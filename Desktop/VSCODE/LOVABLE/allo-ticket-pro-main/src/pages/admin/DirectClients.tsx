import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface DirectClient {
  id: string;
  ticket_code: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  price_paid: number;
  status: string | null;
  purchased_at: string;
  event_name?: string;
  ticket_type_name?: string;
}

const DirectClients = () => {
  const [clients, setClients] = useState<DirectClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Direct clients = tickets without a manager (purchased online)
      const { data } = await supabase
        .from('tickets')
        .select('id, ticket_code, customer_first_name, customer_last_name, customer_phone, customer_email, price_paid, status, purchased_at, events(name), ticket_types(name), manager_id')
        .is('manager_id', null)
        .order('purchased_at', { ascending: false });

      if (data) {
        setClients(data.map((t: any) => ({
          ...t,
          event_name: t.events?.name,
          ticket_type_name: t.ticket_types?.name,
        })));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Clients Directs</h1>
      <p className="text-muted-foreground mb-4">Clients ayant réservé directement via l'application (paiement en ligne).</p>

      {clients.length === 0 ? (
        <p className="text-muted-foreground">Aucun client direct pour le moment.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.customer_first_name} {c.customer_last_name}</TableCell>
                  <TableCell>{c.customer_phone}</TableCell>
                  <TableCell>{c.customer_email || '—'}</TableCell>
                  <TableCell>{c.event_name}</TableCell>
                  <TableCell>{c.ticket_type_name}</TableCell>
                  <TableCell>{Number(c.price_paid).toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'default' : c.status === 'used' ? 'secondary' : 'destructive'}>
                      {c.status === 'active' ? 'Actif' : c.status === 'used' ? 'Utilisé' : c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(c.purchased_at).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DirectClients;
