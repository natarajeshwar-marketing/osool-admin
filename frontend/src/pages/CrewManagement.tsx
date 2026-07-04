"use client"

import { useState, useEffect, useCallback } from "react"
import { CrewHeader } from "@/components/crews/CrewHeader"
import { CrewStats } from "@/components/crews/CrewStats"
import { CrewFilters } from "@/components/crews/CrewFilters"
import { CrewTable } from "@/components/crews/CrewTable"
import { Spinner } from "@/components/ui/spinner"
import type { Crew, Building } from "@/types"

export default function CrewManagement() {
    const [crews, setCrews] = useState<Crew[]>([])
    const [buildings, setBuildings] = useState<Building[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [roleFilter, setRoleFilter] = useState("all")
    const [buildingFilter, setBuildingFilter] = useState("all")
    const [timeRange, setTimeRange] = useState("today")
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const [crewsRes, buildingsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/crews`),
                fetch(`${import.meta.env.VITE_API_URL}/buildings`)
            ])

            const crewsData = await crewsRes.json()
            const buildingsData = await buildingsRes.json()

            setCrews(crewsData)
            setBuildings(buildingsData)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredCrews = crews.filter(crew => {
        const fullName = `${crew.firstName} ${crew.lastName}`.toLowerCase()
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            crew.id.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || crew.status.toLowerCase() === statusFilter.toLowerCase()
        const matchesRole = roleFilter === "all" || crew.role.toLowerCase() === roleFilter.toLowerCase()
        const matchesBuilding = buildingFilter === "all" || (crew.building?.name === buildingFilter)

        return matchesSearch && matchesStatus && matchesRole && matchesBuilding
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
            <CrewHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onCrewAdded={fetchData}
            />

            <CrewStats crews={crews} />

            <CrewFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                roleFilter={roleFilter}
                onRoleChange={setRoleFilter}
                buildingFilter={buildingFilter}
                onBuildingChange={setBuildingFilter}
                buildings={buildings}
            />

            <CrewTable crews={filteredCrews} onDataChange={fetchData} />
        </div>
    )
}
