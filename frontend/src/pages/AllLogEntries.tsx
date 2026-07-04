import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { Search } from "lucide-react"

import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { LogsHistoryTable } from "@/components/daily-log/LogsHistoryTable"
import { PaginationControls } from "@/components/ui/PaginationControls"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Building } from "@/types"

export default function AllLogEntries() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [buildings, setBuildings] = useState<Building[]>([])

    // Filter states
    const [selectedRole, setSelectedRole] = useState("all")
    const [selectedBuilding, setSelectedBuilding] = useState("all")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    // Fetch buildings on mount
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/buildings`)
                const data = await res.json()
                setBuildings(data)
            } catch (err) {
                console.error("Failed to fetch buildings", err)
            }
        }
        fetchBuildings()
    }, [])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', currentPage.toString())
            params.append('limit', itemsPerPage.toString())

            if (date?.from) {
                params.append('startDate', format(date.from, 'yyyy-MM-dd'))
            }
            if (date?.to) {
                params.append('endDate', format(date.to, 'yyyy-MM-dd'))
            }

            if (selectedRole && selectedRole !== 'all') {
                params.append('role', selectedRole)
            }

            if (selectedBuilding && selectedBuilding !== 'all') {
                params.append('buildingId', selectedBuilding)
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/daily-logs?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch logs')

            const { data, total } = await res.json()
            setLogs(data)
            setTotalItems(total)
        } catch (err) {
            console.error("Failed to fetch logs", err)
            toast.error("Failed to load log entries")
        } finally {
            setLoading(false)
        }
    }

    // Reset to page 1 when filters change (but don't fetch)
    useEffect(() => {
        setCurrentPage(1)
    }, [date])

    // Fetch data only when pagination changes
    useEffect(() => {
        fetchLogs()
    }, [currentPage, itemsPerPage])

    const handleApplyFilters = () => {
        setCurrentPage(1)
        fetchLogs()
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-[#011f5f]">All Log Entries</h2>
                <p className="text-muted-foreground">View and filter historical log entries.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-end">
                <div className="flex items-center space-x-2">
                    <DateRangePicker date={date} setDate={setDate} />
                </div>

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-950">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Technician">Technician</SelectItem>
                        <SelectItem value="Cleaner">Cleaner</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger className="w-[160px] bg-white dark:bg-neutral-950">
                        <SelectValue placeholder="Building" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Buildings</SelectItem>
                        {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                                {building.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={handleApplyFilters} className="bg-[#011f5f] hover:bg-[#022a80] text-white">
                    <Search className="mr-2 h-4 w-4" /> Apply
                </Button>
            </div>

            <LogsHistoryTable logs={logs} loading={loading} />

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(val) => {
                    setItemsPerPage(val)
                    setCurrentPage(1) // Reset to first page when changing page size
                }}
                totalItems={totalItems}
            />
        </div>
    )
}
