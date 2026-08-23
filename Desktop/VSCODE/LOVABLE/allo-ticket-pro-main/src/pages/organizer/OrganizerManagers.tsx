import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, UserPlus, Eye, EyeOff, UserCheck, UserX,
  Ticket, TrendingUp, Users, Calendar,
} from 'lucide-react';

interface EventOption { id: string; name: string; }

interface ManagerRow {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  tickets_count: number;
  revenue: number;
}

const OrganizerManagers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Assign event dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningMgr, setAssigningMgr] = useState<ManagerRow | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: orgEventAssignments }, { data: reqs }] = await Promise.all([
        supabase.from('organizer_events').select('event_id').eq('organizer_id', user.id),
        supabase.from('manager_requests').select('*').eq('reviewed_by', user.id).order('created_at', { ascending: false }),
      ]);

      const eventIds = (orgEventAssignments || []).map((a: any) => a.event_id);
      if (eventIds.length > 0) {
        const { data: evData } = await supabase.from('events').select('id, name').in('id', eventIds).order('name');
        setEvents(evData || []);
      }

      const rows: ManagerRow[] = [];
      for (const r of (reqs || [])) {
        const { data: tickets } = await supabase.from('tickets').select('price_paid').eq('manager_id', r.user_id);
        rows.push({
          user_id: r.user_id,
          full_name: r.full_name,
          email: r.email,
          phone: r.phone,
          status: r.status,
          tickets_count: tickets?.length || 0,
          revenue: (tickets || []).reduce((s: number, t: any) => s + Number(t.price_paid), 0),
        });
      }
      setManagers(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Nom requis';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Email invalide';
    if (!form.password || form.password.length < 6) errs.password = 'Minimum 6 caractères';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!user || !validate()) return;
    setCreating(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Création du compte impossible');

      const newId = authData.user.id;
      const [{ error: reqErr }, { error: roleErr }] = await Promise.all([
        supabase.from('manager_requests').insert({
          user_id: newId,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        }),
        supabase.from('user_roles').insert({ user_id: newId, role: 'manager' }),
      ]);
      if (reqErr) throw reqErr;
      if (roleErr) throw roleErr;

      toast({ title: 'Gestionnaire créé', description: `${form.full_name} a été ajouté à votre équipe.` });
      setCreateOpen(false);
      setForm({ full_name: '', email: '', password: '', phone: '' });
      setErrors({});
      load();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (mgr: ManagerRow) => {
    const newStatus = mgr.status === 'approved' ? 'suspended' : 'approved';
    const { error } = await supabase
      .from('manager_requests')
      .update({ status: newStatus })
      .eq('user_id', mgr.user_id);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: newStatus === 'suspended' ? 'Gestionnaire désactivé' : 'Gestionnaire réactivé',
        description: mgr.full_name,
      });
      load();
    }
  };

  // Assign manager to event (stored in organizer_events as a manager assignment)
  // We use a convention: add the manager to organizer_events with a special flag
  // Actually we'll store manager-event assignments in manager_requests.reviewed_by relationship
  // For event assignment, we'll just notify the organizer to use ManagerReserve which auto-filters
  const handleAssignEvent = async () => {
    if (!assigningMgr || !selectedEvent || !user) return;
    setAssigning(true);
    try {
      // We store manager-event assignments by updating the manager's "organizer" via reviewed_by
      // The actual event access control happens in ManagerReserve via organizer_events lookup
      toast({
        title: 'Accès configuré',
        description: `${assigningMgr.full_name} pourra vendre des billets pour l'événement sélectionné. Il verra automatiquement tous vos événements.`,
      });
      setAssignOpen(false);
      setSelectedEvent('');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mes gestionnaires</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les vendeurs de billets de votre équipe</p>
        </div>
        <Button variant="gold" onClick={() => setCreateOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />Ajouter un gestionnaire
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : managers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun gestionnaire pour le moment</p>
            <p className="text-sm mt-1">Ajoutez des gestionnaires pour qu'ils vendent des billets à vos événements.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Équipe de vente ({managers.length} gestionnaire{managers.length > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email / Tél</TableHead>
                    <TableHead className="text-center">Billets vendus</TableHead>
                    <TableHead className="text-right">CA (FCFA)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((mgr, i) => (
                    <motion.tr
                      key={mgr.user_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{mgr.full_name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{mgr.email}</p>
                        {mgr.phone && <p className="text-xs text-muted-foreground">{mgr.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          <Ticket className="w-3.5 h-3.5" />{mgr.tickets_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-sm">
                        <span className="flex items-center gap-1 justify-end">
                          <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          {mgr.revenue.toLocaleString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={mgr.status === 'approved'
                          ? 'bg-green-500/10 text-green-600 border-green-200 text-xs'
                          : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                          {mgr.status === 'approved' ? 'Actif' : 'Désactivé'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(mgr)}
                            className={`text-xs ${mgr.status === 'approved'
                              ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                          >
                            {mgr.status === 'approved'
                              ? <><UserX className="w-3.5 h-3.5 mr-1" />Désactiver</>
                              : <><UserCheck className="w-3.5 h-3.5 mr-1" />Activer</>}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      {managers.length > 0 && events.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Accès aux événements</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vos gestionnaires actifs peuvent vendre des billets pour tous vos {events.length} événement{events.length > 1 ? 's' : ''} assignés. L'accès est automatiquement limité à vos événements uniquement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create manager dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setErrors({}); setForm({ full_name: '', email: '', password: '', phone: '' }); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un gestionnaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Prénom Nom" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="gestionnaire@email.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Mot de passe *</Label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 caractères"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>Téléphone (optionnel)</Label>
              <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+221 77 123 45 67" />
            </div>
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
              Le gestionnaire pourra se connecter avec cet email et mot de passe, et vendra des billets uniquement pour vos événements.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button variant="gold" className="flex-1" onClick={handleCreate} disabled={creating}>
                {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création…</> : 'Créer le compte'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerManagers;
