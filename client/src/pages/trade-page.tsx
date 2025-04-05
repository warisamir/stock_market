import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Stock } from "@shared/schema";
import { TransactionWithStock } from "@/lib/types";
import StockTable from "@/components/stock-table";
import TransactionsTable from "@/components/transactions-table";
import TradeModal from "@/components/trade-modal";

export default function TradePage() {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  
  // Fetch all stocks
  const { data: stocks, isLoading: isLoadingStocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });
  
  // Fetch recent transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<TransactionWithStock[]>({
    queryKey: ["/api/transactions"],
  });
  
  const handleTradeClick = (stockId: number) => {
    setSelectedStockId(stockId);
    setTradeModalOpen(true);
  };
  
  const isLoading = isLoadingStocks || isLoadingTransactions;
  
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
        <h1 className="text-2xl font-bold mb-6">Trade Stocks</h1>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Stocks Table */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Stocks</h2>
            <StockTable 
              stocks={stocks || []} 
              isLoading={isLoadingStocks} 
              onTradeClick={handleTradeClick}
              showPagination={true}
            />
          </div>
          
          {/* Recent Transactions */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
            <TransactionsTable 
              transactions={transactions || []} 
              isLoading={isLoadingTransactions} 
            />
          </div>
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
