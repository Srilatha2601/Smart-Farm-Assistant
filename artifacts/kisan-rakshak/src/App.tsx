import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import ScanPage from "@/pages/ScanPage";
import DronesPage from "@/pages/DronesPage";
import StoragePage from "@/pages/StoragePage";
import MarketPage from "@/pages/MarketPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    }
  }
});

function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative shadow-xl">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/scan" component={ScanPage} />
          <Route path="/drones" component={DronesPage} />
          <Route path="/storage" component={StoragePage} />
          <Route path="/market" component={MarketPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
