import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Percent, Loader2 } from 'lucide-react';

interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  description: string | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  event_id: string | null;
  created_at: string;
}

interface EventOption {
  id: string;
  name: string;
}

const DiscountCodesManagement = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    percentage: 0,
    description: '',
    is_active: true,
    max_uses: '',
    valid_until: '',
    event_id: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [codesRes, eventsRes] = await Promise.all([
      supabase.from('discount_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('id, name'),
    ]);
    if (codesRes.data) setCodes(codesRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ code: '', percentage: 0, description: '', is_active: true, max_uses: '', valid_until: '', event_id: '' });
    setEditingCode(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (c: DiscountCode) => {
    setEditingCode(c);
    setForm({
      code: c.code,
      percentage: c.percentage,
      description: c.description || '',
      is_active: c.is_active,
      max_uses: c.max_uses?.toString() || '',
      valid_until: c.valid_until ? c.valid_until.slice(0, 16) : '',
      event_id: c.event_id || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast({ title: 'Erreur', description: 'Le code est requis', variant: 'destructive' });
      return;
    }
    if (form.percentage < 0 || form.percentage > 100) {
      toast({ title: 'Erreur', description: 'Le pourcentage doit être entre 0 et 100', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      percentage: form.percentage,
      description: form.description || null,
      is_active: form.is_active,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      valid_until: form.valid_until || null,
      event_id: form.event_id || null,
    };

    let error;
    if (editingCode) {
      ({ error } = await supabase.from('discount_codes').update(payload).eq('id', editingCode.id));
    } else {
      ({ error } = await supabase.from('discount_codes').insert(payload));
    }

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingCode ? 'Code modifié' : 'Code créé', description: `Le code ${payload.code} a été enregistré.` });
      setDialogOpen(false);
      resetForm();
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (c: DiscountCode) => {
    if (!confirm(`Supprimer le code "${c.code}" ?`)) return;
    const { error } = await supabase.from('discount_codes').delete().eq('id', c.id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Supprimé', description: `Code ${c.code} supprimé.` });
      fetchData();
    }
  };

  const toggleActive = async (c: DiscountCode) => {
    await supabase.from('discount_codes').update({ is_active: !c.is_active }).eq('id', c.id);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Codes de réduction</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau code</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Modifier le code' : 'Nouveau code de réduction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="EX: PROMO50" />
              </div>
              <div className="space-y-2">
                <Label>Pourcentage de réduction ({form.percentage}%)</Label>
                <div className="flex items-center gap-3">
                  <Input type="number" min={0} max={100} value={form.percentage} onChange={e => setForm({ ...form, percentage: parseInt(e.target.value) || 0 })} className="w-24" />
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${form.percentage}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Offre de lancement" />
              </div>
              <div className="space-y-2">
                <Label>Limité à un événement (optionnel)</Label>
                <Select value={form.event_id} onValueChange={v => setForm({ ...form, event_id: v === '_all' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Tous les événements" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Tous les événements</SelectItem>
                    {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Utilisations max (optionnel)</Label>
                  <Input type="number" min={1} value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} placeholder="Illimité" />
                </div>
                <div className="space-y-2">
                  <Label>Expire le (optionnel)</Label>
                  <Input type="datetime-local" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Actif</Label>
              </div>
              <Button variant="gold" className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingCode ? 'Enregistrer' : 'Créer le code'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Percent className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun code de réduction</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <span className="font-mono font-bold text-foreground">{c.code}</span>
                      {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${c.percentage === 100 ? 'text-primary' : 'text-foreground'}`}>
                      {c.percentage}%
                    </span>
                    {c.percentage === 100 && <span className="text-xs text-primary ml-1">GRATUIT</span>}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {c.current_uses}{c.max_uses ? ` / ${c.max_uses}` : ' / ∞'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DiscountCodesManagement;
