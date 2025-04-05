import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortfolioWithStock, PortfolioSummary } from "@/lib/types";
import PortfolioChart from "@/components/portfolio-chart";
import AssetAllocation from "@/components/asset-allocation";
import HoldingsTable from "@/components/holdings-table";
import TradeModal from "@/components/trade-modal";

interface PortfolioPageProps {
  openTradeModal: (stockId: number) => void;
}

export default function PortfolioPage({ openTradeModal }: PortfolioPageProps) {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState("1D");
  
  // Fetch portfolio data
  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery<PortfolioWithStock[]>({
    queryKey: ["/api/portfolio"],
  });
  
  // Fetch portfolio summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery<PortfolioSummary>({
    queryKey: ["/api/portfolio/summary"],
  });
  
  const handleTradeClick = (stockId: number) => {
    setSelectedStockId(stockId);
    setTradeModalOpen(true);
  };
  
  const isLoading = isLoadingPortfolio || isLoadingSummary;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Your Portfolio</h2>
          {summary && (
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-dark-200">Total Value</p>
                  <p className="text-xl font-bold">₹{summary.totalValue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark-200">Overall Return</p>
                  <p className={`text-xl font-bold ${
                    summary.profitLoss >= 0 ? 'text-chart-green' : 'text-chart-red'
                  }`}>
                    {summary.profitLoss >= 0 ? '+' : ''}
                    ₹{summary.profitLoss.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} 
                    ({summary.profitLoss >= 0 ? '+' : ''}
                    {summary.profitLossPercentage.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Performance Chart */}
          <div className="bg-dark-700 rounded-lg shadow-md p-4 border border-dark-600 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium">Portfolio Performance</h3>
              <div className="flex space-x-2">
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                  <button
                    key={period}
                    className={`px-2 py-1 text-xs rounded ${
                      timeframe === period
                        ? "bg-primary-700 text-white"
                        : "bg-dark-600 text-dark-200 hover:bg-dark-500"
                    }`}
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="chart-container">
              <PortfolioChart timeframe={timeframe} />
            </div>
          </div>
          
          {/* Asset Allocation */}
          {summary && (
            <AssetAllocation assetAllocation={summary.assetAllocation} />
          )}
        </div>
        
        {/* Holdings */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Your Holdings</h3>
          <HoldingsTable
            holdings={portfolio || []}
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
