import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AssetAllocation as AssetAllocationType } from "@/lib/types";

interface AssetAllocationProps {
  assetAllocation: AssetAllocationType[];
}

export default function AssetAllocation({ assetAllocation }: AssetAllocationProps) {
  // Define colors for the pie chart
  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#FBBF24", "#EF4444", "#EC4899", "#F97316", "#14B8A6"];
  
  // Format data for the pie chart
  const pieData = assetAllocation.map((item, index) => ({
    name: item.symbol,
    value: item.percentage,
    color: COLORS[index % COLORS.length],
  }));
  
  if (assetAllocation.length === 0) {
    return (
      <div className="bg-dark-700 rounded-lg shadow-md p-4 border border-dark-600">
        <h3 className="text-base font-medium mb-4">Asset Allocation</h3>
        <div className="aspect-square max-h-56 mx-auto mb-4 flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-dark-500 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p className="text-dark-300 text-sm">No asset allocation data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-700 rounded-lg shadow-md p-4 border border-dark-600">
      <h3 className="text-base font-medium mb-4">Asset Allocation</h3>
      <div className="aspect-square max-h-56 mx-auto mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={({ name }) => name}
              labelLine={{ stroke: '#374151', strokeWidth: 1 }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Allocation"]}
              contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
              itemStyle={{ color: "#D1D5DB" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-3 mt-4">
        {pieData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}  
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{item.value.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
