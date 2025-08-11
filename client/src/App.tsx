import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingGuard from "@/components/OnboardingGuard";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Landing from "./pages/landing";
import Signup from "./pages/signup";
import TermsPage from "./pages/terms";
import ServicesPage from "./pages/services";
import OnboardingPage from "./pages/onboarding";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import WhiteLabelPage from "./pages/white-label";
import CallsPage from "./pages/calls";
import QueuePage from "./pages/queue";
import LogsPage from "./pages/logs";
import CustomersPage from "./pages/customers";
import AppointmentsPage from "./pages/appointments";
import TeamPage from "./pages/team";
import SettingsPage from "./pages/settings";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/signup">
        <PublicLayout>
          <Signup />
        </PublicLayout>
      </Route>

      <Route path="/services">
        <ServicesPage />
      </Route>
      <Route path="/onboarding">
        <OnboardingPage />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <OnboardingGuard>
            <Dashboard />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/white-label">
        <ProtectedRoute>
          <OnboardingGuard>
            <WhiteLabelPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/calls">
        <ProtectedRoute>
          <OnboardingGuard>
            <CallsPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/queue">
        <ProtectedRoute>
          <OnboardingGuard>
            <QueuePage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/logs">
        <ProtectedRoute>
          <OnboardingGuard>
            <LogsPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute>
          <OnboardingGuard>
            <CustomersPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/appointments">
        <ProtectedRoute>
          <OnboardingGuard>
            <AppointmentsPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/team">
        <ProtectedRoute>
          <OnboardingGuard>
            <TeamPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <OnboardingGuard>
            <SettingsPage />
          </OnboardingGuard>
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <PublicLayout>
          <Landing />
        </PublicLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
