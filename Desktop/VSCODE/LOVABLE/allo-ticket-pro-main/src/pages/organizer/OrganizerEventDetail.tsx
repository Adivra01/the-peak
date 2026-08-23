import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Ticket, TrendingUp, Users,
  UserCheck, Store, Trophy, Search, Clock, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface EventInfo {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_public: boolean;
  image_url: string | null;
  description: string | null;
}

interface TicketTypeStat {
  id: string;
  name: string;
  price: number;
  sold: number;
  available: number;
  revenue: number;
}

interface ManagerStat {
  id: string;
  name: string;
  phone: string | null;
  billets: number;
  ca: number;
}

interface BuyerRow {
  id: string;
  ticket_code: string;
  name: string;
  phone: string | null;
  email: string | null;
  ticket_type: string;
  price_paid: number;
  status: string;
  manager_id: string | null;
  manager_name: string | null;
  purchased_at: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'valid':
    case 'active': return <Badge className="bg-teal/10 text-teal border-teal/20 text-xs">Valide</Badge>;
    case 'used': return <Badge className="bg-amber/10 text-amber border-amber/20 text-xs">Utilisé</Badge>;
    case 'cancelled': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Annulé</Badge>;
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};

const PAGE_SIZE = 50;

/* ─── Component ─────────────────────────────────────────────────────────── */
const OrganizerEventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [typeStats, setTypeStats] = useState<TicketTypeStat[]>([]);
  const [mgrStats, setMgrStats] = useState<ManagerStat[]>([]);
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      try {
        // 1. Event info
        const { data: ev } = await supabase
          .from('events')
          .select('id, name, event_date, event_time, location, is_public, image_url, description')
          .eq('id', eventId)
          .single();
        setEvent(ev);

        // 2. Ticket types
        const { data: types } = await supabase
          .from('ticket_types')
          .select('id, name, price, quantity_available, quantity_sold')
          .eq('event_id', eventId);

        // 3. Tickets
        const { data: tickets } = await supabase
          .from('tickets')
          .select('id, ticket_code, customer_first_name, customer_last_name, customer_phone, customer_email, price_paid, status, manager_id, purchased_at, ticket_type_id, ticket_types(name)')
          .eq('event_id', eventId)
          .order('purchased_at', { ascending: false });

        const ticketList = (tickets || []) as any[];

        // 4. Manager names from manager_requests
        const mgrIds = [...new Set(ticketList.filter(t => t.manager_id).map(t => t.manager_id as string))];
        const mgrNameMap = new Map<string, { name: string; phone: string | null }>();
        if (mgrIds.length > 0) {
          const { data: mgrData } = await supabase
            .from('manager_requests')
            .select('user_id, full_name, phone')
            .in('user_id', mgrIds)
            .eq('status', 'approved');
          ((mgrData || []) as any[]).forEach(m => {
            mgrNameMap.set(m.user_id, { name: m.full_name, phone: m.phone });
          });
        }

        // 5. Build ticket-type stats
        const typeMap = new Map<string, TicketTypeStat>();
        (types || []).forEach((tt: any) => {
          typeMap.set(tt.id, { id: tt.id, name: tt.name, price: tt.price, sold: 0, available: tt.quantity_available, revenue: 0 });
        });
        ticketList.forEach(t => {
          const s = typeMap.get(t.ticket_type_id);
          if (s) { s.sold += 1; s.revenue += Number(t.price_paid); }
        });
        setTypeStats(Array.from(typeMap.values()));

        // 6. Build manager stats for this event
        const mgrStatMap = new Map<string, ManagerStat>();
        ticketList.filter(t => t.manager_id).forEach(t => {
          const id = t.manager_id as string;
          const info = mgrNameMap.get(id);
          const cur = mgrStatMap.get(id);
          if (cur) { cur.billets += 1; cur.ca += Number(t.price_paid); }
          else mgrStatMap.set(id, { id, name: info?.name ?? `Gestionnaire (${id.slice(0, 6)}…)`, phone: info?.phone ?? null, billets: 1, ca: Number(t.price_paid) });
        });
        setMgrStats(Array.from(mgrStatMap.values()).sort((a, b) => b.billets - a.billets));

        // 7. Build buyers list
        setBuyers(ticketList.map(t => ({
          id: t.id,
          ticket_code: t.ticket_code,
          name: [t.customer_first_name, t.customer_last_name].filter(Boolean).join(' ') || '—',
          phone: t.customer_phone,
          email: t.customer_email,
          ticket_type: (t.ticket_types as any)?.name ?? '—',
          price_paid: Number(t.price_paid),
          status: t.status ?? 'valid',
          manager_id: t.manager_id,
          manager_name: t.manager_id ? (mgrNameMap.get(t.manager_id)?.name ?? null) : null,
          purchased_at: t.purchased_at,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [eventId]);

  /* Derived */
  const totalBillets = buyers.length;
  const totalRevenue = buyers.reduce((s, b) => s + b.price_paid, 0);
  const directCount = buyers.filter(b => !b.manager_id).length;
  const mgrCount = buyers.filter(b => !!b.manager_id).length;
  const totalCapacity = typeStats.reduce((s, t) => s + t.available, 0);
  const totalRemaining = totalCapacity - totalBillets;

  const filtered = buyers.filter(b => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.phone ?? '').includes(q) ||
      (b.email ?? '').toLowerCase().includes(q) ||
      b.ticket_code.toLowerCase().includes(q) ||
      b.ticket_type.toLowerCase().includes(q) ||
      (b.manager_name ?? '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/organizer/events')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />Retour
        </Button>
        <p className="text-muted-foreground">Événement introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Back + Header ── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/organizer/events')}
          className="gap-2 text-muted-foreground hover:text-foreground mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes événements
        </Button>

        {/* Event banner */}
        {event.image_url && (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <h1 className="text-3xl font-display font-bold text-white drop-shadow">{event.name}</h1>
            </div>
          </div>
        )}

        {!event.image_url && (
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">{event.name}</h1>
        )}

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(event.event_date), 'EEEE d MMMM yyyy', { locale: fr })}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {event.event_time.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {event.location}
          </span>
          <Badge variant={event.is_public ? 'default' : 'secondary'} className="text-xs">
            {event.is_public ? 'Public' : 'Privé'}
          </Badge>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Billets vendus', value: totalBillets, icon: Ticket, border: 'border-l-primary', bg: 'bg-primary/10 text-primary' },
          { label: 'CA total', value: `${totalRevenue.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, border: 'border-l-amber', bg: 'bg-amber/10 text-amber' },
          { label: 'Ventes directes', value: directCount, icon: UserCheck, border: 'border-l-green-500', bg: 'bg-green-500/10 text-green-600' },
          { label: 'Via gestionnaire', value: mgrCount, icon: Store, border: 'border-l-indigo-500', bg: 'bg-indigo-500/10 text-indigo-600' },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className={`border-l-4 ${c.border} shadow-soft`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <div className={`p-2 rounded-lg ${c.bg}`}><c.icon className="w-4 h-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{c.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Capacité / Stock ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card className="border-l-4 border-l-teal shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capacité totale</CardTitle>
              <div className="p-2 rounded-lg bg-teal/10 text-teal"><Ticket className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground mt-1">billets disponibles à la vente</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <Card className="border-l-4 border-l-amber shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Billets vendus</CardTitle>
              <div className="p-2 rounded-lg bg-amber/10 text-amber"><Ticket className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalBillets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCapacity > 0 ? `${Math.round((totalBillets / totalCapacity) * 100)}% de la capacité` : '—'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`border-l-4 shadow-soft ${totalRemaining === 0 ? 'border-l-destructive' : totalRemaining <= totalCapacity * 0.2 ? 'border-l-rose' : 'border-l-green-500'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Billets restants</CardTitle>
              <div className={`p-2 rounded-lg ${totalRemaining === 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                <Ticket className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalRemaining === 0 ? 'text-destructive' : 'text-foreground'}`}>{totalRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalRemaining === 0 ? 'Complet — plus de billets disponibles' : 'encore disponibles'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Types de billets ── */}
      {typeStats.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Répartition par type de billet</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Prix unitaire</TableHead>
                    <TableHead className="text-xs text-center">Capacité</TableHead>
                    <TableHead className="text-xs text-center">Vendus</TableHead>
                    <TableHead className="text-xs text-center">Restants</TableHead>
                    <TableHead className="text-xs text-right">CA (FCFA)</TableHead>
                    <TableHead className="text-xs">Remplissage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeStats.map(tt => {
                    const remaining = tt.available - tt.sold;
                    const pct = tt.available > 0 ? Math.round((tt.sold / tt.available) * 100) : 0;
                    return (
                      <TableRow key={tt.id}>
                        <TableCell className="text-xs font-semibold">{tt.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{tt.price.toLocaleString('fr-FR')} FCFA</TableCell>
                        <TableCell className="text-xs text-center text-muted-foreground">{tt.available}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-primary/10 text-primary font-bold text-xs">{tt.sold}</span>
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full font-bold text-xs ${remaining === 0 ? 'bg-destructive/10 text-destructive' : remaining <= tt.available * 0.2 ? 'bg-rose/10 text-rose' : 'bg-green-500/10 text-green-600'}`}>
                            {remaining}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">{tt.revenue.toLocaleString('fr-FR')}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 80 ? 'bg-destructive' : pct >= 50 ? 'bg-amber' : 'bg-primary'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground w-8">{pct}%</span>
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
      )}

      {/* ── Gestionnaires ── */}
      {mgrStats.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber" />
                Gestionnaires — performances sur cet événement
              </CardTitle>
              <Badge variant="outline" className="text-xs">{mgrStats.length} gestionnaire{mgrStats.length > 1 ? 's' : ''}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8">#</TableHead>
                    <TableHead className="text-xs">Nom du gestionnaire</TableHead>
                    <TableHead className="text-xs">Téléphone</TableHead>
                    <TableHead className="text-xs text-center">Billets vendus</TableHead>
                    <TableHead className="text-xs text-right">CA (FCFA)</TableHead>
                    <TableHead className="text-xs">Part des ventes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mgrStats.map((mgr, i) => {
                    const pct = mgrCount > 0 ? Math.round((mgr.billets / mgrCount) * 100) : 0;
                    return (
                      <TableRow key={mgr.id} className={i === 0 ? 'bg-amber/5' : ''}>
                        <TableCell className="text-xs font-bold text-muted-foreground">
                          {i === 0 ? <Trophy className="w-3.5 h-3.5 text-amber inline" /> : i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-foreground">{mgr.name}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mgr.phone || '—'}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-xs">
                            {mgr.billets}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">{mgr.ca.toLocaleString('fr-FR')}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-muted-foreground w-8">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">{mgrCount} billet{mgrCount > 1 ? 's' : ''} via gestionnaire</span>
              <span className="text-sm font-bold text-foreground">
                {buyers.filter(b => !!b.manager_id).reduce((s, b) => s + b.price_paid, 0).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Liste des acheteurs ── */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Liste des acheteurs
              <span className="text-xs font-normal text-muted-foreground">({buyers.length})</span>
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Nom, téléphone, code…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {buyers.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Aucun billet vendu pour cet événement</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Aucun résultat pour « {search} »</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date / Heure</TableHead>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Téléphone</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Canal</TableHead>
                      <TableHead className="text-xs text-right">Prix</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {format(new Date(b.purchased_at), 'dd MMM HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{b.ticket_code}</TableCell>
                        <TableCell className="text-xs font-medium">{b.name}</TableCell>
                        <TableCell className="text-xs">{b.phone || '—'}</TableCell>
                        <TableCell className="text-xs">{b.email || '—'}</TableCell>
                        <TableCell className="text-xs">{b.ticket_type}</TableCell>
                        <TableCell className="text-xs">
                          {b.manager_id ? (
                            <span className="inline-flex items-center gap-1 text-indigo-600">
                              <Store className="w-3 h-3" />
                              {b.manager_name ?? 'Gestionnaire'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <UserCheck className="w-3 h-3" />
                              Direct
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">
                          {b.price_paid.toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell><StatusBadge status={b.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-medium px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">{totalBillets} billet{totalBillets > 1 ? 's' : ''} au total</span>
                <span className="text-sm font-bold text-foreground">{totalRevenue.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizerEventDetail;
