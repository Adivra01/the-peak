import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo-allo-ticket-pro.png';
import { z } from 'zod';

const emailSchema = z.string().email('Email invalide');
const passwordSchema = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, user, isLoading, isAdmin, isManager, isOrganizer, isSupervisor } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      if (isAdmin) navigate('/admin');
      else if (isSupervisor) navigate('/supervisor');
      else if (isManager) navigate('/manager');
      else if (isOrganizer) navigate('/organizer');
      else navigate('/');
    }
  }, [user, isLoading, isAdmin, isManager, isOrganizer, isSupervisor, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Erreur de connexion',
            description: error.message.includes('Invalid login credentials')
              ? 'Email ou mot de passe incorrect'
              : error.message,
            variant: 'destructive',
          });
        }
        // redirection handled by useEffect
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Erreur',
            description: error.message.includes('already registered')
              ? 'Un compte existe déjà avec cet email'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Inscription réussie', description: 'Votre compte a été créé avec succès !' });
          navigate('/');
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
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo} alt="Allô Ticket Pro" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isLogin
                ? 'Connectez-vous — votre espace s\'ouvre automatiquement selon votre rôle'
                : 'Créez votre compte client'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" variant="gold" disabled={isSubmitting}>
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isLogin ? 'Connexion...' : 'Inscription...'}</>
                : isLogin ? 'Se connecter' : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>
            <div>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
