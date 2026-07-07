"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { JobFilters } from "@/components/jobs/JobFilters"
import { JobTable } from "@/components/jobs/JobTable"
import { Spinner } from "@/components/ui/spinner"
import { type DateRange } from "react-day-picker"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/lib/api"
import type { Schedule } from "@/types"

export default function JobManagement() {
    const navigate = useNavigate()
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    })

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)
        return () => {
            clearTimeout(handler)
        }
    }, [searchTerm])

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (debouncedSearchTerm) {
                params.append("search", debouncedSearchTerm)
            }
            if (dateRange?.from) {
                params.append("startDate", dateRange.from.toISOString())
            }
            if (dateRange?.to) {
                params.append("endDate", dateRange.to.toISOString())
            }

            const schedulesRes = await apiClient(`/schedules?${params.toString()}`)

            let schedulesData: Schedule[] = [];
            if (schedulesRes.ok) {
                schedulesData = await schedulesRes.json()
            } else {
                console.warn("Schedules endpoint failed. Using empty array.")
            }

            setSchedules(schedulesData)
        } catch (error) {
            console.error("Failed to fetch jobs data", error)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearchTerm, dateRange])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Jobs Management</h2>
                    <p className="text-muted-foreground">Manage scheduled jobs and task assignments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => navigate("/schedules/add")} className="bg-[#011f5f] hover:bg-[#022a80]">
                        <Plus className="mr-2 h-4 w-4" /> Add New Job
                    </Button>
                </div>
            </div>

            <JobFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />

            <JobTable
                schedules={schedules}
                onJobUpdated={fetchData}
            />
        </div>
    )
}

