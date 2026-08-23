import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CalendarCheck, ShieldCheck, HardDriveDownload } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMode, setExportMode] = useState<'quarter' | 'full' | null>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleExport = async (full: boolean) => {
    setIsExporting(true);
    setExportMode(full ? 'full' : 'quarter');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const params = full ? '?full=true' : '';
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quarterly-export${params}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Erreur export');
      toast({
        title: 'Export réussi',
        description: result.message,
      });
    } catch (err: any) {
      toast({
        title: 'Erreur export',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setExportMode(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été mis à jour avec succès',
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le mot de passe',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre compte et vos préférences
        </p>
      </div>

      {/* Account Info */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>Vos informations de connexion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>ID utilisateur</Label>
            <Input value={user?.id || ''} disabled className="bg-muted font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* RGPD Export */}
      <Card className="shadow-soft border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-primary" />
            Export RGPD → Google Drive
          </CardTitle>
          <CardDescription>
            Exporte toutes les données (gestionnaires, admin, organisateurs) vers le dossier Drive partagé
            et anonymise les données personnelles sur la plateforme. Le fichier Excel contient 4 onglets :
            Gestionnaires · Admin · Organisateurs · Stats_globales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Trimestre précédent */}
            <div className="rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CalendarCheck className="w-4 h-4 text-primary" />
                Trimestre précédent
              </div>
              <p className="text-xs text-muted-foreground">
                Export + anonymisation des données du dernier trimestre écoulé.
                Planifié automatiquement chaque 1er janvier, avril, juillet, octobre.
              </p>
              <Button
                onClick={() => handleExport(false)}
                disabled={isExporting}
                size="sm"
                className="w-full gap-2"
              >
                {isExporting && exportMode === 'quarter'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />}
                {isExporting && exportMode === 'quarter' ? 'Export en cours…' : 'Exporter maintenant'}
              </Button>
            </div>

            {/* Export complet */}
            <div className="rounded-xl border border-amber/30 bg-amber/5 p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-amber">
                <ShieldCheck className="w-4 h-4" />
                Export complet (toutes données)
              </div>
              <p className="text-xs text-muted-foreground">
                Export de <strong>toutes</strong> les données non-anonymisées depuis le début.
                Les données personnelles seront effacées de la plateforme après l'export.
              </p>
              <Button
                onClick={() => handleExport(true)}
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="w-full gap-2 border-amber/40 text-amber hover:bg-amber/10"
              >
                {isExporting && exportMode === 'full'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ShieldCheck className="w-4 h-4" />}
                {isExporting && exportMode === 'full' ? 'Export complet en cours…' : 'Exporter tout + anonymiser'}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p>• Les fichiers sont nommés <code>AlloTicketPro_Export_[Période]_[Date].xlsx</code></p>
            <p>• Après export : noms, téléphones et emails sont remplacés par <code>ANONYMISÉ</code></p>
            <p>• Les montants, statistiques et codes billets sont conservés pour la comptabilité</p>
            <p>• Conforme RGPD — export planifié tous les 3 mois automatiquement</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Modifier le mot de passe</CardTitle>
          <CardDescription>Choisissez un nouveau mot de passe sécurisé</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="gold" disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Modifier le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
