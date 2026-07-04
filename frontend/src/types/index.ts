
export interface Car {
    carNumber: string;
    modelType: string;
}

export interface Building {
    id: string;
    name: string;
    type: string;
    status: string;
    totalRevenue?: number;
    utilization?: number;
    buildingNumber?: string;
    zone?: string;
    apartmentNumber?: string;
    tenantName?: string;
    contactNumber?: string;
    emailAddress?: string;
    hasCar?: boolean;
    cars?: Car[];
}

export type CrewRole = "Technician" | "Cleaner" | "Car Washer" | "Pest Control";
export type CrewStatus = "Active" | "Inactive" | "On Leave" | "Maintenance";

export interface Crew {
    id: string;
    firstName: string;
    lastName: string;
    role: CrewRole;
    status: CrewStatus;
    dateOfJoining: string; // ISO Date string
    efficiency: number;
    scheduledHours: number;
    building: Building;
}

export interface CreateCrewDto {
    firstName: string;
    lastName: string;
    role: string;
    dateOfJoining: string;
    buildingId: string;
    status?: string;
    scheduledHours?: number;
}

export const UserRole = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    EDITOR: 'Editor',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
}

export type JobStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";
export type JobPriority = "Low" | "Medium" | "High" | "Critical";

export interface Job {
    id: string;
    title: string;
    description?: string;
    status: JobStatus;
    priority: JobPriority;
    buildingId: string;
    building?: Building;
    crewId?: string;
    crew?: Crew;
    scheduledDate: string; // ISO date string
    completedDate?: string;
}
