import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, Clock, CheckCircle2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
// import type { Crew } from "@/data/mockData"
import type { Crew } from "@/types"
import type { LogEntry } from "./types"

interface DailyLogTableProps {
    activeCrews: Crew[]
    entries: Record<string, LogEntry>
    handleEntryChange: (crewId: string, field: keyof LogEntry, value: string) => void
    handleSave: () => void
    isSaving?: boolean
}

export function DailyLogTable({
    activeCrews,
    entries,
    handleEntryChange,
    handleSave,
    isSaving = false
}: DailyLogTableProps) {
    return (
        <Card className="shadow-md animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <CardHeader className="border-b bg-muted/10 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Crew Activity Log
                            <Badge variant="secondary" className="ml-2 font-normal">
                                {activeCrews.length} Crews Active
                            </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Enter hours, jobs, and total revenue below.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[250px] pl-6 py-4">Crew Name</TableHead>
                            <TableHead className="w-[150px]">Role</TableHead>
                            <TableHead className="text-center w-[150px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    Hours Worked
                                </div>
                            </TableHead>
                            <TableHead className="text-center w-[150px]">
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                                    Jobs Done
                                </div>
                            </TableHead>
                            <TableHead className="text-center w-[200px]">Total Revenue (SAR)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeCrews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No active crews found assigned to this building.
                                </TableCell>
                            </TableRow>
                        ) : (
                            activeCrews.map(crew => {
                                const savedEntry = entries[crew.id] || {}
                                const entry = {
                                    hoursWorked: savedEntry.hoursWorked || "",
                                    jobsCompleted: savedEntry.jobsCompleted || "",
                                    totalRevenue: savedEntry.totalRevenue || ""
                                }
                                const hasData = entry.hoursWorked || entry.jobsCompleted || entry.totalRevenue

                                return (
                                    <TableRow
                                        key={crew.id}
                                        className={cn(
                                            "transition-colors hover:bg-muted/5",
                                            hasData ? "bg-[#f8fbff] dark:bg-muted/10" : ""
                                        )}
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-base">{crew.firstName} {crew.lastName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{crew.role}</Badge>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="text-center h-10 border-muted-foreground/20 focus:border-[#011f5f] focus:ring-[#011f5f]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={entry.hoursWorked}
                                                onChange={(e) => handleEntryChange(crew.id, "hoursWorked", e.target.value)}
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="text-center h-10 border-muted-foreground/20 focus:border-[#011f5f] focus:ring-[#011f5f]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={entry.jobsCompleted}
                                                onChange={(e) => handleEntryChange(crew.id, "jobsCompleted", e.target.value)}
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-medium">SAR</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="pl-10 text-center h-10 border-muted-foreground/20 focus:border-[#011f5f] focus:ring-[#011f5f]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={entry.totalRevenue}
                                                    onChange={(e) => handleEntryChange(crew.id, "totalRevenue", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                <div className="p-6 bg-muted/5 border-t flex justify-end">
                    <Button
                        onClick={handleSave}
                        size="lg"
                        disabled={isSaving}
                        className="bg-[#011f5f] hover:bg-[#022a80] min-w-[180px] shadow-lg shadow-blue-900/10"
                    >
                        {isSaving ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4 text-white" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Daily Log
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
