import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo-allo-ticket-pro.png';
import { z } from 'zod';

const formSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone invalide').optional().or(z.literal('')),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const ManagerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user, isLoading, isManager, managerStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in as approved manager
  if (user && !isLoading) {
    if (isManager) {
      navigate('/manager');
      return null;
    }
    if (managerStatus === 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="bg-card shadow-elevated rounded-2xl p-8 border border-border text-center">
              <img src={logo} alt="Allô Ticket Pro" className="h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-foreground mb-4">Demande en attente</h1>
              <p className="text-muted-foreground mb-6">
                Votre demande de compte gestionnaire est en cours de validation par l'administrateur. 
                Vous recevrez l'accès une fois votre compte approuvé.
              </p>
              <Button variant="outline" onClick={() => { navigate('/'); }}>
                Retour à l'accueil
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }
    if (managerStatus === 'rejected') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="bg-card shadow-elevated rounded-2xl p-8 border border-border text-center">
              <img src={logo} alt="Allô Ticket Pro" className="h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-destructive mb-4">Demande refusée</h1>
              <p className="text-muted-foreground mb-6">
                Votre demande de compte gestionnaire a été refusée. Contactez l'administrateur pour plus d'informations.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>Retour à l'accueil</Button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Erreur de connexion', description: error.message.includes('Invalid login') ? 'Email ou mot de passe incorrect' : error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Connexion réussie', description: 'Bienvenue !' });
        }
      } else {
        // Validate
        const result = formSchema.safeParse({ fullName, email, phone, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => { fieldErrors[err.path[0] as string] = err.message; });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        // Sign up
        const { error } = await signUp(email, password);
        if (error) {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }

        // Get user after signup
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          // Create manager request
          const { error: reqError } = await supabase.from('manager_requests').insert({
            user_id: newUser.id,
            full_name: fullName,
            email: email,
            phone: phone || null,
          });

          if (reqError) {
            console.error('Manager request error:', reqError);
            toast({ title: 'Erreur', description: 'Impossible de soumettre la demande de gestionnaire', variant: 'destructive' });
          } else {
            toast({
              title: 'Demande envoyée !',
              description: 'Votre demande de compte gestionnaire a été soumise. L\'administrateur la validera prochainement.',
            });
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card shadow-elevated rounded-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <img src={logo} alt="Allô Ticket Pro" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isLogin ? 'Espace Gestionnaire' : 'Devenir Gestionnaire'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Connectez-vous à votre espace gestionnaire' : 'Créez votre compte gestionnaire'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" className="pl-10" />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 123 45 67" className="pl-10" />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="pl-10" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" variant="gold" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isLogin ? 'Connexion...' : 'Envoi de la demande...'}</> : isLogin ? 'Se connecter' : 'Soumettre ma demande'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {isLogin ? "Pas encore gestionnaire ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
            <div>
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerAuth;
