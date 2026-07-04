import { useState, useMemo, useEffect } from "react"
// import { mockBuildings, mockCrews } from "@/data/mockData"
import { DailyLogControls } from "@/components/daily-log/DailyLogControls"
import { DailyLogTable } from "@/components/daily-log/DailyLogTable"
import { DailyLogEmptyState } from "@/components/daily-log/DailyLogEmptyState"
import type { LogEntry } from "@/components/daily-log/types"
import type { Crew, Building } from "@/types"
import { toast } from "sonner"
import { format } from "date-fns"

export default function DailyLogEntry() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedBuilding, setSelectedBuilding] = useState<string>("")
    const [entries, setEntries] = useState<Record<string, LogEntry>>({})

    // Data states
    const [crews, setCrews] = useState<Crew[]>([])
    const [buildings, setBuildings] = useState<Building[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [submittedBuildingIds, setSubmittedBuildingIds] = useState<Set<string>>(new Set())
    const [allLogsForDate, setAllLogsForDate] = useState<any[]>([])

    // Fetch initial data (Crews & Buildings)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true)
            try {
                const [crewsRes, buildingsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/crews`),
                    fetch(`${import.meta.env.VITE_API_URL}/buildings`)
                ])
                setBuildings(await buildingsRes.json())
                setCrews(await crewsRes.json())
            } catch (err) {
                console.error("Failed to fetch initial data", err)
                toast.error("Failed to load crews and buildings")
            } finally {
                setLoading(false)
            }
        }
        fetchInitialData()
    }, [])

    // Fetch logs when date changes
    useEffect(() => {
        const fetchLogs = async () => {
            if (!date) return
            try {
                const dateStr = format(date, 'yyyy-MM-dd')
                // Using a large limit to get all logs for the daily entry view
                const res = await fetch(`${import.meta.env.VITE_API_URL}/daily-logs?date=${dateStr}&limit=1000`)
                const { data } = await res.json()
                setAllLogsForDate(data || [])

                // Identify submitted buildings
                // Identify submitted buildings
                const submitted = new Set<string>()
                if (data) {
                    data.forEach((log: any) => {
                        // Priority: use snapshotBuildingId (historical truth) -> then crew.building.id (fallback/current)
                        const buildingId = log.snapshotBuildingId || (log.crew && log.crew.building ? log.crew.building.id : null)
                        if (buildingId) {
                            submitted.add(buildingId)
                        }
                    })
                }
                setSubmittedBuildingIds(submitted)
            } catch (err) {
                console.error("Failed to fetch logs", err)
            }
        }
        fetchLogs()
    }, [date])

    // Populate entries when building or allLogs changes
    useEffect(() => {
        if (!selectedBuilding || selectedBuilding === "") {
            setEntries({})
            return
        };

        const buildingLogs = allLogsForDate.filter((log: any) => {
            const logBuildingId = log.snapshotBuildingId || (log.crew && log.crew.building ? log.crew.building.id : null)
            return selectedBuilding === "all" || logBuildingId === selectedBuilding
        })

        if (buildingLogs.length > 0) {
            const newEntries: Record<string, LogEntry> = {}
            buildingLogs.forEach((log: any) => {
                newEntries[log.crewId] = {
                    hoursWorked: String(log.hoursWorked),
                    jobsCompleted: String(log.jobsCompleted),
                    revenuePerJob: String(log.revenuePerJob),
                    totalRevenue: String(log.totalRevenue || 0)
                }
            })
            setEntries(newEntries)
        } else {
            setEntries({})
        }

    }, [selectedBuilding, allLogsForDate])

    // Filter crews based on selected building
    const activeCrews = useMemo(() => {
        if (!selectedBuilding) return []
        return crews.filter(crew =>
            crew.status === "Active" &&
            (selectedBuilding === "all" || crew.building?.id === selectedBuilding)
        )
    }, [selectedBuilding, crews])

    const handleBuildingChange = (buildingId: string) => {
        setSelectedBuilding(buildingId)
    }

    const handleEntryChange = (crewId: string, field: keyof LogEntry, value: string) => {
        setEntries(prev => ({
            ...prev,
            [crewId]: {
                ...prev[crewId],
                [field]: value
            }
        }))
    }

    const dailyStats = useMemo(() => {
        let totalRevenue = 0
        let totalJobs = 0
        let totalHours = 0

        activeCrews.forEach(crew => {
            const entry = entries[crew.id]
            if (entry) {
                totalRevenue += parseFloat(entry.totalRevenue) || 0
                totalJobs += parseFloat(entry.jobsCompleted) || 0
                totalHours += parseFloat(entry.hoursWorked) || 0
            }
        })

        return { totalRevenue, totalJobs, totalHours }
    }, [activeCrews, entries])

    const handleSave = async () => {
        if (!date) {
            toast.error("Please select a date")
            return
        }

        const logsToSave = activeCrews.map(crew => {
            const entry = entries[crew.id]
            // Skip empty entries if you prefer, or save 0s
            // For now, we save everything for active crews in this building
            const totalRev = parseFloat(entry?.totalRevenue || '0')
            const jobs = parseInt(entry?.jobsCompleted || '0', 10)

            // Calculate avg rev per job for backend consistency, or 0
            const revPerJob = jobs > 0 ? totalRev / jobs : 0

            return {
                date: format(date, 'yyyy-MM-dd'),
                crewId: crew.id,
                hoursWorked: parseFloat(entry?.hoursWorked || '0'),
                jobsCompleted: jobs,
                revenuePerJob: revPerJob,
                totalRevenue: totalRev
            }
        })

        if (logsToSave.length === 0) {
            toast.warning("No crews to save logs for")
            return
        }

        setSaving(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/daily-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logsToSave)
            })

            if (res.ok) {
                toast.success(`Successfully saved ${logsToSave.length} log entries!`)
                // Optionally clear entries or keep them visible
            } else {
                toast.error("Failed to save daily logs")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error connecting to server")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-[#011f5f]">Daily Log Entry</h2>
                <p className="text-muted-foreground">Record daily activities, hours, and revenue for your crews.</p>
            </div>

            <DailyLogControls
                date={date}
                setDate={setDate}
                selectedBuilding={selectedBuilding}
                handleBuildingChange={handleBuildingChange}
                dailyStats={dailyStats}
                buildings={buildings}
                submittedBuildingIds={submittedBuildingIds}
            />

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : selectedBuilding ? (
                <DailyLogTable
                    activeCrews={activeCrews}
                    entries={entries}
                    handleEntryChange={handleEntryChange}
                    handleSave={handleSave}
                    isSaving={saving}
                />
            ) : (
                <DailyLogEmptyState />
            )}
        </div>
    )
}
