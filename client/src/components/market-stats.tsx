import { useQuery } from "@tanstack/react-query";
import { Stock } from "@shared/schema";
import { TrendingUp, TrendingDown } from "lucide-react";

// Define market indices with their component stocks and weights
const marketIndices = [
  {
    name: "NIFTY 50",
    baseValue: 19425.32,
    components: ["RELIANCE", "TCS", "HDFCBANK", "INFY"]
  },
  {
    name: "SENSEX",
    baseValue: 64718.56,
    components: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATASTEEL"]
  },
  {
    name: "BANK NIFTY",
    baseValue: 44327.80,
    components: ["HDFCBANK", "ICICIBANK", "AXISBANK", "KOTAKBANK", "SBIN"]
  },
  {
    name: "IT INDEX",
    baseValue: 32145.67,
    components: ["TCS", "INFY", "WIPRO", "TECHM", "HCLTECH"]
  }
];

export default function MarketStats() {
  // Fetch all stocks
  const { data: stocks, isLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  // Calculate market index values based on component stocks
  const calculateIndexValue = (indexData: typeof marketIndices[0]) => {
    if (!stocks || isLoading) {
      return {
        value: indexData.baseValue,
        change: 0,
        isPositive: true
      };
    }

    // Get the component stocks that we have data for
    const componentStocks = stocks.filter(stock => 
      indexData.components.includes(stock.symbol)
    );

    if (componentStocks.length === 0) {
      return {
        value: indexData.baseValue,
        change: 0,
        isPositive: true
      };
    }

    // Calculate average price change percentage
    let totalChangePercent = 0;
    componentStocks.forEach(stock => {
      const changePercent = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
      totalChangePercent += changePercent;
    });
    
    const averageChangePercent = totalChangePercent / componentStocks.length;
    
    // Apply the average change to the base value
    const value = indexData.baseValue * (1 + averageChangePercent / 100);
    
    return {
      value: parseFloat(value.toFixed(2)),
      change: parseFloat(averageChangePercent.toFixed(2)),
      isPositive: averageChangePercent >= 0
    };
  };

  // Calculate stats for all indices
  const stats = marketIndices.map(index => {
    return {
      name: index.name,
      ...calculateIndexValue(index)
    };
  });

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-dark-700 rounded-lg shadow-md p-4 border border-dark-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-dark-200">{stat.name}</p>
              <p className="mt-1 text-xl font-semibold">{stat.value.toLocaleString('en-IN')}</p>
            </div>
            <div className={`flex items-center ${stat.isPositive ? 'text-chart-green' : 'text-chart-red'}`}>
              {stat.isPositive ? 
                <TrendingUp className="mr-1 h-4 w-4" /> : 
                <TrendingDown className="mr-1 h-4 w-4" />
              }
              <span>{stat.isPositive ? '+' : ''}{stat.change}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
