import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { type DateRange } from "react-day-picker"

interface JobFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (date: DateRange | undefined) => void
}

export function JobFilters({
    searchTerm,
    onSearchChange,
    dateRange,
    onDateRangeChange
}: JobFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full flex-wrap justify-end">
                <div className="relative w-full md:w-auto md:min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs..."
                        className="pl-8 bg-white dark:bg-neutral-950"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DateRangePicker date={dateRange} setDate={onDateRangeChange} />
                </div>
            </div>
        </div>
    )
}
