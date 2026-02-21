import { useState, useMemo, useEffect } from "react"
// import { mockZones, mockCrews } from "@/data/mockData"
import { DailyLogControls } from "@/components/daily-log/DailyLogControls"
import { DailyLogTable } from "@/components/daily-log/DailyLogTable"
import { DailyLogEmptyState } from "@/components/daily-log/DailyLogEmptyState"
import type { LogEntry } from "@/components/daily-log/types"
import type { Crew, Zone } from "@/types"
import { toast } from "sonner"
import { format } from "date-fns"

export default function DailyLogEntry() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedZone, setSelectedZone] = useState<string>("")
    const [entries, setEntries] = useState<Record<string, LogEntry>>({})

    // Data states
    const [crews, setCrews] = useState<Crew[]>([])
    const [zones, setZones] = useState<Zone[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [submittedZoneIds, setSubmittedZoneIds] = useState<Set<string>>(new Set())
    const [allLogsForDate, setAllLogsForDate] = useState<any[]>([])

    // Fetch initial data (Crews & Zones)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true)
            try {
                const [crewsRes, zonesRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/crews`),
                    fetch(`${import.meta.env.VITE_API_URL}/zones`)
                ])
                setZones(await zonesRes.json())
                setCrews(await crewsRes.json())
            } catch (err) {
                console.error("Failed to fetch initial data", err)
                toast.error("Failed to load crews and zones")
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

                // Identify submitted zones
                // Identify submitted zones
                const submitted = new Set<string>()
                if (data) {
                    data.forEach((log: any) => {
                        // Priority: use snapshotZoneId (historical truth) -> then crew.zone.id (fallback/current)
                        const zoneId = log.snapshotZoneId || (log.crew && log.crew.zone ? log.crew.zone.id : null)
                        if (zoneId) {
                            submitted.add(zoneId)
                        }
                    })
                }
                setSubmittedZoneIds(submitted)
            } catch (err) {
                console.error("Failed to fetch logs", err)
            }
        }
        fetchLogs()
    }, [date])

    // Populate entries when zone or allLogs changes
    useEffect(() => {
        if (!selectedZone || selectedZone === "") {
            setEntries({})
            return
        };

        const zoneLogs = allLogsForDate.filter((log: any) => {
            const logZoneId = log.snapshotZoneId || (log.crew && log.crew.zone ? log.crew.zone.id : null)
            return selectedZone === "all" || logZoneId === selectedZone
        })

        if (zoneLogs.length > 0) {
            const newEntries: Record<string, LogEntry> = {}
            zoneLogs.forEach((log: any) => {
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

    }, [selectedZone, allLogsForDate])

    // Filter crews based on selected zone
    const activeCrews = useMemo(() => {
        if (!selectedZone) return []
        return crews.filter(crew =>
            crew.status === "Active" &&
            (selectedZone === "all" || crew.zone?.id === selectedZone)
        )
    }, [selectedZone, crews])

    const handleZoneChange = (zoneId: string) => {
        setSelectedZone(zoneId)
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
            // For now, we save everything for active crews in this zone
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
                selectedZone={selectedZone}
                handleZoneChange={handleZoneChange}
                dailyStats={dailyStats}
                zones={zones}
                submittedZoneIds={submittedZoneIds}
            />

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : selectedZone ? (
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
