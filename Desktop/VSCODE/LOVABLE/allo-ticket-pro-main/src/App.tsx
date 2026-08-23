import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";

import Auth from "./pages/Auth";
import ManagerAuth from "./pages/ManagerAuth";
import { Navigate } from "react-router-dom";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import OrangeMoneyPayment from "./pages/OrangeMoneyPayment";
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";
import SupervisorLayout from "./layouts/SupervisorLayout";
import Dashboard from "./pages/admin/Dashboard";
import EventsManagement from "./pages/admin/EventsManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import TicketsManagement from "./pages/admin/TicketsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import ManagersManagement from "./pages/admin/ManagersManagement";
import OrganizersManagement from "./pages/admin/OrganizersManagement";
import SupervisorsManagement from "./pages/admin/SupervisorsManagement";
import DirectClients from "./pages/admin/DirectClients";
import Settings from "./pages/admin/Settings";
import DiscountCodesManagement from "./pages/admin/DiscountCodesManagement";
import DataArchive from "./pages/admin/DataArchive";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerReserve from "./pages/manager/ManagerReserve";
import ManagerClients from "./pages/manager/ManagerClients";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import OrganizerEventDetail from "./pages/organizer/OrganizerEventDetail";
import OrganizerTickets from "./pages/organizer/OrganizerTickets";
import OrganizerManagers from "./pages/organizer/OrganizerManagers";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorEvents from "./pages/supervisor/SupervisorEvents";
import NotFound from "./pages/NotFound";
import ScanTicket from "./pages/ScanTicket";
import TicketVerify from "./pages/TicketVerify";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event/:id" element={<EventDetail />} />
            
            <Route path="/auth" element={<Auth />} />
            <Route path="/manager-auth" element={<ManagerAuth />} />
            <Route path="/organizer-auth" element={<Navigate to="/auth" replace />} />
            <Route path="/supervisor-auth" element={<Navigate to="/auth" replace />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/payment/orange-money" element={<OrangeMoneyPayment />} />
            <Route path="/scan" element={<ScanTicket />} />
            <Route path="/ticket/:code" element={<TicketVerify />} />
            
            {/* Supervisor Routes */}
            <Route path="/supervisor" element={
              <ProtectedRoute requireSupervisor>
                <SupervisorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SupervisorDashboard />} />
              <Route path="events" element={<SupervisorEvents />} />
            </Route>

            {/* Manager Routes */}
            <Route path="/manager" element={
              <ProtectedRoute requireManager>
                <ManagerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ManagerDashboard />} />
              <Route path="reserve" element={<ManagerReserve />} />
              <Route path="clients" element={<ManagerClients />} />
            </Route>

            {/* Organizer Routes */}
            <Route path="/organizer" element={
              <ProtectedRoute requireOrganizer>
                <OrganizerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<OrganizerDashboard />} />
              <Route path="events" element={<OrganizerEvents />} />
              <Route path="events/:eventId" element={<OrganizerEventDetail />} />
              <Route path="tickets" element={<OrganizerTickets />} />
              <Route path="managers" element={<OrganizerManagers />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<EventsManagement />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="tickets" element={<TicketsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="managers" element={<ManagersManagement />} />
              <Route path="organizers" element={<OrganizersManagement />} />
              <Route path="supervisors" element={<SupervisorsManagement />} />
              <Route path="direct-clients" element={<DirectClients />} />
              <Route path="discount-codes" element={<DiscountCodesManagement />} />
              <Route path="archive" element={<DataArchive />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
