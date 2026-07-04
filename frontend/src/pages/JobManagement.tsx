"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { JobFilters } from "@/components/jobs/JobFilters"
import { JobTable } from "@/components/jobs/JobTable"
import { AddJobModal } from "@/components/jobs/AddJobModal"
import { Spinner } from "@/components/ui/spinner"
import type { Job, Building, Crew } from "@/types"
import { type DateRange } from "react-day-picker"

export default function JobManagement() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [buildings, setBuildings] = useState<Building[]>([])
    const [crews, setCrews] = useState<Crew[]>([])
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    const fetchData = useCallback(async () => {
        try {
            const [jobsRes, buildingsRes, crewsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/jobs`),
                fetch(`${import.meta.env.VITE_API_URL}/buildings`),
                fetch(`${import.meta.env.VITE_API_URL}/crews`)
            ])

            // Mock jobs fallback if backend endpoint doesn't exist
            let jobsData: Job[] = [];
            if (jobsRes.ok) {
                jobsData = await jobsRes.json()
            } else {
                console.warn("Jobs endpoint not found. Using empty array.")
            }

            let buildingsData: Building[] = [];
            if (buildingsRes.ok) {
                buildingsData = await buildingsRes.json()
            }

            let crewsData: Crew[] = [];
            if (crewsRes.ok) {
                crewsData = await crewsRes.json()
            }

            setJobs(jobsData)
            setBuildings(buildingsData)
            setCrews(crewsData)
        } catch (error) {
            console.error("Failed to fetch jobs data", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase())
        
        let matchesDateRange = true
        if (dateRange?.from || dateRange?.to) {
            const jobDate = new Date(job.scheduledDate)
            jobDate.setHours(0, 0, 0, 0)
            
            if (dateRange.from) {
                const start = new Date(dateRange.from)
                start.setHours(0, 0, 0, 0)
                if (jobDate < start) matchesDateRange = false
            }
            if (dateRange.to) {
                const end = new Date(dateRange.to)
                end.setHours(23, 59, 59, 999)
                if (jobDate > end) matchesDateRange = false
            }
        }

        return matchesSearch && matchesDateRange
    })

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
                    <AddJobModal buildings={buildings} crews={crews} onSave={fetchData}>
                        <Button className="bg-[#011f5f] hover:bg-[#022a80]">
                            <Plus className="mr-2 h-4 w-4" /> Add New Job
                        </Button>
                    </AddJobModal>
                </div>
            </div>

            <JobFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />

            <JobTable
                jobs={filteredJobs}
                buildings={buildings}
                crews={crews}
                onJobUpdated={fetchData}
            />
        </div>
    )
}
