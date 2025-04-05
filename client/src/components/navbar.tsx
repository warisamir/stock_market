import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { ChartLine, Menu, Bell } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  if (!user) return null;
  
  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/trade", label: "Trade" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/leaderboard", label: "Leaderboard" },
  ];
  
  // Get user initials from username
  const initials = user.username.slice(0, 2).toUpperCase();
  
  return (
    <nav className="bg-dark-700 border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ChartLine className="text-primary-500 h-6 w-6 mr-2" />
              <span className="font-bold text-xl text-white">TradeSmart</span>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a className={`${
                    location === item.path
                      ? "border-b-2 border-primary-500 text-white"
                      : "border-transparent border-b-2 text-dark-100 hover:text-white"
                  } px-1 pt-1 text-sm font-medium`}>
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="hidden sm:flex items-center text-dark-100 mr-4">
                <span className="mr-2 font-medium">Balance:</span>
                <span className="text-white font-bold">
                  ₹{user.walletBalance.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
            
            <div className="ml-3 relative">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="bg-dark-600 p-1 rounded-full text-dark-100 hover:text-white">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center">
                        <Avatar className="h-8 w-8 bg-primary-600">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="ml-2 text-sm font-medium hidden sm:block">{user.username}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-dark-700 border-dark-600">
                      <DropdownMenuItem className="text-white hover:bg-dark-600 cursor-pointer" onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="ml-4 sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-dark-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`${
                  location === item.path
                    ? "bg-dark-600 text-white"
                    : "text-dark-100 hover:bg-dark-600 hover:text-white"
                } block px-3 py-2 rounded-md text-base font-medium`}>
                  {item.label}
                </a>
              </Link>
            ))}
            <div className="flex items-center text-dark-100 px-3 py-2">
              <span className="mr-2 font-medium">Balance:</span>
              <span className="text-white font-bold">
                ₹{user.walletBalance.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
