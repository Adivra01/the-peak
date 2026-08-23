import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Loader2, Calendar, Users, Ticket, TrendingUp,
  ChevronDown, ChevronRight, MapPin, ShieldCheck,
  UserCheck, UserX, CheckCircle, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface OrganizerStat {
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  tickets_sold: number;
  revenue: number;
}

interface GestionnaireStat {
  manager_id: string;
  full_name: string;
  email: string;
  tickets_sold: number;
  revenue: number;
}

interface EventStats {
  id: string;
  name: string;
  event_date: string;
  location: string;
  organizer_field: string | null;
  is_public: boolean;
  total_capacity: number;
  tickets_sold: number;
  remaining: number;
  total_revenue: number;
  organizers: OrganizerStat[];
  gestionnaires: GestionnaireStat[];
}

interface PendingProposal {
  id: string;
  name: string;
  event_date: string;
  location: string;
  organizer_id: string;
  organizer_name: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const StatCard = ({ label, value, sub, color = '' }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div className="bg-secondary/40 rounded-xl p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventStats[]>([]);
  const [proposals, setProposals] = useState<PendingProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [togglingOrg, setTogglingOrg] = useState<string | null>(null);
  const [approvingProposal, setApprovingProposal] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Get event IDs this supervisor is assigned to
      const { data: assignments } = await supabase
        .from('event_supervisors')
        .select('event_id')
        .eq('supervisor_id', user.id);

      const eventIds = (assignments || []).map((a: any) => a.event_id);

      // Also look for organizer proposals (events where organizer = UUID and not public)
      const { data: allProposalEvents } = await supabase
        .from('events')
        .select('id, name, event_date, location, organizer, is_public')
        .eq('is_public', false);

      const pendingProposals: PendingProposal[] = [];
      const orgIdsForProposals: string[] = [];

      for (const ev of (allProposalEvents || [])) {
        if (ev.organizer && UUID_RE.test(ev.organizer)) {
          orgIdsForProposals.push(ev.organizer);
          pendingProposals.push({
            id: ev.id,
            name: ev.name,
            event_date: ev.event_date,
            location: ev.location,
            organizer_id: ev.organizer,
            organizer_name: ev.organizer,
          });
        }
      }

      // Resolve organizer names
      if (orgIdsForProposals.length > 0) {
        const { data: orgReqs } = await supabase
          .from('organizer_requests')
          .select('user_id, full_name')
          .in('user_id', orgIdsForProposals);
        const nameMap = new Map((orgReqs || []).map((r: any) => [r.user_id, r.full_name]));
        pendingProposals.forEach(p => {
          p.organizer_name = nameMap.get(p.organizer_id) || p.organizer_id.slice(0, 8);
        });
      }

      setProposals(pendingProposals);

      if (eventIds.length === 0) { setIsLoading(false); return; }

      // 2. Parallel: events info, ticket_types (capacity), all tickets, organizer assignments
      const [
        { data: eventsData },
        { data: ticketTypes },
        { data: allTickets },
        { data: orgAssignments },
      ] = await Promise.all([
        supabase.from('events').select('id, name, event_date, location, organizer, is_public').in('id', eventIds),
        supabase.from('ticket_types').select('event_id, quantity_available').in('event_id', eventIds),
        supabase.from('tickets').select('event_id, manager_id, price_paid').in('event_id', eventIds),
        supabase.from('organizer_events').select('event_id, organizer_id').in('event_id', eventIds),
      ]);

      // 3. Get organizer profiles
      const orgIds = [...new Set((orgAssignments || []).map((a: any) => a.organizer_id))];
      const { data: orgRequests } = orgIds.length > 0
        ? await supabase.from('organizer_requests').select('user_id, full_name, email, status').in('user_id', orgIds)
        : { data: [] };

      // 4. Get gestionnaire profiles from manager_requests
      const managerIds = [...new Set((allTickets || []).filter((t: any) => t.manager_id).map((t: any) => t.manager_id))];
      const { data: mgrRequests } = managerIds.length > 0
        ? await supabase.from('manager_requests').select('user_id, full_name, email').in('user_id', managerIds)
        : { data: [] };

      const orgMap = new Map((orgRequests || []).map((r: any) => [r.user_id, r]));
      const mgrMap = new Map((mgrRequests || []).map((r: any) => [r.user_id, r]));

      // 5. Build per-event stats
      const result: EventStats[] = (eventsData || []).map((ev: any) => {
        const evTicketTypes = (ticketTypes || []).filter((tt: any) => tt.event_id === ev.id);
        const totalCapacity = evTicketTypes.reduce((s: number, tt: any) => s + (tt.quantity_available || 0), 0);

        const evTickets = (allTickets || []).filter((t: any) => t.event_id === ev.id);
        const ticketsSold = evTickets.length;
        const totalRevenue = evTickets.reduce((s: number, t: any) => s + (t.price_paid || 0), 0);

        // Organizers for this event
        const evOrgIds = (orgAssignments || []).filter((a: any) => a.event_id === ev.id).map((a: any) => a.organizer_id);
        const organizers: OrganizerStat[] = evOrgIds.map((orgId: string) => {
          const profile = orgMap.get(orgId);
          return {
            user_id: orgId,
            full_name: profile?.full_name || orgId.slice(0, 8),
            email: profile?.email || '',
            status: profile?.status || 'approved',
            tickets_sold: ticketsSold,
            revenue: totalRevenue,
          };
        });

        // Gestionnaires for this event (grouped by manager_id)
        const mgrStats = new Map<string, { tickets_sold: number; revenue: number }>();
        evTickets.forEach((t: any) => {
          if (!t.manager_id) return;
          const cur = mgrStats.get(t.manager_id) || { tickets_sold: 0, revenue: 0 };
          cur.tickets_sold += 1;
          cur.revenue += t.price_paid || 0;
          mgrStats.set(t.manager_id, cur);
        });

        const gestionnaires: GestionnaireStat[] = [...mgrStats.entries()].map(([mgId, stats]) => {
          const profile = mgrMap.get(mgId);
          return {
            manager_id: mgId,
            full_name: profile?.full_name || mgId.slice(0, 8),
            email: profile?.email || '',
            ...stats,
          };
        });

        return {
          id: ev.id,
          name: ev.name,
          event_date: ev.event_date,
          location: ev.location,
          organizer_field: ev.organizer,
          is_public: ev.is_public,
          total_capacity: totalCapacity,
          tickets_sold: ticketsSold,
          remaining: totalCapacity - ticketsSold,
          total_revenue: totalRevenue,
          organizers,
          gestionnaires,
        };
      });

      setEvents(result);
    } catch (err) {
      console.error('Error loading supervisor dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleOrganizerStatus = async (org: OrganizerStat) => {
    const newStatus = org.status === 'approved' ? 'suspended' : 'approved';
    setTogglingOrg(org.user_id);
    try {
      const { error } = await supabase
        .from('organizer_requests')
        .update({ status: newStatus })
        .eq('user_id', org.user_id);
      if (error) throw error;
      toast({
        title: newStatus === 'suspended' ? 'Organisateur désactivé' : 'Organisateur réactivé',
        description: org.full_name,
      });
      load();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setTogglingOrg(null);
    }
  };

  const handleApproveProposal = async (proposal: PendingProposal) => {
    setApprovingProposal(proposal.id);
    try {
      const { error } = await supabase
        .from('events')
        .update({ organizer: `PENDING_ADMIN:${proposal.organizer_id}` })
        .eq('id', proposal.id);
      if (error) throw error;
      toast({
        title: 'Proposition transmise à l\'admin',
        description: `L'événement "${proposal.name}" a été validé par vous et envoyé à l'administrateur.`,
      });
      load();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setApprovingProposal(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Global KPIs
  const totalCapacity = events.reduce((s, e) => s + e.total_capacity, 0);
  const totalSold = events.reduce((s, e) => s + e.tickets_sold, 0);
  const totalRevenue = events.reduce((s, e) => s + e.total_revenue, 0);
  const totalRemaining = events.reduce((s, e) => s + e.remaining, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tableau de bord Superviseur</h1>
          <p className="text-muted-foreground mt-0.5">Vue hiérarchique de vos événements</p>
        </div>
      </div>

      {/* Pending proposals from organizers */}
      {proposals.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              Propositions à valider ({proposals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between gap-4 bg-white dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{proposal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Organisateur: {proposal.organizer_name} ·{' '}
                    {format(new Date(proposal.event_date), 'dd MMM yyyy', { locale: fr })} · {proposal.location}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleApproveProposal(proposal)}
                  disabled={approvingProposal === proposal.id}
                >
                  {approvingProposal === proposal.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <><CheckCircle className="w-3.5 h-3.5 mr-1" />Valider</>}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Global KPIs */}
      {events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Événements supervisés" value={events.length} />
          <StatCard label="Capacité totale" value={totalCapacity.toLocaleString('fr-FR')} />
          <StatCard
            label="Billets vendus"
            value={totalSold.toLocaleString('fr-FR')}
            sub={totalCapacity > 0 ? `${Math.round((totalSold / totalCapacity) * 100)}% de remplissage` : undefined}
            color="text-primary"
          />
          <StatCard
            label="Billets restants"
            value={totalRemaining.toLocaleString('fr-FR')}
            color={totalRemaining === 0 ? 'text-destructive' : totalRemaining / totalCapacity < 0.2 ? 'text-orange-500' : 'text-green-600'}
          />
        </div>
      )}

      {/* Revenue summary */}
      {totalRevenue > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Chiffre d'affaires total</p>
              <p className="text-2xl font-bold text-primary">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-event detail */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Aucun événement supervisé pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Détail par événement</h2>
          {events.map((ev, i) => {
            const isPast = new Date(ev.event_date) < new Date();
            const fillPct = ev.total_capacity > 0 ? Math.round((ev.tickets_sold / ev.total_capacity) * 100) : 0;
            const isExpanded = expandedEvent === ev.id;

            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="shadow-soft overflow-hidden">
                  {/* Event header row */}
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedEvent(isExpanded ? null : ev.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <CardTitle className="text-base">{ev.name}</CardTitle>
                            {isPast && <Badge variant="outline" className="text-xs">Terminé</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(ev.event_date), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {ev.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>

                      {/* Mini KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="text-center bg-secondary/40 rounded-lg p-2">
                          <p className="text-lg font-bold">{ev.total_capacity}</p>
                          <p className="text-xs text-muted-foreground">Capacité</p>
                        </div>
                        <div className="text-center bg-secondary/40 rounded-lg p-2">
                          <p className="text-lg font-bold text-primary">{ev.tickets_sold}</p>
                          <p className="text-xs text-muted-foreground">Vendus ({fillPct}%)</p>
                        </div>
                        <div className="text-center bg-secondary/40 rounded-lg p-2">
                          <p className={`text-lg font-bold ${ev.remaining === 0 ? 'text-destructive' : ev.remaining / ev.total_capacity < 0.2 ? 'text-orange-500' : 'text-green-600'}`}>
                            {ev.remaining}
                          </p>
                          <p className="text-xs text-muted-foreground">Restants</p>
                        </div>
                        <div className="text-center bg-secondary/40 rounded-lg p-2">
                          <p className="text-lg font-bold text-primary">{ev.total_revenue.toLocaleString('fr-FR')}</p>
                          <p className="text-xs text-muted-foreground">FCFA</p>
                        </div>
                      </div>

                      {/* Fill bar */}
                      {ev.total_capacity > 0 && (
                        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-destructive' : fillPct >= 70 ? 'bg-orange-500' : 'bg-primary'}`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      )}
                    </CardHeader>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0 pb-4 space-y-6 border-t border-border">

                          {/* Organizers section */}
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4 text-primary" />
                              <h3 className="font-semibold text-sm">
                                Organisateurs ({ev.organizers.length})
                              </h3>
                            </div>
                            {ev.organizers.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic pl-6">Aucun organisateur assigné</p>
                            ) : (
                              <div className="space-y-2">
                                {ev.organizers.map((org) => (
                                  <div key={org.user_id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{org.full_name}</p>
                                        <Badge className={org.status === 'approved'
                                          ? 'bg-green-500/10 text-green-600 border-green-200 text-xs'
                                          : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                                          {org.status === 'approved' ? 'Actif' : 'Désactivé'}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{org.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-primary">{ev.tickets_sold} vendus</p>
                                        <p className="text-xs text-muted-foreground">{ev.total_revenue.toLocaleString('fr-FR')} FCFA</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleOrganizerStatus(org)}
                                        disabled={togglingOrg === org.user_id}
                                        className={`text-xs ${org.status === 'approved'
                                          ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                                      >
                                        {togglingOrg === org.user_id
                                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          : org.status === 'approved'
                                            ? <><UserX className="w-3.5 h-3.5 mr-1" />Désactiver</>
                                            : <><UserCheck className="w-3.5 h-3.5 mr-1" />Activer</>}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Gestionnaires section */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Ticket className="w-4 h-4 text-primary" />
                              <h3 className="font-semibold text-sm">
                                Gestionnaires / Vendeurs ({ev.gestionnaires.length})
                              </h3>
                            </div>
                            {ev.gestionnaires.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic pl-6">Aucune vente enregistrée par un gestionnaire</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-muted-foreground border-b border-border">
                                      <th className="text-left pb-2 font-medium">Nom</th>
                                      <th className="text-right pb-2 font-medium">Billets vendus</th>
                                      <th className="text-right pb-2 font-medium">Chiffre d'affaires</th>
                                      <th className="text-right pb-2 font-medium">Part (%)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border">
                                    {ev.gestionnaires
                                      .sort((a, b) => b.tickets_sold - a.tickets_sold)
                                      .map((mgr) => {
                                        const pct = ev.tickets_sold > 0 ? Math.round((mgr.tickets_sold / ev.tickets_sold) * 100) : 0;
                                        return (
                                          <tr key={mgr.manager_id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="py-2">
                                              <p className="font-medium">{mgr.full_name}</p>
                                              <p className="text-xs text-muted-foreground">{mgr.email}</p>
                                            </td>
                                            <td className="py-2 text-right font-semibold text-primary">{mgr.tickets_sold}</td>
                                            <td className="py-2 text-right">{mgr.revenue.toLocaleString('fr-FR')} FCFA</td>
                                            <td className="py-2 text-right">
                                              <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs">{pct}%</span>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
