import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CallVolumeChart() {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Call Volume Today</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Call Volume Chart</p>
            <p className="text-sm text-gray-400 mt-2">Real-time data visualization</p>
            <p className="text-xs text-gray-400 mt-1">Chart.js integration coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
