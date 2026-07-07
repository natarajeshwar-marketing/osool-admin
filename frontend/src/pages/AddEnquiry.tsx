import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

const SERVICES = [
    "HVAC Service",
    "Deep Cleaning Service",
    "Pest Control Service",
    "Plumbing Repair",
    "Electrical Checkup",
    "Window Washing",
    "General Enquiry"
]

const SOURCES = [
    "Website",
    "Phone",
    "Email",
    "Walk-in"
]

const STATUSES = [
    "Pending",
    "Converted"
]

export default function AddEnquiry() {
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        serviceName: "General Enquiry",
        buildingNumber: "",
        apartmentNumber: "",
        apartmentType: "",
        message: "",
        source: "Website",
        status: "Pending"
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.clientName.trim()) {
            toast.error("Client Name is required")
            return
        }
        if (!formData.clientEmail.trim()) {
            toast.error("Client Email is required")
            return
        }
        if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
            toast.error("Please enter a valid email address")
            return
        }
        if (!formData.clientPhone.trim()) {
            toast.error("Client Phone is required")
            return
        }
        if (!formData.message.trim()) {
            toast.error("Message is required")
            return
        }

        setSubmitting(true)
        try {
            const response = await apiClient("/enquiries", {
                method: "POST",
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error("Failed to add enquiry")
            }

            toast.success("Enquiry added successfully")
            navigate("/enquiries/all")
        } catch (error) {
            console.error("Error creating enquiry:", error)
            toast.error("Failed to add enquiry. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="h-9 w-9 border-gray-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Add Enquiry</h2>
                    <p className="text-muted-foreground text-sm">Create a new client enquiry ticket.</p>
                </div>
            </div>

            <Card className="border border-gray-150 shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#011f5f]" />
                        <div>
                            <CardTitle className="text-lg">Enquiry Details</CardTitle>
                            <CardDescription>Enter the enquiry description and client info below.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="clientName" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Client Name *
                                </Label>
                                <Input
                                    id="clientName"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleInputChange}
                                    placeholder="Enter client's full name"
                                    required
                                />
                            </div>

                            {/* Client Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="clientEmail" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Client Email *
                                </Label>
                                <Input
                                    id="clientEmail"
                                    name="clientEmail"
                                    type="email"
                                    value={formData.clientEmail}
                                    onChange={handleInputChange}
                                    placeholder="Enter client's email address"
                                    required
                                />
                            </div>

                            {/* Client Phone */}
                            <div className="space-y-1.5">
                                <Label htmlFor="clientPhone" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Client Phone *
                                </Label>
                                <Input
                                    id="clientPhone"
                                    name="clientPhone"
                                    value={formData.clientPhone}
                                    onChange={handleInputChange}
                                    placeholder="Enter client's contact number"
                                    required
                                />
                            </div>

                            {/* Building Number */}
                            <div className="space-y-1.5">
                                <Label htmlFor="buildingNumber" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Building Number
                                </Label>
                                <Input
                                    id="buildingNumber"
                                    name="buildingNumber"
                                    value={formData.buildingNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter building number (e.g. B1)"
                                />
                            </div>

                            {/* Apartment Number */}
                            <div className="space-y-1.5">
                                <Label htmlFor="apartmentNumber" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Apartment Number
                                </Label>
                                <Input
                                    id="apartmentNumber"
                                    name="apartmentNumber"
                                    value={formData.apartmentNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter apartment number (e.g. 101)"
                                />
                            </div>

                            {/* Apartment Type */}
                            <div className="space-y-1.5">
                                <Label htmlFor="apartmentType" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Apartment Type
                                </Label>
                                <Input
                                    id="apartmentType"
                                    name="apartmentType"
                                    value={formData.apartmentType}
                                    onChange={handleInputChange}
                                    placeholder="Enter apartment type (e.g. 2 BHK)"
                                />
                            </div>

                            {/* Service of Interest */}
                            <div className="space-y-1.5">
                                <Label htmlFor="serviceName" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Service of Interest
                                </Label>
                                <Select
                                    value={formData.serviceName}
                                    onValueChange={(val) => handleSelectChange("serviceName", val)}
                                >
                                    <SelectTrigger id="serviceName">
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICES.map(service => (
                                            <SelectItem key={service} value={service}>
                                                {service}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Source */}
                            <div className="space-y-1.5">
                                <Label htmlFor="source" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Source
                                </Label>
                                <Select
                                    value={formData.source}
                                    onValueChange={(val) => handleSelectChange("source", val)}
                                >
                                    <SelectTrigger id="source">
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOURCES.map(source => (
                                            <SelectItem key={source} value={source}>
                                                {source}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => handleSelectChange("status", val)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-1.5">
                            <Label htmlFor="message" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Message / Details *
                            </Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Enter enquiry details or requirements..."
                                rows={5}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/enquiries/all")}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#011f5f] hover:bg-[#022a80] text-white px-6"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Enquiry"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
