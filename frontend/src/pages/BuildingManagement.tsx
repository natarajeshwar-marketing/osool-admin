"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BuildingFilters } from "@/components/buildings/BuildingFilters"
import { BuildingTable } from "@/components/buildings/BuildingTable"
import { AddBuildingModal } from "@/components/buildings/AddBuildingModal"
import { Spinner } from "@/components/ui/spinner"
import type { Building } from "@/types"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types"

export default function BuildingManagement() {
    const { user } = useAuth()
    const isViewer = user?.role === UserRole.VIEWER

    const [buildings, setBuildings] = useState<Building[]>([])
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")

    const fetchData = useCallback(async () => {
        try {
            const buildingsRes = await apiClient("/buildings")
            const buildingsData = await buildingsRes.json()
            setBuildings(buildingsData)
        } catch (error) {
            console.error("Failed to fetch building data", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredBuildings = buildings.filter(building => {
        const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            building.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || building.status.toLowerCase() === statusFilter.toLowerCase()
        const matchesType = typeFilter === "all" || building.type.toLowerCase() === typeFilter.toLowerCase()

        return matchesSearch && matchesStatus && matchesType
    })

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
                    <h2 className="text-2xl font-bold tracking-tight">Building Management</h2>
                    <p className="text-muted-foreground">Manage operational buildings and their status.</p>
                </div>
                {!isViewer && (
                    <div className="flex items-center gap-4">
                        <AddBuildingModal onSave={fetchData}>
                            <Button className="bg-[#011f5f] hover:bg-[#022a80]">
                                <Plus className="mr-2 h-4 w-4" /> Add New Building
                            </Button>
                        </AddBuildingModal>
                    </div>
                )}
            </div>

            {/* <BuildingStats buildings={buildings} crews={crews} /> */}

            <BuildingFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
            />

            <BuildingTable
                buildings={filteredBuildings}
                onBuildingUpdated={fetchData}
            />
        </div>
    )
}
