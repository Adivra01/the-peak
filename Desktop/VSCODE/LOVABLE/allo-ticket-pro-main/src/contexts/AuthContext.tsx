import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isManager: boolean;
  isOrganizer: boolean;
  isSupervisor: boolean;
  managerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  organizerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  supervisorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [managerStatus, setManagerStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [organizerStatus, setOrganizerStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [supervisorStatus, setSupervisorStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error in checkAdminRole:', err);
      return false;
    }
  };

  const checkManagerRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'manager')
        .maybeSingle();
      
      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };

  const checkOrganizerRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'organizer')
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };

  const checkSupervisorRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'supervisor')
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };

  const checkSupervisorRequest = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('supervisor_requests')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return 'none' as const;
      return data.status as 'pending' | 'approved' | 'rejected';
    } catch {
      return 'none' as const;
    }
  };

  const checkManagerRequest = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('manager_requests')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error || !data) return 'none' as const;
      return data.status as 'pending' | 'approved' | 'rejected';
    } catch {
      return 'none' as const;
    }
  };

  const checkOrganizerRequest = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizer_requests')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error || !data) return 'none' as const;
      return data.status as 'pending' | 'approved' | 'rejected';
    } catch {
      return 'none' as const;
    }
  };

  const loadRoles = async (userId: string) => {
    const [adminStatus, managerRole, organizerRole, supervisorRole, mgrRequest, orgRequest, supRequest] = await Promise.all([
      checkAdminRole(userId),
      checkManagerRole(userId),
      checkOrganizerRole(userId),
      checkSupervisorRole(userId),
      checkManagerRequest(userId),
      checkOrganizerRequest(userId),
      checkSupervisorRequest(userId),
    ]);
    setIsAdmin(adminStatus);
    setIsManager(managerRole);
    setIsOrganizer(organizerRole);
    setIsSupervisor(supervisorRole);
    setManagerStatus(mgrRequest);
    setOrganizerStatus(orgRequest);
    setSupervisorStatus(supRequest);
    setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => loadRoles(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setIsManager(false);
          setIsOrganizer(false);
          setIsSupervisor(false);
          setManagerStatus('none');
          setOrganizerStatus('none');
          setSupervisorStatus('none');
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadRoles(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsManager(false);
    setIsOrganizer(false);
    setIsSupervisor(false);
    setManagerStatus('none');
    setOrganizerStatus('none');
    setSupervisorStatus('none');
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isManager, isOrganizer, isSupervisor, managerStatus, organizerStatus, supervisorStatus, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
