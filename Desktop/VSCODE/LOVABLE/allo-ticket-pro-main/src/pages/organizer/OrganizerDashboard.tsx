import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, TrendingUp, Users, UserCheck, Store, CalendarDays, Clock, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketRow {
  id: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  price_paid: number;
  status: string | null;
  manager_id: string | null;
  purchased_at: string;
  event_id: string;
  event_name?: string;
  ticket_type_name?: string;
}

interface EventRow {
  id: string;
  name: string;
}

interface ManagerInfo {
  name: string;
  phone: string | null;
}

const PERIOD_OPTIONS = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: '90 jours', value: 90 },
];

const StatusBadge = ({ status }: { status: string | null }) => {
  switch (status) {
    case 'valid': return <Badge className="bg-teal/10 text-teal border-teal/20 text-xs">Valide</Badge>;
    case 'used': return <Badge className="bg-amber/10 text-amber border-amber/20 text-xs">Utilisé</Badge>;
    case 'cancelled': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Annulé</Badge>;
    default: return <Badge variant="outline" className="text-xs">{status || 'actif'}</Badge>;
  }
};

const CanalBadge = ({ managerId }: { managerId: string | null }) =>
  managerId ? (
    <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-200 text-xs">Gestionnaire</Badge>
  ) : (
    <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">Direct</Badge>
  );

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [managerMap, setManagerMap] = useState<Map<string, ManagerInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(7);
  const [selectedEvent, setSelectedEvent] = useState('all');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const { data: assignments } = await supabase
          .from('organizer_events')
          .select('event_id')
          .eq('organizer_id', user.id);

        const eventIds = assignments?.map(a => a.event_id) || [];
        if (eventIds.length === 0) { setIsLoading(false); return; }

        const [ticketsRes, eventsRes] = await Promise.all([
          supabase.from('tickets')
            .select('id, customer_first_name, customer_last_name, customer_phone, price_paid, status, manager_id, purchased_at, event_id, events(name), ticket_types(name)')
            .in('event_id', eventIds)
            .order('purchased_at', { ascending: false }),
          supabase.from('events')
            .select('id, name')
            .in('id', eventIds)
            .order('name'),
        ]);

        const enriched: TicketRow[] = ((ticketsRes.data || []) as any[]).map(t => ({
          id: t.id,
          customer_first_name: t.customer_first_name,
          customer_last_name: t.customer_last_name,
          customer_phone: t.customer_phone,
          price_paid: t.price_paid,
          status: t.status,
          manager_id: t.manager_id,
          purchased_at: t.purchased_at,
          event_id: t.event_id,
          event_name: t.events?.name,
          ticket_type_name: t.ticket_types?.name,
        }));

        setTickets(enriched);
        setEvents(eventsRes.data || []);

        // Fetch manager names for all managers who sold tickets in these events
        const mgrIds = [...new Set(enriched.filter(t => t.manager_id).map(t => t.manager_id as string))];
        if (mgrIds.length > 0) {
          const { data: mgrData } = await supabase
            .from('manager_requests')
            .select('user_id, full_name, phone')
            .in('user_id', mgrIds)
            .eq('status', 'approved');

          const map = new Map<string, ManagerInfo>();
          ((mgrData || []) as any[]).forEach(m => {
            map.set(m.user_id, { name: m.full_name, phone: m.phone });
          });
          setManagerMap(map);
        }
      } catch (error) {
        console.error('Error fetching organizer stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Helper: manager display name
  const mgrName = (id: string) => managerMap.get(id)?.name ?? `Gestionnaire (${id.slice(0, 6)}…)`;
  const mgrPhone = (id: string) => managerMap.get(id)?.phone ?? null;

  // ── Today ──
  const todayTickets = tickets.filter(t => t.purchased_at?.startsWith(today));
  const todayRevenue = todayTickets.reduce((s, t) => s + Number(t.price_paid), 0);
  const todayDirect = todayTickets.filter(t => !t.manager_id).length;
  const todayManager = todayTickets.filter(t => !!t.manager_id).length;

  // Hourly chart
  const currentHour = new Date().getHours();
  const hourlyData = Array.from({ length: currentHour + 1 }, (_, h) => ({
    heure: `${String(h).padStart(2, '0')}h`,
    billets: 0,
  }));
  todayTickets.forEach(t => {
    const h = new Date(t.purchased_at).getHours();
    if (h <= currentHour) hourlyData[h].billets += 1;
  });
  const visibleHourlyData = hourlyData.filter(h => parseInt(h.heure) >= 6);
  const hasHourlyActivity = visibleHourlyData.some(d => d.billets > 0);

  // Today event breakdown
  const todayEventBreakdown = events
    .map(ev => {
      const ev_t = todayTickets.filter(t => t.event_id === ev.id);
      const direct = ev_t.filter(t => !t.manager_id).length;
      const via = ev_t.filter(t => !!t.manager_id).length;
      return { name: ev.name, billets: ev_t.length, ca: ev_t.reduce((s, t) => s + Number(t.price_paid), 0), direct, viaManager: via };
    })
    .filter(ev => ev.billets > 0)
    .sort((a, b) => b.billets - a.billets);

  // ── Period ──
  const periodStart = format(subDays(new Date(), periodDays), 'yyyy-MM-dd');
  const periodFiltered = tickets.filter(t => {
    const inPeriod = (t.purchased_at || '') >= periodStart;
    const inEvent = selectedEvent === 'all' || t.event_id === selectedEvent;
    return inPeriod && inEvent;
  });
  const periodRevenue = periodFiltered.reduce((s, t) => s + Number(t.price_paid), 0);

  const chartDays = Array.from({ length: periodDays }, (_, i) => {
    const d = subDays(new Date(), periodDays - 1 - i);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, periodDays <= 7 ? 'EEE dd' : 'dd/MM', { locale: fr }), revenue: 0 };
  });
  periodFiltered.forEach(t => {
    const found = chartDays.find(d => d.date === t.purchased_at?.slice(0, 10));
    if (found) found.revenue += Number(t.price_paid);
  });

  // ── Manager stats (all time) ──
  // Global summary per manager
  const globalMgrMap = new Map<string, { name: string; phone: string | null; billets: number; ca: number; eventIds: Set<string> }>();
  tickets.filter(t => !!t.manager_id).forEach(t => {
    const id = t.manager_id!;
    const cur = globalMgrMap.get(id);
    if (cur) {
      cur.billets += 1;
      cur.ca += Number(t.price_paid);
      cur.eventIds.add(t.event_id);
    } else {
      globalMgrMap.set(id, { name: mgrName(id), phone: mgrPhone(id), billets: 1, ca: Number(t.price_paid), eventIds: new Set([t.event_id]) });
    }
  });
  const globalMgrList = Array.from(globalMgrMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.billets - a.billets);

  // Per-event manager breakdown
  const eventMgrBreakdown = events
    .map(ev => {
      const evMgrTickets = tickets.filter(t => t.event_id === ev.id && !!t.manager_id);
      if (evMgrTickets.length === 0) return null;

      const mgrStatsMap = new Map<string, { name: string; phone: string | null; billets: number; ca: number }>();
      evMgrTickets.forEach(t => {
        const id = t.manager_id!;
        const cur = mgrStatsMap.get(id);
        if (cur) { cur.billets += 1; cur.ca += Number(t.price_paid); }
        else mgrStatsMap.set(id, { name: mgrName(id), phone: mgrPhone(id), billets: 1, ca: Number(t.price_paid) });
      });

      const totalBillets = evMgrTickets.length;
      return {
        eventId: ev.id,
        eventName: ev.name,
        managers: Array.from(mgrStatsMap.values()).sort((a, b) => b.billets - a.billets),
        totalBillets,
        totalCa: evMgrTickets.reduce((s, t) => s + Number(t.price_paid), 0),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  // ── Totals ──
  const totalTickets = tickets.length;
  const totalRevenue = tickets.reduce((s, t) => s + Number(t.price_paid), 0);
  const totalClients = new Set(tickets.map(t => t.customer_phone).filter(Boolean)).size;
  const directTickets = tickets.filter(t => !t.manager_id).length;
  const managerTickets = tickets.filter(t => !!t.manager_id).length;

  const Skeleton = () => <div className="h-8 w-24 animate-pulse rounded bg-secondary" />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Tableau de bord Organisateur</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de vos événements</p>
      </div>

      {/* ── Aujourd'hui ── */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Aujourd'hui — {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Billets vendus', value: todayTickets.length, icon: Ticket, border: 'border-l-primary', bg: 'bg-primary/10 text-primary' },
            { label: 'CA réalisé', value: `${todayRevenue.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, border: 'border-l-amber', bg: 'bg-amber/10 text-amber' },
            { label: 'Ventes directes', value: todayDirect, icon: UserCheck, border: 'border-l-green-500', bg: 'bg-green-500/10 text-green-600' },
            { label: 'Via gestionnaire', value: todayManager, icon: Store, border: 'border-l-indigo-500', bg: 'bg-indigo-500/10 text-indigo-600' },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border-l-4 ${c.border} shadow-soft`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${c.bg}`}><c.icon className="w-4 h-4" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton /> : c.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Hourly chart */}
        {!isLoading && hasHourlyActivity && (
          <Card className="shadow-soft mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Activité par heure — aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={visibleHourlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="heure" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v} billet${v > 1 ? 's' : ''}`, 'Vendus']} />
                  <Bar dataKey="billets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Event breakdown today */}
        {!isLoading && todayEventBreakdown.length > 0 && (
          <Card className="shadow-soft mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Répartition par événement — aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Événement</TableHead>
                      <TableHead className="text-xs text-center">Total</TableHead>
                      <TableHead className="text-xs text-center">Direct</TableHead>
                      <TableHead className="text-xs text-center">Gestionnaire</TableHead>
                      <TableHead className="text-xs text-right">CA (FCFA)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayEventBreakdown.map(ev => (
                      <TableRow key={ev.name}>
                        <TableCell className="text-xs font-medium max-w-[180px] truncate">{ev.name}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">{ev.billets}</span>
                        </TableCell>
                        <TableCell className="text-xs text-center text-green-600 font-medium">{ev.direct}</TableCell>
                        <TableCell className="text-xs text-center text-indigo-600 font-medium">{ev.viaManager}</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{ev.ca.toLocaleString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">{todayTickets.length} billet{todayTickets.length > 1 ? 's' : ''} au total</span>
                <span className="text-sm font-bold text-foreground">{todayRevenue.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed today table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Détail des ventes du jour
              {todayTickets.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({todayTickets.length} billet{todayTickets.length > 1 ? 's' : ''})</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : todayTickets.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Aucune vente enregistrée aujourd'hui</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-16">Heure</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Téléphone</TableHead>
                      <TableHead className="text-xs">Événement</TableHead>
                      <TableHead className="text-xs">Catégorie</TableHead>
                      <TableHead className="text-xs">Canal</TableHead>
                      <TableHead className="text-xs text-right">Montant</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayTickets.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs font-mono text-muted-foreground">{format(new Date(t.purchased_at), 'HH:mm')}</TableCell>
                        <TableCell className="text-xs font-medium">{[t.customer_first_name, t.customer_last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                        <TableCell className="text-xs">{t.customer_phone || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{t.event_name || '—'}</TableCell>
                        <TableCell className="text-xs">{t.ticket_type_name || '—'}</TableCell>
                        <TableCell><CanalBadge managerId={t.manager_id} /></TableCell>
                        <TableCell className="text-xs text-right font-semibold">{Number(t.price_paid).toLocaleString('fr-FR')}</TableCell>
                        <TableCell><StatusBadge status={t.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {todayTickets.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">{todayTickets.length} vente{todayTickets.length > 1 ? 's' : ''}</span>
                <span className="text-sm font-bold text-foreground">{todayRevenue.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Période personnalisée ── */}
      <section>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-foreground">Période personnalisée</h2>
          <div className="flex gap-2 flex-wrap">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriodDays(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  periodDays === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {events.length > 0 && (
            <div className="w-56">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tous les événements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Billets vendus</CardTitle>
              <div className="p-2 rounded-lg bg-teal/10 text-teal"><Ticket className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton /> : periodFiltered.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ces {periodDays} derniers jours{selectedEvent !== 'all' ? ` · ${events.find(e => e.id === selectedEvent)?.name}` : ''}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</CardTitle>
              <div className="p-2 rounded-lg bg-rose/10 text-rose"><TrendingUp className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton /> : `${periodRevenue.toLocaleString('fr-FR')} FCFA`}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ces {periodDays} derniers jours{selectedEvent !== 'all' ? ` · ${events.find(e => e.id === selectedEvent)?.name}` : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Chiffre d'affaires par jour{selectedEvent !== 'all' ? ` · ${events.find(e => e.id === selectedEvent)?.name}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">Chargement...</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartDays} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'CA']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Gestionnaires par événement ── */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Gestionnaires — performances par événement
        </h2>

        {/* Global manager summary */}
        {!isLoading && globalMgrList.length > 0 && (
          <Card className="shadow-soft mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Vue d'ensemble — tous événements</CardTitle>
                <Badge variant="outline" className="text-xs">{globalMgrList.length} gestionnaire{globalMgrList.length > 1 ? 's' : ''}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs">Gestionnaire</TableHead>
                      <TableHead className="text-xs">Téléphone</TableHead>
                      <TableHead className="text-xs text-center">Billets vendus</TableHead>
                      <TableHead className="text-xs text-right">CA total (FCFA)</TableHead>
                      <TableHead className="text-xs text-center">Événements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalMgrList.map((mgr, i) => (
                      <TableRow key={mgr.id} className={i === 0 ? 'bg-amber/5' : ''}>
                        <TableCell className="text-xs font-bold text-muted-foreground">
                          {i === 0 ? <Trophy className="w-3.5 h-3.5 text-amber inline" /> : i + 1}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{mgr.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mgr.phone || '—'}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {mgr.billets}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">{mgr.ca.toLocaleString('fr-FR')}</TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground">{mgr.eventIds.size}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">{managerTickets} billet{managerTickets > 1 ? 's' : ''} via gestionnaire</span>
                <span className="text-sm font-bold text-foreground">
                  {tickets.filter(t => !!t.manager_id).reduce((s, t) => s + Number(t.price_paid), 0).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Per-event manager breakdown */}
        {!isLoading && eventMgrBreakdown.length > 0 ? (
          <div className="space-y-4">
            {eventMgrBreakdown.map(ev => (
              <Card key={ev.eventId} className="shadow-soft">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-semibold">{ev.eventName}</CardTitle>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        {ev.totalBillets} billet{ev.totalBillets > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        {ev.totalCa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs w-8">#</TableHead>
                          <TableHead className="text-xs">Gestionnaire</TableHead>
                          <TableHead className="text-xs">Téléphone</TableHead>
                          <TableHead className="text-xs text-center">Billets</TableHead>
                          <TableHead className="text-xs text-right">CA (FCFA)</TableHead>
                          <TableHead className="text-xs text-right">% billets</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ev.managers.map((mgr, i) => {
                          const pct = ev.totalBillets > 0 ? Math.round((mgr.billets / ev.totalBillets) * 100) : 0;
                          return (
                            <TableRow key={mgr.name} className={i === 0 ? 'bg-primary/5' : ''}>
                              <TableCell className="text-xs font-bold text-muted-foreground">
                                {i === 0 ? <Trophy className="w-3.5 h-3.5 text-amber inline" /> : i + 1}
                              </TableCell>
                              <TableCell className="text-xs font-semibold">{mgr.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{mgr.phone || '—'}</TableCell>
                              <TableCell className="text-xs text-center">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                  {mgr.billets}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-right font-semibold">{mgr.ca.toLocaleString('fr-FR')}</TableCell>
                              <TableCell className="text-xs text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-muted-foreground w-8 text-right">{pct}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isLoading ? (
          <Card className="shadow-soft">
            <CardContent className="py-10 text-center">
              <Store className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Aucun gestionnaire n'a encore vendu de billets pour vos événements</p>
            </CardContent>
          </Card>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">Chargement...</div>
        )}
      </section>

      {/* ── Totaux généraux ── */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Totaux généraux</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Mes événements', value: events.length, icon: Calendar, color: 'bg-teal/10 text-teal' },
            { title: 'Total billets vendus', value: totalTickets, icon: Ticket, color: 'bg-amber/10 text-amber' },
            { title: 'Participants uniques', value: totalClients, icon: Users, color: 'bg-rose/10 text-rose' },
            { title: 'CA total (FCFA)', value: totalRevenue.toLocaleString('fr-FR'), icon: TrendingUp, color: 'bg-primary/10 text-primary' },
            { title: 'Achats client direct', value: directTickets, icon: UserCheck, color: 'bg-green-500/10 text-green-600' },
            { title: 'Achats via gestionnaire', value: managerTickets, icon: Store, color: 'bg-indigo-500/10 text-indigo-600' },
          ].map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="shadow-soft hover:shadow-card transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-4 h-4" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoading ? <Skeleton /> : card.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OrganizerDashboard;
