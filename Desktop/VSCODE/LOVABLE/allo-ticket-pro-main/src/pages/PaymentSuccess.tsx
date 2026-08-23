import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/event';
import Header from '@/components/Header';
import DigitalTicket from '@/components/DigitalTicket';
import WhatsAppMessage from '@/components/WhatsAppMessage';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const MAX_POLLS = 20;
const POLL_INTERVAL = 5000; // 5 seconds

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('ref');
  const isFreeTicket = searchParams.get('free') === 'true';
  
  const [isLoading, setIsLoading] = useState(!isFreeTicket);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [freeTicketLoaded, setFreeTicketLoaded] = useState(false);
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailSent = useRef(false);

  // Send confirmation email once ticket is available
  useEffect(() => {
    if (!ticket || emailSent.current || !ticket.customer_email) return;
    emailSent.current = true;
    (async () => {
      let eventImageUrl: string | undefined;
      try {
        if (ticket.event_id) {
          const { data: ev } = await supabase
            .from('events')
            .select('image_url')
            .eq('id', ticket.event_id)
            .maybeSingle();
          eventImageUrl = ev?.image_url || undefined;
        }
      } catch (_) { /* ignore */ }

      supabase.functions.invoke('send-ticket-email', {
        body: {
          to: ticket.customer_email,
          customerName: `${ticket.customer_firstname || ''} ${ticket.customer_name || ''}`.trim(),
          ticketCode: ticket.ticket_id,
          eventName: ticket.event_name,
          eventDate: ticket.event_date,
          eventTime: ticket.event_time,
          eventLocation: ticket.event_location,
          ticketType: ticket.ticket_type,
          pricePaid: ticket.price,
          qrCodeData: ticket.ticket_id,
          eventImageUrl,
        },
      }).catch((e) => console.error('Email send failed:', e));
    })();
  }, [ticket]);

  // Load the most recent ticket for free ticket flow
  const loadFreeTicket = useCallback(async () => {
    try {
      const code = searchParams.get('code');
      let query = supabase
        .from('tickets')
        .select('*, ticket_types(name), events(name, event_date, event_time, location)');

      if (code) {
        query = query.eq('ticket_code', code);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Billet introuvable.');
          return;
        }
        query = query.eq('user_id', user.id).order('purchased_at', { ascending: false });
      }

      const { data, error: fetchError } = await query.limit(1).maybeSingle();

      if (fetchError || !data) {
        setError('Impossible de charger votre billet.');
        return;
      }

      const eventData = data.events as any;
      const ticketTypeData = data.ticket_types as any;

      setTicket({
        ticket_id: data.ticket_code,
        event_id: data.event_id,
        event_name: eventData?.name || '',
        ticket_type: ticketTypeData?.name || '',
        price: data.price_paid,
        event_date: eventData?.event_date || '',
        event_time: eventData?.event_time || '',
        event_location: eventData?.location || '',
        reservation_date: data.purchased_at,
        customer_name: data.customer_last_name || '',
        customer_firstname: data.customer_first_name || '',
        customer_phone: data.customer_phone || '',
        customer_email: data.customer_email || '',
        status: (data.status as 'valid' | 'used' | 'cancelled') || 'valid',
      });
      setFreeTicketLoaded(true);
      // Email already sent by the edge function — prevent duplicate from client effect
      emailSent.current = true;
    } catch (err) {
      setError('Erreur lors du chargement du billet.');
    }
  }, [searchParams]);

  const verifyPayment = useCallback(async () => {
    if (!reference) {
      setError('Référence de paiement manquante');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-payment', {
        body: { reference },
      });

      if (invokeError) throw new Error(invokeError.message);

      const verificationStatus = data?.status;

      if (verificationStatus === 'completed') {
        if (data.ticket) {
          setTicket(data.ticket);
          setIsLoading(false);
          setIsPending(false);
          return;
        }

        setError('Paiement confirmé mais billet indisponible. Veuillez contacter le support.');
        setIsLoading(false);
        setIsPending(false);
        return;
      }

      if (verificationStatus === 'failed') {
        setError(data.message || 'Le paiement a échoué.');
        setIsLoading(false);
        setIsPending(false);
        return;
      }

      if (verificationStatus !== 'pending') {
        setError(data?.message || 'Vérification du paiement impossible.');
        setIsLoading(false);
        setIsPending(false);
        return;
      }

      pollCount.current += 1;
      if (pollCount.current < MAX_POLLS) {
        setIsPending(true);
        setIsLoading(false);
        pollTimer.current = setTimeout(verifyPayment, POLL_INTERVAL);
      } else {
        setError('Le paiement est toujours en attente. Vérifiez vos billets plus tard dans "Mes billets".');
        setIsLoading(false);
        setIsPending(false);
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de vérification');
      setIsLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (isFreeTicket) {
      loadFreeTicket();
    } else {
      verifyPayment();
    }
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [isFreeTicket, loadFreeTicket, verifyPayment]);

  if ((isFreeTicket && !freeTicketLoaded && !error) || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Vérification du paiement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md px-4">
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Paiement en cours de traitement
            </h1>
            <p className="text-muted-foreground mb-2">
              Nous attendons la confirmation de votre paiement par Bictorys...
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Vérification automatique toutes les 5 secondes ({pollCount.current}/{MAX_POLLS})
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md px-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Erreur de vérification
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/events')}>
              Retour aux événements
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {isFreeTicket ? 'Billet réservé ! 🎉' : 'Paiement réussi ! 🎉'}
            </h1>
            <p className="text-muted-foreground">
              {isFreeTicket ? 'Votre billet gratuit a été généré avec succès.' : 'Votre billet Allô Ticket Pro a été généré avec succès.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <DigitalTicket ticket={ticket} showDownloadWarning={true} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="font-display text-lg font-bold text-foreground mb-4 text-center">
              Partager via WhatsApp
            </h3>
            <WhatsAppMessage ticket={ticket} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button 
              variant="outline"
              onClick={() => navigate('/my-tickets')}
            >
              Voir mes billets
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/events')}
            >
              Retour aux événements
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
