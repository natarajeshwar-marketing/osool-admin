import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import { FullCalendar, type CalendarEvent } from '@/components/calendar/FullCalendar';
import { MultiProgressBar } from '@/components/shared/MultiProgressBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SchedulesCalendar() {
  const navigate = useNavigate();



  const [events, setEvents] = useState<CalendarEvent[]>([])

  const fetchEvents = () => {
    apiClient("/schedules")
      .then(res => res.json())
      .then((data: any[]) => {
        const mapped = data.map((item: any) => {
          let colorClass = "bg-blue-500"
          const name = item.serviceName.toLowerCase()
          if (name.includes("cleaning")) colorClass = "bg-emerald-500"
          else if (name.includes("pest")) colorClass = "bg-orange-500"
          else if (name.includes("repair") || name.includes("electrical") || name.includes("plumbing")) colorClass = "bg-purple-500"
          else if (name.includes("wash") || name.includes("window")) colorClass = "bg-cyan-500"

          const title = item.buildingNumber ? `${item.buildingNumber} - ${item.serviceName}` : item.serviceName

          return {
            id: item.id,
            title: title,
            date: new Date(item.year, item.month - 1, item.date),
            color: colorClass
          }
        })
        setEvents(mapped)
      })
      .catch(err => {
        console.error("Failed to fetch events from backend", err)
        toast.error("Failed to load schedules from database.")
      })
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const [pendingMove, setPendingMove] = useState<{
    event: CalendarEvent;
    targetDate: Date;
  } | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleEventDrop = (event: CalendarEvent, targetDate: Date) => {
    const sameDay =
      event.date.getDate() === targetDate.getDate() &&
      event.date.getMonth() === targetDate.getMonth() &&
      event.date.getFullYear() === targetDate.getFullYear();

    if (sameDay) return;

    setPendingMove({ event, targetDate });
    setIsConfirmOpen(true);
  };

  const handleConfirmMove = () => {
    if (!pendingMove) return;

    const { event, targetDate } = pendingMove;

    const payload = {
      date: targetDate.getDate(),
      month: targetDate.getMonth() + 1,
      year: targetDate.getFullYear()
    }

    apiClient(`/schedules/${event.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to move schedule")
        return res.json()
      })
      .then(() => {
        toast("Rescheduled schedule", {
          description: `"${event.title}" has been moved to ${targetDate.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}.`,
        });
        fetchEvents()
      })
      .catch(err => {
        console.error("Failed to reschedule", err)
        toast.error("Failed to update date on the server.")
      })
      .finally(() => {
        setPendingMove(null);
        setIsConfirmOpen(false);
      })
  };

  const handleCancelMove = () => {
    setPendingMove(null);
    setIsConfirmOpen(false);
  };

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

  const handleEventDoubleClick = (event: CalendarEvent) => {
    navigate('/schedules/edit', {
      state: {
        editEvent: {
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          color: event.color
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] space-y-4 w-full pb-4">
      <div className="flex items-center justify-between gap-6 w-full">
        {/* Progress Bar showing service booking percentage */}
        <MultiProgressBar segments={serviceStats} />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button className="bg-[#001e60] hover:bg-[#001e60]/90" onClick={() => navigate('/schedules/add')}>
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
              onEventDoubleClick={handleEventDoubleClick}
              onEventDrop={handleEventDrop}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#001e60] text-xl font-bold flex items-center gap-2">
              Confirm Reschedule
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-2">
              Are you sure you want to reschedule this booking?
              <div className="mt-4 p-4 bg-slate-50/80 rounded-xl text-sm space-y-3 border border-slate-100">
                <div className="font-semibold text-slate-700 truncate">
                  {pendingMove?.event.title}
                </div>
                <div className="h-px bg-slate-200/60 my-2" />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Current Date</span>
                  <span className="text-slate-600 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200/50 shadow-sm">
                    {pendingMove?.event.date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#001e60] uppercase tracking-wider">New Date</span>
                  <span className="text-[#001e60] font-bold bg-[#001e60]/5 px-2.5 py-1 rounded-md border border-[#001e60]/10 shadow-sm">
                    {pendingMove?.targetDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel onClick={handleCancelMove} className="border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMove}
              className="bg-[#001e60] hover:bg-[#001e60]/90 text-white font-medium"
            >
              Confirm Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
