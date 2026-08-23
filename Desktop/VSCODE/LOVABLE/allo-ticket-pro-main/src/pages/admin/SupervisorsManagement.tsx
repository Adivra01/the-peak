import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Eye, EyeOff, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface Supervisor {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  assigned_events: { id: string; event_id: string; event_name: string }[];
}

interface EventOption {
  id: string;
  name: string;
}

const SupervisorsManagement = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [selectedEventId, setSelectedEventId] = useState('');

  const loadData = async () => {
    setLoading(true);

    const [{ data: reqs }, { data: eventsData }] = await Promise.all([
      supabase.from('supervisor_requests').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('events').select('id, name').order('name'),
    ]);

    setEvents(eventsData || []);

    const supList: Supervisor[] = [];
    for (const req of (reqs || [])) {
      const { data: assignments } = await supabase
        .from('event_supervisors')
        .select('id, event_id, events(name)')
        .eq('supervisor_id', req.user_id);

      supList.push({
        user_id: req.user_id,
        full_name: req.full_name,
        email: req.email,
        phone: req.phone,
        created_at: req.created_at,
        assigned_events: (assignments || []).map((a: any) => ({
          id: a.id,
          event_id: a.event_id,
          event_name: a.events?.name || '',
        })),
      });
    }

    setSupervisors(supList);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const validateCreate = () => {
    const errs: Record<string, string> = {};
    if (!createForm.full_name.trim()) errs.full_name = 'Nom requis';
    if (!createForm.email || !/\S+@\S+\.\S+/.test(createForm.email)) errs.email = 'Email invalide';
    if (!createForm.password || createForm.password.length < 6) errs.password = 'Mot de passe minimum 6 caractères';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: createForm.email,
          password: createForm.password,
          role: 'supervisor',
          full_name: createForm.full_name,
          phone: createForm.phone || null,
        },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });

      if (error || !data?.success) {
        toast({ title: 'Erreur', description: data?.error || error?.message || 'Impossible de créer le compte', variant: 'destructive' });
      } else {
        toast({ title: 'Superviseur créé', description: `${createForm.full_name} peut maintenant se connecter avec ses identifiants.` });
        setCreateOpen(false);
        setCreateForm({ full_name: '', email: '', password: '', phone: '' });
        loadData();
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleAssignEvent = async () => {
    if (!selectedSupervisor || !selectedEventId) return;
    const { error } = await supabase.from('event_supervisors').insert({
      supervisor_id: selectedSupervisor.user_id,
      event_id: selectedEventId,
    });
    if (error) {
      toast({ title: 'Erreur', description: 'Cet événement est peut-être déjà assigné.', variant: 'destructive' });
    } else {
      toast({ title: 'Événement assigné' });
      setAssignDialogOpen(false);
      setSelectedEventId('');
      loadData();
    }
  };

  const handleRemoveEvent = async (assignmentId: string) => {
    await supabase.from('event_supervisors').delete().eq('id', assignmentId);
    toast({ title: 'Événement retiré' });
    loadData();
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Superviseurs</h1>
          <p className="text-muted-foreground mt-1">Créez des comptes superviseurs et affectez-les à des événements</p>
        </div>
        <Button variant="gold" onClick={() => setCreateOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Créer un superviseur
        </Button>
      </div>

      {/* Supervisors list */}
      {supervisors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun superviseur. Créez le premier compte ci-dessus.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {supervisors.map(sup => (
            <Card key={sup.user_id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">{sup.full_name}</p>
                    <p className="text-sm text-muted-foreground">{sup.email}</p>
                    {sup.phone && <p className="text-xs text-muted-foreground">{sup.phone}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Créé le {new Date(sup.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => { setSelectedSupervisor(sup); setAssignDialogOpen(true); }}
                  >
                    <Plus className="w-3.5 h-3.5" />Assigner un événement
                  </Button>
                </div>

                {sup.assigned_events.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sup.assigned_events.map(ev => (
                      <div key={ev.id} className="flex items-center gap-1.5 bg-secondary rounded-full pl-3 pr-1 py-1 text-sm">
                        <span>{ev.event_name}</span>
                        <button
                          onClick={() => handleRemoveEvent(ev.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 italic">Aucun événement assigné</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setCreateForm({ full_name: '', email: '', password: '', phone: '' }); setCreateErrors({}); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Créer un compte superviseur</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Le superviseur recevra ces identifiants pour se connecter sur <strong>/auth</strong>. Il pourra changer son mot de passe depuis son profil.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input
                value={createForm.full_name}
                onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })}
                placeholder="Jean Dupont"
              />
              {createErrors.full_name && <p className="text-xs text-destructive">{createErrors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="superviseur@email.com"
              />
              {createErrors.email && <p className="text-xs text-destructive">{createErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Mot de passe temporaire *</Label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={createForm.password}
                  onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {createErrors.password && <p className="text-xs text-destructive">{createErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>Téléphone (optionnel)</Label>
              <Input
                type="tel"
                value={createForm.phone}
                onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button type="submit" variant="gold" className="flex-1" disabled={creating}>
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Créer le compte
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign event dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assigner un événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Superviseur : <span className="font-medium text-foreground">{selectedSupervisor?.full_name}</span>
            </p>
            <div className="space-y-2">
              <Label>Événement</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Choisir un événement…" /></SelectTrigger>
                <SelectContent>
                  {events
                    .filter(ev => !selectedSupervisor?.assigned_events.some(ae => ae.event_id === ev.id))
                    .map(ev => (
                      <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setAssignDialogOpen(false); setSelectedEventId(''); }}>Annuler</Button>
              <Button className="flex-1" onClick={handleAssignEvent} disabled={!selectedEventId}>Assigner</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorsManagement;
