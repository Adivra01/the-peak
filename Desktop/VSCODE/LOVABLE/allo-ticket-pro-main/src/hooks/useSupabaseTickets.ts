import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface TicketData {
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
}

interface CreatedTicket {
  id: string;
  ticket_code: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  price_paid: number;
  status: string;
  event_name: string;
  event_date: string;
  event_time: string;
  event_location: string;
  ticket_type: string;
  qr_code_data: string;
}

export const useSupabaseTickets = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createTicketWithReservation = useCallback(async (ticketData: TicketData): Promise<CreatedTicket | null> => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour réserver un billet',
        variant: 'destructive',
      });
      return null;
    }

    setIsCreating(true);

    try {
      const ticketCode = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
      
      const qrCodeData = `${window.location.origin}/ticket/${ticketCode}`;

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          event_id: ticketData.eventId,
          ticket_type_id: ticketData.ticketTypeId,
          ticket_code: ticketCode,
          customer_first_name: ticketData.customerFirstName,
          customer_last_name: ticketData.customerLastName,
          customer_email: ticketData.customerEmail,
          customer_phone: ticketData.customerPhone,
          price_paid: ticketData.price,
          status: 'valid',
          qr_code_data: qrCodeData,
        })
        .select('id, ticket_code, customer_first_name, customer_last_name, customer_phone, price_paid, status, qr_code_data')
        .single();

      if (ticketError) throw ticketError;

      // Update ticket type availability
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('quantity_available')
        .eq('id', ticketData.ticketTypeId)
        .single();
      
      if (ticketType && ticketType.quantity_available > 0) {
        await supabase
          .from('ticket_types')
          .update({ quantity_available: ticketType.quantity_available - 1 })
          .eq('id', ticketData.ticketTypeId);
      }

      toast({
        title: 'Billet réservé !',
        description: `Votre billet ${ticketData.ticketTypeName} a été créé avec succès`,
      });

      return {
        id: ticket.id,
        ticket_code: ticket.ticket_code,
        customer_first_name: ticket.customer_first_name || '',
        customer_last_name: ticket.customer_last_name || '',
        customer_phone: ticket.customer_phone || '',
        price_paid: ticket.price_paid,
        status: ticket.status || 'valid',
        event_name: ticketData.eventName,
        event_date: ticketData.eventDate,
        event_time: ticketData.eventTime,
        event_location: ticketData.eventLocation,
        ticket_type: ticketData.ticketTypeName,
        qr_code_data: ticket.qr_code_data || qrCodeData,
      };
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erreur de réservation',
        description: error.message || 'Impossible de créer le billet',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, toast]);

  return {
    createTicketWithReservation,
    isCreating,
  };
};
