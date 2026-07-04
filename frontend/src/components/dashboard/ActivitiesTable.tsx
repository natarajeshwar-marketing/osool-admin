import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Home, HardHat, RefreshCcw, ArrowUpRight } from "lucide-react" // Using generic icons as placeholders for specific activity icons

const activities = [
    {
        id: 1,
        activity: "Site A - Foundation Pouring",
        lead: "Mike Ross",
        building: "#ZN-4591",
        date: "Sep 19, 2024",
        status: "Completed",
        icon: Home // Placeholder
    },
    {
        id: 2,
        activity: "Building B - Wiring Setup",
        lead: "Rachel Zane",
        building: "#ZN-4592",
        date: "Sep 19, 2024",
        status: "In Progress",
        icon: RefreshCcw // Placeholder
    },
    {
        id: 3,
        activity: "Building C - Pipe Inspection",
        lead: "Harvey Specter",
        building: "#ZN-4593",
        date: "Sep 18, 2024",
        status: "Scheduled",
        icon: HardHat // Placeholder
    },
]

export function ActivitiesTable() {
    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                        <RefreshCcw className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                        <ArrowUpRight className="h-4 w-4 text-neutral-500" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">ACTIVITY</TableHead>
                            <TableHead>CREW LEAD</TableHead>
                            <TableHead>BUILDING ID</TableHead>
                            <TableHead>DATE</TableHead>
                            <TableHead className="text-right">STATUS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${item.id === 1 ? 'bg-blue-100 text-blue-600' :
                                            item.id === 2 ? 'bg-orange-100 text-orange-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        {item.activity}
                                    </div>
                                </TableCell>
                                <TableCell>{item.lead}</TableCell>
                                <TableCell className="text-muted-foreground">{item.building}</TableCell>
                                <TableCell className="text-muted-foreground">{item.date}</TableCell>
                                <TableCell className="text-right">
                                    <StatusBadge status={item.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
