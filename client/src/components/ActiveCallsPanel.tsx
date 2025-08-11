import { Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/lib/utils";

interface ActiveCallsPanelProps {
  calls?: any[];
}

export default function ActiveCallsPanel({ calls = [] }: ActiveCallsPanelProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const transferCallMutation = useMutation({
    mutationFn: async ({ callId, agentId }: { callId: string; agentId: string }) => {
      return apiRequest("POST", `/api/calls/${callId}/transfer`, { agentId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Call transferred successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/active'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to transfer call",
        variant: "destructive",
      });
    },
  });

  const handleTransfer = (callId: string) => {
    // In a real app, this would open a modal to select agent
    const agentId = "agent_123"; // Mock agent ID
    transferCallMutation.mutate({ callId, agentId });
  };

  const handleListen = (callId: string) => {
    console.log("Listen to call:", callId);
    // TODO: Implement call listening functionality
  };

  if (!calls || calls.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Active Calls</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Real-time</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active calls at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Active Calls</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Real-time</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {calls.map((call, index) => (
            <div key={call.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  call.assignedAgentId && call.assignedAgentId !== 'ai' 
                    ? 'bg-yellow-100' 
                    : 'bg-primary'
                }`}>
                  {call.assignedAgentId && call.assignedAgentId !== 'ai' ? (
                    <User className="text-yellow-600 w-5 h-5" />
                  ) : (
                    <Phone className="text-white w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{call.customerName}</p>
                  <p className="text-sm text-gray-500">{call.phoneNumber}</p>
                  <p className="text-xs text-gray-400">{call.purpose}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {call.startTime ? formatDuration(new Date(call.startTime)) : '00:00:00'}
                </p>
                <p className="text-xs text-gray-500">
                  {call.assignedAgentId && call.assignedAgentId !== 'ai' 
                    ? `Agent: ${call.assignedAgentId}` 
                    : 'AI Handling'
                  }
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {!call.assignedAgentId || call.assignedAgentId === 'ai' ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleTransfer(call.id)}
                      disabled={transferCallMutation.isPending}
                      className="text-xs"
                    >
                      Transfer
                    </Button>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Live Agent
                    </span>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleListen(call.id)}
                    className="text-xs"
                  >
                    Listen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
