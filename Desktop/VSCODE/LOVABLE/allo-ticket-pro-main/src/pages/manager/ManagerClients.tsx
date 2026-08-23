import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClientTicket {
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

const PAGE_SIZE = 20;

const ManagerClients = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('id, ticket_code, customer_first_name, customer_last_name, customer_phone, customer_email, price_paid, status, purchased_at, events(name), ticket_types(name)')
        .eq('manager_id', user.id)
        .order('purchased_at', { ascending: false });

      if (data) {
        setTickets(data.map((t: any) => ({
          ...t,
          event_name: t.events?.name,
          ticket_type_name: t.ticket_types?.name,
        })));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return (
      t.customer_first_name?.toLowerCase().includes(q) ||
      t.customer_last_name?.toLowerCase().includes(q) ||
      t.customer_phone?.includes(q) ||
      t.ticket_code?.toLowerCase().includes(q) ||
      t.event_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Mes clients</h1>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone, code..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Aucun billet trouvé.</p>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-auto mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.customer_first_name} {t.customer_last_name}</TableCell>
                    <TableCell>{t.customer_phone}</TableCell>
                    <TableCell>{t.event_name}</TableCell>
                    <TableCell>{t.ticket_type_name}</TableCell>
                    <TableCell>{Number(t.price_paid).toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'active' ? 'default' : t.status === 'used' ? 'secondary' : 'destructive'}>
                        {t.status === 'active' ? 'Actif' : t.status === 'used' ? 'Utilisé' : t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(t.purchased_at).toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} — Page {page} / {totalPages}</span>
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
                    <span key={`ellipsis-${i}`} className="px-1">…</span>
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
    </div>
  );
};

export default ManagerClients;
