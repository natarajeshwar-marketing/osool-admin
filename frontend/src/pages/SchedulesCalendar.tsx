import { useState } from 'react';
import { FullCalendar, type CalendarEvent } from '@/components/calendar/FullCalendar';
import { MultiProgressBar } from '@/components/shared/MultiProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function SchedulesCalendar() {
  // Dummy events to showcase capability
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Building A Maintenance',
      date: new Date(),
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Crew 2 - Deep Cleaning',
      date: new Date(),
      color: 'bg-emerald-500'
    },
    {
      id: '3',
      title: 'Pest Control - Zone C',
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      color: 'bg-orange-500'
    },
    {
      id: '4',
      title: 'HVAC Inspection',
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      color: 'bg-purple-500'
    },
    {
      id: '5',
      title: 'Window Cleaning - Tower 1',
      date: new Date(new Date().setDate(new Date().getDate() - 3)),
      color: 'bg-cyan-500'
    }
  ]);

  // Dummy breakdown of service bookings
  const serviceStats = [
    { id: 'maintenance', label: 'General Maintenance', color: 'bg-blue-500', percentage: 40 },
    { id: 'cleaning', label: 'Cleaning', color: 'bg-emerald-500', percentage: 10 },
    { id: 'pest', label: 'Pest Control', color: 'bg-orange-500', percentage: 1 },
    { id: 'inspection', label: 'Inspection', color: 'bg-purple-500', percentage: 10 },
  ];

  const handleDateClick = (date: Date) => {
    toast(`Adding event for ${date.toDateString()}`, {
      description: "This would open a modal to create a new schedule."
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    toast(`Event Details: ${event.title}`, {
      description: `Scheduled for ${event.date.toDateString()}`
    });
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] space-y-4 w-full pb-4">
      <div className="flex items-center justify-between gap-6 w-full">
        {/* Progress Bar showing service booking percentage */}
        <MultiProgressBar segments={serviceStats} />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button className="bg-[#001e60] hover:bg-[#001e60]/90">
            <Plus className="mr-2 h-4 w-4" /> Add Schedule
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <Card className="shadow-md border-slate-200 flex-1 flex flex-col">

          <CardContent className="p-6 flex-1 flex flex-col min-h-0">
            <FullCalendar
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              className="flex-1"
            />
          </CardContent>
        </Card>
      </div>

      {/* Legend section */}
      <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div> General Maintenance
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Cleaning
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div> Pest Control
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div> Inspection
        </div>
      </div>
    </div>
  );
}
