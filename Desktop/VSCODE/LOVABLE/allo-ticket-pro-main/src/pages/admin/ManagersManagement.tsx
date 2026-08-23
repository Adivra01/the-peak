import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ManagerRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

interface ManagerStats {
  user_id: string;
  full_name: string;
  email: string;
  tickets_count: number;
  revenue: number;
}

const ManagersManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ManagerRequest[]>([]);
  const [approvedManagers, setApprovedManagers] = useState<ManagerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [managerTickets, setManagerTickets] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Load requests
    const { data: reqs } = await supabase.from('manager_requests').select('*').order('created_at', { ascending: false });
    if (reqs) setRequests(reqs);

    // Load approved managers with stats
    const approvedReqs = (reqs || []).filter(r => r.status === 'approved');
    const stats: ManagerStats[] = [];
    for (const mgr of approvedReqs) {
      const { data: tickets } = await supabase.from('tickets').select('price_paid').eq('manager_id', mgr.user_id);
      stats.push({
        user_id: mgr.user_id,
        full_name: mgr.full_name,
        email: mgr.email,
        tickets_count: tickets?.length || 0,
        revenue: tickets?.reduce((s, t) => s + Number(t.price_paid), 0) || 0,
      });
    }
    setApprovedManagers(stats);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (req: ManagerRequest) => {
    // Update request status
    await supabase.from('manager_requests').update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user?.id }).eq('id', req.id);
    // Add manager role
    await supabase.from('user_roles').insert({ user_id: req.user_id, role: 'manager' });
    toast({ title: 'Gestionnaire approuvé', description: `${req.full_name} peut maintenant se connecter.` });
    loadData();
  };

  const handleReject = async (req: ManagerRequest) => {
    await supabase.from('manager_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user?.id }).eq('id', req.id);
    toast({ title: 'Demande refusée', description: `La demande de ${req.full_name} a été refusée.` });
    loadData();
  };

  const viewManagerDetails = async (managerId: string) => {
    setSelectedManager(managerId);
    const { data } = await supabase
      .from('tickets')
      .select('ticket_code, customer_first_name, customer_last_name, customer_phone, price_paid, status, purchased_at, events(name), ticket_types(name)')
      .eq('manager_id', managerId)
      .order('purchased_at', { ascending: false });
    setManagerTickets((data || []).map((t: any) => ({ ...t, event_name: t.events?.name, ticket_type_name: t.ticket_types?.name })));
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold text-foreground">Gestionnaires</h1>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Demandes en attente ({pendingRequests.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone || '—'}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(r)} className="gap-1"><CheckCircle className="w-4 h-4" />Approuver</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(r)} className="gap-1"><XCircle className="w-4 h-4" />Refuser</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Approved Managers */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Gestionnaires actifs ({approvedManagers.length})</CardTitle></CardHeader>
        <CardContent>
          {approvedManagers.length === 0 ? (
            <p className="text-muted-foreground">Aucun gestionnaire actif.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Billets émis</TableHead>
                  <TableHead>Revenus</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedManagers.map(m => (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium">{m.full_name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.tickets_count}</TableCell>
                    <TableCell>{m.revenue.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => viewManagerDetails(m.user_id)} className="gap-1">
                        <Eye className="w-4 h-4" />Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manager Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Détails du gestionnaire</DialogTitle>
          </DialogHeader>
          {managerTickets.length === 0 ? (
            <p className="text-muted-foreground">Aucun billet émis par ce gestionnaire.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managerTickets.map((t: any) => (
                  <TableRow key={t.ticket_code}>
                    <TableCell className="font-mono text-xs">{t.ticket_code}</TableCell>
                    <TableCell>{t.customer_first_name} {t.customer_last_name}</TableCell>
                    <TableCell>{t.event_name}</TableCell>
                    <TableCell>{t.ticket_type_name}</TableCell>
                    <TableCell>{Number(t.price_paid).toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>
                        {t.status === 'active' ? 'Actif' : 'Utilisé'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagersManagement;
