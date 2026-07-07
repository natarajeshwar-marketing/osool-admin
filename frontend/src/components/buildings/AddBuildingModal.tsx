import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { Building, Car } from "@/types"

interface AddBuildingModalProps {
    children: React.ReactNode
    building?: Building
    onSave?: () => void
}

export function AddBuildingModal({ children, building, onSave }: AddBuildingModalProps) {
    const [buildingNumber, setBuildingNumber] = useState("")
    const [zone, setZone] = useState("")
    const [type, setType] = useState("")
    const [apartmentNumber, setApartmentNumber] = useState("")
    const [tenantName, setTenantName] = useState("")
    const [contactNumber, setContactNumber] = useState("")
    const [emailAddress, setEmailAddress] = useState("")
    const [hasCar, setHasCar] = useState(false)
    const [cars, setCars] = useState<Car[]>([])
    const [status, setStatus] = useState("Active")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (building && open) {
            setBuildingNumber(building.buildingNumber || "")
            setZone(building.zone || "")
            setType(building.type || "")
            setApartmentNumber(building.apartmentNumber || "")
            setTenantName(building.tenantName || "")
            setContactNumber(building.contactNumber || "")
            setEmailAddress(building.emailAddress || "")
            setHasCar(building.hasCar || false)
            setCars(building.cars?.length ? building.cars : [{ carNumber: "", modelType: "" }])
            setStatus(building.status || "Active")
        } else if (!building && open) {
            setBuildingNumber("")
            setZone("")
            setType("")
            setApartmentNumber("")
            setTenantName("")
            setContactNumber("")
            setEmailAddress("")
            setHasCar(false)
            setCars([{ carNumber: "", modelType: "" }])
            setStatus("Active")
        }
    }, [building, open])

    const handleCarChange = (index: number, field: keyof Car, value: string) => {
        const newCars = [...cars]
        newCars[index] = { ...newCars[index], [field]: value }
        setCars(newCars)
    }

    const addCar = () => {
        setCars([...cars, { carNumber: "", modelType: "" }])
    }

    const removeCar = (index: number) => {
        const newCars = cars.filter((_, i) => i !== index)
        setCars(newCars)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name: `${buildingNumber} - ${zone}`, // Generated name for the table view
            type,
            status,
            buildingNumber,
            zone,
            apartmentNumber,
            tenantName,
            contactNumber,
            emailAddress,
            hasCar,
            cars: hasCar ? cars : []
        }

        try {
            const path = building ? `/buildings/${building.id}` : '/buildings'
            const method = building ? 'PATCH' : 'POST'

            const res = await apiClient(path, {
                method,
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setOpen(false)
                toast.success(building ? "Building updated successfully" : "Building created successfully")
                if (onSave) onSave()

                if (!building) {
                    setBuildingNumber("")
                    setZone("")
                    setType("")
                    setApartmentNumber("")
                    setTenantName("")
                    setContactNumber("")
                    setEmailAddress("")
                    setHasCar(false)
                    setCars([{ carNumber: "", modelType: "" }])
                    setStatus("Active")
                }
            } else {
                toast.error("Failed to save building")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const title = building ? "Edit Building" : "Add New Building"
    const description = building ? "Update the details for this building." : "Enter the details for the new building here."

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="buildingNumber">Building Number</Label>
                            <Input
                                id="buildingNumber"
                                placeholder="e.g. B1"
                                value={buildingNumber}
                                onChange={(e) => setBuildingNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zone">Zone</Label>
                            <Input
                                id="zone"
                                placeholder="e.g. North Zone"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Apartment Type</Label>
                            <Select onValueChange={setType} value={type} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2 BHK">2 BHK</SelectItem>
                                    <SelectItem value="3 BHK">3 BHK</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="apartmentNumber">Apartment Number</Label>
                            <Input
                                id="apartmentNumber"
                                placeholder="e.g. 101"
                                value={apartmentNumber}
                                onChange={(e) => setApartmentNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tenantName">Tenant Name</Label>
                        <Input
                            id="tenantName"
                            placeholder="Full Name"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input
                                id="contactNumber"
                                placeholder="Phone Number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="emailAddress">Email Address</Label>
                            <Input
                                id="emailAddress"
                                type="email"
                                placeholder="Email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-y mt-2">
                        <Label htmlFor="hasCar" className="text-base font-medium">Tenant has car(s)?</Label>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="hasCar">{hasCar ? "Yes" : "No"}</Label>
                            <Switch
                                id="hasCar"
                                checked={hasCar}
                                onCheckedChange={setHasCar}
                            />
                        </div>
                    </div>

                    {hasCar && (
                        <div className="space-y-4">
                            {cars.map((car, index) => (
                                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end bg-muted/30 p-3 rounded-md border">
                                    <div className="grid gap-2">
                                        <Label>Car Number</Label>
                                        <Input
                                            placeholder="Plate number"
                                            value={car.carNumber}
                                            onChange={(e) => handleCarChange(index, "carNumber", e.target.value)}
                                            required={hasCar}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Car Model Type</Label>
                                        <Select 
                                            onValueChange={(val) => handleCarChange(index, "modelType", val)} 
                                            value={car.modelType} 
                                            required={hasCar}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sedan">Sedan</SelectItem>
                                                <SelectItem value="SUV">SUV</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {cars.length > 1 && (
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeCar(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={addCar}
                                className="w-full flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add cars
                            </Button>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading} className="bg-[#011f5f] hover:bg-[#022a80] min-w-[120px]">
                            {loading ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4 text-white" />
                                    Saving...
                                </>
                            ) : (
                                building ? "Update Building" : "Save Building"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
