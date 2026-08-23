import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Loader2, Ticket, Eye, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MediaUploadSection from '@/components/admin/MediaUploadSection';
import EventTicketDetailModal from '@/components/EventTicketDetailModal';

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string | null;
  is_public: boolean;
  is_featured: boolean | null;
  organizer: string | null;
  category_id: string | null;
  gallery?: string[] | null;
  video_url?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  fees: number;
  client_price: number;
  manager_fees: number;
  quantity_available: number;
  quantity_sold: number;
  event_id: string;
  start_time?: string | null;
  end_time?: string | null;
}

interface OrganizerOption {
  id: string;
  name: string;
  email: string;
}

// Ticket type for the form (without id for new tickets)
interface TicketTypeFormItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  fees: number;
  client_price: number;
  manager_fees: number;
  quantity_available: number;
  quantity_sold?: number;
  start_time: string;
  end_time: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

// UUID regex to detect organizer-submitted events
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isOrganizerProposal = (ev: Event) =>
  !ev.is_public && ev.organizer != null && (
    UUID_RE.test(ev.organizer) ||
    ev.organizer.startsWith('PENDING_ADMIN:') ||
    ev.organizer.startsWith('REJECTED:')
  );

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [approvedOrganizers, setApprovedOrganizers] = useState<OrganizerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  // Approval workflow state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingEvent, setRejectingEvent] = useState<Event | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  
  // Ticket types in the event form
  const [formTicketTypes, setFormTicketTypes] = useState<TicketTypeFormItem[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Event Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    image_url: '',
    gallery: [] as string[],
    video_url: '',
    is_public: true,
    is_featured: false,
    organizer: '',
    category_id: '',
  });

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    name: '',
    description: '',
    price: 0,
    fees: 0,
    client_price: 0,
    manager_fees: 0,
    quantity_available: 100,
    start_time: '',
    end_time: '',
  });

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchApprovedOrganizers = async () => {
    try {
      const { data } = await supabase
        .from('organizer_requests')
        .select('id, name, email')
        .eq('status', 'approved')
        .order('name');
      setApprovedOrganizers(data || []);
    } catch (error) {
      console.error('Error fetching organizers:', error);
    }
  };

  const fetchTicketTypesForEvent = async (eventId: string) => {
    setIsLoadingTickets(true);
    try {
      const [{ data: ticketTypes, error: ticketTypesError }, { data: soldTickets, error: soldTicketsError }] = await Promise.all([
        supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .order('price', { ascending: true }),
        supabase
          .from('tickets')
          .select('ticket_type_id')
          .eq('event_id', eventId),
      ]);

      if (ticketTypesError) throw ticketTypesError;
      if (soldTicketsError) throw soldTicketsError;

      const quantitySoldByType = (soldTickets || []).reduce<Record<string, number>>((accumulator, ticket) => {
        accumulator[ticket.ticket_type_id] = (accumulator[ticket.ticket_type_id] || 0) + 1;
        return accumulator;
      }, {});
      
      setFormTicketTypes((ticketTypes || []).map(tt => ({
        id: tt.id,
        name: tt.name,
        description: tt.description || '',
        price: tt.price,
        fees: (tt as any).fees || 0,
        client_price: (tt as any).client_price || 0,
        manager_fees: (tt as any).manager_fees || 0,
        quantity_available: tt.quantity_available,
        quantity_sold: quantitySoldByType[tt.id] || 0,
        start_time: (tt as any).start_time || '',
        end_time: (tt as any).end_time || '',
        isNew: false,
        isDeleted: false,
      })));
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les types de billets',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchApprovedOrganizers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      image_url: '',
      gallery: [],
      video_url: '',
      is_public: true,
      is_featured: false,
      organizer: '',
      category_id: '',
    });
    setFormTicketTypes([]);
    setNewTicket({
      name: '',
      description: '',
      price: 0,
      fees: 0,
      client_price: 0,
      manager_fees: 0,
      quantity_available: 100,
      start_time: '',
      end_time: '',
    });
    setEditingEvent(null);
  };

  const handleOpenDialog = async (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        description: event.description || '',
        event_date: event.event_date,
        event_time: event.event_time,
        location: event.location,
        image_url: event.image_url || '',
        gallery: event.gallery || [],
        video_url: event.video_url || '',
        is_public: event.is_public,
        is_featured: event.is_featured || false,
        organizer: event.organizer || '',
        category_id: event.category_id || '',
      });
      await fetchTicketTypesForEvent(event.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleAddTicketType = () => {
    if (!newTicket.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du billet est requis',
        variant: 'destructive',
      });
      return;
    }

    setFormTicketTypes([
      ...formTicketTypes,
      {
        ...newTicket,
        quantity_sold: 0,
        isNew: true,
        isDeleted: false,
      },
    ]);

    setNewTicket({
      name: '',
      description: '',
      price: 0,
      fees: 0,
      client_price: 0,
      manager_fees: 0,
      quantity_available: 100,
      start_time: '',
      end_time: '',
    });

    toast({
      title: 'Billet ajouté',
      description: 'Le type de billet a été ajouté à l\'événement',
    });
  };

  const handleRemoveTicketType = (index: number) => {
    const ticket = formTicketTypes[index];

    if (ticket.quantity_sold > 0) {
      toast({
        title: 'Suppression impossible',
        description: 'Ce type de billet a déjà des réservations. Modifiez-le ou mettez sa quantité à 0.',
        variant: 'destructive',
      });
      return;
    }

    if (ticket.id && !ticket.isNew) {
      // Mark existing ticket as deleted
      setFormTicketTypes(
        formTicketTypes.map((t, i) =>
          i === index ? { ...t, isDeleted: true } : t
        )
      );
    } else {
      // Remove new ticket from the list
      setFormTicketTypes(formTicketTypes.filter((_, i) => i !== index));
    }
  };

  const handleUpdateTicketType = (index: number, field: keyof TicketTypeFormItem, value: string | number) => {
    setFormTicketTypes(
      formTicketTypes.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const deletedTickets = formTicketTypes.filter(t => t.isDeleted && t.id);
      const newTickets = formTicketTypes.filter(t => t.isNew && !t.isDeleted);
      const existingTickets = formTicketTypes.filter(t => t.id && !t.isNew && !t.isDeleted);

      const eventData = {
        name: formData.name,
        description: formData.description || null,
        event_date: formData.event_date,
        event_time: formData.event_time,
        location: formData.location,
        image_url: formData.image_url || null,
        gallery: formData.gallery,
        video_url: formData.video_url || null,
        is_public: formData.is_public,
        is_featured: formData.is_featured,
        organizer: formData.organizer || null,
        category_id: formData.category_id || null,
      };

      let eventId: string;

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        eventId = editingEvent.id;
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select('id')
          .single();

        if (error) throw error;
        eventId = data.id;
      }

      const deletedTicketIds = deletedTickets.flatMap((ticket) => (ticket.id ? [ticket.id] : []));
      let blockedDeletedTicketNames: string[] = [];

      if (deletedTicketIds.length > 0) {
        const [{ data: linkedTickets, error: linkedTicketsError }, { error: cleanupTransactionsError }] = await Promise.all([
          supabase
            .from('tickets')
            .select('ticket_type_id')
            .in('ticket_type_id', deletedTicketIds),
          supabase
            .from('payment_transactions')
            .delete()
            .in('ticket_type_id', deletedTicketIds),
        ]);

        if (linkedTicketsError) throw linkedTicketsError;
        if (cleanupTransactionsError) throw cleanupTransactionsError;

        const linkedTicketTypeIds = new Set((linkedTickets || []).map((ticket) => ticket.ticket_type_id));
        const deletableTicketIds = deletedTicketIds.filter((ticketId) => !linkedTicketTypeIds.has(ticketId));

        blockedDeletedTicketNames = deletedTickets
          .filter((ticket) => ticket.id && linkedTicketTypeIds.has(ticket.id))
          .map((ticket) => ticket.name);

        if (deletableTicketIds.length > 0) {
          const { error } = await supabase
            .from('ticket_types')
            .delete()
            .in('id', deletableTicketIds);

          if (error) throw error;
        }
      }

      // Insert new tickets
      if (newTickets.length > 0) {
        const { error } = await supabase
          .from('ticket_types')
          .insert(
            newTickets.map(t => ({
              name: t.name,
              description: t.description || null,
              price: t.price,
              fees: t.fees,
              client_price: t.client_price || null,
              manager_fees: t.manager_fees || 0,
              quantity_available: t.quantity_available,
              event_id: eventId,
              start_time: t.start_time || null,
              end_time: t.end_time || null,
            }))
          );
        if (error) throw error;
      }

      // Update existing tickets
      for (const ticket of existingTickets) {
        if (ticket.id) {
          const { error } = await supabase
            .from('ticket_types')
            .update({
              name: ticket.name,
              description: ticket.description || null,
              price: ticket.price,
              fees: ticket.fees,
              client_price: ticket.client_price || null,
              manager_fees: ticket.manager_fees || 0,
              quantity_available: ticket.quantity_available,
              start_time: ticket.start_time || null,
              end_time: ticket.end_time || null,
            })
            .eq('id', ticket.id);
          if (error) throw error;
        }
      }

      toast({
        title: editingEvent ? 'Événement modifié' : 'Événement créé',
        description: blockedDeletedTicketNames.length > 0
          ? `L'événement a été mis à jour, mais ces billets ont été conservés car ils ont déjà des réservations : ${blockedDeletedTicketNames.join(', ')}`
          : editingEvent
            ? 'L\'événement et ses billets ont été mis à jour avec succès'
            : 'L\'événement et ses billets ont été créés avec succès',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder l\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('event_id', id);

      if (ticketsError) throw ticketsError;

      const [
        paymentTransactionsResult,
        organizerEventsResult,
        discountCodesResult,
      ] = await Promise.all([
        supabase.from('payment_transactions').delete().eq('event_id', id),
        supabase.from('organizer_events').delete().eq('event_id', id),
        supabase.from('discount_codes').delete().eq('event_id', id),
      ]);

      if (paymentTransactionsResult.error) throw paymentTransactionsResult.error;
      if (organizerEventsResult.error) throw organizerEventsResult.error;
      if (discountCodesResult.error) throw discountCodesResult.error;

      const { error: ticketTypesError } = await supabase
        .from('ticket_types')
        .delete()
        .eq('event_id', id);

      if (ticketTypesError) throw ticketTypesError;

      // Then delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: 'Événement supprimé',
        description: 'L\'événement et tous ses billets ont été supprimés avec succès',
      });
      fetchEvents();
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'événement',
        variant: 'destructive',
      });
    }
  };

  // Approve organizer proposal
  const handleApproveProposal = async (ev: Event) => {
    setIsApproving(true);
    try {
      // Get organizer's display name
      const orgId = ev.organizer?.replace(/^(PENDING_ADMIN:|REJECTED:)/, '');
      let orgName = ev.organizer || '';
      if (orgId) {
        const { data: orgReq } = await supabase.from('organizer_requests').select('full_name').eq('user_id', orgId).maybeSingle();
        orgName = orgReq?.full_name || orgId.slice(0, 8);
      }
      // Clean description from any rejection comment
      let cleanDesc = ev.description || '';
      const marker = '__ADMIN_COMMENT__:';
      const idx = cleanDesc.indexOf(marker);
      if (idx !== -1) {
        const after = cleanDesc.slice(idx);
        const end = after.indexOf('\n---\n');
        cleanDesc = end === -1 ? cleanDesc.slice(0, idx).trim() : (cleanDesc.slice(0, idx) + cleanDesc.slice(idx + end + 5)).trim();
      }
      const { error } = await supabase.from('events').update({
        is_public: true,
        organizer: orgName,
        description: cleanDesc || null,
      }).eq('id', ev.id);
      if (error) throw error;
      toast({ title: 'Événement approuvé !', description: `"${ev.name}" est maintenant en ligne.` });
      fetchEvents();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally { setIsApproving(false); }
  };

  // Reject organizer proposal
  const handleRejectProposal = async () => {
    if (!rejectingEvent || !rejectComment.trim()) {
      toast({ title: 'Commentaire requis', variant: 'destructive' }); return;
    }
    setIsApproving(true);
    try {
      const orgId = rejectingEvent.organizer?.replace(/^(PENDING_ADMIN:|REJECTED:)/, '') || rejectingEvent.organizer;
      const cleanDesc = (rejectingEvent.description || '').replace(/__ADMIN_COMMENT__:[\s\S]*?\n---\n/, '').trim();
      const newDesc = `${cleanDesc}\n__ADMIN_COMMENT__:${rejectComment.trim()}\n---\n`;
      const { error } = await supabase.from('events').update({
        is_public: false,
        organizer: `REJECTED:${orgId}`,
        description: newDesc,
      }).eq('id', rejectingEvent.id);
      if (error) throw error;
      toast({ title: 'Événement refusé', description: 'L\'organisateur a été notifié du refus.' });
      setRejectDialogOpen(false);
      setRejectComment('');
      setRejectingEvent(null);
      fetchEvents();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally { setIsApproving(false); }
  };

  const pendingProposals = events.filter(isOrganizerProposal);
  const filteredEvents = events.filter(event =>
    !isOrganizerProposal(event) &&
    (event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const visibleTicketTypes = formTicketTypes.filter(t => !t.isDeleted);
  const hasLockedTicketTypes = visibleTicketTypes.some(ticket => ticket.quantity_sold > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Événements
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos événements et leurs types de billets
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Event Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">1</span>
                  Informations de l'événement
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_time">Heure *</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Organisateur</Label>
                  <Select
                    value={formData.organizer || '__none__'}
                    onValueChange={(value) => setFormData({ ...formData, organizer: value === '__none__' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un organisateur (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucun organisateur</SelectItem>
                      {approvedOrganizers.map((org) => (
                        <SelectItem key={org.id} value={org.name}>
                          {org.name} — {org.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {approvedOrganizers.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun organisateur approuvé. Approuvez des organisateurs depuis la section Organisateurs.</p>
                  )}
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                    <Label htmlFor="is_public">Public</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">En vedette</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Media Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">2</span>
                  Médias de l'événement
                </h3>
                <MediaUploadSection
                  imageUrl={formData.image_url}
                  gallery={formData.gallery}
                  videoUrl={formData.video_url}
                  onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                  onGalleryChange={(urls) => setFormData({ ...formData, gallery: urls })}
                  onVideoUrlChange={(url) => setFormData({ ...formData, video_url: url })}
                  eventId={editingEvent?.id}
                />
              </div>

              <Separator />

              {/* Ticket Types Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">3</span>
                  Types de billets
                </h3>

                {isLoadingTickets ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Add New Ticket Form */}
                    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                      <CardContent className="pt-4 space-y-3">
                        {/* Row 1: name + qty + add button */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="new_ticket_name" className="text-xs">Nom du billet *</Label>
                            <Input
                              id="new_ticket_name"
                              value={newTicket.name}
                              onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                              placeholder="Ex: Standard, VIP, Pelouse…"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new_ticket_qty" className="text-xs">Quantité *</Label>
                            <Input
                              id="new_ticket_qty"
                              type="number"
                              min="1"
                              value={newTicket.quantity_available}
                              onChange={(e) => setNewTicket({ ...newTicket, quantity_available: parseInt(e.target.value) || 1 })}
                              className="h-9"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddTicketType}
                              className="w-full h-9"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        </div>

                        {/* Row 2: créneau horaire */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Heure de début (optionnel)</Label>
                            <Input
                              type="time"
                              value={newTicket.start_time}
                              onChange={(e) => setNewTicket({ ...newTicket, start_time: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Heure de fin (optionnel)</Label>
                            <Input
                              type="time"
                              value={newTicket.end_time}
                              onChange={(e) => setNewTicket({ ...newTicket, end_time: e.target.value })}
                              className="h-9"
                            />
                          </div>
                        </div>

                        {/* Row 3: 4 prix fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="new_ticket_price" className="text-xs">Prix gestionnaire (FCFA) *</Label>
                            <Input
                              id="new_ticket_price"
                              type="number"
                              min="0"
                              value={newTicket.price}
                              onChange={(e) => setNewTicket({ ...newTicket, price: parseInt(e.target.value) || 0 })}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new_ticket_manager_fees" className="text-xs">Frais gestionnaire (FCFA)</Label>
                            <Input
                              id="new_ticket_manager_fees"
                              type="number"
                              min="0"
                              value={newTicket.manager_fees}
                              onChange={(e) => setNewTicket({ ...newTicket, manager_fees: parseInt(e.target.value) || 0 })}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new_ticket_client_price" className="text-xs">Prix client direct (FCFA)</Label>
                            <Input
                              id="new_ticket_client_price"
                              type="number"
                              min="0"
                              value={newTicket.client_price}
                              onChange={(e) => setNewTicket({ ...newTicket, client_price: parseInt(e.target.value) || 0 })}
                              placeholder="0 = même que gestionnaire"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new_ticket_fees" className="text-xs">Frais client direct (FCFA)</Label>
                            <Input
                              id="new_ticket_fees"
                              type="number"
                              min="0"
                              value={newTicket.fees}
                              onChange={(e) => setNewTicket({ ...newTicket, fees: parseInt(e.target.value) || 0 })}
                              className="h-9"
                            />
                          </div>
                        </div>

                        {/* Row 4: description */}
                        <div className="space-y-1">
                          <Label htmlFor="new_ticket_desc" className="text-xs">Description (optionnel)</Label>
                          <Input
                            id="new_ticket_desc"
                            value={newTicket.description}
                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                            placeholder="Avantages inclus…"
                            className="h-9"
                          />
                        </div>

                        {(newTicket.price > 0 || newTicket.fees > 0 || newTicket.client_price > 0 || newTicket.manager_fees > 0) && (
                          <div className="flex flex-wrap gap-4">
                            <p className="text-xs">
                              <span className="text-muted-foreground">Gestionnaire paie : </span>
                              <span className="font-semibold text-foreground">{(newTicket.price + newTicket.manager_fees).toLocaleString('fr-FR')} FCFA</span>
                              {newTicket.manager_fees > 0 && <span className="text-muted-foreground"> ({newTicket.price.toLocaleString('fr-FR')} + {newTicket.manager_fees.toLocaleString('fr-FR')} frais)</span>}
                            </p>
                            <p className="text-xs">
                              <span className="text-muted-foreground">Client direct paie : </span>
                              <span className="font-semibold text-foreground">{((newTicket.client_price || newTicket.price) + newTicket.fees).toLocaleString('fr-FR')} FCFA</span>
                              {newTicket.fees > 0 && <span className="text-muted-foreground"> ({(newTicket.client_price || newTicket.price).toLocaleString('fr-FR')} + {newTicket.fees.toLocaleString('fr-FR')} frais)</span>}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* List of Ticket Types */}
                    {visibleTicketTypes.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6 bg-secondary rounded-lg">
                        <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Aucun type de billet. Ajoutez-en au moins un ci-dessus.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {hasLockedTicketTypes && (
                          <Alert>
                            <AlertDescription>
                              Les types de billets déjà vendus restent modifiables, mais ne peuvent plus être supprimés.
                            </AlertDescription>
                          </Alert>
                        )}
                        {visibleTicketTypes.map((ticket, index) => {
                          const actualIndex = formTicketTypes.findIndex(t => t === ticket);
                          return (
                            <div
                              key={ticket.id || `new-${index}`}
                              className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Ticket className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 space-y-2">
                                {/* Row 1: name + qty */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Input
                                    value={ticket.name}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'name', e.target.value)}
                                    placeholder="Nom"
                                    className="h-8 md:col-span-2"
                                  />
                                  <Input
                                    type="number"
                                    min="1"
                                    value={ticket.quantity_available}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'quantity_available', parseInt(e.target.value) || 1)}
                                    placeholder="Quantité"
                                    className="h-8"
                                  />
                                </div>
                                {/* Row 2: créneau */}
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="time"
                                    value={ticket.start_time}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'start_time', e.target.value)}
                                    className="h-8 text-xs"
                                    title="Heure de début"
                                  />
                                  <Input
                                    type="time"
                                    value={ticket.end_time}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'end_time', e.target.value)}
                                    className="h-8 text-xs"
                                    title="Heure de fin"
                                  />
                                </div>
                                {/* Row 3: 4 prix fields */}
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="number" min="0"
                                    value={ticket.price}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'price', parseInt(e.target.value) || 0)}
                                    placeholder="Prix gestionnaire"
                                    className="h-8"
                                    title="Prix gestionnaire"
                                  />
                                  <Input
                                    type="number" min="0"
                                    value={ticket.manager_fees}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'manager_fees', parseInt(e.target.value) || 0)}
                                    placeholder="Frais gestionnaire"
                                    className="h-8"
                                    title="Frais gestionnaire"
                                  />
                                  <Input
                                    type="number" min="0"
                                    value={ticket.client_price}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'client_price', parseInt(e.target.value) || 0)}
                                    placeholder="Prix client direct (0=idem)"
                                    className="h-8"
                                    title="Prix client direct (0 = même que gestionnaire)"
                                  />
                                  <Input
                                    type="number" min="0"
                                    value={ticket.fees}
                                    onChange={(e) => handleUpdateTicketType(actualIndex, 'fees', parseInt(e.target.value) || 0)}
                                    placeholder="Frais client direct"
                                    className="h-8"
                                    title="Frais client direct"
                                  />
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                  <span>{ticket.quantity_sold || 0} vendu(s)</span>
                                  {ticket.start_time && ticket.end_time && (
                                    <span className="text-primary font-medium">⏱ {ticket.start_time.slice(0,5)} → {ticket.end_time.slice(0,5)}</span>
                                  )}
                                  <span className="text-foreground font-medium">Gestionnaire : {(ticket.price + ticket.manager_fees).toLocaleString('fr-FR')} FCFA</span>
                                  <span className="text-foreground font-medium">
                                    Client direct : {((ticket.client_price || ticket.price) + ticket.fees).toLocaleString('fr-FR')} FCFA
                                    {ticket.fees > 0 ? ` (+${ticket.fees.toLocaleString('fr-FR')} frais)` : ''}
                                  </span>
                                  {ticket.quantity_sold > 0 && <span>Suppression désactivée.</span>}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTicketType(actualIndex)}
                                className="flex-shrink-0"
                                disabled={ticket.quantity_sold > 0}
                                title={ticket.quantity_sold > 0 ? 'Impossible de supprimer un billet déjà vendu' : 'Supprimer ce type de billet'}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="gold" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingEvent ? 'Modifier l\'événement' : 'Créer l\'événement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending proposals section */}
      {pendingProposals.length > 0 && (
        <Card className="shadow-soft border-amber/30 bg-amber/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              Propositions d'organisateurs en attente ({pendingProposals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingProposals.map(ev => {
                const isRejected = ev.organizer?.startsWith('REJECTED:');
                return (
                  <div key={ev.id} className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${isRejected ? 'border-destructive/30 bg-destructive/5' : 'border-amber/30 bg-background'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{ev.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${isRejected ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-amber/10 text-amber-700 border-amber/20'}`}>
                          {isRejected ? 'Précédemment refusé' : 'En attente de validation'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(ev.event_date), 'dd MMM yyyy', { locale: fr })} · {ev.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => { setRejectingEvent(ev); setRejectDialogOpen(true); }} className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs">
                        <XCircle className="w-3.5 h-3.5 mr-1" />Refuser
                      </Button>
                      <Button variant="gold" size="sm" onClick={() => handleApproveProposal(ev)} disabled={isApproving} className="text-xs">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Approuver
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des événements ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun événement trouvé
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        {format(new Date(event.event_date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.is_public 
                            ? 'bg-teal/10 text-teal' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {event.is_public ? 'Public' : 'Privé'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDetailEventId(event.id)}
                            title="Voir les détails des billets"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(event)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'événement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. L'événement et tous ses billets associés seront supprimés.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(event.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject proposal dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-destructive" />
              Motif du refus
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {rejectingEvent && (
              <p className="text-sm text-muted-foreground">
                Expliquez à l'organisateur pourquoi <strong>"{rejectingEvent.name}"</strong> a été refusé, afin qu'il puisse corriger et resoumettre.
              </p>
            )}
            <div className="space-y-2">
              <Label>Commentaire pour l'organisateur *</Label>
              <Textarea
                value={rejectComment}
                onChange={e => setRejectComment(e.target.value)}
                placeholder="Ex: L'affiche est manquante, les prix sont incorrects, la description est insuffisante…"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setRejectDialogOpen(false); setRejectComment(''); }}>Annuler</Button>
              <Button
                variant="destructive" className="flex-1"
                onClick={handleRejectProposal}
                disabled={isApproving || !rejectComment.trim()}
              >
                {isApproving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Confirmer le refus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Ticket Detail Modal */}
      {detailEventId && (
        <EventTicketDetailModal
          eventId={detailEventId}
          open={!!detailEventId}
          onOpenChange={(open) => !open && setDetailEventId(null)}
        />
      )}
    </div>
  );
};

export default EventsManagement;
