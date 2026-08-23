import { useState } from 'react';
import { Search, Phone, Loader2, Ticket, QrCode, Calendar, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import DigitalTicket from '@/components/DigitalTicket';
import { Ticket as TicketType } from '@/types/event';

interface TicketResult {
  id: string;
  ticket_code: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string;
  price_paid: number;
  status: string;
  purchased_at: string;
  events: {
    name: string;
    event_date: string;
    event_time: string;
    location: string;
  };
  ticket_types: {
    name: string;
  };
}

const TicketSearchByPhone = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<TicketResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const { toast } = useToast();

  const formatPhoneForSearch = (phone: string) => {
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '');
  };

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Numéro requis',
        description: 'Veuillez entrer un numéro de téléphone',
        variant: 'destructive',
      });
      return;
    }

    const formattedPhone = formatPhoneForSearch(phoneNumber);
    if (formattedPhone.length < 8) {
      toast({
        title: 'Numéro invalide',
        description: 'Le numéro doit contenir au moins 8 chiffres',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_code,
          customer_first_name,
          customer_last_name,
          customer_phone,
          customer_email,
          price_paid,
          status,
          purchased_at,
          events!inner (
            name,
            event_date,
            event_time,
            location
          ),
          ticket_types!inner (
            name
          )
        `)
        .ilike('customer_phone', `%${formattedPhone}%`)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      setResults(data || []);
      
      if (data?.length === 0) {
        toast({
          title: 'Aucun résultat',
          description: 'Aucun billet trouvé pour ce numéro',
        });
      } else {
        toast({
          title: `${data?.length} billet(s) trouvé(s)`,
          description: 'Cliquez sur un billet pour voir le QR code',
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Erreur de recherche',
        description: error.message || 'Impossible de rechercher les billets',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const convertToTicketType = (result: TicketResult): TicketType => {
    return {
      ticket_id: result.ticket_code,
      event_id: result.id,
      event_name: result.events.name,
      ticket_type: result.ticket_types.name,
      price: result.price_paid,
      event_date: result.events.event_date,
      event_time: result.events.event_time,
      event_location: result.events.location,
      reservation_date: result.purchased_at.split('T')[0],
      customer_name: result.customer_last_name,
      customer_firstname: result.customer_first_name,
      status: result.status as 'valid' | 'used' | 'cancelled',
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500/20 text-green-700';
      case 'used':
        return 'bg-orange-500/20 text-orange-700';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Valide';
      case 'used':
        return 'Utilisé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <Card className="shadow-card border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Entrez un numéro de téléphone..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              variant="gold"
              className="h-12 px-6 gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Rechercher
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Entrez le numéro de téléphone utilisé lors de la réservation
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result, index) => {
                  const isVIP = result.ticket_types.name.toLowerCase().includes('vip') || 
                               result.ticket_types.name.toLowerCase().includes('platinum') ||
                               result.ticket_types.name.toLowerCase().includes('gold');
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer hover:-translate-y-1 transition-all shadow-card ${
                          isVIP ? 'bg-gradient-gold text-primary-foreground' : ''
                        }`}
                        onClick={() => setSelectedTicket(convertToTicketType(result))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mb-2 ${
                                isVIP 
                                  ? 'bg-background/20' 
                                  : 'bg-primary/20 text-primary'
                              }`}>
                                {result.ticket_types.name}
                              </span>
                              <h4 className={`font-display font-bold ${
                                isVIP ? '' : 'text-foreground'
                              }`}>
                                {result.events.name}
                              </h4>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                              {getStatusLabel(result.status)}
                            </span>
                          </div>

                          <div className={`space-y-1 text-sm ${
                            isVIP ? 'opacity-80' : 'text-muted-foreground'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4" />
                              <span>{result.customer_first_name} {result.customer_last_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(result.events.event_date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{result.events.location}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between">
                            <span className={`font-display font-bold text-lg ${
                              isVIP ? '' : 'text-foreground'
                            }`}>
                              {result.price_paid.toLocaleString()} FCFA
                            </span>
                            <Button
                              variant={isVIP ? 'glass' : 'outline'}
                              size="sm"
                              className="gap-1"
                            >
                              <QrCode className="w-4 h-4" />
                              Voir QR
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    Aucun billet trouvé
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Vérifiez le numéro de téléphone et réessayez
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto py-8"
            onClick={() => setSelectedTicket(null)}
          >
            <div 
              className="container mx-auto px-4 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <DigitalTicket ticket={selectedTicket} />
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTicket(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketSearchByPhone;
