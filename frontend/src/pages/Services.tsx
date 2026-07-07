import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Edit2, Trash2, Settings, Wrench, Shield, Sparkles } from "lucide-react"

interface ServiceItem {
    id: string
    name: string
    category: string
    pricingType: string
    rate: number
    status: "Active" | "Inactive"
    description?: string
}

export default function Services() {
    const [services, setServices] = useState<ServiceItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchServices = async () => {
        try {
            setLoading(true)
            const response = await apiClient("/services")
            if (!response.ok) throw new Error("Failed to fetch services")
            const data = await response.json()
            setServices(data)
        } catch (error) {
            console.error("Error fetching services:", error)
            toast.error("Failed to load services from backend")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    // Dialog control states
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    
    // CRUD Target states
    const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null)
    const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null)
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [customCategoryName, setCustomCategoryName] = useState("")

    // Form inputs state
    const [formData, setFormData] = useState({
        name: "",
        category: "Maintenance",
        pricingType: "per-service",
        rate: "",
        status: "Active" as "Active" | "Inactive",
        description: ""
    })

    // Reset Form
    const resetForm = () => {
        setFormData({
            name: "",
            category: "Maintenance",
            pricingType: "per-service",
            rate: "",
            status: "Active",
            description: ""
        })
        setIsCustomCategory(false)
        setCustomCategoryName("")
        setServiceToEdit(null)
    }

    // Handlers
    const handleOpenCreate = () => {
        resetForm()
        setIsFormOpen(true)
    }

    const handleOpenEdit = (service: ServiceItem) => {
        setServiceToEdit(service)
        setFormData({
            name: service.name,
            category: service.category,
            pricingType: service.pricingType,
            rate: service.rate.toString(),
            status: service.status,
            description: service.description || ""
        })
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("Service name is required")
            return
        }

        const rateNum = parseFloat(formData.rate)
        if (isNaN(rateNum) || rateNum < 0) {
            toast.error("Please enter a valid positive rate")
            return
        }

        const categoryToSubmit = isCustomCategory 
            ? customCategoryName.trim() 
            : formData.category;

        if (isCustomCategory && !customCategoryName.trim()) {
            toast.error("Please enter a custom category name")
            return
        }

        const payload = {
            name: formData.name.trim(),
            category: categoryToSubmit,
            pricingType: formData.pricingType,
            rate: rateNum,
            status: formData.status,
            description: formData.description.trim() || undefined
        }

        try {
            if (serviceToEdit) {
                // Edit Mode
                const response = await apiClient(`/services/${serviceToEdit.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload)
                })
                if (!response.ok) throw new Error("Failed to update service")
                toast.success("Service updated successfully")
            } else {
                // Create Mode
                const response = await apiClient("/services", {
                    method: "POST",
                    body: JSON.stringify(payload)
                })
                if (!response.ok) throw new Error("Failed to create service")
                toast.success("New service added successfully")
            }
            fetchServices()
            setIsFormOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error saving service:", error)
            toast.error(serviceToEdit ? "Failed to update service" : "Failed to create service")
        }
    }

    const handleOpenDelete = (service: ServiceItem) => {
        setServiceToDelete(service)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return
        try {
            const response = await apiClient(`/services/${serviceToDelete.id}`, {
                method: "DELETE"
            })
            if (!response.ok) throw new Error("Failed to delete service")
            toast.success(`Service "${serviceToDelete.name}" deleted`)
            fetchServices()
        } catch (error) {
            console.error("Error deleting service:", error)
            toast.error("Failed to delete service")
        } finally {
            setIsDeleteDialogOpen(false)
            setServiceToDelete(null)
        }
    }

    // Filtered list (retained naming for simplicity)
    const filteredServices = services

    // Dynamic categories computation
    const allCategories = Array.from(
        new Set(["Maintenance", "Cleaning", "Pest Control", ...services.map(s => s.category)])
    )

    // Compute stats
    const totalServices = services.length
    const activeServices = services.filter(s => s.status === "Active").length
    const avgPrice = services.length > 0
        ? Math.round(services.reduce((acc, s) => acc + s.rate, 0) / services.length)
        : 0
    const inactiveServices = totalServices - activeServices

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Spinner className="h-8 w-8 text-[#011f5f]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#011f5f]">Service Registry</h2>
                    <p className="text-muted-foreground">Manage core services, pricing catalog, and operational rates.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={handleOpenCreate} className="bg-[#011f5f] hover:bg-[#022a80] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add New Service
                    </Button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Services</CardTitle>
                        <Settings className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalServices}</div>
                        <p className="text-xs text-muted-foreground">Configured in system catalog</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
                        <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeServices}</div>
                        <p className="text-xs text-muted-foreground">Available for scheduling</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Rate</CardTitle>
                        <Sparkles className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgPrice} SAR</div>
                        <p className="text-xs text-muted-foreground">Across all service types</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Services</CardTitle>
                        <Wrench className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{inactiveServices}</div>
                        <p className="text-xs text-muted-foreground">Temporarily suspended</p>
                    </CardContent>
                </Card>
            </div>


            {/* Services Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Pricing Model</TableHead>
                            <TableHead>Rate (SAR)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No services found matching the criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredServices.map((service) => (
                                <TableRow key={service.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{service.name}</div>
                                        {service.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[400px]">
                                                {service.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs font-normal px-2.5 py-0.5">
                                            {service.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize text-sm text-gray-600">
                                        {service.pricingType.replace("-", " ")}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900">
                                        {service.rate.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">SAR</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`h-2 w-2 rounded-full ${
                                                service.status === "Active" ? "bg-green-500" : "bg-red-400"
                                            }`} />
                                            <span className={`text-xs font-medium ${
                                                service.status === "Active" ? "text-green-700" : "text-red-600"
                                            }`}>
                                                {service.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(service)}
                                                className="hover:bg-blue-50 hover:text-blue-600 h-8 w-8 rounded-full"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDelete(service)}
                                                className="hover:bg-red-50 hover:text-red-500 h-8 w-8 rounded-full"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Service Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-[#011f5f]">
                            {serviceToEdit ? "Edit Service Properties" : "Register New Service"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure pricing catalog details and rate cards. Click save when complete.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs font-semibold">Service Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. AC Duct Cleaning"
                                className="h-10 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category" className="text-xs font-semibold">Category</Label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomCategory(!isCustomCategory)}
                                        className="text-[10px] font-semibold text-blue-600 hover:text-[#022a80] transition-colors"
                                    >
                                        {isCustomCategory ? "Select Existing" : "+ Add Custom"}
                                    </button>
                                </div>
                                {isCustomCategory ? (
                                    <Input
                                        id="customCategory"
                                        value={customCategoryName}
                                        onChange={(e) => setCustomCategoryName(e.target.value)}
                                        placeholder="e.g. Electrical"
                                        className="h-10 text-sm focus-visible:ring-[#011f5f]"
                                    />
                                ) : (
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allCategories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="pricingType" className="text-xs font-semibold">Pricing Model</Label>
                                <Select 
                                    value={formData.pricingType} 
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, pricingType: val }))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per-service">Per Service</SelectItem>
                                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                                        <SelectItem value="contract-based">Contract Based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="rate" className="text-xs font-semibold">Rate (SAR)</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.rate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                                    placeholder="e.g. 250"
                                    className="h-10 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status" className="text-xs font-semibold">Status</Label>
                                <Select 
                                    value={formData.status} 
                                    onValueChange={(val: "Active" | "Inactive") => setFormData(prev => ({ ...prev, status: val }))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the scope of work or standard operational guidelines..."
                                className="min-h-[80px] text-sm resize-none"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="h-10">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-[#011f5f] hover:bg-[#022a80] text-white h-10">
                                {serviceToEdit ? "Save Changes" : "Create Service"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 font-bold">Remove Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{serviceToDelete?.name}"</span>?
                            This action will remove the service from the registry. Active schedules utilizing this service will not be modified automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
