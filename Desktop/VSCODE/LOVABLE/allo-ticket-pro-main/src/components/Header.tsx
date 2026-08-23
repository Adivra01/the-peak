import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo-allo-ticket-pro.png';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, isManager, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="Allô Ticket Pro" 
              className="h-10 w-auto object-contain"
            />
            <span className="hidden sm:inline font-display text-lg font-bold text-gradient-gold">
              Allô Ticket Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
            >
              Accueil
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link 
              to="/events" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
            >
              Événements
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                 {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isManager && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/manager" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          Espace Gestionnaire
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Connexion
                </Button>
              </Link>
            )}
            <Link to="/events">
              <Button variant="gold" size="sm" className="shadow-primary">
                Réserver maintenant
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link 
                to="/" 
                className="text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-all py-3 px-4 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/events" 
                className="text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-all py-3 px-4 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>
              {user ? (
                <>
                 {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-sm font-medium text-primary hover:bg-secondary transition-all py-3 px-4 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  {isManager && (
                    <Link 
                      to="/manager" 
                      className="text-sm font-medium text-primary hover:bg-secondary transition-all py-3 px-4 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Espace Gestionnaire
                    </Link>
                  )}
                  <button 
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    className="text-sm font-medium text-destructive hover:bg-secondary transition-all py-3 px-4 rounded-lg text-left"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="mt-2">
                  <Button variant="outline" className="w-full">
                    Connexion / Inscription
                  </Button>
                </Link>
              )}
              <Link to="/events" onClick={() => setIsMenuOpen(false)} className="mt-2">
                <Button variant="gold" className="w-full shadow-primary">
                  Réserver maintenant
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
