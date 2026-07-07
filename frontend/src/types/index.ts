
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
    revenue: number;
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

export interface Schedule {
    id: string;
    buildingNumber?: string;
    zone?: string;
    apartmentNumber?: string;
    tenantName?: string;
    apartmentType?: string;
    phoneNumber?: string;
    emailAddress?: string;
    date: number;
    month: number;
    year: number;
    frequency: string;
    repeatDays?: string[];
    startTime: string;
    endTime: string;
    serviceName: string;
    buildingId?: string | null;
    building?: Building | null;
    crews?: Crew[];
    notes?: string;
    discount?: number;
    baseCost?: number;
    vat?: number;
    totalCost?: number;
    confirmedBooking?: boolean;
    paymentMethod?: string;
}

export interface Enquiry {
    id: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    serviceName: string;
    message: string;
    buildingNumber?: string;
    apartmentNumber?: string;
    apartmentType?: string;
    status: 'Pending' | 'Converted';
    source: 'Website' | 'Phone' | 'Email' | 'Walk-in';
    createdAt: string;
    updatedAt: string;
}


