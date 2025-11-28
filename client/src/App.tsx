import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SessionsPage from "@/pages/sessions";
import ActivityPage from "@/pages/activity";
import MemberProfile from "@/pages/member-profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sessions" component={SessionsPage} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/members/:id" component={MemberProfile} />
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
