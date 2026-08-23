import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, LogOut, ChevronLeft, ShieldCheck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo-allo-ticket-pro.png';
import ProfileDialog from '@/components/ProfileDialog';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/supervisor' },
  { icon: Calendar, label: 'Mes événements', path: '/supervisor/events' },
];

interface SupervisorSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const SupervisorSidebar = ({ collapsed = false, onToggle }: SupervisorSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className={cn('h-screen bg-card border-r border-border flex flex-col transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link to="/supervisor" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
            <span className="font-display font-bold text-foreground">Superviseur</span>
          </Link>
        )}
        {collapsed && <img src={logo} alt="Logo" className="h-8 mx-auto" />}
        {onToggle && (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accès Superviseur</span>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/supervisor' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground', collapsed && 'justify-center')}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={() => setProfileOpen(true)}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all', collapsed && 'justify-center')}
          title="Mon profil"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Mon profil</span>}
        </button>
        <Link
          to="/"
          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all', collapsed && 'justify-center')}
        >
          <ChevronLeft className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Retour au site</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all', collapsed && 'justify-center')}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </aside>
  );
};

export default SupervisorSidebar;
