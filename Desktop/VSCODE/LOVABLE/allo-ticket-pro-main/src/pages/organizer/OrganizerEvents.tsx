import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Calendar, MapPin, Clock, ArrowRight, Ticket, Plus,
  AlertCircle, CheckCircle2, XCircle, RefreshCw, Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Status helpers ─────────────────────────────────────────────────── */
// organizer = "PENDING_ADMIN:{user_id}" → pending admin approval
// organizer = "REJECTED:{user_id}" → rejected by admin
// organizer = "{user_id}" (UUID) → pending (legacy / initial)
// is_public = true → live

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getProposalStatus(ev: OrgEvent): 'pending' | 'pending_admin' | 'rejected' | 'live' {
  if (ev.is_public) return 'live';
  if (ev.organizer?.startsWith('REJECTED:')) return 'rejected';
  if (ev.organizer?.startsWith('PENDING_ADMIN:')) return 'pending_admin';
  return 'pending';
}

function getRejectionComment(ev: OrgEvent): string {
  const desc = ev.description || '';
  const marker = '__ADMIN_COMMENT__:';
  const idx = desc.indexOf(marker);
  if (idx === -1) return '';
  const after = desc.slice(idx + marker.length);
  const end = after.indexOf('\n---\n');
  return end === -1 ? after.trim() : after.slice(0, end).trim();
}

function cleanDescription(desc: string): string {
  const marker = '__ADMIN_COMMENT__:';
  const idx = desc.indexOf(marker);
  if (idx === -1) return desc;
  const after = desc.slice(idx);
  const end = after.indexOf('\n---\n');
  return end === -1 ? '' : desc.slice(0, idx) + desc.slice(idx + end + 5);
}

/* ── Types ──────────────────────────────────────────────────────────── */
interface OrgEvent {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_public: boolean | null;
  image_url: string | null;
  organizer: string | null;
  description: string | null;
}

interface EventTicketStat { total: number; sold: number; remaining: number; }

interface TicketFormItem {
  id: string;
  name: string;
  description: string;
  price: number;
  fees: number;
  client_price: number;
  manager_fees: number;
  quantity_available: number;
  start_time: string;
  end_time: string;
}

const newTicketItem = (): TicketFormItem => ({
  id: crypto.randomUUID(), name: '', description: '', price: 0, fees: 0,
  client_price: 0, manager_fees: 0, quantity_available: 100, start_time: '', end_time: '',
});

