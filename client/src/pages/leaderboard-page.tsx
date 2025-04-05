import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { LeaderboardEntry } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function LeaderboardPage() {
  const { user } = useAuth();
  
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });
  
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
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <div className="bg-dark-700 rounded-lg shadow-md border border-dark-600 overflow-hidden">
          <div className="px-6 py-4 bg-primary-900 text-white">
            <h3 className="text-lg font-semibold">Top Traders</h3>
            <p className="text-sm text-primary-200">Based on portfolio performance</p>
          </div>
          
          <div>
            <ul className="divide-y divide-dark-600">
              {leaderboard && leaderboard.map((entry, index) => {
                const isCurrentUser = user && entry.userId === user.id;
                
                return (
                  <li 
                    key={entry.userId} 
                    className={`px-6 py-4 flex items-center justify-between hover:bg-dark-600 ${
                      isCurrentUser ? "bg-dark-600 bg-opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${
                        index < 3 ? "bg-primary-800" : "bg-dark-600"
                      } flex items-center justify-center mr-3 ${
                        isCurrentUser ? "bg-primary-700" : ""
                      }`}>
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {entry.username}
                          {isCurrentUser && <span className="text-xs text-dark-300 ml-2">You</span>}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        ₹{entry.portfolioValue.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
