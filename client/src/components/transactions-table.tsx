import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TransactionWithStock } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface TransactionsTableProps {
  transactions: TransactionWithStock[];
  isLoading: boolean;
}

export default function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  return (
    <div className="bg-dark-700 rounded-lg shadow-md border border-dark-600 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-dark-700">
            <TableRow>
              <TableHead className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider">Date & Time</TableHead>
              <TableHead className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider">Stock</TableHead>
              <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Price</TableHead>
              <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Quantity</TableHead>
              <TableHead className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider">Total</TableHead>
              <TableHead className="text-center text-xs font-medium text-dark-300 uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-dark-800 divide-y divide-dark-700">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-dark-300">
                  No transactions yet. Start trading to see your history.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-dark-700">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(transaction.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${
                      transaction.type === "BUY" 
                        ? "bg-chart-green bg-opacity-20 text-chart-green" 
                        : "bg-chart-red bg-opacity-20 text-chart-red"
                    } px-2 py-1 rounded text-xs font-medium`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.stock?.symbol}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ₹{transaction.price.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {transaction.quantity}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ₹{transaction.total.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`${
                      transaction.status === "COMPLETED" 
                        ? "bg-green-900 bg-opacity-30 text-green-400" 
                        : transaction.status === "FAILED"
                          ? "bg-red-900 bg-opacity-30 text-red-400"
                          : "bg-yellow-900 bg-opacity-30 text-yellow-400"
                    } px-2 py-1 rounded text-xs font-medium`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {transactions.length > 0 && (
        <div className="px-6 py-4 bg-dark-700 border-t border-dark-600">
          <Button variant="link" className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center p-0">
            <span>View all transactions</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