const STATUS_CONFIG = {
  live: { label: 'En ligne', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 },
  pending: { label: 'En attente de validation', color: 'bg-amber/10 text-amber border-amber/20', icon: AlertCircle },
  pending_admin: { label: 'Validé — Attente admin', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: AlertCircle },
  rejected: { label: 'Rejeté — Action requise', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

/* ── Component ──────────────────────────────────────────────────────── */
const OrganizerEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [ticketStatsMap, setTicketStatsMap] = useState<Map<string, EventTicketStat>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit event dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrgEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '', description: '', event_date: '', event_time: '',
    location: '', image_url: '', category_id: '',
  });
  const [ticketItems, setTicketItems] = useState<TicketFormItem[]>([newTicketItem()]);

  const fetchEvents = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Events assigned by admin
      const { data: assignments } = await supabase
        .from('organizer_events').select('event_id').eq('organizer_id', user.id);
      const assignedIds = (assignments || []).map((a: any) => a.event_id);

      // Events proposed by this organizer (organizer field starts with UUID or PENDING/REJECTED prefix)
      // We identify them by the organizer field containing the user.id
      const [assignedRes, proposedRes] = await Promise.all([
        assignedIds.length > 0
          ? supabase.from('events').select('id, name, event_date, event_time, location, is_public, image_url, organizer, description').in('id', assignedIds)
          : { data: [] },
        supabase.from('events').select('id, name, event_date, event_time, location, is_public, image_url, organizer, description')
          .or(`organizer.eq.${user.id},organizer.like.PENDING_ADMIN:${user.id},organizer.like.REJECTED:${user.id}`),
      ]);

      // Merge and deduplicate by id
      const allMap = new Map<string, OrgEvent>();
      [...(assignedRes.data || []), ...(proposedRes.data || [])].forEach((ev: any) => allMap.set(ev.id, ev));
      const allEvents = [...allMap.values()].sort((a, b) => a.event_date.localeCompare(b.event_date));
      setEvents(allEvents);

      // Stats
      const allIds = allEvents.map(e => e.id);
      if (allIds.length > 0) {
        const [{ data: types }, { data: soldTickets }] = await Promise.all([
          supabase.from('ticket_types').select('event_id, quantity_available').in('event_id', allIds),
          supabase.from('tickets').select('event_id').in('event_id', allIds),
        ]);
        const statsMap = new Map<string, EventTicketStat>();
        allIds.forEach(id => statsMap.set(id, { total: 0, sold: 0, remaining: 0 }));
        (types || []).forEach((tt: any) => {
          const cur = statsMap.get(tt.event_id);
          if (cur) cur.total += tt.quantity_available;
        });
        (soldTickets || []).forEach((t: any) => {
          const cur = statsMap.get(t.event_id);
          if (cur) cur.sold += 1;
        });
        statsMap.forEach(s => { s.remaining = s.total - s.sold; });
        setTicketStatsMap(statsMap);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchEvents();
    supabase.from('categories').select('id, name').order('name')
      .then(({ data }) => setCategories(data || []));
  }, [user]);

  const resetForm = () => {
    setFormData({ name: '', description: '', event_date: '', event_time: '', location: '', image_url: '', category_id: '' });
    setTicketItems([newTicketItem()]);
    setEditingEvent(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (ev: OrgEvent) => {
    setEditingEvent(ev);
    setFormData({
      name: ev.name,
      description: cleanDescription(ev.description || ''),
      event_date: ev.event_date,
      event_time: ev.event_time,
      location: ev.location,
      image_url: ev.image_url || '',
      category_id: '',
    });
    // Load ticket types
    supabase.from('ticket_types').select('*').eq('event_id', ev.id).then(({ data }) => {
      if (data && data.length > 0) {
        setTicketItems(data.map((tt: any) => ({
          id: tt.id, name: tt.name, description: tt.description || '',
          price: tt.price, fees: (tt as any).fees || 0,
          client_price: (tt as any).client_price || 0, manager_fees: (tt as any).manager_fees || 0,
          quantity_available: tt.quantity_available, start_time: (tt as any).start_time || '', end_time: (tt as any).end_time || '',
        })));
      } else { setTicketItems([newTicketItem()]); }
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.event_date || !formData.event_time || !formData.location) {
      toast({ title: 'Champs requis manquants', variant: 'destructive' }); return;
    }
    const validTickets = ticketItems.filter(t => t.name.trim());
    if (validTickets.length === 0) {
      toast({ title: 'Ajoutez au moins un type de billet', variant: 'destructive' }); return;
    }
    setIsSaving(true);
    try {
      const orgData = {
        name: formData.name,
        description: formData.description || null,
        event_date: formData.event_date,
        event_time: formData.event_time,
        location: formData.location,
        image_url: formData.image_url || null,
        is_public: false,
        organizer: editingEvent ? (editingEvent.organizer?.startsWith('REJECTED:') ? `PENDING_ADMIN:${user.id}` : editingEvent.organizer) : user.id,
        category_id: formData.category_id || null,
      };

      let eventId: string;
      if (editingEvent) {
        const { error } = await supabase.from('events').update(orgData).eq('id', editingEvent.id);
        if (error) throw error;
        eventId = editingEvent.id;
        // Delete old ticket types and re-insert
        await supabase.from('ticket_types').delete().eq('event_id', eventId);
      } else {
        const { data, error } = await supabase.from('events').insert(orgData).select('id').single();
        if (error) throw error;
        eventId = data.id;
        // Register as organizer for this event
        await supabase.from('organizer_events').insert({ organizer_id: user.id, event_id: eventId, assigned_by: user.id });
      }

      if (validTickets.length > 0) {
        const { error: ttErr } = await supabase.from('ticket_types').insert(
          validTickets.map(t => ({
            event_id: eventId, name: t.name, description: t.description || null,
            price: t.price, fees: t.fees, quantity_available: t.quantity_available,
            ...(t.client_price ? { client_price: t.client_price } : {}),
            ...(t.manager_fees ? { manager_fees: t.manager_fees } : {}),
            ...(t.start_time ? { start_time: t.start_time } : {}),
            ...(t.end_time ? { end_time: t.end_time } : {}),
          }))
        );
        if (ttErr) throw ttErr;
      }

      toast({ title: editingEvent ? 'Événement mis à jour' : 'Événement soumis !', description: 'Votre événement est en attente de validation par l\'administrateur.' });
      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const liveEvents = events.filter(e => e.is_public);
  const proposedEvents = events.filter(e => !e.is_public);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mes événements</h1>
          <p className="text-muted-foreground mt-1">
            {events.length} événement{events.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />Proposer un événement
        </Button>
      </div>

      {/* Pending / Rejected events */}
      {proposedEvents.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">En cours de validation</h2>
          <div className="grid gap-3">
            {proposedEvents.map((ev, i) => {
              const status = getProposalStatus(ev);
              const cfg = STATUS_CONFIG[status];
              const comment = getRejectionComment(ev);
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`border-l-4 ${status === 'rejected' ? 'border-l-destructive' : status === 'pending_admin' ? 'border-l-blue-500' : 'border-l-amber'} shadow-soft`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground">{ev.name}</h3>
                            <Badge className={`${cfg.color} text-xs border`}>
                              <cfg.icon className="w-3 h-3 mr-1" />{cfg.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(ev.event_date), 'dd MMMM yyyy', { locale: fr })}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>
                          </div>
                          {status === 'rejected' && comment && (
                            <div className="mt-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive">
                              <strong>Motif du refus :</strong> {comment}
                            </div>
                          )}
                          {status === 'pending' && (
                            <p className="mt-1 text-xs text-muted-foreground">En attente de validation par l'administrateur</p>
                          )}
                          {status === 'pending_admin' && (
                            <p className="mt-1 text-xs text-blue-600">Approuvé par le superviseur — En attente de validation finale</p>
                          )}
                        </div>
                        {status === 'rejected' && (
                          <Button size="sm" variant="outline" onClick={() => openEdit(ev)} className="shrink-0">
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />Corriger et resoum.
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Live events */}
      {liveEvents.length === 0 && proposedEvents.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun événement</p>
            <p className="text-sm mt-1">Proposez votre premier événement, il sera affiché après validation.</p>
          </CardContent>
        </Card>
      ) : liveEvents.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Événements en ligne</h2>
          <div className="grid gap-4">
            {liveEvents.map((event, i) => {
              const isPast = new Date(event.event_date) < new Date();
              const stats = ticketStatsMap.get(event.id);
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="shadow-soft hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {event.image_url ? (
                          <div className="w-28 sm:w-36 shrink-0">
                            <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-28 sm:w-36 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-primary/40" />
                          </div>
                        )}
                        <div className="flex-1 p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground text-base leading-tight">{event.name}</h3>
                              <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 border-green-200 border">En ligne</Badge>
                              {isPast && <Badge variant="outline" className="text-xs text-muted-foreground">Terminé</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(event.event_date), 'dd MMMM yyyy', { locale: fr })}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{event.event_time.slice(0, 5)}</span>
                              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                            </div>
                            {stats && stats.total > 0 && (
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Ticket className="w-3 h-3" />{stats.total} disponibles</span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs font-medium text-primary">{stats.sold} vendus</span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className={`text-xs font-semibold ${stats.remaining === 0 ? 'text-destructive' : stats.remaining <= stats.total * 0.2 ? 'text-rose' : 'text-green-600'}`}>
                                  {stats.remaining} restants
                                </span>
                              </div>
                            )}
                          </div>
                          <Button onClick={() => navigate(`/organizer/events/${event.id}`)} className="shrink-0 gap-2 font-medium">
                            Voir les détails<ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Create/Edit event dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Modifier et resoumettre' : 'Proposer un événement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <section className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                Informations de l'événement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nom de l'événement *</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Nom de votre événement" />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.event_date} onChange={e => setFormData({ ...formData, event_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Heure *</Label>
                  <Input type="time" value={formData.event_time} onChange={e => setFormData({ ...formData, event_time: e.target.value })} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Lieu *</Label>
                  <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required placeholder="Adresse ou nom du lieu" />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.category_id} onValueChange={v => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Image URL (optionnel)</Label>
                  <Input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://…" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Décrivez votre événement…" />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                  Types de billets
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setTicketItems(prev => [...prev, newTicketItem()])}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Ajouter un billet
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Vous pouvez créer plusieurs types de billets (Standard, VIP, Tribune, etc.) pour le même événement.</p>
              {ticketItems.map((tt, idx) => (
                <div key={tt.id} className="bg-secondary/40 rounded-xl p-4 space-y-3 relative">
                  {ticketItems.length > 1 && (
                    <button type="button" onClick={() => setTicketItems(prev => prev.filter(x => x.id !== tt.id))} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Nom du billet *</Label>
                      <Input value={tt.name} onChange={e => setTicketItems(prev => prev.map(x => x.id === tt.id ? { ...x, name: e.target.value } : x))} placeholder="Ex: Standard, VIP, Pelouse…" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantité *</Label>
                      <Input type="number" min="1" value={tt.quantity_available} onChange={e => setTicketItems(prev => prev.map(x => x.id === tt.id ? { ...x, quantity_available: parseInt(e.target.value) || 1 } : x))} className="h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Prix gestionnaire (FCFA) *</Label>
                      <Input type="number" min="0" value={tt.price} onChange={e => setTicketItems(prev => prev.map(x => x.id === tt.id ? { ...x, price: parseInt(e.target.value) || 0 } : x))} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix client direct (FCFA)</Label>
                      <Input type="number" min="0" value={tt.client_price} onChange={e => setTicketItems(prev => prev.map(x => x.id === tt.id ? { ...x, client_price: parseInt(e.target.value) || 0 } : x))} placeholder="0 = même" className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description (optionnel)</Label>
                    <Input value={tt.description} onChange={e => setTicketItems(prev => prev.map(x => x.id === tt.id ? { ...x, description: e.target.value } : x))} placeholder="Avantages inclus…" className="h-9" />
                  </div>
                </div>
              ))}
            </section>

            <div className="bg-amber/5 border border-amber/20 rounded-lg p-3 text-xs text-amber-700">
              Votre événement sera soumis à l'administrateur pour validation avant d'être affiché sur la plateforme.
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setDialogOpen(false); resetForm(); }}>Annuler</Button>
              <Button type="submit" variant="gold" className="flex-1" disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi…</> : editingEvent ? 'Resoumettre l\'événement' : 'Soumettre pour validation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerEvents;
