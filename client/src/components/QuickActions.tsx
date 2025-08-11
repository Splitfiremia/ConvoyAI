import { PhoneCall, Mic, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  const outboundCallMutation = useMutation({
    mutationFn: async ({ phoneNumber, agentId }: { phoneNumber: string; agentId: string }) => {
      return apiRequest("POST", "/api/calls/outbound", { phoneNumber, agentId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Outbound call initiated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate outbound call",
        variant: "destructive",
      });
    },
  });

  const handleMakeOutboundCall = () => {
    // In a real app, this would open a modal to enter phone number
    const phoneNumber = "+1 (555) 123-4567"; // Mock phone number
    const agentId = "agent_123"; // Mock agent ID
    outboundCallMutation.mutate({ phoneNumber, agentId });
  };

  const handleViewRecordings = () => {
    console.log("View call recordings");
    // TODO: Implement view recordings functionality
    toast({
      title: "Feature Coming Soon",
      description: "Call recordings viewer will be available soon",
    });
  };

  const handleGenerateReport = () => {
    console.log("Generate analytics report");
    // TODO: Implement report generation
    toast({
      title: "Feature Coming Soon",
      description: "Report generation will be available soon",
    });
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <Button 
          className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90"
          onClick={handleMakeOutboundCall}
          disabled={outboundCallMutation.isPending}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Make Outbound Call</span>
        </Button>
        
        <Button 
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleViewRecordings}
        >
          <Mic className="w-4 h-4" />
          <span>View Recordings</span>
        </Button>
        
        <Button 
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleGenerateReport}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Generate Report</span>
        </Button>
      </CardContent>
    </Card>
  );
}
