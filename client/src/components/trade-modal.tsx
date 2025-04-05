import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Stock, TradeOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, TrendingUp, TrendingDown, X } from "lucide-react";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number;
}

type OrderType = "market" | "limit";

export default function TradeModal({ isOpen, onClose, stockId }: TradeModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for trade form
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [price, setPrice] = useState(0);
  
  // Fetch stock data
  const { data: stock, isLoading: isLoadingStock } = useQuery<Stock>({
    queryKey: [`/api/stocks/${stockId}`],
    enabled: isOpen && !!stockId,
  });
  
  // Update price when stock data loads
  useEffect(() => {
    if (stock) {
      setPrice(stock.currentPrice);
    }
  }, [stock]);
  
  // Calculate total
  const total = quantity * price;
  
  // Place trade mutation
  const tradeMutation = useMutation({
    mutationFn: async (tradeOrder: TradeOrder) => {
      const res = await apiRequest("POST", "/api/trade", tradeOrder);
      return await res.json();
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Order Placed Successfully",
        description: `Your ${tradeType.toLowerCase()} order for ${quantity} shares of ${stock?.symbol} has been placed.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Close modal
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };
  
  // Handle order submission
  const handleSubmitOrder = () => {
    if (!stock) return;
    
    tradeMutation.mutate({
      stockId,
      type: tradeType,
      quantity,
      price,
    });
  };
  
  // Calculate price change percentage
  const priceChangePercent = stock 
    ? ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100 
    : 0;
  
  const isPriceUp = priceChangePercent >= 0;
  
  // Handle closing the modal
  const handleClose = () => {
    if (!tradeMutation.isPending) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-700 border-dark-600 text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              {isLoadingStock ? "Loading..." : `Trade ${stock?.symbol}`}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-dark-300 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {isLoadingStock ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : stock ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-dark-200">{stock.name}</span>
                <div className={`flex items-center ${isPriceUp ? 'text-chart-green' : 'text-chart-red'}`}>
                  {isPriceUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span>
                    ₹{stock.currentPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} 
                    ({isPriceUp ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <div className="h-28 bg-dark-800 rounded border border-dark-600 mb-4 flex items-center justify-center">
                <div className="text-center text-dark-400">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Price chart</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex border border-dark-500 rounded-lg overflow-hidden mb-4">
                <button 
                  className={`flex-1 py-2 text-center font-medium ${
                    tradeType === "BUY" 
                      ? "text-white bg-primary-700" 
                      : "text-dark-200 hover:bg-dark-600"
                  }`}
                  onClick={() => setTradeType("BUY")}
                >
                  BUY
                </button>
                <button 
                  className={`flex-1 py-2 text-center font-medium ${
                    tradeType === "SELL" 
                      ? "text-white bg-chart-red" 
                      : "text-dark-200 hover:bg-dark-600"
                  }`}
                  onClick={() => setTradeType("SELL")}
                >
                  SELL
                </button>
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-dark-200 mb-1">Quantity</Label>
                <div className="flex">
                  <Button 
                    className="px-3 py-2 bg-dark-600 border-dark-500 rounded-l border text-white"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    className="flex-1 px-3 py-2 bg-dark-800 border-t border-b border-dark-500 text-center text-white" 
                    value={quantity} 
                    onChange={(e) => handleQuantityChange(Number(e.target.value))} 
                    min="1"
                  />
                  <Button 
                    className="px-3 py-2 bg-dark-600 border-dark-500 rounded-r border text-white"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-dark-200 mb-1">Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                >
                  <SelectTrigger className="w-full px-3 py-2 bg-dark-800 border border-dark-500 rounded text-white">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-800 border-dark-500 text-white">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {orderType === "limit" && (
                <div className="mb-4">
                  <Label className="block text-sm font-medium text-dark-200 mb-1">Price (₹)</Label>
                  <Input 
                    type="number" 
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-500 rounded text-white" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))}
                    step="0.01"
                    min="0.01"
                  />
                </div>
              )}
            </div>
            
            <div className="bg-dark-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-dark-200">Order Value</span>
                <span className="font-medium">
                  ₹{total.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-dark-200">Brokerage Fee</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="border-t border-dark-600 my-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-dark-200">Total Amount</span>
                  <span className="font-bold text-lg">
                    ₹{total.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              <div>
                <div className="text-xs text-dark-300">Available Balance</div>
                <div className="font-bold">
                  ₹{user?.walletBalance.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <Button 
                onClick={handleSubmitOrder}
                disabled={tradeMutation.isPending}
                className={`px-6 py-3 font-medium rounded-lg ${
                  tradeType === "BUY" 
                    ? "bg-primary-600 hover:bg-primary-700 text-white" 
                    : "bg-chart-red hover:bg-red-700 text-white"
                }`}
              >
                {tradeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place ${tradeType} Order`
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center text-dark-300">
            Failed to load stock data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
