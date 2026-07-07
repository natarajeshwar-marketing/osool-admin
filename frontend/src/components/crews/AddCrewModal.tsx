"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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
import { DatePicker } from "@/components/ui/date-picker"

import type { Crew } from "@/types"

interface AddCrewModalProps {
    children: React.ReactNode
    crew?: Crew
    onSave?: () => void
}

export function AddCrewModal({ children, crew, onSave }: AddCrewModalProps) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [role, setRole] = useState("")
    const [date, setDate] = useState<Date>()
    const [status, setStatus] = useState("Active")
    const [scheduledHours, setScheduledHours] = useState("8")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Populate Form
    useEffect(() => {
        if (crew && open) {
            setFirstName(crew.firstName)
            setLastName(crew.lastName)
            setRole(crew.role)
            try {
                setDate(new Date(crew.dateOfJoining))
            } catch (e) {
                console.error("Invalid date", e)
            }
            setStatus(crew.status)
            setScheduledHours(String(crew.scheduledHours || "8"))
        } else if (!crew && open) {
            setFirstName("")
            setLastName("")
            setRole("")
            setDate(undefined)
            setStatus("Active")
            setScheduledHours("8")
        }
    }, [crew, open])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!date) return;

        setLoading(true)
        const payload = {
            firstName,
            lastName,
            role,
            dateOfJoining: format(date, 'yyyy-MM-dd'),
            status,
            scheduledHours: parseFloat(scheduledHours) || 0
        }

        try {
            const path = crew ? `/crews/${crew.id}` : '/crews'
            const method = crew ? 'PATCH' : 'POST'

            const res = await apiClient(path, {
                method,
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setOpen(false)
                if (onSave) onSave()
            } else {
                console.error("Failed to save crew")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const title = crew ? "Edit Crew" : "Add New Crew"
    const description = crew ? "Update the details for this crew member." : "Enter the details for the new crew member here."

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={setRole} value={role} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Technician">Technician</SelectItem>
                                <SelectItem value="Cleaner">Cleaner</SelectItem>
                                <SelectItem value="Car Washer">Car Washer</SelectItem>
                                <SelectItem value="Pest Control">Pest Control</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Date of Joining</Label>
                        <DatePicker date={date} setDate={setDate} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={setStatus} value={status} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="scheduledHours">Scheduled Hours (Daily)</Label>
                        <Input
                            id="scheduledHours"
                            type="number"
                            placeholder="8"
                            min="0"
                            step="0.5"
                            value={scheduledHours}
                            onChange={(e) => setScheduledHours(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-[#011f5f] hover:bg-[#022a80] min-w-[120px]">
                            {loading ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4 text-white" />
                                    Saving...
                                </>
                            ) : (
                                crew ? "Update Crew" : "Save Crew"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
