import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
    date?: Date
    value?: string // Format: "hh:mm aa" e.g. "08:30 AM"
    onChange?: (time: string) => void
    className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
    // Parse initial value or default
    const [hour, setHour] = React.useState<string>("12")
    const [minute, setMinute] = React.useState<string>("00")
    const [ampm, setAmpm] = React.useState<string>("AM")
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        if (value) {
            // Simple parse "hh:mm aa"
            const parts = value.split(/[:\s]/)
            if (parts.length === 3) {
                setHour(parts[0])
                setMinute(parts[1])
                setAmpm(parts[2])
            }
        }
    }, [value])

    const handleTimeChange = (type: "hour" | "minute" | "ampm", val: string) => {
        let newHour = hour
        let newMinute = minute
        let newAmpm = ampm

        if (type === "hour") newHour = val
        if (type === "minute") newMinute = val
        if (type === "ampm") newAmpm = val

        if (type === "hour") setHour(val)
        if (type === "minute") setMinute(val)
        if (type === "ampm") setAmpm(val)

        if (onChange) {
            onChange(`${newHour}:${newMinute} ${newAmpm}`)
        }
    }

    // Generate options
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal px-3",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {value ? value : "Pick time"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-center">Hour</Label>
                        <Select value={hour} onValueChange={(v) => handleTimeChange("hour", v)}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="h-[200px]">
                                {hours.map((h) => (
                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="text-xl pt-4">:</span>
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-center">Min</Label>
                        <Select value={minute} onValueChange={(v) => handleTimeChange("minute", v)}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="h-[200px]">
                                {minutes.map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-center">AM/PM</Label>
                        <Select value={ampm} onValueChange={(v) => handleTimeChange("ampm", v)}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="AM/PM" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
