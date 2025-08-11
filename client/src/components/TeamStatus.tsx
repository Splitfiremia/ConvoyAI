import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamStatusProps {
  users?: any[];
}

export default function TeamStatus({ users = [] }: TeamStatusProps) {
  const teamMembers = users.filter(user => user.role !== 'admin');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'on_call':
        return 'bg-yellow-500';
      case 'break':
        return 'bg-gray-400';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'on_call':
        return 'On Call';
      case 'break':
        return 'Break';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'on_call':
        return 'text-yellow-600';
      case 'break':
        return 'text-gray-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Team Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={member.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100`}
                  alt={member.name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{member.role.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                <span className={`text-sm ${getStatusTextColor(member.status)}`}>
                  {getStatusText(member.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
