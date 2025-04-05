import { useState } from "react";
import { Stock } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Filter, TrendingUp, TrendingDown } from "lucide-react";

interface StockTableProps {
  stocks: Stock[];
  isLoading: boolean;
  onTradeClick: (stockId: number) => void;
  showPagination?: boolean;
}

export default function StockTable({ 
  stocks, 
  isLoading, 
  onTradeClick,
  showPagination = false 
}: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter stocks based on search query
  const filteredStocks = stocks.filter(
    (stock) => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Paginate stocks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Stocks</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search stocks..." 
              className="bg-dark-700 border border-dark-600 focus:border-primary-500 focus:ring-0 rounded-md py-2 pr-10 pl-3 text-sm w-60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-dark-300" />
          </div>
          <Button variant="outline" size="icon" className="bg-dark-700 border border-dark-600 hover:bg-dark-600">
            <Filter className="h-4 w-4 text-dark-300" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-dark-600">
        <Table>
          <TableHeader className="bg-dark-700">
            <TableRow>
              <TableHead className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider">Symbol</TableHead>
              <TableHead className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider">Company</TableHead>
              <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Price</TableHead>
              <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Change</TableHead>
              <TableHead className="text-center text-xs font-medium text-dark-300 uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-dark-800 divide-y divide-dark-700">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
                </TableCell>
              </TableRow>
            ) : currentStocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-dark-300">
                  No stocks found
                </TableCell>
              </TableRow>
            ) : (
              currentStocks.map((stock) => {
                // Calculate price change percentage
                const priceChangePercent = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
                const isPriceUp = priceChangePercent >= 0;
                
                return (
                  <TableRow key={stock.id} className="hover:bg-dark-700">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {stock.symbol}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                      {stock.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ₹{stock.currentPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className={`flex items-center justify-end ${isPriceUp ? 'text-chart-green' : 'text-chart-red'}`}>
                        {isPriceUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        <span>{isPriceUp ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-primary-700 hover:bg-primary-600 text-white"
                        onClick={() => onTradeClick(stock.id)}
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
      
      {showPagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-dark-300">
            Showing <span className="font-medium text-dark-100">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium text-dark-100">
              {Math.min(indexOfLastItem, filteredStocks.length)}
            </span>{" "}
            of <span className="font-medium text-dark-100">{filteredStocks.length}</span> results
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 rounded bg-dark-700 border border-dark-600 text-dark-300 hover:bg-dark-600 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? "bg-primary-700 text-white hover:bg-primary-600"
                      : "bg-dark-700 border border-dark-600 text-dark-200 hover:bg-dark-600"
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 rounded bg-dark-700 border border-dark-600 text-dark-200 hover:bg-dark-600 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
