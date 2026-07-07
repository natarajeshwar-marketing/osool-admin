import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Building } from "@/types"
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
import { AddBuildingModal } from "@/components/buildings/AddBuildingModal"

interface BuildingTableProps {
    buildings: Building[]
    onBuildingUpdated?: () => void
}

export function BuildingTable({ buildings, onBuildingUpdated }: BuildingTableProps) {
    const handleDelete = async (id: string) => {
        try {
            await apiClient(`/buildings/${id}`, {
                method: 'DELETE'
            })
            toast.success("Building deleted successfully")
            if (onBuildingUpdated) onBuildingUpdated()
        } catch (error) {
            toast.error("Failed to delete building")
            console.error("Failed to delete building", error)
        }
    }

    return (
        <Card>
            <CardContent className="p-0 max-h-[600px] overflow-auto relative">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            <TableHead className="py-4 px-4 bg-muted/50">BUILDING NUMBER</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">ZONE</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">APARTMENT TYPE</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">APARTMENT NUMBER</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">TENANT NAME</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">CONTACT NUMBER</TableHead>
                            <TableHead className="py-4 px-4 bg-muted/50">EMAIL ADDRESS</TableHead>
                            <TableHead className="w-[50px] py-4 px-4 bg-muted/50"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {buildings.map((building) => {
                            return (
                                <TableRow key={building.id} className="hover:bg-muted/5">
                                    <TableCell className="font-semibold py-4 px-4">{building.buildingNumber || "-"}</TableCell>
                                    <TableCell className="py-4 px-4">{building.zone || "-"}</TableCell>
                                    <TableCell className="py-4 px-4">{building.type || "-"}</TableCell>
                                    <TableCell className="py-4 px-4">{building.apartmentNumber || "-"}</TableCell>
                                    <TableCell className="py-4 px-4">{building.tenantName || "-"}</TableCell>
                                    <TableCell className="py-4 px-4">{building.contactNumber || "-"}</TableCell>
                                    <TableCell className="py-4 px-4 text-neutral-600 dark:text-neutral-400">{building.emailAddress || "-"}</TableCell>
                                    <TableCell className="py-4 px-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <AddBuildingModal building={building} onSave={onBuildingUpdated}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                </AddBuildingModal>
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
                                                                This action cannot be undone. This will permanently delete the building
                                                                and remove its data from the servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(building.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
