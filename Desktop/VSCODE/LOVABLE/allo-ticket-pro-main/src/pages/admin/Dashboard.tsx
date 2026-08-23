import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Ticket, Users, TrendingUp, CalendarDays,
  UserCheck, ShieldCheck, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketRow {
  id: string;
  price_paid: number;
  purchased_at: string;
  event_id: string | null;
  ticket_type_id: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  status: string | null;
  manager_id: string | null;
}

interface EventRow {
  id: string;
  name: string;
  event_date: string;
  location: string;
}

interface TicketTypeRow {
  id: string;
  event_id: string;
  name: string;
  quantity_available: number;
}

interface ManagerStat {
  manager_id: string;
  full_name: string;
  tickets_sold: number;
  revenue: number;
}

type ViewMode = 'day' | 'month' | 'year' | 'custom';

const PERIOD_OPTIONS = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: '90 jours', value: 90 },
  { label: 'Tout', value: 9999 },
];

const statusBadge = (status: string | null) => {
  if (status === 'used') return <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Utilisé</Badge>;
  if (status === 'cancelled') return <Badge variant="destructive" className="text-xs gap-1"><XCircle className="w-3 h-3" />Annulé</Badge>;
  return <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-300"><CheckCircle2 className="w-3 h-3" />Valide</Badge>;
};

