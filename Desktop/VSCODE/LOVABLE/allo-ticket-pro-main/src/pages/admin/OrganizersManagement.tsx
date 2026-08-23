import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrganizerWithAssignments {
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

const OrganizersManagement = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [organizers, setOrganizers] = useState<OrganizerWithAssignments[]>([]);
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
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrganizerWithAssignments | null>(null);
  const [selectedEventId, setSelectedEventId] = useState('');

  const loadData = async () => {
    setLoading(true);

    const [{ data: reqs }, { data: eventsData }] = await Promise.all([
      supabase.from('organizer_requests').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('events').select('id, name').order('name'),
    ]);

    setEvents(eventsData || []);

    const orgList: OrganizerWithAssignments[] = [];
    for (const req of (reqs || [])) {
      const { data: assignments } = await supabase
        .from('organizer_events')
        .select('id, event_id, events(name)')
        .eq('organizer_id', req.user_id);

      orgList.push({
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

    setOrganizers(orgList);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const validateCreate = () => {
    const errs: Record<string, string> = {};
    if (!createForm.full_name.trim()) errs.full_name = 'Nom requis';
    if (!createForm.email || !/\S+@\S+\.\S+/.test(createForm.email)) errs.email = 'Email invalide';
    if (!createForm.password || createForm.password.length < 6) errs.password = 'Minimum 6 caractères';
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
          role: 'organizer',
          full_name: createForm.full_name,
          phone: createForm.phone || null,
        },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });

      if (error || !data?.success) {
        toast({ title: 'Erreur', description: data?.error || error?.message || 'Impossible de créer le compte', variant: 'destructive' });
      } else {
        toast({ title: 'Organisateur créé', description: `${createForm.full_name} peut maintenant se connecter depuis /auth.` });
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
    if (!selectedOrganizer || !selectedEventId) return;
    const { error } = await supabase.from('organizer_events').insert({
      organizer_id: selectedOrganizer.user_id,
      event_id: selectedEventId,
      assigned_by: user?.id,
    });
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Événement assigné' });
    setSelectedEventId('');
    setAssignDialogOpen(false);
    loadData();
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    await supabase.from('organizer_events').delete().eq('id', assignmentId);
    toast({ title: 'Assignation retirée' });
    loadData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Organisateurs</h1>
          <p className="text-muted-foreground mt-1">Créez des comptes organisateurs et assignez-les à des événements</p>
        </div>
        <Button variant="gold" onClick={() => setCreateOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Créer un organisateur
        </Button>
      </div>

      {/* Active Organizers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organisateurs actifs ({organizers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {organizers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun organisateur. Créez le premier compte ci-dessus.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Événements assignés</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizers.map(org => (
                  <TableRow key={org.user_id}>
                    <TableCell className="font-medium">{org.full_name}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(org.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {org.assigned_events.length === 0 ? (
                          <span className="text-muted-foreground text-sm italic">Aucun</span>
                        ) : org.assigned_events.map(ae => (
                          <Badge key={ae.id} variant="secondary" className="gap-1">
                            {ae.event_name}
                            <button onClick={() => handleRemoveAssignment(ae.id)} className="ml-1 hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedOrganizer(org); setAssignDialogOpen(true); }} className="gap-1">
                        <Plus className="w-4 h-4" />Assigner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setCreateForm({ full_name: '', email: '', password: '', phone: '' }); setCreateErrors({}); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Créer un compte organisateur</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            L'organisateur recevra ces identifiants pour se connecter sur <strong>/auth</strong>. Il pourra changer son mot de passe depuis son profil.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input value={createForm.full_name} onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder="Nom Prénom" />
              {createErrors.full_name && <p className="text-xs text-destructive">{createErrors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="organisateur@email.com" />
              {createErrors.email && <p className="text-xs text-destructive">{createErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Mot de passe temporaire *</Label>
              <div className="relative">
                <Input type={showPwd ? 'text' : 'password'} value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {createErrors.password && <p className="text-xs text-destructive">{createErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>Téléphone (optionnel)</Label>
              <Input type="tel" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+221 77 123 45 67" />
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

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assigner un événement à {selectedOrganizer?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Événement</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
                <SelectContent>
                  {events
                    .filter(e => !selectedOrganizer?.assigned_events.some(ae => ae.event_id === e.id))
                    .map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignEvent} disabled={!selectedEventId} className="w-full">
              Assigner l'événement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizersManagement;
