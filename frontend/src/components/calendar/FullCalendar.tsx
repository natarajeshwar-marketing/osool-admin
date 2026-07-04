import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string; // Optional color class (e.g., bg-blue-500)
}

interface FullCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function FullCalendar({ events = [], onDateClick, onEventClick, className }: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#001e60]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold py-3 border-b text-slate-500 uppercase text-sm tracking-wider bg-slate-50/50">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-t border-l border-r border-slate-200 rounded-t-lg">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;

        // Find events for this day
        const dayEvents = events.filter(e => isSameDay(e.date, cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "border-b border-r p-2 flex flex-col transition-colors cursor-pointer hover:bg-slate-50 min-h-0",
              !isSameMonth(day, monthStart) ? "text-slate-400 bg-slate-50/50" : "text-slate-700 bg-white",
              isSameDay(day, new Date()) ? "ring-2 ring-inset ring-[#001e60]" : "",
              i === 0 ? "border-l" : "" // left border for the first column
            )}
            onClick={() => onDateClick && onDateClick(cloneDay)}
          >
            <div className="flex justify-end mb-1">
              <span className={cn(
                "flex items-center justify-center h-7 w-7 rounded-full text-sm",
                isSameDay(day, new Date()) ? "bg-[#001e60] text-white font-bold" : ""
              )}>
                {formattedDate}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick && onEventClick(event);
                  }}
                  className={cn(
                    "text-xs px-2 py-1 rounded truncate text-white cursor-pointer hover:opacity-90 transition-opacity font-medium",
                    event.color || "bg-[#001e60]"
                  )}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 flex-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-b rounded-b-lg overflow-hidden bg-white shadow-sm flex-1 flex flex-col">{rows}</div>;
  };

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {renderHeader()}
      <div className="bg-white rounded-lg flex-1 flex flex-col min-h-0">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}
