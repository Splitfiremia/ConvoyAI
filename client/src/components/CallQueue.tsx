import { Phone, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CallQueueProps {
  calls?: any[];
}

export default function CallQueue({ calls = [] }: CallQueueProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const answerCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      return apiRequest("POST", `/api/calls/${callId}/answer`, { agentId: 'ai' });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Call answered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/active'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to answer call",
        variant: "destructive",
      });
    },
  });

  const handleAnswerCall = (callId: string) => {
    answerCallMutation.mutate(callId);
  };

  const formatWaitTime = (timestamp: string) => {
    const now = new Date();
    const callTime = new Date(timestamp);
    const diffMs = now.getTime() - callTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);
    return `Waiting ${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Call Queue</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {calls.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No calls in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.slice(0, 5).map((call) => (
              <div key={call.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{call.customerName}</p>
                  <p className="text-sm text-gray-500">{formatWaitTime(call.timestamp)}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAnswerCall(call.id)}
                  disabled={answerCallMutation.isPending}
                  className="text-primary hover:text-primary/80"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {calls.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-primary text-sm font-medium hover:text-primary/80"
              >
                View All ({calls.length} total)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
