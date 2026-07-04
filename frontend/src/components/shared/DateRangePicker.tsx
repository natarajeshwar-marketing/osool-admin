"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { OrangeCalendar } from "@/components/ui/calendar-orange"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date?: DateRange
    setDate?: (date: DateRange | undefined) => void
}

export function DateRangePicker({
    className,
    date: externalDate,
    setDate: externalSetDate,
}: DateRangePickerProps) {
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>({
        from: new Date(2024, 0, 20),
        to: addDays(new Date(2024, 0, 20), 20),
    })

    // Determining the effective current date
    const date = externalDate !== undefined ? externalDate : internalDate
    const setDate = externalSetDate || setInternalDate

    // Local state for the popover interaction
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)
    const [open, setOpen] = React.useState(false)

    // Sync tempDate when popover opens
    React.useEffect(() => {
        if (open) {
            setTempDate(date)
        }
    }, [open, date])

    const handleApply = () => {
        setDate(tempDate)
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-fit justify-start text-left font-normal rounded-full bg-white dark:bg-neutral-950",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                    <Card className="mx-auto w-fit p-0 border-0 shadow-none">
                        <CardContent className="p-0">
                            <OrangeCalendar
                                initialFocus
                                mode="range"
                                defaultMonth={tempDate?.from}
                                selected={tempDate}
                                onSelect={setTempDate}
                                numberOfMonths={2}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                            />
                            <div className="flex items-center justify-end gap-2 p-3 border-t">
                                <Button variant="ghost" size="sm" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleApply} className="bg-orange-500 hover:bg-orange-600 text-white">
                                    Apply
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    )
}
