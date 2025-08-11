import { Phone, CheckCircle, Clock, Heart, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardsProps {
  analytics?: any;
  activeCalls?: any[];
}

export default function MetricsCards({ analytics, activeCalls }: MetricsCardsProps) {
  const metrics = [
    {
      label: "Active Calls",
      value: activeCalls?.length || 0,
      change: "+15%",
      trending: "up",
      icon: Phone,
      color: "primary"
    },
    {
      label: "Calls Answered",
      value: analytics?.answeredCalls || 847,
      change: "+8%",
      trending: "up",
      icon: CheckCircle,
      color: "green"
    },
    {
      label: "Avg Response Time",
      value: `${analytics?.avgResponseTime || 2.3}s`,
      change: "-12%",
      trending: "down",
      icon: Clock,
      color: "yellow"
    },
    {
      label: "Customer Satisfaction",
      value: `${analytics?.customerSatisfaction || 96}%`,
      change: "+3%",
      trending: "up",
      icon: Heart,
      color: "red"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "green":
        return "bg-green-100 text-green-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trending === "up" ? TrendingUp : TrendingDown;
        const trendColor = metric.trending === "up" ? "text-green-600" : "text-green-600";
        
        return (
          <Card key={index} className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className={`text-sm ml-1 ${trendColor}`}>{metric.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(metric.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
