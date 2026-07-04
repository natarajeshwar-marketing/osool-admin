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
import type { Job, Building, Crew } from "@/types"
import { toast } from "sonner"
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
import { AddJobModal } from "@/components/jobs/AddJobModal"
import { format } from "date-fns"

interface JobTableProps {
    jobs: Job[]
    buildings: Building[]
    crews: Crew[]
    onJobUpdated?: () => void
}

export function JobTable({ jobs, buildings, crews, onJobUpdated }: JobTableProps) {
    const handleDelete = async (id: string) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/jobs/${id}`, {
                method: 'DELETE'
            })
            toast.success("Job deleted successfully")
            if (onJobUpdated) onJobUpdated()
        } catch (error) {
            toast.error("Failed to delete job")
            console.error("Failed to delete job", error)
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            case "In Progress":
                return "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
            case "Pending":
                return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
            case "Cancelled":
                return "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            default:
                return "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
        }
    }

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case "Critical":
                return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900"
            case "High":
                return "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900"
            case "Medium":
                return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900"
            case "Low":
                return "bg-neutral-500/10 text-neutral-600 border-neutral-200 dark:border-neutral-800"
            default:
                return "bg-neutral-100 text-neutral-700"
        }
    }

    const getBuildingName = (buildingId: string) => {
        return buildings.find(b => b.id === buildingId)?.name || buildingId
    }

    const getCrewName = (crewId?: string) => {
        if (!crewId) return "Unassigned"
        const crew = crews.find(c => c.id === crewId)
        return crew ? `${crew.firstName} ${crew.lastName}` : crewId
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
                            <TableHead className="py-4 px-4 bg-muted/50">Added By</TableHead>
                            <TableHead className="w-[50px] py-4 px-4 bg-muted/50">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job.id} className="hover:bg-muted/5">
                                <TableCell className="font-semibold py-4 px-4">
                                    <div className="flex flex-col">
                                        <span>{job.title}</span>
                                        {job.description && (
                                            <span className="text-xs text-muted-foreground font-normal mt-0.5 line-clamp-1">
                                                {job.description}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-4">{getBuildingName(job.buildingId)}</TableCell>
                                <TableCell className="py-4 px-4">{getCrewName(job.crewId)}</TableCell>
                                <TableCell className="py-4 px-4">
                                    <div className="flex items-center text-sm">
                                        <CalendarIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                                        {format(new Date(job.scheduledDate), "MMM d, yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                    <Badge variant="outline" className={getPriorityBadgeClass(job.priority)}>
                                        {job.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                    <Badge
                                        variant="secondary"
                                        className={`font-normal ${getStatusBadgeClass(job.status)}`}
                                    >
                                        {job.status}
                                    </Badge>
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
                                            <AddJobModal 
                                                job={job} 
                                                buildings={buildings} 
                                                crews={crews} 
                                                onSave={onJobUpdated}
                                            >
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    Edit
                                                </DropdownMenuItem>
                                            </AddJobModal>
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
                                                            This action cannot be undone. This will permanently delete the job
                                                            and remove its data from the servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(job.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {jobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No jobs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