const Dashboard = () => {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeRow[]>([]);
  const [managerStats, setManagerStats] = useState<ManagerStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalManagers, setTotalManagers] = useState(0);
  const [totalOrganizers, setTotalOrganizers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          ticketsRes,
          eventsRes,
          ticketTypesRes,
          usersRes,
          managersRes,
          organizersRes,
          managerRequestsRes,
        ] = await Promise.all([
          supabase.from('tickets').select('id, price_paid, purchased_at, event_id, ticket_type_id, customer_first_name, customer_last_name, customer_phone, status, manager_id').order('purchased_at', { ascending: false }),
          supabase.from('events').select('id, name, event_date, location').order('event_date', { ascending: true }),
          supabase.from('ticket_types').select('id, event_id, name, quantity_available'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'manager'),
          supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'organizer'),
          supabase.from('manager_requests').select('user_id, full_name').eq('status', 'approved'),
        ]);

        setTickets(ticketsRes.data || []);
        setEvents(eventsRes.data || []);
        setTicketTypes(ticketTypesRes.data || []);
        setTotalUsers(usersRes.count || 0);
        setTotalManagers(managersRes.count || 0);
        setTotalOrganizers(organizersRes.count || 0);

        // Manager stats
        const mgrMap = new Map((managerRequestsRes.data || []).map((r: any) => [r.user_id, r.full_name]));
        const mgrStatMap = new Map<string, { tickets_sold: number; revenue: number }>();
        (ticketsRes.data || []).filter((t: any) => t.manager_id).forEach((t: any) => {
          const cur = mgrStatMap.get(t.manager_id) || { tickets_sold: 0, revenue: 0 };
          cur.tickets_sold += 1;
          cur.revenue += Number(t.price_paid) || 0;
          mgrStatMap.set(t.manager_id, cur);
        });
        const stats: ManagerStat[] = [...mgrStatMap.entries()].map(([id, s]) => ({
          manager_id: id,
          full_name: mgrMap.get(id) || id.slice(0, 8),
          ...s,
        })).sort((a, b) => b.tickets_sold - a.tickets_sold);
        setManagerStats(stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Today ──
  const todayTickets = tickets.filter(t => (t.purchased_at || '').startsWith(today));
  const todayRevenue = todayTickets.reduce((s, t) => s + Number(t.price_paid), 0);

  // ── Period + event filter ──
  const periodStart = periodDays === 9999 ? '2000-01-01' : format(subDays(new Date(), periodDays), 'yyyy-MM-dd');
  const periodFiltered = tickets.filter(t => {
    const inPeriod = (t.purchased_at || '') >= periodStart;
    const inEvent = selectedEventFilter === 'all' || t.event_id === selectedEventFilter;
    return inPeriod && inEvent;
  });
  const periodRevenue = periodFiltered.reduce((s, t) => s + Number(t.price_paid), 0);

  // ── Totals ──
  const totalRevenue = tickets.reduce((s, t) => s + Number(t.price_paid), 0);

  // ── Per-event stats ──
  const eventStats = events.map(ev => {
    const evTypes = ticketTypes.filter(tt => tt.event_id === ev.id);
    const totalCapacity = evTypes.reduce((s, tt) => s + tt.quantity_available, 0);
    const evTickets = tickets.filter(t => t.event_id === ev.id);
    const sold = evTickets.length;
    const revenue = evTickets.reduce((s, t) => s + Number(t.price_paid), 0);
    const fillPct = totalCapacity > 0 ? Math.round((sold / totalCapacity) * 100) : 0;
    return { ...ev, totalCapacity, sold, remaining: totalCapacity - sold, revenue, fillPct };
  });

  const Skeleton = () => <div className="h-7 w-20 animate-pulse rounded bg-secondary" />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue complète de la plateforme</p>
      </div>

      {/* ── Aujourd'hui ── */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          Aujourd'hui — {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Billets vendus aujourd\'hui', value: isLoading ? null : todayTickets.length, icon: Ticket, color: 'text-primary bg-primary/10' },
            { label: 'CA aujourd\'hui', value: isLoading ? null : `${todayRevenue.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, color: 'text-amber bg-amber/10' },
            { label: 'Billets actifs', value: isLoading ? null : tickets.filter(t => t.status !== 'cancelled').length, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-l-4 border-l-primary shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-4 h-4" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {card.value === null ? <Skeleton /> : card.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Totaux généraux ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Totaux généraux</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Événements', value: events.length, icon: Calendar, color: 'text-teal bg-teal/10' },
            { label: 'Billets vendus', value: tickets.length, icon: Ticket, color: 'text-amber bg-amber/10' },
            { label: 'Utilisateurs', value: totalUsers, icon: Users, color: 'text-rose bg-rose/10' },
            { label: 'Gestionnaires', value: totalManagers, icon: UserCheck, color: 'text-indigo-500 bg-indigo-100' },
            { label: 'Organisateurs', value: totalOrganizers, icon: UserCheck, color: 'text-violet-500 bg-violet-100' },
            { label: 'CA Total (FCFA)', value: totalRevenue.toLocaleString('fr-FR'), icon: TrendingUp, color: 'text-primary bg-primary/10' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-soft hover:shadow-card transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
                  <div className={`p-1.5 rounded-lg ${card.color}`}><card.icon className="w-3.5 h-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-bold text-foreground">
                    {isLoading ? <Skeleton /> : card.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Analyse Avancée ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Analyse statistique avancée</h2>

        {/* View mode tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit mb-4">
          {([
            { key: 'day', label: 'Jour' },
            { key: 'month', label: 'Mois' },
            { key: 'year', label: 'Année' },
            { key: 'custom', label: 'Personnalisé' },
          ] as { key: ViewMode; label: string }[]).map(v => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === v.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Period / date range controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {viewMode === 'day' && (
            <div className="flex gap-1.5 flex-wrap">
              {PERIOD_OPTIONS.slice(0, 3).map(opt => (
                <button key={opt.value} onClick={() => setPeriodDays(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${periodDays === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {viewMode === 'custom' && (
            <div className="flex gap-3 flex-wrap items-center">
              <div className="space-y-1">
                <Label className="text-xs">Du</Label>
                <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="h-8 text-sm w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Au</Label>
                <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="h-8 text-sm w-40" />
              </div>
            </div>
          )}
          <div className="w-56">
            <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Tous les événements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics cards + chart */}
        {(() => {
          const now = new Date();
          let startDate: Date, endDate: Date = now;
          const evFilter = (t: TicketRow) => selectedEventFilter === 'all' || t.event_id === selectedEventFilter;

          if (viewMode === 'day') {
            startDate = subDays(now, periodDays);
          } else if (viewMode === 'month') {
            startDate = startOfMonth(now); endDate = endOfMonth(now);
          } else if (viewMode === 'year') {
            startDate = startOfYear(now); endDate = endOfYear(now);
          } else {
            startDate = customStart ? new Date(customStart) : subDays(now, 30);
            endDate = customEnd ? new Date(customEnd) : now;
          }

          const startStr = format(startDate, 'yyyy-MM-dd');
          const endStr = format(endDate, 'yyyy-MM-dd');
          const filtered = tickets.filter(t => {
            const d = (t.purchased_at || '').slice(0, 10);
            return d >= startStr && d <= endStr && evFilter(t);
          });
          const revenue = filtered.reduce((s, t) => s + Number(t.price_paid), 0);
          const cancelled = filtered.filter(t => t.status === 'cancelled').length;

          // Build chart data
          let chartData: { label: string; billets: number; ca: number }[] = [];
          if (viewMode === 'year') {
            const months = eachMonthOfInterval({ start: startDate, end: endDate });
            chartData = months.map(m => {
              const ms = format(m, 'yyyy-MM');
              const mTickets = filtered.filter(t => t.purchased_at?.startsWith(ms));
              return { label: format(m, 'MMM', { locale: fr }), billets: mTickets.length, ca: mTickets.reduce((s, t) => s + Number(t.price_paid), 0) };
            });
          } else {
            const days = eachDayOfInterval({ start: startDate, end: endDate > now ? now : endDate });
            const maxDays = viewMode === 'custom' ? days.length : Math.min(days.length, viewMode === 'day' ? periodDays : 31);
            chartData = days.slice(0, maxDays).map(d => {
              const ds = format(d, 'yyyy-MM-dd');
              const dTickets = filtered.filter(t => t.purchased_at?.startsWith(ds));
              return { label: format(d, viewMode === 'month' ? 'dd' : 'dd/MM', { locale: fr }), billets: dTickets.length, ca: dTickets.reduce((s, t) => s + Number(t.price_paid), 0) };
            });
          }

          const periodLabel = viewMode === 'day' ? `${periodDays} derniers jours`
            : viewMode === 'month' ? format(now, 'MMMM yyyy', { locale: fr })
            : viewMode === 'year' ? format(now, 'yyyy')
            : customStart && customEnd ? `${customStart} → ${customEnd}` : 'Période personnalisée';

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Billets vendus', value: filtered.length, icon: Ticket, color: 'text-primary bg-primary/10' },
                  { label: 'CA (FCFA)', value: `${revenue.toLocaleString('fr-FR')}`, icon: TrendingUp, color: 'text-amber bg-amber/10' },
                  { label: 'Annulés', value: cancelled, icon: XCircle, color: 'text-destructive bg-destructive/10' },
                ].map((card, i) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="shadow-soft">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                        <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-4 h-4" /></div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton /> : card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {chartData.length > 0 && !isLoading && (
                <Card className="shadow-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      {viewMode === 'year' ? 'CA par mois' : 'CA par jour'} — {periodLabel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'CA']} />
                        <Bar dataKey="ca" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          );
        })()}
      </section>

      {/* ── Tous les événements ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />Tous les événements ({events.length})
        </h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : events.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">Aucun événement</CardContent></Card>
        ) : (
          <Card className="shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Événement</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Capacité</th>
                    <th className="text-right px-4 py-3 font-medium">Vendus</th>
                    <th className="text-right px-4 py-3 font-medium">Restants</th>
                    <th className="text-right px-4 py-3 font-medium">CA (FCFA)</th>
                    <th className="px-4 py-3 font-medium">Remplissage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventStats.map(ev => (
                    <tr key={ev.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{ev.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {format(new Date(ev.event_date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-3 text-right">{ev.totalCapacity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{ev.sold}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${ev.remaining === 0 ? 'text-destructive' : ev.remaining / Math.max(ev.totalCapacity, 1) < 0.2 ? 'text-orange-500' : 'text-green-600'}`}>
                        {ev.remaining}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{ev.revenue.toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${ev.fillPct >= 90 ? 'bg-destructive' : ev.fillPct >= 70 ? 'bg-orange-500' : 'bg-primary'}`}
                              style={{ width: `${ev.fillPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{ev.fillPct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* ── Derniers billets ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <Ticket className="w-4 h-4" />Dernières transactions ({Math.min(tickets.length, 100)})
        </h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : tickets.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">Aucun billet vendu</CardContent></Card>
        ) : (
          <Card className="shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Client</th>
                    <th className="text-left px-4 py-3 font-medium">Événement</th>
                    <th className="text-right px-4 py-3 font-medium">Prix (FCFA)</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.slice(0, 100).map(t => {
                    const ev = events.find(e => e.id === t.event_id);
                    return (
                      <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-xs">{t.customer_first_name} {t.customer_last_name}</p>
                          {t.customer_phone && <p className="text-xs text-muted-foreground">{t.customer_phone}</p>}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[150px] truncate">{ev?.name || '—'}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-xs">{Number(t.price_paid).toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {t.purchased_at ? format(new Date(t.purchased_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}
                        </td>
                        <td className="px-4 py-2.5">{statusBadge(t.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* ── Top gestionnaires ── */}
      {managerStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />Top gestionnaires
          </h2>
          <Card className="shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Gestionnaire</th>
                    <th className="text-right px-4 py-3 font-medium">Billets vendus</th>
                    <th className="text-right px-4 py-3 font-medium">CA (FCFA)</th>
                    <th className="px-4 py-3 font-medium">Part</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {managerStats.map((mgr, i) => {
                    const pct = tickets.length > 0 ? Math.round((mgr.tickets_sold / tickets.length) * 100) : 0;
                    return (
                      <tr key={mgr.manager_id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{mgr.full_name}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-primary">{mgr.tickets_sold}</td>
                        <td className="px-4 py-2.5 text-right">{mgr.revenue.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
