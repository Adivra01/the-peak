import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Users, TrendingUp, CalendarDays, Clock, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TicketRow {
  id: string;
  ticket_code: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  price_paid: number;
  status: string | null;
  purchased_at: string;
  event_id: string | null;
  event_name?: string;
  ticket_type_name?: string;
}

interface EventRow {
  id: string;
  name: string;
}

interface EventTicketStat {
  name: string;
  total: number;
  sold: number;
  remaining: number;
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

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventTicketStats, setEventTicketStats] = useState<EventTicketStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(7);
  const [selectedEvent, setSelectedEvent] = useState('all');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('id, ticket_code, customer_first_name, customer_last_name, customer_phone, price_paid, status, purchased_at, event_id, events(name), ticket_types(name)')
        .eq('manager_id', user.id)
        .order('purchased_at', { ascending: false });

      if (data) {
        const enriched: TicketRow[] = (data as any[]).map(t => ({
          id: t.id,
          ticket_code: t.ticket_code,
          customer_first_name: t.customer_first_name,
          customer_last_name: t.customer_last_name,
          customer_phone: t.customer_phone,
          price_paid: t.price_paid,
          status: t.status,
          purchased_at: t.purchased_at,
          event_id: t.event_id,
          event_name: t.events?.name,
          ticket_type_name: t.ticket_types?.name,
        }));
        setTickets(enriched);

        const seen = new Map<string, string>();
        enriched.forEach(t => {
          if (t.event_id && t.event_name) seen.set(t.event_id, t.event_name);
        });
        const eventList = Array.from(seen.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setEvents(eventList);

        // Fetch ticket availability for each event
        const eventIds = eventList.map(e => e.id);
        if (eventIds.length > 0) {
          const [{ data: types }, { data: allTickets }] = await Promise.all([
            supabase.from('ticket_types').select('event_id, quantity_available').in('event_id', eventIds),
            supabase.from('tickets').select('event_id').in('event_id', eventIds),
          ]);

          const statsMap = new Map<string, { total: number; sold: number }>();
          eventIds.forEach(id => statsMap.set(id, { total: 0, sold: 0 }));
          (types || []).forEach((tt: any) => {
            const cur = statsMap.get(tt.event_id);
            if (cur) cur.total += tt.quantity_available;
          });
          (allTickets || []).forEach((t: any) => {
            const cur = statsMap.get(t.event_id);
            if (cur) cur.sold += 1;
          });

          setEventTicketStats(
            eventList.map(ev => {
              const s = statsMap.get(ev.id) || { total: 0, sold: 0 };
              return { name: ev.name, total: s.total, sold: s.sold, remaining: s.total - s.sold };
            })
          );
        }
      }
      setIsLoading(false);
    };
    load();
  }, [user]);

  // Today
  const todayTickets = tickets.filter(t => t.purchased_at?.startsWith(today));
  const todayRevenue = todayTickets.reduce((s, t) => s + Number(t.price_paid), 0);
  const todayClients = new Set(todayTickets.map(t => t.customer_phone).filter(Boolean)).size;

  // Hourly chart for today
  const currentHour = new Date().getHours();
  const hourlyData = Array.from({ length: currentHour + 1 }, (_, h) => ({
    heure: `${String(h).padStart(2, '0')}h`,
    billets: 0,
    ca: 0,
  }));
  todayTickets.forEach(t => {
    const h = new Date(t.purchased_at).getHours();
    if (h <= currentHour) {
      hourlyData[h].billets += 1;
      hourlyData[h].ca += Number(t.price_paid);
    }
  });
  const visibleHourlyData = hourlyData.filter(h => parseInt(h.heure) >= 6);
  const hasHourlyActivity = visibleHourlyData.some(d => d.billets > 0);

  // Event breakdown today
  const todayEventBreakdown = events
    .map(ev => {
      const evTickets = todayTickets.filter(t => t.event_id === ev.id);
      return { name: ev.name, billets: evTickets.length, ca: evTickets.reduce((s, t) => s + Number(t.price_paid), 0) };
    })
    .filter(ev => ev.billets > 0)
    .sort((a, b) => b.billets - a.billets);

  // Period + event filter
  const periodStart = format(subDays(new Date(), periodDays), 'yyyy-MM-dd');
  const periodFiltered = tickets.filter(t => {
    const inPeriod = (t.purchased_at || '') >= periodStart;
    const inEvent = selectedEvent === 'all' || t.event_id === selectedEvent;
    return inPeriod && inEvent;
  });
  const periodRevenue = periodFiltered.reduce((s, t) => s + Number(t.price_paid), 0);

  // Daily chart
  const chartDays = Array.from({ length: periodDays }, (_, i) => {
    const d = subDays(new Date(), periodDays - 1 - i);
    return {
      date: format(d, 'yyyy-MM-dd'),
      label: format(d, periodDays <= 7 ? 'EEE dd' : 'dd/MM', { locale: fr }),
      count: 0,
      ca: 0,
    };
  });
  periodFiltered.forEach(t => {
    const day = t.purchased_at?.slice(0, 10);
    const found = chartDays.find(d => d.date === day);
    if (found) { found.count += 1; found.ca += Number(t.price_paid); }
  });

  // Totals
  const totalTickets = tickets.length;
  const totalRevenue = tickets.reduce((s, t) => s + Number(t.price_paid), 0);
  const totalClients = new Set(tickets.map(t => t.customer_phone).filter(Boolean)).size;

  const Skeleton = () => <div className="h-8 w-24 animate-pulse rounded bg-secondary" />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Suivi de vos ventes de billets</p>
      </div>

      {/* ── Aujourd'hui ── */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Aujourd'hui — {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-l-4 border-l-primary shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Billets vendus</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Ticket className="w-4 h-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {isLoading ? <Skeleton /> : todayTickets.length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <Card className="border-l-4 border-l-amber shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">CA réalisé</CardTitle>
                <div className="p-2 rounded-lg bg-amber/10 text-amber"><TrendingUp className="w-4 h-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {isLoading ? <Skeleton /> : `${todayRevenue.toLocaleString('fr-FR')} FCFA`}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card className="border-l-4 border-l-teal shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Clients servis</CardTitle>
                <div className="p-2 rounded-lg bg-teal/10 text-teal"><Users className="w-4 h-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {isLoading ? <Skeleton /> : todayClients}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Hourly activity chart */}
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
                <BarChart data={visibleHourlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
        {!isLoading && todayEventBreakdown.length > 1 && (
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
                      <TableHead className="text-xs text-center">Billets</TableHead>
                      <TableHead className="text-xs text-right">CA (FCFA)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayEventBreakdown.map(ev => (
                      <TableRow key={ev.name}>
                        <TableCell className="text-xs font-medium">{ev.name}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {ev.billets}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium">
                          {ev.ca.toLocaleString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed today table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Détail des ventes du jour
              {todayTickets.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">({todayTickets.length} billet{todayTickets.length > 1 ? 's' : ''})</span>
              )}
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
                      <TableHead className="text-xs text-right">Montant</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayTickets.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {format(new Date(t.purchased_at), 'HH:mm')}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {[t.customer_first_name, t.customer_last_name].filter(Boolean).join(' ') || '—'}
                        </TableCell>
                        <TableCell className="text-xs">{t.customer_phone || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[140px] truncate">{t.event_name || '—'}</TableCell>
                        <TableCell className="text-xs">{t.ticket_type_name || '—'}</TableCell>
                        <TableCell className="text-xs text-right font-semibold">
                          {Number(t.price_paid).toLocaleString('fr-FR')}
                        </TableCell>
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
                  periodDays === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
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
                  {events.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
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
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton /> : periodFiltered.length}
              </div>
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
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton /> : `${periodRevenue.toLocaleString('fr-FR')} FCFA`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ces {periodDays} derniers jours{selectedEvent !== 'all' ? ` · ${events.find(e => e.id === selectedEvent)?.name}` : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Billets vendus par jour</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">Chargement...</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartDays} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v} billet${v > 1 ? 's' : ''}`, 'Vendus']}
                    labelFormatter={(l) => `${l}`}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Disponibilité des billets ── */}
      {!isLoading && eventTicketStats.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Disponibilité des billets par événement
          </h2>
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Événement</TableHead>
                      <TableHead className="text-xs text-center">Capacité totale</TableHead>
                      <TableHead className="text-xs text-center">Vendus</TableHead>
                      <TableHead className="text-xs text-center">Restants</TableHead>
                      <TableHead className="text-xs">Remplissage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventTicketStats.map(stat => {
                      const pct = stat.total > 0 ? Math.round((stat.sold / stat.total) * 100) : 0;
                      return (
                        <TableRow key={stat.name}>
                          <TableCell className="text-xs font-medium max-w-[180px] truncate">{stat.name}</TableCell>
                          <TableCell className="text-xs text-center text-muted-foreground">{stat.total}</TableCell>
                          <TableCell className="text-xs text-center">
                            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {stat.sold}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full font-bold text-xs ${
                              stat.remaining === 0
                                ? 'bg-destructive/10 text-destructive'
                                : stat.remaining <= stat.total * 0.2
                                  ? 'bg-rose/10 text-rose'
                                  : 'bg-green-500/10 text-green-600'
                            }`}>
                              {stat.remaining}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct >= 80 ? 'bg-destructive' : pct >= 50 ? 'bg-amber' : 'bg-primary'}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
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
        </section>
      )}

      {/* ── Totaux généraux ── */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Totaux généraux</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Total billets émis', value: totalTickets, icon: Ticket, color: 'bg-primary/10 text-primary' },
            { title: 'Clients uniques', value: totalClients, icon: Users, color: 'bg-teal/10 text-teal' },
            { title: 'CA total (FCFA)', value: totalRevenue.toLocaleString('fr-FR'), icon: TrendingUp, color: 'bg-amber/10 text-amber' },
          ].map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
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

export default ManagerDashboard;
