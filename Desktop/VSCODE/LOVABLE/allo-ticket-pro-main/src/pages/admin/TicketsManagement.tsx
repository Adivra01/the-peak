import { useEffect, useState } from 'react';
import { Search, Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

interface Ticket {
  id: string;
  ticket_code: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  price_paid: number;
  status: string | null;
  purchased_at: string;
  qr_code_data: string | null;
  event_id: string;
  ticket_type_id: string;
}

interface TicketWithDetails extends Ticket {
  event_name?: string;
  ticket_type_name?: string;
}

const TicketsManagement = () => {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Fetch events and ticket types for additional details
      const eventIds = [...new Set(ticketsData?.map(t => t.event_id) || [])];
      const ticketTypeIds = [...new Set(ticketsData?.map(t => t.ticket_type_id) || [])];

      const [eventsRes, typesRes] = await Promise.all([
        supabase.from('events').select('id, name').in('id', eventIds),
        supabase.from('ticket_types').select('id, name').in('id', ticketTypeIds),
      ]);

      const eventsMap = new Map(eventsRes.data?.map(e => [e.id, e.name]) || []);
      const typesMap = new Map(typesRes.data?.map(t => [t.id, t.name]) || []);

      const enrichedTickets = (ticketsData || []).map(ticket => ({
        ...ticket,
        event_name: eventsMap.get(ticket.event_id) || 'Événement inconnu',
        ticket_type_name: typesMap.get(ticket.ticket_type_id) || 'Type inconnu',
      }));

      setTickets(enrichedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les billets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      
      toast({
        title: 'Statut mis à jour',
        description: `Le billet a été marqué comme ${newStatus}`,
      });
      fetchTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    (ticket.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (ticket.customer_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (ticket.customer_last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (ticket.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-teal/10 text-teal border-teal/20">Valide</Badge>;
      case 'used':
        return <Badge className="bg-amber/10 text-amber border-amber/20">Utilisé</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Billets
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez et validez les billets
        </p>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code, nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des billets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun billet trouvé
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">{ticket.ticket_code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {ticket.customer_first_name} {ticket.customer_last_name}
                          </p>
                          {ticket.customer_email && (
                            <p className="text-xs text-muted-foreground">{ticket.customer_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.event_name}</TableCell>
                      <TableCell>{ticket.ticket_type_name}</TableCell>
                      <TableCell>{ticket.price_paid.toLocaleString('fr-FR')} FCFA</TableCell>
                      <TableCell>{getStatusBadge(ticket.status || 'active')}</TableCell>
                      <TableCell>
                        {format(new Date(ticket.purchased_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {ticket.status === 'valid' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(ticket.id, 'used')}
                              title="Marquer comme utilisé"
                            >
                              <CheckCircle className="w-4 h-4 text-teal" />
                            </Button>
                          )}
                          {ticket.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(ticket.id, 'cancelled')}
                              title="Annuler le billet"
                            >
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
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

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du billet</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center p-4 bg-secondary rounded-lg">
                <QRCodeSVG 
                  value={selectedTicket.qr_code_data || selectedTicket.ticket_code} 
                  size={150}
                />
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono font-medium">{selectedTicket.ticket_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">
                    {selectedTicket.customer_first_name} {selectedTicket.customer_last_name}
                  </span>
                </div>
                {selectedTicket.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{selectedTicket.customer_email}</span>
                  </div>
                )}
                {selectedTicket.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span>{selectedTicket.customer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Événement</span>
                  <span className="font-medium">{selectedTicket.event_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{selectedTicket.ticket_type_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix payé</span>
                  <span className="font-medium">{selectedTicket.price_paid.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  {getStatusBadge(selectedTicket.status || 'active')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsManagement;
