import { Phone, BarChart3, PhoneCall, Users, Calendar, UsersRound, Settings, List, LogOut, Palette } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const ConvoyLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="flex-shrink-0">
    <rect width="40" height="40" rx="8" fill="#3B82F6" />
    <circle cx="12" cy="12" r="3" fill="white" />
    <circle cx="28" cy="12" r="3" fill="white" />
    <circle cx="20" cy="20" r="4" fill="white" />
    <circle cx="12" cy="28" r="3" fill="white" />
    <circle cx="28" cy="28" r="3" fill="white" />
    <line x1="15" y1="14" x2="17" y2="18" stroke="white" strokeWidth="1.5" />
    <line x1="25" y1="14" x2="23" y2="18" stroke="white" strokeWidth="1.5" />
    <line x1="17" y1="22" x2="15" y2="26" stroke="white" strokeWidth="1.5" />
    <line x1="23" y1="22" x2="25" y2="26" stroke="white" strokeWidth="1.5" />
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: true },
  { name: 'Active Calls', href: '/calls', icon: PhoneCall, current: false },
  { name: 'Call Queue', href: '/queue', icon: List, current: false },
  { name: 'Call Logs', href: '/logs', icon: Phone, current: false },
  { name: 'Customers', href: '/customers', icon: Users, current: false },
  { name: 'Appointments', href: '/appointments', icon: Calendar, current: false },
  { name: 'Team Management', href: '/team', icon: UsersRound, current: false },
  { name: 'White Label', href: '/white-label', icon: Palette, current: false },
  { name: 'Settings', href: '/settings', icon: Settings, current: false },
];

function UserProfile() {
  const { currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <img 
          src={currentUser.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"}
          alt="User profile" 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{currentUser.displayName || 'User'}</p>
          <p className="text-xs text-gray-500">{currentUser.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-400 hover:text-red-600 p-1"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <ConvoyLogo size={32} />
        <h1 className="text-xl font-bold text-gray-900 ml-3">Convoy AI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 w-5 h-5",
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <UserProfile />
    </div>
  );
}