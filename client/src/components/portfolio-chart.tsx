import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PortfolioChartProps {
  timeframe: string;
}

export default function PortfolioChart({ timeframe }: PortfolioChartProps) {
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  
  // Generate sample data based on timeframe
  useEffect(() => {
    const generateData = () => {
      const data: { date: string; value: number }[] = [];
      const now = new Date();
      let startValue = 100000;
      let previousValue = startValue;
      let dataPoints = 0;
      
      // Set number of data points based on timeframe
      switch (timeframe) {
        case "1D":
          dataPoints = 24; // Hourly for a day
          break;
        case "1W":
          dataPoints = 7; // Daily for a week
          break;
        case "1M":
          dataPoints = 30; // Daily for a month
          break;
        case "3M":
          dataPoints = 12; // Weekly for 3 months
          break;
        case "1Y":
          dataPoints = 12; // Monthly for a year
          break;
        case "ALL":
          dataPoints = 24; // Monthly for 2 years
          break;
        default:
          dataPoints = 24;
      }
      
      // Generate data points
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date(now);
        
        // Adjust date based on timeframe
        if (timeframe === "1D") {
          date.setHours(now.getHours() - (dataPoints - i - 1));
        } else if (timeframe === "1W") {
          date.setDate(now.getDate() - (dataPoints - i - 1));
        } else if (timeframe === "1M") {
          date.setDate(now.getDate() - (dataPoints - i - 1));
        } else if (timeframe === "3M") {
          date.setDate(now.getDate() - ((dataPoints - i - 1) * 7));
        } else if (timeframe === "1Y" || timeframe === "ALL") {
          date.setMonth(now.getMonth() - (dataPoints - i - 1));
        }
        
        // Generate a realistic looking random change (-5% to +5%)
        const change = (Math.random() * 10 - 5) / 100;
        const currentValue = Math.round(previousValue * (1 + change));
        previousValue = currentValue;
        
        // Format date based on timeframe
        let formattedDate = '';
        if (timeframe === "1D") {
          formattedDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (["1W", "1M", "3M"].includes(timeframe)) {
          formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
          formattedDate = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
        }
        
        data.push({
          date: formattedDate,
          value: currentValue,
        });
      }
      
      return data;
    };
    
    setChartData(generateData());
  }, [timeframe]);
  
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-800 rounded border border-dark-600">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-dark-500 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-dark-300 text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }
  
  // Calculate if trending up or down
  const isTrendingUp = chartData[chartData.length - 1].value >= chartData[0].value;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis 
          dataKey="date" 
          stroke="#6B7280" 
          tick={{ fill: "#9CA3AF" }} 
          tickLine={{ stroke: "#4B5563" }}
        />
        <YAxis 
          stroke="#6B7280" 
          tick={{ fill: "#9CA3AF" }} 
          tickLine={{ stroke: "#4B5563" }}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value: number) => [`₹${value.toLocaleString()}`, "Value"]}
          contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          labelStyle={{ color: "#D1D5DB" }}
          itemStyle={{ color: "#93C5FD" }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={isTrendingUp ? "#10B981" : "#EF4444"} 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: isTrendingUp ? "#10B981" : "#EF4444" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
