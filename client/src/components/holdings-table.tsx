import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { PortfolioWithStock } from "@/lib/types";

interface HoldingsTableProps {
  holdings: PortfolioWithStock[];
  isLoading: boolean;
  onTradeClick: (stockId: number) => void;
}

export default function HoldingsTable({ holdings, isLoading, onTradeClick }: HoldingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-dark-600">
      <Table>
        <TableHeader className="bg-dark-700">
          <TableRow>
            <TableHead className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider">Stock</TableHead>
            <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Avg. Buy Price</TableHead>
            <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Current Price</TableHead>
            <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Quantity</TableHead>
            <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Invested Amount</TableHead>
            <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Current Value</TableHead>
            <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">P&L</TableHead>
            <TableHead className="text-center text-xs font-medium text-dark-300 uppercase tracking-wider">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-dark-800 divide-y divide-dark-700">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
              </TableCell>
            </TableRow>
          ) : holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-dark-300">
                Your portfolio is empty. Start trading to build your holdings.
              </TableCell>
            </TableRow>
          ) : (
            holdings.map((holding) => {
              const isProfitable = holding.profitLoss >= 0;
              
              return (
                <TableRow key={`${holding.userId}-${holding.stockId}`} className="hover:bg-dark-700">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium">{holding.stock?.symbol}</div>
                        <div className="text-xs text-dark-300">{holding.stock?.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ₹{holding.averageBuyPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ₹{holding.stock?.currentPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {holding.quantity}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ₹{(holding.averageBuyPrice * holding.quantity).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ₹{holding.currentValue.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className={`flex items-center justify-end ${isProfitable ? 'text-chart-green' : 'text-chart-red'}`}>
                      {isProfitable ? 
                        <TrendingUp className="h-4 w-4 mr-1" /> : 
                        <TrendingDown className="h-4 w-4 mr-1" />
                      }
                      <span>
                        {isProfitable ? '+' : ''}
                        ₹{holding.profitLoss.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} 
                        ({isProfitable ? '+' : ''}
                        {holding.profitLossPercentage.toFixed(2)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-primary-700 hover:bg-primary-600 text-white"
                      onClick={() => onTradeClick(holding.stockId)}
                    >
                      TRADE
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
