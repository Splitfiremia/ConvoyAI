import { Bell, Square, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function TopBar() {
  const { signOut } = useAuth();

  const handleEmergencyStop = () => {
    console.log("Emergency stop activated");
    // TODO: Implement emergency system stop
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Real-time AI receptionist overview</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Real-time status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Emergency stop button */}
          <Button 
            variant="destructive" 
            onClick={handleEmergencyStop}
            className="bg-red-500 hover:bg-red-600"
          >
            <Square className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>

          {/* Sign out button */}
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-gray-600 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
