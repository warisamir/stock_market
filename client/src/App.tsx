import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import PortfolioPage from "@/pages/portfolio-page";
import TradePage from "@/pages/trade-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { useState } from "react";
import Navbar from "./components/navbar";

function Router() {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  
  const openTradeModal = (stockId: number) => {
    setSelectedStockId(stockId);
    setTradeModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-dark-800 text-white">
      <Navbar />
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute 
          path="/" 
          component={() => <DashboardPage openTradeModal={openTradeModal} />} 
        />
        <ProtectedRoute 
          path="/portfolio" 
          component={() => <PortfolioPage openTradeModal={openTradeModal} />} 
        />
        <ProtectedRoute path="/trade" component={TradePage} />
        <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
