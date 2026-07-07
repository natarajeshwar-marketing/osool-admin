// Force TS Server refresh
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Schedule } from "@/types"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

interface JobTableProps {
    schedules: Schedule[]
    onJobUpdated?: () => void
}

export function JobTable({ schedules, onJobUpdated }: JobTableProps) {
    const navigate = useNavigate()

    const handleDelete = async (id: string) => {
        try {
            const res = await apiClient(`/schedules/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success("Schedule deleted successfully")
                if (onJobUpdated) onJobUpdated()
            } else {
                toast.error("Failed to delete schedule")
            }
        } catch (error) {
            toast.error("Failed to delete schedule")
            console.error("Failed to delete schedule", error)
        }
    }

    return (
        <Card>
            <CardContent className="p-0 max-h-[600px] overflow-auto relative">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            <TableHead className="py-4 px-4 bg-muted/50">Customer</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">Job Date</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">Service</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">Status</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">Amount</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">Assigned Crew</TableHead>
                            <TableHead className="w-[50px] py-4 px-4 bg-muted/50">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id} className="hover:bg-muted/5">
                                <TableCell className="font-semibold py-4 px-4">
                                    <div className="flex flex-col">
                                        <span>{schedule.tenantName || "N/A"}</span>
                                        <span className="text-xs text-muted-foreground font-normal mt-0.5">
                                            {schedule.buildingNumber && `Bldg: ${schedule.buildingNumber}`}
                                            {schedule.apartmentNumber && ` - Apt: ${schedule.apartmentNumber}`}
                                            {schedule.zone && ` (${schedule.zone})`}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                    <div className="flex flex-col text-sm">
                                        <div className="flex items-center">
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                            {format(new Date(schedule.year, schedule.month - 1, schedule.date), "MMM d, yyyy")}
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-5 mt-0.5">
                                            {schedule.startTime} - {schedule.endTime}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-4 font-medium text-muted-foreground">
                                    {schedule.serviceName}
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                    <Badge
                                        variant="secondary"
                                        className={`font-normal ${
                                            schedule.confirmedBooking
                                                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        }`}
                                    >
                                        {schedule.confirmedBooking ? "Confirmed" : "Pending"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-4 font-semibold text-sm">
                                    SAR {Number(schedule.totalCost || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="py-4 px-4 text-sm">
                                    {schedule.crews && schedule.crews.length > 0 ? (
                                        <div className="flex flex-col gap-0.5">
                                            {schedule.crews.map((c) => (
                                                <span key={c.id}>{c.firstName} {c.lastName}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground italic">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => navigate('/schedules/edit', { state: { editEvent: { id: schedule.id } } })}>
                                                Edit
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the scheduled job.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(schedule.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {schedules.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No scheduled jobs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
