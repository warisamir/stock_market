import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stock } from "@shared/schema";
import { format } from "date-fns";
import StockTable from "@/components/stock-table";
import MarketStats from "@/components/market-stats";
import TradeModal from "@/components/trade-modal";

interface DashboardPageProps {
  openTradeModal: (stockId: number) => void;
}

export default function DashboardPage({ openTradeModal }: DashboardPageProps) {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  
  // Fetch all stocks
  const { data: stocks, isLoading, error } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });
  
  const handleTradeClick = (stockId: number) => {
    setSelectedStockId(stockId);
    setTradeModalOpen(true);
  };

  const now = new Date();
  const formattedDate = format(now, "MMM d, yyyy HH:mm");
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Market Overview</h1>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-sm text-dark-200 mr-2">Last updated:</span>
            <span className="text-sm">{formattedDate}</span>
            <div className="ml-4 text-sm flex items-center text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                <path d="M21 22v-6h-6"></path>
              </svg>
              <span>Auto-refreshing</span>
            </div>
          </div>
        </div>
        
        {/* Market Stats Summary Cards */}
        <MarketStats />
        
        {/* Stock Table */}
        <div className="mt-8">
          <StockTable 
            stocks={stocks || []} 
            isLoading={isLoading} 
            onTradeClick={handleTradeClick} 
          />
        </div>
      </div>
      
      {/* Trade Modal */}
      {selectedStockId && (
        <TradeModal 
          isOpen={tradeModalOpen} 
          onClose={() => setTradeModalOpen(false)} 
          stockId={selectedStockId} 
        />
      )}
    </main>
  );
}
