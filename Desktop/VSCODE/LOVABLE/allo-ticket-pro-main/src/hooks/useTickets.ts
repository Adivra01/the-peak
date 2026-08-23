import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@/types/event';

const STORAGE_KEY = 'billetterie_tickets';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTickets(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing tickets from localStorage:', e);
      }
    }
  }, []);

  const saveTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => {
      const updated = [...prev, ticket];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getTicketById = useCallback((ticketId: string): Ticket | undefined => {
    return tickets.find(t => t.ticket_id === ticketId);
  }, [tickets]);

  const getUserTickets = useCallback((): Ticket[] => {
    return tickets;
  }, [tickets]);

  return { tickets, saveTicket, getTicketById, getUserTickets };
};
