import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from '@/components/supervisor/SupervisorSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SupervisorLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <SupervisorSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SupervisorSidebar onToggle={() => setMobileSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden sticky top-0 z-30 bg-background border-b border-border p-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SupervisorLayout;
