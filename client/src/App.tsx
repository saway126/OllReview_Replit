import { Switch, Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import MatchingPage from "@/pages/MatchingPage";
import CheckoutPage from "@/pages/CheckoutPage";
import DashboardPage from "@/pages/DashboardPage";
import CampaignsPage from "@/pages/CampaignsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import SettingsPage from "@/pages/SettingsPage";
import SamplesPage from "@/pages/SamplesPage";
import ShippingPage from "@/pages/ShippingPage";
import RecordsPage from "@/pages/RecordsPage";
import RevenuePage from "@/pages/RevenuePage";
import PartnersPage from "@/pages/PartnersPage";
import NotFound from "@/pages/not-found";

function RedirectToHome() {
  const [, setLocation] = useLocation();
  setLocation("/");
  return null;
}

function RedirectToDashboard() {
  const [, setLocation] = useLocation();
  setLocation("/dashboard");
  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Switch>
            <Route path="/" component={isAuthenticated ? DashboardPage : HomePage} />
            <Route path="/login" component={isAuthenticated ? DashboardPage : LoginPage} />
            <Route path="/signup" component={isAuthenticated ? DashboardPage : SignUpPage} />
            <Route path="/dashboard" component={isAuthenticated ? DashboardPage : HomePage} />
            <Route path="/dashboard/campaigns" component={isAuthenticated ? CampaignsPage : HomePage} />
            <Route path="/dashboard/analytics" component={isAuthenticated ? AnalyticsPage : HomePage} />
            <Route path="/dashboard/billing" component={isAuthenticated ? PaymentsPage : HomePage} />
            <Route path="/dashboard/settings" component={isAuthenticated ? SettingsPage : HomePage} />
            <Route path="/dashboard/samples" component={isAuthenticated ? SamplesPage : HomePage} />
            <Route path="/dashboard/shipping" component={isAuthenticated ? ShippingPage : HomePage} />
            <Route path="/dashboard/records" component={isAuthenticated ? RecordsPage : HomePage} />
            <Route path="/dashboard/revenue" component={isAuthenticated ? RevenuePage : HomePage} />
            <Route path="/dashboard/partners" component={isAuthenticated ? PartnersPage : HomePage} />
            <Route path="/matching" component={isAuthenticated ? MatchingPage : HomePage} />
            <Route path="/checkout" component={isAuthenticated ? CheckoutPage : HomePage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
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
