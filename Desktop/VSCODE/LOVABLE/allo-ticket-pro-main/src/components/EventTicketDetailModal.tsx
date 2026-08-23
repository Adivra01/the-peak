import { useEffect, useState } from 'react';
import { Loader2, Ticket, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketTypeStat {
  name: string;
  sold: number;
  revenue: number;
  available: number;
}

interface Buyer {
  ticket_code: string;
  name: string;
  phone: string | null;
  email: string | null;
  ticket_type: string;
  price_paid: number;
  status: string;
  purchased_at: string;
  used_at: string | null;
  source: string; // "Client direct" or "Gestionnaire: <name>"
}

interface Props {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BUYERS_PER_PAGE = 50;

const EventTicketDetailModal = ({ eventId, open, onOpenChange }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  const [ticketStats, setTicketStats] = useState<TicketTypeStat[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [totalSold, setTotalSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!open || !eventId) return;
    setIsLoading(true);
    setCurrentPage(1);

    const fetchData = async () => {
      try {
        const { data: eventData } = await supabase.from('events').select('name').eq('id', eventId).single();
        setEventName(eventData?.name || '');

        const { data: types } = await supabase.from('ticket_types').select('*').eq('event_id', eventId);

        const { data: tickets } = await supabase
          .from('tickets')
          .select('*, ticket_types(name)')
          .eq('event_id', eventId)
          .order('purchased_at', { ascending: false });

        const statsMap = new Map<string, TicketTypeStat>();
        for (const type of types || []) {
          statsMap.set(type.id, { name: type.name, sold: 0, revenue: 0, available: type.quantity_available });
        }

        let sold = 0;
        let revenue = 0;
        const buyersList: Buyer[] = [];

        // Fetch manager profiles for tickets that have manager_id
        const managerIds = Array.from(new Set((tickets || []).map(t => t.manager_id).filter(Boolean))) as string[];
        const managerMap = new Map<string, string>();
        if (managerIds.length > 0) {
          const { data: managerProfiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', managerIds);
          for (const p of managerProfiles || []) {
            managerMap.set(p.user_id, p.full_name || 'Gestionnaire');
          }
        }

        for (const ticket of tickets || []) {
          sold++;
          revenue += Number(ticket.price_paid);
          const stat = statsMap.get(ticket.ticket_type_id);
          if (stat) { stat.sold++; stat.revenue += Number(ticket.price_paid); }
          buyersList.push({
            ticket_code: ticket.ticket_code,
            name: `${ticket.customer_first_name || ''} ${ticket.customer_last_name || ''}`.trim(),
            phone: ticket.customer_phone,
            email: ticket.customer_email,
            ticket_type: (ticket.ticket_types as any)?.name || '',
            price_paid: ticket.price_paid,
            status: ticket.status || 'active',
            purchased_at: ticket.purchased_at,
            used_at: ticket.used_at,
            source: ticket.manager_id
              ? `Gestionnaire: ${managerMap.get(ticket.manager_id) || '—'}`
              : 'Client direct',
          });
        }

        setTicketStats(Array.from(statsMap.values()));
        setBuyers(buyersList);
        setTotalSold(sold);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, open]);

  const totalPages = Math.max(1, Math.ceil(buyers.length / BUYERS_PER_PAGE));
  const paginatedBuyers = buyers.slice((currentPage - 1) * BUYERS_PER_PAGE, currentPage * BUYERS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid': return <Badge className="bg-teal/10 text-teal border-teal/20">Actif</Badge>;
      case 'used': return <Badge className="bg-amber/10 text-amber border-amber/20">Utilisé</Badge>;
      case 'cancelled': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Annulé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails — {eventName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber/10"><Ticket className="w-5 h-5 text-amber" /></div>
                  <div><p className="text-sm text-muted-foreground">Billets vendus</p><p className="text-xl font-bold">{totalSold}</p></div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
                  <div><p className="text-sm text-muted-foreground">Revenus</p><p className="text-xl font-bold">{totalRevenue.toLocaleString('fr-FR')} FCFA</p></div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal/10"><Users className="w-5 h-5 text-teal" /></div>
                  <div><p className="text-sm text-muted-foreground">Acheteurs</p><p className="text-xl font-bold">{buyers.length}</p></div>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Type Breakdown */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Détail par type de billet</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Vendus</TableHead>
                    <TableHead>Disponibles</TableHead>
                    <TableHead>Revenus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketStats.map(stat => (
                    <TableRow key={stat.name}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell>{stat.sold}</TableCell>
                      <TableCell>{stat.available}</TableCell>
                      <TableCell>{stat.revenue.toLocaleString('fr-FR')} FCFA</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Buyers List with Pagination */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Liste des acheteurs ({buyers.length})</h3>
              {buyers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun acheteur</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Acheté le</TableHead>
                          <TableHead>Utilisé le</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedBuyers.map((buyer, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{buyer.ticket_code}</TableCell>
                            <TableCell className="font-medium">{buyer.name || '—'}</TableCell>
                            <TableCell>{buyer.phone || '—'}</TableCell>
                            <TableCell>{buyer.email || '—'}</TableCell>
                            <TableCell>{buyer.ticket_type}</TableCell>
                            <TableCell>{buyer.price_paid.toLocaleString('fr-FR')} FCFA</TableCell>
                            <TableCell>
                              <Badge variant={buyer.source.startsWith('Gestionnaire') ? 'secondary' : 'outline'}>
                                {buyer.source}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(buyer.status)}</TableCell>
                            <TableCell>{format(new Date(buyer.purchased_at), 'dd MMM yyyy HH:mm', { locale: fr })}</TableCell>
                            <TableCell>{buyer.used_at ? format(new Date(buyer.used_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {(currentPage - 1) * BUYERS_PER_PAGE + 1}–{Math.min(currentPage * BUYERS_PER_PAGE, buyers.length)} sur {buyers.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                        </Button>
                        <span className="text-sm font-medium px-2">
                          {currentPage} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Suivant <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventTicketDetailModal;
