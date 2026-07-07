"use client"

import { useState, useEffect, useCallback } from "react"
import { CrewHeader } from "@/components/crews/CrewHeader"
import { CrewStats } from "@/components/crews/CrewStats"
import { CrewFilters } from "@/components/crews/CrewFilters"
import { CrewTable } from "@/components/crews/CrewTable"
import { Spinner } from "@/components/ui/spinner"
import type { Crew } from "@/types"
import { apiClient } from "@/lib/api"

export default function CrewManagement() {
    const [crews, setCrews] = useState<Crew[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [roleFilter, setRoleFilter] = useState("all")
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const crewsRes = await apiClient("/crews")
            const crewsData = await crewsRes.json()
            setCrews(crewsData)
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

        return matchesSearch && matchesStatus && matchesRole
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
            />

            <CrewTable crews={filteredCrews} onDataChange={fetchData} />
        </div>
    )
}
