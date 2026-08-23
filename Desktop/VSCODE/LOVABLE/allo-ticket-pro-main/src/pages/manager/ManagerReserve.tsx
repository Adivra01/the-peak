import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, Ticket as TicketIcon, Plus, Trash2, Users, User, Minus, Clock } from 'lucide-react';

const fmtTime = (t: string) => t.slice(0, 5).replace(':', 'h');
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import DigitalTicket from '@/components/DigitalTicket';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface EventOption {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  location: string;
}

interface TicketTypeOption {
  id: string;
  name: string;
  price: number;
  fees: number;
  manager_fees: number;
  description: string | null;
  remaining: number;
  start_time?: string | null;
  end_time?: string | null;
}

interface BulkRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface GeneratedTicket {
  code: string;
  name: string;
  phone: string;
  email: string;
  emailSent: boolean;
}

/* ─── Shared ticket type picker ─────────────────────────────────────── */
const TicketTypePicker = ({
  events, ticketTypes, selectedEventId, selectedTicketTypeId, onEventChange, onTypeChange, eventError,
}: {
  events: EventOption[];
  ticketTypes: TicketTypeOption[];
  selectedEventId: string;
  selectedTicketTypeId: string;
  onEventChange: (id: string) => void;
  onTypeChange: (id: string) => void;
  eventError?: string;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Événement</Label>
      <Select value={selectedEventId} onValueChange={onEventChange}>
        <SelectTrigger><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
        <SelectContent>
          {events.map(ev => (
            <SelectItem key={ev.id} value={ev.id}>
              {ev.name} — {new Date(ev.event_date).toLocaleDateString('fr-FR')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {eventError && <p className="text-destructive text-xs">{eventError}</p>}
    </div>

    {ticketTypes.length > 0 && (
      <div className="space-y-2">
        <Label>Type de billet</Label>
        <RadioGroup value={selectedTicketTypeId} onValueChange={onTypeChange} className="space-y-2">
          {ticketTypes.map(tt => {
            const isSoldOut = tt.remaining <= 0;
            return (
              <Label
                key={tt.id}
                htmlFor={`type-${tt.id}`}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  isSoldOut
                    ? 'opacity-50 cursor-not-allowed bg-secondary'
                    : selectedTicketTypeId === tt.id
                      ? 'bg-primary/20 border-2 border-primary cursor-pointer'
                      : 'bg-secondary hover:bg-secondary/70 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={tt.id} id={`type-${tt.id}`} className="sr-only" disabled={isSoldOut} />
                  <TicketIcon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">{tt.name}</p>
                    {tt.start_time && tt.end_time && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary mt-0.5">
                        <Clock className="w-3 h-3" />
                        {fmtTime(tt.start_time)} → {fmtTime(tt.end_time)}
                      </span>
                    )}
                    {tt.description && <p className="text-sm text-muted-foreground mt-0.5">{tt.description}</p>}
                    <p className={`text-xs mt-0.5 font-medium ${isSoldOut ? 'text-destructive' : tt.remaining <= 10 ? 'text-rose' : 'text-green-600'}`}>
                      {isSoldOut ? 'Épuisé' : `${tt.remaining} restant${tt.remaining > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold">{(tt.price + (tt.manager_fees || 0)).toLocaleString()} FCFA</p>
                  <p className="text-xs text-muted-foreground">(gestionnaire)</p>
                  {tt.fees > 0 && (
                    <p className="text-xs text-muted-foreground">Client direct : {(tt.price + tt.fees).toLocaleString()} FCFA</p>
                  )}
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </div>
    )}
  </div>
);

/* ─── Quantity stepper ──────────────────────────────────────────────── */
const QuantityStepper = ({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(Math.max(1, value - 1))}
      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      <Minus className="w-4 h-4" />
    </button>
    <span className="w-12 text-center font-display font-bold text-xl">{value}</span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      disabled={value >= max}
    >
      <Plus className="w-4 h-4" />
    </button>
    <span className="text-xs text-muted-foreground">billet{value > 1 ? 's' : ''} (max 50 par bloc)</span>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────── */
const ManagerReserve = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');

  // Shared state
  const [events, setEvents] = useState<EventOption[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('');

  // Individual mode state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicket[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Intent dialog (shown when quantity > 1)
  const [showIntentDialog, setShowIntentDialog] = useState(false);

  // Bulk mode state
  const [bulkSubMode, setBulkSubMode] = useState<null | 'self' | 'multiple'>(null);

  // Bulk → self (N tickets same person)
  const [bulkSelfQty, setBulkSelfQty] = useState(2);
  const [bulkSelfResults, setBulkSelfResults] = useState<GeneratedTicket[]>([]);
  const [isBulkSelfProcessing, setIsBulkSelfProcessing] = useState(false);
  const [bulkSelfStep, setBulkSelfStep] = useState(1);

  // Bulk → multiple (rows)
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' },
    { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' },
  ]);
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkResults, setBulkResults] = useState<GeneratedTicket[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkEventError, setBulkEventError] = useState('');

  /* ── Data fetching ── */
  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      // Check if manager belongs to an organizer (via reviewed_by field)
      const { data: mgrReq } = await supabase
        .from('manager_requests')
        .select('reviewed_by')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (mgrReq?.reviewed_by) {
        // Manager belongs to an organizer — only show that organizer's events
        const { data: orgAssignments } = await supabase
          .from('organizer_events')
          .select('event_id')
          .eq('organizer_id', mgrReq.reviewed_by);
        const eventIds = (orgAssignments || []).map((a: any) => a.event_id);
        if (eventIds.length > 0) {
          const { data } = await supabase
            .from('events')
            .select('id, name, event_date, event_time, location')
            .in('id', eventIds)
            .eq('is_public', true);
          if (data) setEvents(data);
        }
      } else {
        // Manager not assigned to organizer — show all public events
        const { data } = await supabase
          .from('events')
          .select('id, name, event_date, event_time, location')
          .eq('is_public', true);
        if (data) setEvents(data);
      }
    };
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) { setTicketTypes([]); setSelectedTicketTypeId(''); setQuantity(1); return; }
    const fetchTypes = async () => {
      const [{ data: types }, { data: soldTickets }] = await Promise.all([
        supabase.from('ticket_types').select('id, name, price, fees, manager_fees, description, quantity_available, start_time, end_time').eq('event_id', selectedEventId),
        supabase.from('tickets').select('ticket_type_id').eq('event_id', selectedEventId),
      ]);
      if (types) {
        const soldMap = new Map<string, number>();
        (soldTickets || []).forEach((t: any) => {
          soldMap.set(t.ticket_type_id, (soldMap.get(t.ticket_type_id) || 0) + 1);
        });
        setTicketTypes(types.map((tt: any) => ({
          id: tt.id, name: tt.name, price: tt.price, fees: tt.fees,
          manager_fees: tt.manager_fees || 0,
          description: tt.description,
          remaining: tt.quantity_available - (soldMap.get(tt.id) || 0),
          start_time: tt.start_time || null,
          end_time: tt.end_time || null,
        })));
      }
    };
    fetchTypes();
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedTicketType = ticketTypes.find(t => t.id === selectedTicketTypeId);
  const maxQty = Math.min(selectedTicketType?.remaining ?? 1, 50);

  /* ── Mode switch ── */
  const resetAll = () => {
    setSelectedEventId(''); setSelectedTicketTypeId(''); setTicketTypes([]);
    setStep(1); setBulkStep(1); setBulkResults([]); setErrors({}); setBulkEventError('');
    setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setQuantity(1);
    setCreatedTicket(null); setGeneratedTickets([]);
    setBulkSubMode(null);
    setBulkSelfQty(2); setBulkSelfResults([]); setBulkSelfStep(1);
    setBulkRows([
      { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' },
      { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' },
    ]);
  };

  const switchMode = (newMode: 'individual' | 'bulk') => { setMode(newMode); resetAll(); };

  /* ── Individual validation ── */
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Prénom requis';
    if (!lastName.trim()) errs.lastName = 'Nom requis';
    if (!phone.trim() || phone.length < 8) errs.phone = 'Téléphone invalide';
    if (!selectedEventId) errs.event = 'Sélectionnez un événement';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Click "Continuer" in individual mode ── */
  const handleContinue = () => {
    if (!validateStep1() || !selectedTicketTypeId) return;
    if (quantity > 1) {
      setShowIntentDialog(true); // ask: for myself or multiple people?
    } else {
      setStep(2);
    }
  };

  /* ── Intent: "For myself" with N tickets ── */
  const handleIntentSelf = () => {
    setShowIntentDialog(false);
    setStep(2); // go to confirmation with selfMode (quantity > 1)
  };

  /* ── Intent: "Multiple people" → pre-fill bulk form ── */
  const handleIntentMultiple = () => {
    setShowIntentDialog(false);
    const rows = Array.from({ length: quantity }, (_, i) => ({
      id: uuidv4(),
      firstName: i === 0 ? firstName : '',
      lastName: i === 0 ? lastName : '',
      phone: i === 0 ? phone : '',
      email: i === 0 ? email : '',
    }));
    setBulkRows(rows);
    setMode('bulk');
    setBulkStep(1);
    setStep(1);
    // event & type selection is shared, so it carries over
  };

  /* ── Individual reserve (1 ticket) ── */
  const handleReserveSingle = async () => {
    if (!user || !selectedTicketType || !selectedEvent) return;
    setIsProcessing(true);
    try {
      const ticketCode = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
      const { error } = await supabase.from('tickets').insert({
        user_id: user.id, manager_id: user.id,
        event_id: selectedEventId, ticket_type_id: selectedTicketTypeId,
        price_paid: selectedTicketType.price + (selectedTicketType.manager_fees || 0),
        ticket_code: ticketCode,
        qr_code_data: `${window.location.origin}/ticket/${ticketCode}`,
        customer_first_name: firstName, customer_last_name: lastName,
        customer_email: email || null, customer_phone: phone, status: 'active',
      }).select().single();
      if (error) throw error;
      if (email) sendEmail(email, `${firstName} ${lastName}`, ticketCode);
      setCreatedTicket({
        ticket_id: ticketCode, event_name: selectedEvent.name,
        ticket_type: selectedTicketType.name, price: selectedTicketType.price + (selectedTicketType.manager_fees || 0),
        event_date: selectedEvent.event_date, event_time: selectedEvent.event_time,
        event_location: selectedEvent.location, reservation_date: new Date().toISOString(),
        customer_name: lastName, customer_firstname: firstName,
        customer_phone: phone, customer_email: email, status: 'valid' as const,
      });
      setStep(3);
      toast({ title: 'Billet créé !', description: `Billet ${ticketCode} généré.` });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── Individual reserve (N tickets for same person) ── */
  const handleReserveMultiSelf = async () => {
    if (!user || !selectedTicketType || !selectedEvent) return;
    setIsProcessing(true);
    try {
      const toInsert = Array.from({ length: quantity }, () => {
        const code = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
        return {
          _code: code,
          payload: {
            user_id: user.id, manager_id: user.id,
            event_id: selectedEventId, ticket_type_id: selectedTicketTypeId,
            price_paid: selectedTicketType.price + (selectedTicketType.manager_fees || 0),
            ticket_code: code,
            qr_code_data: `${window.location.origin}/ticket/${code}`,
            customer_first_name: firstName, customer_last_name: lastName,
            customer_email: email || null, customer_phone: phone, status: 'active',
          },
        };
      });

      const { error } = await supabase.from('tickets').insert(toInsert.map(t => t.payload));
      if (error) throw error;

      // Send one email per ticket to same address
      if (email) {
        toInsert.forEach(t => sendEmail(email, `${firstName} ${lastName}`, t._code));
      }

      setGeneratedTickets(toInsert.map(t => ({
        code: t._code,
        name: `${firstName} ${lastName}`.trim(),
        phone, email, emailSent: !!email,
      })));
      setStep(3);
      toast({ title: `${quantity} billets créés !`, description: 'Tous les billets ont été générés avec succès.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReserve = () => quantity > 1 ? handleReserveMultiSelf() : handleReserveSingle();

  /* ── Email helper ── */
  const sendEmail = (to: string, name: string, code: string) => {
    if (!selectedEvent || !selectedTicketType) return;
    supabase.functions.invoke('send-ticket-email', {
      body: {
        to, customerName: name, ticketCode: code,
        eventName: selectedEvent.name, eventDate: selectedEvent.event_date,
        eventTime: selectedEvent.event_time, eventLocation: selectedEvent.location,
        ticketType: selectedTicketType.name, pricePaid: selectedTicketType.price + (selectedTicketType.manager_fees || 0),
        qrCodeData: code,
      },
    }).catch(e => console.error('Email failed:', e));
  };

  const handleReset = () => resetAll();

  /* ── Bulk handlers ── */
  const addBulkRow = () => {
    const maxRows = selectedTicketType?.remaining ?? 999;
    if (bulkRows.length >= maxRows) {
      toast({ title: 'Limite atteinte', description: `Il ne reste que ${maxRows} billet${maxRows > 1 ? 's' : ''} disponible${maxRows > 1 ? 's' : ''}`, variant: 'destructive' });
      return;
    }
    setBulkRows(prev => [...prev, { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' }]);
  };

  const removeBulkRow = (id: string) => {
    if (bulkRows.length <= 1) return;
    setBulkRows(prev => prev.filter(r => r.id !== id));
  };

  const updateBulkRow = (id: string, field: keyof BulkRow, value: string) => {
    setBulkRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const validateBulk = (): boolean => {
    if (!selectedEventId) { setBulkEventError('Sélectionnez un événement'); return false; }
    if (!selectedTicketTypeId) {
      toast({ title: 'Type de billet requis', variant: 'destructive' });
      return false;
    }
    const invalid = bulkRows.filter(r => !r.firstName.trim() || !r.lastName.trim() || !r.phone.trim() || r.phone.length < 8);
    if (invalid.length > 0) {
      toast({ title: 'Données incomplètes', description: `${invalid.length} ligne${invalid.length > 1 ? 's' : ''} incomplète${invalid.length > 1 ? 's' : ''} (prénom, nom, téléphone)`, variant: 'destructive' });
      return false;
    }
    const remaining = selectedTicketType?.remaining ?? 0;
    if (bulkRows.length > remaining) {
      toast({ title: 'Stock insuffisant', description: `Il ne reste que ${remaining} billet${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''}`, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleBulkGenerate = async () => {
    if (!user || !selectedEvent || !selectedTicketType) return;
    if (!validateBulk()) return;
    setIsBulkProcessing(true);
    try {
      const toInsert = bulkRows.map(row => {
        const code = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
        return {
          _code: code, _row: row,
          payload: {
            user_id: user.id, manager_id: user.id,
            event_id: selectedEventId, ticket_type_id: selectedTicketTypeId,
            price_paid: selectedTicketType.price + (selectedTicketType.manager_fees || 0),
            ticket_code: code,
            qr_code_data: `${window.location.origin}/ticket/${code}`,
            customer_first_name: row.firstName, customer_last_name: row.lastName,
            customer_email: row.email || null, customer_phone: row.phone, status: 'active',
          },
        };
      });

      const { error } = await supabase.from('tickets').insert(toInsert.map(t => t.payload));
      if (error) throw error;

      toInsert.forEach(t => {
        if (t._row.email) sendEmail(t._row.email, `${t._row.firstName} ${t._row.lastName}`.trim(), t._code);
      });

      setBulkResults(toInsert.map(t => ({
        code: t._code,
        name: `${t._row.firstName} ${t._row.lastName}`.trim(),
        phone: t._row.phone, email: t._row.email, emailSent: !!t._row.email,
      })));
      setBulkStep(2);
      toast({ title: `${bulkRows.length} billets générés !` });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  /* ── Bulk self: N tickets same person ── */
  const handleBulkSelfGenerate = async () => {
    if (!user || !selectedTicketType || !selectedEvent) return;
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Prénom requis';
    if (!lastName.trim()) errs.lastName = 'Nom requis';
    if (!phone.trim() || phone.length < 8) errs.phone = 'Téléphone invalide';
    if (!selectedEventId) errs.event = 'Sélectionnez un événement';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (bulkSelfQty > (selectedTicketType.remaining ?? 0)) {
      toast({ title: 'Stock insuffisant', description: `Il ne reste que ${selectedTicketType.remaining} billet(s).`, variant: 'destructive' });
      return;
    }
    setIsBulkSelfProcessing(true);
    try {
      const toInsert = Array.from({ length: bulkSelfQty }, () => {
        const code = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
        return {
          _code: code,
          payload: {
            user_id: user.id, manager_id: user.id,
            event_id: selectedEventId, ticket_type_id: selectedTicketTypeId,
            price_paid: selectedTicketType.price + (selectedTicketType.manager_fees || 0),
            ticket_code: code,
            qr_code_data: `${window.location.origin}/ticket/${code}`,
            customer_first_name: firstName, customer_last_name: lastName,
            customer_email: email || null, customer_phone: phone, status: 'active',
          },
        };
      });
      const { error } = await supabase.from('tickets').insert(toInsert.map(t => t.payload));
      if (error) throw error;
      if (email) toInsert.forEach(t => sendEmail(email, `${firstName} ${lastName}`, t._code));
      setBulkSelfResults(toInsert.map(t => ({
        code: t._code,
        name: `${firstName} ${lastName}`.trim(),
        phone, email, emailSent: !!email,
      })));
      setBulkSelfStep(2);
      toast({ title: `${bulkSelfQty} billets créés !` });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setIsBulkSelfProcessing(false);
    }
  };

  const handleBulkReset = () => {
    setBulkStep(1); setBulkResults([]);
    setSelectedEventId(''); setSelectedTicketTypeId(''); setTicketTypes([]);
    setBulkEventError('');
    setBulkRows([
      { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' },
      { id: uuidv4(), firstName: '', lastName: '', phone: '', email: '' },
    ]);
  };

  /* ── Shared results table ── */
  const ResultsTable = ({ results, title }: { results: GeneratedTicket[]; title: string }) => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge variant="outline">{results.length} billet{results.length > 1 ? 's' : ''}</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-2">#</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-2">Code</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-2">Nom</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-2">Téléphone</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.code} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-semibold">{r.code}</span>
                </td>
                <td className="px-4 py-2.5 text-xs font-medium">{r.name}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.phone}</td>
                <td className="px-4 py-2.5 text-xs">
                  {r.email ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />{r.email}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════ RENDER ══ */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Réserver des billets</h1>
        <p className="text-muted-foreground text-sm mt-1">Créez un ou plusieurs billets pour vos clients</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-secondary rounded-xl w-fit">
        {([
          { key: 'individual', label: 'Billet individuel', icon: User },
          { key: 'bulk', label: 'Billets en lot', icon: Users },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ════════════════════════ INDIVIDUAL MODE ═══════════════════════ */}
      {mode === 'individual' && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-4">
            {['Informations', 'Confirmation', 'Billet'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > i + 1 ? 'bg-primary text-primary-foreground' : step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{label}</span>
                {i < 2 && <div className="flex-1 h-0.5 bg-secondary"><div className={`h-full bg-primary transition-all ${step > i + 1 ? 'w-full' : 'w-0'}`} /></div>}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-6 border border-border space-y-5">
              <TicketTypePicker
                events={events} ticketTypes={ticketTypes}
                selectedEventId={selectedEventId} selectedTicketTypeId={selectedTicketTypeId}
                onEventChange={setSelectedEventId} onTypeChange={setSelectedTicketTypeId}
                eventError={errors.event}
              />

              {/* Quantity */}
              {selectedTicketTypeId && (
                <div className="space-y-2">
                  <Label>Nombre de billets</Label>
                  <QuantityStepper value={quantity} max={maxQty} onChange={setQuantity} />
                </div>
              )}

              {/* Customer info */}
              <div className="space-y-4 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {quantity > 1 ? 'Vos coordonnées (acheteur)' : 'Informations du client'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom" />
                    {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom" />
                    {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 123 45 67" />
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email {quantity > 1 ? `(vous recevrez ${quantity} emails de confirmation)` : '(optionnel)'}</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com" />
                </div>
              </div>

              <Button
                variant="gold" className="w-full"
                onClick={handleContinue}
                disabled={!selectedTicketTypeId || (selectedTicketType?.remaining ?? 1) <= 0}
              >
                Continuer {quantity > 1 && `(${quantity} billets)`}
              </Button>
            </motion.div>
          )}

          {/* Step 2 – Confirmation */}
          {step === 2 && selectedEvent && selectedTicketType && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-6 border border-border space-y-4">
              <h2 className="font-display text-xl font-bold">Confirmation</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Événement</span><span className="font-medium">{selectedEvent.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(selectedEvent.event_date).toLocaleDateString('fr-FR')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type de billet</span><span>{selectedTicketType.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{quantity > 1 ? 'Acheteur' : 'Client'}</span><span>{firstName} {lastName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span>{phone}</span></div>
                {quantity > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre de billets</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground font-medium">Montant total</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {((selectedTicketType.price + (selectedTicketType.manager_fees || 0)) * quantity).toLocaleString()} FCFA
                    {quantity > 1 && <span className="text-sm font-normal text-muted-foreground ml-1">({(selectedTicketType.price + (selectedTicketType.manager_fees || 0)).toLocaleString()} × {quantity})</span>}
                  </span>
                </div>
              </div>
              {quantity > 1 && (
                <div className="bg-amber/10 border border-amber/20 rounded-lg p-3 text-xs text-amber-700">
                  <strong>{quantity} billets</strong> seront générés au nom de <strong>{firstName} {lastName}</strong>.
                  {email ? ` Vous recevrez ${quantity} emails de confirmation à ${email}.` : ' Aucun email fourni — remettez les codes manuellement.'}
                </div>
              )}
              <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                💰 Paiement physique — Assurez-vous d'avoir encaissé le montant avant de valider.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Retour</Button>
                <Button variant="gold" onClick={handleReserve} className="flex-1" disabled={isProcessing}>
                  {isProcessing
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création…</>
                    : `Valider${quantity > 1 ? ` (${quantity} billets)` : ''}`}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 – Result */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                <Check className="w-12 h-12 text-primary mx-auto mb-3" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  {quantity > 1 ? `${quantity} billets créés !` : 'Billet créé avec succès !'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {quantity > 1
                    ? email
                      ? `${quantity} emails de confirmation envoyés à ${email}.`
                      : `${quantity} codes générés — remettez-les à votre client.`
                    : 'Le billet a été généré et est prêt à être remis au client.'}
                </p>
              </div>

              {quantity === 1 && createdTicket && <DigitalTicket ticket={createdTicket} />}
              {quantity > 1 && generatedTickets.length > 0 && (
                <ResultsTable results={generatedTickets} title={`Billets générés — ${firstName} ${lastName}`} />
              )}

              <Button variant="gold" className="w-full" onClick={handleReset}>
                Nouvelle réservation
              </Button>
            </motion.div>
          )}

          {/* Intent dialog */}
          <Dialog open={showIntentDialog} onOpenChange={setShowIntentDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ces {quantity} billets sont pour…</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleIntentSelf}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pour moi-même</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quantity} billets à mon nom. Je recevrai {quantity} codes que je distribuerai.
                    </p>
                  </div>
                </button>
                <button
                  onClick={handleIntentMultiple}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Plusieurs personnes</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quantity} billets pour {quantity} personnes différentes, chacune avec ses infos.
                    </p>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ════════════════════════ BULK MODE ═════════════════════════════ */}
      {mode === 'bulk' && (
        <>
          {/* ── SubMode selection ─────────────────────────────────────── */}
          {bulkSubMode === null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-muted-foreground">Ces billets en lot sont pour :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setBulkSubMode('self')}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Pour moi</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Plusieurs billets à mon nom. Je distribue les codes moi-même.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setBulkSubMode('multiple')}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Users className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Pour des personnes différentes</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Chaque billet au nom d'une personne différente.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── BULK SELF (N tickets, même personne) ───────────────────── */}
          {bulkSubMode === 'self' && (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => { setBulkSubMode(null); setBulkSelfStep(1); setBulkSelfResults([]); setErrors({}); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Retour
                </button>
                <span className="text-sm text-muted-foreground">/ Pour moi</span>
              </div>

              {bulkSelfStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  {/* Event + type */}
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <h2 className="font-semibold mb-4">Événement & type de billet</h2>
                    <TicketTypePicker
                      events={events} ticketTypes={ticketTypes}
                      selectedEventId={selectedEventId} selectedTicketTypeId={selectedTicketTypeId}
                      onEventChange={setSelectedEventId} onTypeChange={setSelectedTicketTypeId}
                      eventError={errors.event}
                    />
                  </div>

                  {/* Quantity */}
                  {selectedTicketTypeId && (
                    <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
                      <h2 className="font-semibold">Nombre de billets</h2>
                      <QuantityStepper
                        value={bulkSelfQty}
                        max={Math.min(selectedTicketType?.remaining ?? 1, 50)}
                        onChange={setBulkSelfQty}
                      />
                    </div>
                  )}

                  {/* My info */}
                  <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                    <h2 className="font-semibold">Vos coordonnées</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prénom</Label>
                        <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom" />
                        {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom" />
                        {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 123 45 67" />
                      {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email (vous recevrez {bulkSelfQty} emails)</Label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com" />
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedTicketType && (
                    <div className="bg-card rounded-2xl p-6 border border-border space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Billets</span><span className="font-semibold">{bulkSelfQty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Prix unitaire</span><span>{(selectedTicketType.price + (selectedTicketType.manager_fees || 0)).toLocaleString('fr-FR')} FCFA</span></div>
                      <div className="flex justify-between border-t pt-2 mt-1">
                        <span className="font-medium">Total</span>
                        <span className="font-display text-xl font-bold text-primary">{((selectedTicketType.price + (selectedTicketType.manager_fees || 0)) * bulkSelfQty).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                        💰 Paiement physique — Encaissez le montant avant de valider.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="gold" className="w-full"
                    onClick={handleBulkSelfGenerate}
                    disabled={isBulkSelfProcessing || !selectedEventId || !selectedTicketTypeId}
                  >
                    {isBulkSelfProcessing
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération…</>
                      : <><TicketIcon className="w-4 h-4 mr-2" />Générer {bulkSelfQty} billet{bulkSelfQty > 1 ? 's' : ''} à mon nom</>}
                  </Button>
                </motion.div>
              )}

              {bulkSelfStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                    <Check className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h2 className="font-display text-xl font-bold">{bulkSelfResults.length} billets créés !</h2>
                    <p className="text-muted-foreground mt-1">
                      {email
                        ? `${bulkSelfResults.length} emails envoyés à ${email}.`
                        : 'Aucun email — remettez les codes manuellement.'}
                    </p>
                  </div>
                  <ResultsTable results={bulkSelfResults} title={`Billets — ${firstName} ${lastName}`} />
                  <Button variant="gold" className="w-full" onClick={resetAll}>
                    <Plus className="w-4 h-4 mr-2" />Nouvelle réservation
                  </Button>
                </motion.div>
              )}
            </>
          )}

          {/* ── BULK MULTIPLE (rows, personnes différentes) ─────────────── */}
          {bulkSubMode === 'multiple' && (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => { setBulkSubMode(null); setBulkStep(1); setBulkResults([]); setBulkEventError(''); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Retour
                </button>
                <span className="text-sm text-muted-foreground">/ Pour des personnes différentes</span>
              </div>

              {bulkStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Event + type */}
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</span>
                      Événement & type de billet
                    </h2>
                    <TicketTypePicker
                      events={events} ticketTypes={ticketTypes}
                      selectedEventId={selectedEventId} selectedTicketTypeId={selectedTicketTypeId}
                      onEventChange={id => { setSelectedEventId(id); setBulkEventError(''); }}
                      onTypeChange={setSelectedTicketTypeId}
                      eventError={bulkEventError}
                    />
                  </div>

                  {/* Customer table */}
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-foreground flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</span>
                        Liste des personnes
                        <Badge variant="outline" className="text-xs ml-1">{bulkRows.length}</Badge>
                      </h2>
                      {selectedTicketType && (
                        <span className={`text-xs font-medium ${bulkRows.length > selectedTicketType.remaining ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {Math.max(0, selectedTicketType.remaining - bulkRows.length)} place{selectedTicketType.remaining - bulkRows.length !== 1 ? 's' : ''} restante{selectedTicketType.remaining - bulkRows.length !== 1 ? 's' : ''} après génération
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_32px] gap-2 px-1">
                        {['#', 'Prénom *', 'Nom *', 'Téléphone *', 'Email (opt.)', ''].map((h, i) => (
                          <span key={i} className="text-xs text-muted-foreground font-medium">{h}</span>
                        ))}
                      </div>
                      {bulkRows.map((row, index) => (
                        <div key={row.id} className="grid grid-cols-[28px_1fr_1fr_1fr_1fr_32px] gap-2 items-center">
                          <span className="text-xs text-muted-foreground font-mono text-center">{index + 1}</span>
                          <Input value={row.firstName} onChange={e => updateBulkRow(row.id, 'firstName', e.target.value)} placeholder="Prénom" className="h-9 text-sm" />
                          <Input value={row.lastName} onChange={e => updateBulkRow(row.id, 'lastName', e.target.value)} placeholder="Nom" className="h-9 text-sm" />
                          <Input type="tel" value={row.phone} onChange={e => updateBulkRow(row.id, 'phone', e.target.value)} placeholder="+221 77…" className="h-9 text-sm" />
                          <Input type="email" value={row.email} onChange={e => updateBulkRow(row.id, 'email', e.target.value)} placeholder="email@…" className="h-9 text-sm" />
                          <button
                            onClick={() => removeBulkRow(row.id)}
                            disabled={bulkRows.length <= 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addBulkRow} className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                      <Plus className="w-4 h-4" />Ajouter une personne
                    </button>
                  </div>

                  {/* Summary + Generate */}
                  <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</span>
                      Récapitulatif
                    </h2>
                    <div className="space-y-2 text-sm">
                      {selectedEvent && <div className="flex justify-between"><span className="text-muted-foreground">Événement</span><span className="font-medium">{selectedEvent.name}</span></div>}
                      {selectedTicketType && <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{selectedTicketType.name}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">Personnes</span><span className="font-medium">{bulkRows.length}</span></div>
                      {selectedTicketType && (
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-muted-foreground font-medium">Montant total</span>
                          <span className="font-display text-xl font-bold text-primary">
                            {((selectedTicketType.price + (selectedTicketType.manager_fees || 0)) * bulkRows.length).toLocaleString('fr-FR')} FCFA
                            <span className="text-sm font-normal text-muted-foreground ml-1">({(selectedTicketType.price + (selectedTicketType.manager_fees || 0)).toLocaleString()} × {bulkRows.length})</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                      💰 Paiement physique — Encaissez le montant total avant de valider. Un email sera envoyé aux personnes ayant fourni leur adresse.
                    </p>
                    <Button variant="gold" className="w-full" onClick={handleBulkGenerate} disabled={isBulkProcessing || !selectedEventId || !selectedTicketTypeId}>
                      {isBulkProcessing
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération…</>
                        : <><TicketIcon className="w-4 h-4 mr-2" />Générer {bulkRows.length} billet{bulkRows.length > 1 ? 's' : ''}</>}
                    </Button>
                  </div>
                </motion.div>
              )}

              {bulkStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                    <Check className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {bulkResults.length} billet{bulkResults.length > 1 ? 's' : ''} généré{bulkResults.length > 1 ? 's' : ''} !
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {bulkResults.filter(r => r.emailSent).length > 0
                        ? `${bulkResults.filter(r => r.emailSent).length} email${bulkResults.filter(r => r.emailSent).length > 1 ? 's' : ''} envoyé${bulkResults.filter(r => r.emailSent).length > 1 ? 's' : ''} automatiquement.`
                        : 'Aucun email fourni — remettez les codes manuellement.'}
                    </p>
                  </div>
                  <ResultsTable results={bulkResults} title="Récapitulatif des billets générés" />
                  <Button variant="gold" className="w-full" onClick={handleBulkReset}>
                    <Plus className="w-4 h-4 mr-2" />Nouvelle génération en lot
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ManagerReserve;
