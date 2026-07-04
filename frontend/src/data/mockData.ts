export interface Building {
    id: string
    name: string
    type: "Residential" | "Commercial" | "Industrial"
    status: "Active" | "Inactive"
}

export const mockBuildings: Building[] = [
    { id: "ZN-001", name: "Riyadh", type: "Commercial", status: "Active" },
    { id: "ZN-002", name: "Dammam", type: "Residential", status: "Active" },
    { id: "ZN-003", name: "Jeddah", type: "Industrial", status: "Active" },
    { id: "ZN-004", name: "Al Ula", type: "Industrial", status: "Active" },
    { id: "ZN-005", name: "KAEC", type: "Residential", status: "Inactive" },
]

export type CrewStatus = "Active" | "Inactive" | "On Leave" | "Maintenance"
export type CrewRole = "Technician" | "Cleaner"

export interface Crew {
    id: string
    name: string
    joiningDate: string
    building: string
    role: CrewRole
    status: CrewStatus
    efficiency: number
}

export const mockCrews: Crew[] = [
    {
        id: "CR-001",
        name: "Alpha Squad",
        joiningDate: "Jan 15, 2024",
        building: "Riyadh",
        role: "Technician",
        status: "Active",
        efficiency: 92
    },
    {
        id: "CR-002",
        name: "Beta Team",
        joiningDate: "Feb 01, 2024",
        building: "Dammam",
        role: "Cleaner",
        status: "Active",
        efficiency: 88
    },
    {
        id: "CR-003",
        name: "Gamma Force",
        joiningDate: "Mar 10, 2024",
        building: "Al Ula",
        role: "Technician",
        status: "Maintenance",
        efficiency: 20
    },
    {
        id: "CR-004",
        name: "Delta Unit",
        joiningDate: "Apr 05, 2024",
        building: "Riyadh", // Changed to match a mock building for testing
        role: "Cleaner",
        status: "On Leave",
        efficiency: 10
    },
    {
        id: "CR-005",
        name: "Epsilon Crew",
        joiningDate: "May 20, 2024",
        building: "Dammam",
        role: "Technician",
        status: "Active",
        efficiency: 76
    },
    {
        id: "CR-006",
        name: "Zeta Group",
        joiningDate: "Jun 12, 2024",
        building: "Jeddah",
        role: "Cleaner",
        status: "Inactive",
        efficiency: 50
    },
]
