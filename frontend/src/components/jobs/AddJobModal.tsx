// Force TS Server refresh
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
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
import { Textarea } from "@/components/ui/textarea"
import type { Job, Building, Crew, JobStatus, JobPriority } from "@/types"

interface AddJobModalProps {
    children: React.ReactNode
    job?: Job
    buildings: Building[]
    crews: Crew[]
    onSave?: () => void
}

export function AddJobModal({ children, job, buildings, crews, onSave }: AddJobModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState<JobStatus>("Pending")
    const [priority, setPriority] = useState<JobPriority>("Medium")
    const [buildingId, setBuildingId] = useState("")
    const [crewId, setCrewId] = useState("unassigned")
    const [scheduledDate, setScheduledDate] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (job && open) {
            setTitle(job.title || "")
            setDescription(job.description || "")
            setStatus(job.status || "Pending")
            setPriority(job.priority || "Medium")
            setBuildingId(job.buildingId || "")
            setCrewId(job.crewId || "unassigned")
            setScheduledDate(job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : "")
        } else if (!job && open) {
            setTitle("")
            setDescription("")
            setStatus("Pending")
            setPriority("Medium")
            setBuildingId("")
            setCrewId("unassigned")
            setScheduledDate(new Date().toISOString().split('T')[0])
        }
    }, [job, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            title,
            description,
            status,
            priority,
            buildingId,
            crewId: crewId === "unassigned" ? null : crewId,
            scheduledDate: new Date(scheduledDate).toISOString()
        }

        try {
            const url = job ? `${import.meta.env.VITE_API_URL}/jobs/${job.id}` : `${import.meta.env.VITE_API_URL}/jobs`
            const method = job ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setOpen(false)
                toast.success(job ? "Job updated successfully" : "Job created successfully")
                if (onSave) onSave()
            } else {
                toast.error("Failed to save job")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const modalTitle = job ? "Edit Job" : "Add New Job"
    const modalDescription = job ? "Update the details for this scheduled job." : "Enter the details for the new job here."

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                    <DialogDescription>
                        {modalDescription}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. HVAC Maintenance"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Job details and instructions..."
                            value={description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="building">Building</Label>
                            <Select onValueChange={setBuildingId} value={buildingId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select building" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buildings.map((building) => (
                                        <SelectItem key={building.id} value={building.id}>
                                            {building.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="crew">Assigned Crew</Label>
                            <Select onValueChange={setCrewId} value={crewId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select crew (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {crews.map((crew) => (
                                        <SelectItem key={crew.id} value={crew.id}>
                                            {crew.firstName} {crew.lastName} - {crew.role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(val) => setStatus(val as JobStatus)} value={status} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select onValueChange={(val) => setPriority(val as JobPriority)} value={priority} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input
                            id="scheduledDate"
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading} className="bg-[#011f5f] hover:bg-[#022a80] min-w-[120px]">
                            {loading ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4 text-white" />
                                    Saving...
                                </>
                            ) : (
                                job ? "Update Job" : "Save Job"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
