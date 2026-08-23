import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import DigitalTicket from '@/components/DigitalTicket';
import TicketSearchByPhone from '@/components/TicketSearchByPhone';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, ArrowRight, QrCode, Search, Loader2 } from 'lucide-react';
import { Ticket as TicketType } from '@/types/event';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TicketRow {
  id: string;
  ticket_code: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  price_paid: number;
  status: string | null;
  purchased_at: string;
  events: { name: string; event_date: string; event_time: string; location: string } | null;
  ticket_types: { name: string } | null;
}

const convertRowToTicket = (row: TicketRow): TicketType => ({
  ticket_id: row.ticket_code,
  event_id: row.id,
  event_name: row.events?.name || '',
  ticket_type: row.ticket_types?.name || '',
  price: row.price_paid,
  event_date: row.events?.event_date || '',
  event_time: row.events?.event_time || '',
  event_location: row.events?.location || '',
  reservation_date: row.purchased_at.split('T')[0],
  customer_name: row.customer_last_name || '',
  customer_firstname: row.customer_first_name || '',
  customer_phone: row.customer_phone || '',
  customer_email: row.customer_email || '',
  status: (row.status as 'valid' | 'used' | 'cancelled') || 'valid',
});

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_code, customer_first_name, customer_last_name, customer_phone, customer_email, price_paid, status, purchased_at, events:event_id (name, event_date, event_time, location), ticket_types:ticket_type_id (name)')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (!error && data) {
        setTickets((data as unknown as TicketRow[]).map(convertRowToTicket));
      }
      setLoading(false);
    };
    fetchTickets();
  }, [user]);

  const defaultTab = user ? 'my-tickets' : 'search';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Mes <span className="text-gradient-gold">Billets</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Retrouvez tous vos billets Allô Ticket Pro. Présentez le QR code à l'entrée de l'événement.
            </p>
          </motion.div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="my-tickets" className="gap-2">
                <TicketIcon className="w-4 h-4" />
                {user ? 'Mes billets' : 'Connexion'}
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-2">
                <Search className="w-4 h-4" />
                Rechercher
              </TabsTrigger>
            </TabsList>

            {/* My Tickets Tab */}
            <TabsContent value="my-tickets">
              {!user ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <TicketIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Connectez-vous</h3>
                  <p className="text-muted-foreground mb-6">Connectez-vous pour voir vos billets ou utilisez l'onglet "Rechercher" avec votre numéro de téléphone.</p>
                  <Link to="/auth"><Button variant="gold" className="gap-2">Se connecter <ArrowRight className="w-4 h-4" /></Button></Link>
                </motion.div>
              ) : loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
              ) : tickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map((ticket, index) => {
                    const isVIP = ticket.ticket_type.toLowerCase().includes('vip') || 
                                 ticket.ticket_type.toLowerCase().includes('platinum') ||
                                 ticket.ticket_type.toLowerCase().includes('gold');
                    return (
                      <motion.div
                        key={ticket.ticket_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div 
                          className={`rounded-2xl p-6 shadow-card cursor-pointer hover:-translate-y-1 transition-all ${
                            isVIP ? 'bg-gradient-gold text-primary-foreground' : 'bg-gradient-card'
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mb-2 ${
                                isVIP ? 'bg-background/20 text-primary-foreground' : 'bg-primary/20 text-primary'
                              }`}>{ticket.ticket_type}</span>
                              <h3 className={`font-display text-lg font-bold ${isVIP ? 'text-primary-foreground' : 'text-foreground'}`}>
                                {ticket.event_name}
                              </h3>
                            </div>
                            <div className={`text-right ${isVIP ? 'text-primary-foreground' : 'text-foreground'}`}>
                              <p className="font-display text-xl font-bold">{ticket.price.toLocaleString()}</p>
                              <p className="text-xs opacity-70">FCFA</p>
                            </div>
                          </div>

                          <div className={`space-y-2 text-sm ${isVIP ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            <p>📅 {new Date(ticket.event_date).toLocaleDateString('fr-FR')}</p>
                            <p>📍 {ticket.event_location}</p>
                            <p>👤 {ticket.customer_firstname} {ticket.customer_name}</p>
                          </div>

                          <Button variant={isVIP ? 'glass' : 'outline'} size="sm" className="w-full mt-4 gap-2">
                            <QrCode className="w-4 h-4" />
                            Voir le billet
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <TicketIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Aucun billet</h3>
                  <p className="text-muted-foreground mb-6">Vous n'avez pas encore réservé de billet.</p>
                  <Link to="/events"><Button variant="gold" className="gap-2">Explorer les événements <ArrowRight className="w-4 h-4" /></Button></Link>
                </motion.div>
              )}
            </TabsContent>

            {/* Search by Phone Tab */}
            <TabsContent value="search">
              <TicketSearchByPhone />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto py-8"
          onClick={() => setSelectedTicket(null)}
        >
          <div className="container mx-auto px-4 max-w-md" onClick={(e) => e.stopPropagation()}>
            <DigitalTicket ticket={selectedTicket} />
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>Fermer</Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MyTickets;
