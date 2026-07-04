import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
// import { mockBuildings } from "@/data/mockData"
import type { Building } from "@/types"

interface DailyStats {
    totalRevenue: number
    totalJobs: number
    totalHours: number
}

interface DailyLogControlsProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    selectedBuilding: string
    handleBuildingChange: (buildingId: string) => void
    dailyStats: DailyStats
    buildings: Building[]
    submittedBuildingIds: Set<string>
}

export function DailyLogControls({
    date,
    setDate,
    selectedBuilding,
    handleBuildingChange,
    dailyStats,
    buildings,
    submittedBuildingIds
}: DailyLogControlsProps) {
    return (
        <Card className="border-l-4 border-l-[#011f5f] shadow-sm">
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-end md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto items-end">
                    <div className="space-y-2 w-full md:w-auto">
                        {/* <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Select Date
                        </label> */}
                        <DatePicker date={date} setDate={setDate} />
                    </div>

                    <div className="space-y-2 w-full md:w-auto">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Select Building
                        </label>
                        <Select value={selectedBuilding} onValueChange={handleBuildingChange}>
                            <SelectTrigger className="w-full md:w-[240px] bg-white">
                                <SelectValue placeholder="Choose a building..." />
                            </SelectTrigger>
                            <SelectContent>
                                {buildings.map(building => {
                                    const isSubmitted = submittedBuildingIds.has(building.id);
                                    return (
                                        <SelectItem key={building.id} value={building.id}>
                                            <div className="flex items-center justify-between w-full gap-4 min-w-[200px]">
                                                <span className="font-medium">{building.name}</span>
                                                {selectedBuilding !== building.id && (
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider",
                                                        isSubmitted
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    )}>
                                                        {isSubmitted ? "Submitted" : "Pending"}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Live Summary Stats (Only visible when building selected) */}
                {selectedBuilding && (
                    <div className="flex gap-6 py-2 px-4 bg-muted/30 rounded-lg border border-dashed md:ml-auto w-full md:w-auto mt-4 md:mt-0">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Est. Revenue</span>
                            <span className="text-xl font-bold text-green-600">SAR {dailyStats.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-px bg-border h-10"></div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Jobs</span>
                            <span className="text-xl font-bold">{dailyStats.totalJobs}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
