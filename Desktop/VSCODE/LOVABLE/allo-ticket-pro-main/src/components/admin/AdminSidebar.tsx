import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Tags,
  Ticket,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  UserCheck,
  Contact,
  Percent,
  ShieldCheck,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo-allo-ticket-pro.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
  { icon: Calendar, label: 'Événements', path: '/admin/events' },
  { icon: Tags, label: 'Catégories', path: '/admin/categories' },
  { icon: Ticket, label: 'Billets', path: '/admin/tickets' },
  { icon: Percent, label: 'Codes promo', path: '/admin/discount-codes' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
  { icon: UserCheck, label: 'Gestionnaires', path: '/admin/managers' },
  { icon: UserCheck, label: 'Organisateurs', path: '/admin/organizers' },
  { icon: ShieldCheck, label: 'Superviseurs', path: '/admin/supervisors' },
  { icon: Contact, label: 'Clients Directs', path: '/admin/direct-clients' },
  { icon: Archive, label: 'Archivage Drive', path: '/admin/archive' },
  { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const AdminSidebar = ({ collapsed = false, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
            <span className="font-display font-bold text-foreground">Admin</span>
          </Link>
        )}
        {collapsed && (
          <img src={logo} alt="Logo" className="h-8 mx-auto" />
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        {/* User info */}
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        
        {/* Back to site */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Retour au site" : undefined}
        >
          <ChevronLeft className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Retour au site</span>}
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
