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
import { MoreHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Crew, CrewStatus } from "@/types"
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
import { AddCrewModal } from "@/components/crews/AddCrewModal"

interface CrewTableProps {
    crews: Crew[]
    onDataChange?: () => void
}

export function CrewTable({ crews, onDataChange }: CrewTableProps) {
    const getStatusColor = (status: CrewStatus) => {
        switch (status) {
            case "Active": return "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            case "Maintenance": return "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
            case "On Leave": return "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
            case "Inactive": return "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
            default: return "bg-neutral-100 text-neutral-700"
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await apiClient(`/crews/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const { toast } = await import('sonner')
                toast.success('Crew member deleted successfully')
                onDataChange?.()
            } else {
                const { toast } = await import('sonner')
                toast.error('Failed to delete crew member')
            }
        } catch (error) {
            console.error('Error deleting crew:', error)
            const { toast } = await import('sonner')
            toast.error('Error connecting to server')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Card>
            <CardContent className="p-0 max-h-[600px] overflow-auto relative">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            <TableHead className="py-4 px-4 bg-muted/50">CREW NAME</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">JOINING DATE</TableHead>
                            <TableHead className="text-center py-4 px-4 bg-muted/50">ROLE</TableHead>
                            <TableHead className="text-center py-4 px-4 bg-muted/50">SCHEDULED HOURS</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">STATUS</TableHead>
                            <TableHead className="text-right py-4 px-4 bg-muted/50">REVENUE</TableHead>
                            <TableHead className="w-[50px] py-4 px-4 bg-muted/50"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {crews.map((crew) => (
                            <TableRow key={crew.id} className="hover:bg-muted/5">
                                <TableCell className="font-semibold py-4 px-4">{crew.firstName} {crew.lastName}</TableCell>
                                <TableCell className="py-4 px-4 text-muted-foreground">{formatDate(crew.dateOfJoining)}</TableCell>
                                <TableCell className="text-center py-4 px-4">
                                    <Badge variant="outline" className="font-normal">
                                        {crew.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center py-4 px-4 font-medium">
                                    {crew.scheduledHours || 0} hrs
                                </TableCell>
                                <TableCell className="py-4 px-4">
                                    <Badge variant="secondary" className={`font-normal ${getStatusColor(crew.status)}`}>
                                        {crew.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-4 px-4 font-semibold text-green-600">
                                    {crew.revenue > 0 ? (
                                        <span>
                                            SAR {Number(crew.revenue).toLocaleString()}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">SAR 0</span>
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
                                            <AddCrewModal crew={crew} onSave={onDataChange}>
                                                <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                                                    Edit
                                                </DropdownMenuItem>
                                            </AddCrewModal>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the crew
                                                            and remove their data from the servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(crew.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
