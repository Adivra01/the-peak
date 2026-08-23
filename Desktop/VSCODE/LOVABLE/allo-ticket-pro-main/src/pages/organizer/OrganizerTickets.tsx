import { useEffect, useState } from 'react';
import { Search, Loader2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

interface TicketWithDetails {
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
  event_name?: string;
  ticket_type_name?: string;
}

const PAGE_SIZE = 20;

const OrganizerTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTickets = async () => {
      try {
        const { data: assignments } = await supabase
          .from('organizer_events')
          .select('event_id')
          .eq('organizer_id', user.id);

        const eventIds = assignments?.map(a => a.event_id) || [];
        if (eventIds.length === 0) { setIsLoading(false); return; }

        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('*, events(name), ticket_types(name)')
          .in('event_id', eventIds)
          .order('purchased_at', { ascending: false });

        setTickets((ticketsData || []).map((t: any) => ({
          ...t,
          event_name: t.events?.name || '',
          ticket_type_name: t.ticket_types?.name || '',
        })));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  const filteredTickets = tickets.filter(t =>
    (t.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.customer_first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.customer_last_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.event_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const paginated = filteredTickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearchQuery(v);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge className="bg-teal/10 text-teal border-teal/20">Valide</Badge>;
      case 'active': return <Badge className="bg-teal/10 text-teal border-teal/20">Actif</Badge>;
      case 'used': return <Badge className="bg-amber/10 text-amber border-amber/20">Utilisé</Badge>;
      case 'cancelled': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Annulé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Billets</h1>
        <p className="text-muted-foreground mt-1">Billets vendus pour vos événements</p>
      </div>

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par code, nom ou événement..." value={searchQuery} onChange={e => handleSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Billets ({filteredTickets.length})</CardTitle></CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun billet trouvé</p>
          ) : (
            <>
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
                      <TableHead className="text-right">Détail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-sm">{ticket.ticket_code}</TableCell>
                        <TableCell>{ticket.customer_first_name} {ticket.customer_last_name}</TableCell>
                        <TableCell>{ticket.event_name}</TableCell>
                        <TableCell>{ticket.ticket_type_name}</TableCell>
                        <TableCell>{ticket.price_paid.toLocaleString('fr-FR')} FCFA</TableCell>
                        <TableCell>{getStatusBadge(ticket.status || 'active')}</TableCell>
                        <TableCell>{format(new Date(ticket.purchased_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(ticket)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>{filteredTickets.length} résultat{filteredTickets.length > 1 ? 's' : ''} — Page {page} / {totalPages}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`e-${i}`} className="px-1">…</span>
                      ) : (
                        <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p as number)} className="w-8 h-8 p-0">
                          {p}
                        </Button>
                      )
                    )}
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Détails du billet</DialogTitle></DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-secondary rounded-lg">
                <QRCodeSVG value={selectedTicket.qr_code_data || selectedTicket.ticket_code} size={150} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span className="font-mono font-medium">{selectedTicket.ticket_code}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span>{selectedTicket.customer_first_name} {selectedTicket.customer_last_name}</span></div>
                {selectedTicket.customer_phone && <div className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span>{selectedTicket.customer_phone}</span></div>}
                {selectedTicket.customer_email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedTicket.customer_email}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Événement</span><span>{selectedTicket.event_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{selectedTicket.ticket_type_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Prix</span><span className="font-medium">{selectedTicket.price_paid.toLocaleString('fr-FR')} FCFA</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Statut</span>{getStatusBadge(selectedTicket.status || 'active')}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerTickets;
