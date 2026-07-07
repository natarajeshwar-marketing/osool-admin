import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


interface CrewFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    roleFilter: string
    onRoleChange: (value: string) => void
}

export function CrewFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    roleFilter,
    onRoleChange
}: CrewFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full flex-wrap justify-end">
                <div className="relative w-full md:w-auto md:min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search crews..."
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
                        <SelectItem value="on leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                </Select>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={onRoleChange}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-950">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="cleaner">Cleaner</SelectItem>
                        <SelectItem value="car washer">Car Washer</SelectItem>
                        <SelectItem value="pest control">Pest Control</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
