import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';

const OrganizerAuth = () => {
  const { signIn, signUp, user, isOrganizer, organizerStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already organizer
  if (user && isOrganizer) {
    navigate('/organizer');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signUp(registerData.email, registerData.password);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Create organizer request
    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      await supabase.from('organizer_requests').insert({
        user_id: newUser.id,
        full_name: registerData.fullName,
        email: registerData.email,
        phone: registerData.phone || null,
      });
    }

    toast({
      title: 'Demande envoyée',
      description: 'Votre demande d\'organisateur a été soumise. Vous serez notifié après validation.',
    });
    setIsLoading(false);
  };

  if (user && organizerStatus === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber" />
              </div>
              <h2 className="text-xl font-bold">Demande en cours</h2>
              <p className="text-muted-foreground">Votre demande d'organisateur est en attente de validation par l'administrateur.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user && organizerStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <h2 className="text-xl font-bold text-destructive">Demande refusée</h2>
              <p className="text-muted-foreground">Votre demande d'organisateur a été refusée. Contactez l'administrateur pour plus d'informations.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Espace Organisateur</CardTitle>
            <CardDescription>Connectez-vous ou créez un compte organisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <Input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Se connecter
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Nom complet *</Label>
                    <Input value={registerData.fullName} onChange={e => setRegisterData({ ...registerData, fullName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input value={registerData.phone} onChange={e => setRegisterData({ ...registerData, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input type="password" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}S'inscrire comme organisateur
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerAuth;
