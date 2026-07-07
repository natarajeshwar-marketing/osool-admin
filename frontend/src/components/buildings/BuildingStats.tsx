import { StatCard } from "@/components/shared/StatCard"
import { MapPin, Percent, DollarSign } from "lucide-react"
import type { Building, Crew } from "@/types"

interface BuildingStatsProps {
    buildings: Building[]
    crews: Crew[]
}

export function BuildingStats({ buildings, crews }: BuildingStatsProps) {
    const totalUtilization = crews.length > 0
        ? Math.round((crews.reduce((acc, crew) => acc + (crew.scheduledHours || 0), 0) / (crews.length * 8)) * 100)
        : 0

    const totalRevenue = crews.length > 0
        ? crews.reduce((acc, crew) => acc + (crew.revenue || 0), 0)
        : 125000

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard
                title="Total Buildings"
                value={buildings.length.toString()}
                className=""
                icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Total Utilization"
                value={`${totalUtilization}%`}
                className=""
                icon={<Percent className="h-4 w-4 text-blue-500" />}
            />
            <StatCard
                title="Total Revenue"
                value={`SAR ${totalRevenue.toLocaleString()}`}
                className=""
                icon={<DollarSign className="h-4 w-4 text-green-500" />}
            />
        </div>
    )
}
