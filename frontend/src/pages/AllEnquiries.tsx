import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Search, Plus, Trash2, Eye, Mail, Phone, Calendar, Info, MessageSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import type { Enquiry } from "@/types"
import { UserRole } from "@/types"
import { apiClient } from "@/lib/api"

export default function AllEnquiries() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const isViewer = user?.role === UserRole.VIEWER
    const [enquiries, setEnquiries] = useState<Enquiry[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [serviceFilter, setServiceFilter] = useState("all")

    // Modals
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [statusToUpdate, setStatusToUpdate] = useState<string>("")
    const [updatingStatus, setUpdatingStatus] = useState(false)

    // Delete confirmation
    const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const fetchEnquiries = useCallback(async () => {
        try {
            const response = await apiClient("/enquiries")
            if (!response.ok) {
                throw new Error("Failed to fetch enquiries")
            }
            const data = await response.json()
            setEnquiries(data)
        } catch (error) {
            console.error("Error fetching enquiries:", error)
            toast.error("Failed to load enquiries")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEnquiries()
    }, [fetchEnquiries])

    const handleOpenDetails = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry)
        setStatusToUpdate(enquiry.status)
        setIsDetailsOpen(true)
    }

    const handleUpdateStatus = async () => {
        if (!selectedEnquiry) return

        setUpdatingStatus(true)
        try {
            const response = await apiClient(`/enquiries/${selectedEnquiry.id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: statusToUpdate }),
            })

            if (!response.ok) {
                throw new Error("Failed to update status")
            }

            toast.success("Enquiry status updated successfully")
            setIsDetailsOpen(false)
            fetchEnquiries()
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Failed to update enquiry status")
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleOpenDelete = (enquiry: Enquiry, e: React.MouseEvent) => {
        e.stopPropagation()
        setEnquiryToDelete(enquiry)
        setIsDeleteOpen(true)
    }

    const handleDeleteEnquiry = async () => {
        if (!enquiryToDelete) return

        setDeleting(true)
        try {
            const response = await apiClient(`/enquiries/${enquiryToDelete.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete enquiry")
            }

            toast.success("Enquiry deleted successfully")
            setIsDeleteOpen(false)
            fetchEnquiries()
        } catch (error) {
            console.error("Error deleting enquiry:", error)
            toast.error("Failed to delete enquiry")
        } finally {
            setDeleting(false)
        }
    }

    // Filter Logic
    const filteredEnquiries = enquiries.filter(enquiry => {
        const matchesSearch =
            enquiry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enquiry.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enquiry.message.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter
        const matchesService = serviceFilter === "all" || enquiry.serviceName === serviceFilter

        return matchesSearch && matchesStatus && matchesService
    })

    // Get unique service names for filtering list
    const uniqueServices = Array.from(new Set(enquiries.map(e => e.serviceName)))

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pending</Badge>
            case "Converted":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Converted</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Enquiries</h2>
                    <p className="text-muted-foreground">Manage client enquiries and work request tickets.</p>
                </div>
                {!isViewer && (
                    <Button
                        onClick={() => navigate("/enquiries/add")}
                        className="bg-[#011f5f] hover:bg-[#022a80] text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Enquiry
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by client name, email or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Converted">Converted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-56">
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Services</SelectItem>
                            {uniqueServices.map(service => (
                                <SelectItem key={service} value={service}>
                                    {service}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Enquiries Table */}
            <div className="border rounded-md bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/75">
                        <TableRow>
                            <TableHead className="w-[200px] font-semibold text-gray-700">Client Name</TableHead>
                            <TableHead className="font-semibold text-gray-700">Contact Info</TableHead>
                            <TableHead className="font-semibold text-gray-700">Service Interest</TableHead>
                            <TableHead className="font-semibold text-gray-700">Source</TableHead>
                            <TableHead className="font-semibold text-gray-700">Date Received</TableHead>
                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEnquiries.length > 0 ? (
                            filteredEnquiries.map((enquiry) => (
                                <TableRow
                                    key={enquiry.id}
                                    className="cursor-pointer hover:bg-gray-50/50"
                                    onClick={() => handleOpenDetails(enquiry)}
                                >
                                    <TableCell className="font-medium text-gray-900">
                                        {enquiry.clientName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {enquiry.clientEmail}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {enquiry.clientPhone}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 font-medium">
                                        {enquiry.serviceName}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {enquiry.source}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(enquiry.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[#011f5f] hover:bg-[#011f5f]/10"
                                                onClick={() => handleOpenDetails(enquiry)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {!isViewer && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    onClick={(e) => handleOpenDelete(enquiry, e)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    No enquiries found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Details & Status Update Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <MessageSquare className="h-5 w-5 text-[#011f5f]" />
                            Enquiry Details
                        </DialogTitle>
                        <DialogDescription>
                            Review the request and manage client communication status.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEnquiry && (
                        <div className="space-y-6 pt-4">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm border">
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Client Name</span>
                                    <span className="font-semibold text-gray-900">{selectedEnquiry.clientName}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Service Interest</span>
                                    <span className="font-medium text-[#011f5f]">{selectedEnquiry.serviceName}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact Details</span>
                                    <span className="block text-gray-700">{selectedEnquiry.clientEmail}</span>
                                    <span className="block text-gray-700">{selectedEnquiry.clientPhone}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Source & Date</span>
                                    <span className="block text-gray-700">Source: {selectedEnquiry.source}</span>
                                    <span className="block text-gray-700">
                                        Received: {new Date(selectedEnquiry.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                {(selectedEnquiry.buildingNumber || selectedEnquiry.apartmentNumber || selectedEnquiry.apartmentType) && (
                                    <div className="col-span-2 pt-2 border-t border-gray-200">
                                        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Building & Apartment Details</span>
                                        <div className="flex gap-6 text-gray-700">
                                            {selectedEnquiry.buildingNumber && (
                                                <span><strong>Building Number:</strong> {selectedEnquiry.buildingNumber}</span>
                                            )}
                                            {selectedEnquiry.apartmentNumber && (
                                                <span><strong>Apartment Number:</strong> {selectedEnquiry.apartmentNumber}</span>
                                            )}
                                            {selectedEnquiry.apartmentType && (
                                                <span><strong>Apartment Type:</strong> {selectedEnquiry.apartmentType}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message content */}
                            <div className="space-y-1.5 border-t pt-4">
                                <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Enquiry Message
                                </Label>
                                <div className="bg-gray-50/50 border rounded-lg p-4 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                    {selectedEnquiry.message}
                                </div>
                            </div>

                             {/* Status controls */}
                            {!isViewer && (
                                <div className="flex items-center justify-between border-t pt-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Update Status</Label>
                                        <div className="w-48 pt-1">
                                            <Select value={statusToUpdate} onValueChange={setStatusToUpdate}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Converted">Converted</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUpdateStatus}
                                        className="bg-[#011f5f] hover:bg-[#022a80] text-white self-end"
                                        disabled={updatingStatus}
                                    >
                                        {updatingStatus ? "Saving..." : "Save Status"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the enquiry ticket for <strong>{enquiryToDelete?.clientName}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDeleteEnquiry()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
