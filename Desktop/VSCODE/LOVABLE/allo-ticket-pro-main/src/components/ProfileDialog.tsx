import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'password' | 'email'>('password');
  const [isLoading, setIsLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const resetFields = () => {
    setNewPassword(''); setConfirmPassword(''); setNewEmail('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Erreur', description: 'Minimum 6 caractères requis', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été mis à jour avec succès.' });
      resetFields();
      onOpenChange(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast({ title: 'Erreur', description: 'Adresse email invalide', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setIsLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Email mis à jour',
        description: 'Un lien de confirmation a été envoyé à votre nouvelle adresse. Vérifiez votre boîte mail.',
      });
      resetFields();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetFields(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mon profil</DialogTitle>
        </DialogHeader>

        {user && (
          <p className="text-sm text-muted-foreground -mt-1">
            Connecté : <span className="font-medium text-foreground">{user.email}</span>
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {(['password', 'email'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'password' ? 'Mot de passe' : 'Email'}
            </button>
          ))}
        </div>

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirmer</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" variant="gold" disabled={isLoading || !newPassword || !confirmPassword}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Changer le mot de passe
            </Button>
          </form>
        )}

        {tab === 'email' && (
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label>Nouvel email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="nouveau@email.com"
                  className="pl-9"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2.5">
              Un email de confirmation sera envoyé à la nouvelle adresse. Vos identifiants actuels restent valides jusqu'à confirmation.
            </p>
            <Button type="submit" className="w-full" variant="gold" disabled={isLoading || !newEmail}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Changer l'email
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
