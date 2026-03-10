import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layouts
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import Login from "./pages/login";
import Dashboard from "./pages/app/dashboard";
import RotaBuilder from "./pages/app/rota-builder";
import Rota from "./pages/app/rota";
import Holidays from "./pages/app/holidays";
import HolidaysManage from "./pages/app/holidays-manage";
import Admin from "./pages/app/admin";

function AppRoutes() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Switch>
          <Route path="/app" component={Dashboard} />
          <Route path="/app/rota-builder" component={RotaBuilder} />
          <Route path="/app/rota" component={Rota} />
          <Route path="/app/holidays" component={Holidays} />
          <Route path="/app/holidays/manage" component={HolidaysManage} />
          <Route path="/app/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Route */}
      <Route path="/login" component={Login} />

      {/* Nested App Routes wrapped in Protected Layout */}
      <Route path="/app/*" component={AppRoutes} />
      <Route path="/app" component={AppRoutes} />

      {/* Redirect root to app (which will redirect to login if no auth) */}
      <Route path="/">
        <Redirect to="/app" />
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
