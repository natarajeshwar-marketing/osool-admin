import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// We need a slightly different type for the history view as it includes the Crew and Zone objects populated
interface HistoryLogEntry {
    id: number
    date: string
    hoursWorked: number
    jobsCompleted: number
    revenuePerJob: number
    totalRevenue: number
    snapshotRole?: string
    snapshotZone?: {
        name: string
    }
    crew: {
        firstName: string
        lastName: string
        role: string
        zone?: {
            name: string
        }
    }
}

interface LogsHistoryTableProps {
    logs: HistoryLogEntry[]
    loading: boolean
}

export function LogsHistoryTable({ logs, loading }: LogsHistoryTableProps) {
    if (loading) {
        return (
            <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/10 pb-4">
                    <CardTitle>History Log</CardTitle>
                </CardHeader>
                <CardContent className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-md animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="flex items-center gap-2">
                    History Log
                    <Badge variant="secondary" className="ml-2 font-normal">
                        {logs?.length || 0} Entries
                    </Badge>
                </CardTitle>
                <CardDescription>
                    View past log entries and performance metrics.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[150px] pl-6">Date</TableHead>
                            <TableHead>Crew Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead className="text-center">Hours</TableHead>
                            <TableHead className="text-center">Jobs</TableHead>
                            <TableHead className="text-right pr-6">Total Rev</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!logs || logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    No logs found for the selected criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/5">
                                    <TableCell className="pl-6 font-medium">
                                        {format(new Date(log.date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {log.crew?.firstName} {log.crew?.lastName}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {log.snapshotRole || log.crew?.role}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">
                                            {log.snapshotZone?.name || log.crew?.zone?.name || 'Unassigned'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{Number(log.hoursWorked)}</TableCell>
                                    <TableCell className="text-center">{Number(log.jobsCompleted)}</TableCell>
                                    <TableCell className="text-right pr-6 font-mono font-medium">
                                        {Number(log.totalRevenue).toLocaleString(undefined, {
                                            style: 'currency',
                                            currency: 'SAR',
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
