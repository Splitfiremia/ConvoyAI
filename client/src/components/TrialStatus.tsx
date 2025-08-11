import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TrialStatus() {
  const [trialInfo, setTrialInfo] = useState<{
    plan: string;
    daysRemaining: number;
    isActive: boolean;
  } | null>(null);

  useEffect(() => {
    const trialPlan = localStorage.getItem('trialPlan');
    const trialEndDate = localStorage.getItem('trialEndDate');
    
    if (trialPlan && trialEndDate) {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      setTrialInfo({
        plan: trialPlan,
        daysRemaining,
        isActive: daysRemaining > 0
      });
    }
  }, []);

  if (!trialInfo) return null;

  const planNames = {
    starter: 'Starter',
    professional: 'Professional', 
    enterprise: 'Enterprise'
  };

  return (
    <Card className={`mb-6 border-2 ${trialInfo.isActive ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${trialInfo.isActive ? 'bg-blue-100' : 'bg-orange-100'}`}>
              {trialInfo.isActive ? (
                <Clock className="w-5 h-5 text-blue-600" />
              ) : (
                <Crown className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {planNames[trialInfo.plan as keyof typeof planNames]} Trial
                </span>
                <Badge variant={trialInfo.isActive ? "secondary" : "destructive"}>
                  {trialInfo.isActive ? `${trialInfo.daysRemaining} days left` : 'Expired'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {trialInfo.isActive 
                  ? 'Enjoy full access to all features during your trial period'
                  : 'Your trial has ended. Upgrade to continue using Convoy AI'
                }
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant={trialInfo.isActive ? "outline" : "default"}
            className={trialInfo.isActive ? "border-blue-300 text-blue-700 hover:bg-blue-50" : ""}
          >
            {trialInfo.isActive ? 'Upgrade Early' : 'Upgrade Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}