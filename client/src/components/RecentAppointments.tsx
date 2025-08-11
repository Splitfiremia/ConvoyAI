import { Calendar, CalendarCheck, CalendarX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecentAppointmentsProps {
  appointments?: any[];
}

export default function RecentAppointments({ appointments = [] }: RecentAppointmentsProps) {
  // Mock appointments for demo
  const mockAppointments = [
    {
      id: '1',
      customerName: 'Jennifer Clark',
      service: 'Consultation',
      date: new Date(),
      status: 'confirmed'
    },
    {
      id: '2',
      customerName: 'Mark Rodriguez',
      service: 'Follow-up meeting',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '3',
      customerName: 'Sophie Turner',
      service: 'Initial consultation',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'scheduled'
    }
  ];

  const displayAppointments = appointments.length > 0 ? appointments : mockAppointments;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CalendarCheck;
      case 'pending':
        return Calendar;
      case 'scheduled':
        return Calendar;
      case 'cancelled':
        return CalendarX;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'scheduled':
        return 'bg-blue-100 text-blue-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAppointmentDate = (date: Date) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (isTomorrow) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Appointments</CardTitle>
          <Button variant="ghost" className="text-primary text-sm font-medium hover:text-primary/80">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayAppointments.map((appointment) => {
            const StatusIcon = getStatusIcon(appointment.status);
            
            return (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(appointment.status)}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.customerName}</p>
                    <p className="text-sm text-gray-500">{appointment.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatAppointmentDate(new Date(appointment.date))}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
