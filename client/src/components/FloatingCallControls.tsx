import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FloatingCallControls() {
  const [systemStatus, setSystemStatus] = useState<'active' | 'paused' | 'stopped'>('active');
  const { toast } = useToast();

  const handleAcceptAll = () => {
    setSystemStatus('active');
    toast({
      title: "System Active",
      description: "Now accepting all incoming calls",
    });
  };

  const handlePause = () => {
    setSystemStatus('paused');
    toast({
      title: "System Paused",
      description: "Call accepting is paused",
      variant: "destructive",
    });
  };

  const handleStop = () => {
    setSystemStatus('stopped');
    toast({
      title: "System Stopped",
      description: "All call processing has been stopped",
      variant: "destructive",
    });
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'active':
        return 'System Active';
      case 'paused':
        return 'System Paused';
      case 'stopped':
        return 'System Stopped';
      default:
        return 'System Status';
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${systemStatus === 'active' ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white p-0"
            onClick={handleAcceptAll}
            disabled={systemStatus === 'active'}
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white p-0"
            onClick={handlePause}
            disabled={systemStatus === 'paused'}
          >
            <Pause className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
            onClick={handleStop}
            disabled={systemStatus === 'stopped'}
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
