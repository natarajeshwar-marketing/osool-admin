import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BuildingFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    typeFilter: string
    onTypeChange: (value: string) => void
}

export function BuildingFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    typeFilter,
    onTypeChange
}: BuildingFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full flex-wrap justify-end">
                <div className="relative w-full md:w-auto md:min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search buildings..."
                        className="pl-8 bg-white dark:bg-neutral-950"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-950">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={onTypeChange}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-950">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
