import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddCrewModal } from "@/components/crews/AddCrewModal"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types"

interface CrewHeaderProps {
    onCrewAdded: () => void
}

export function CrewHeader({ onCrewAdded }: CrewHeaderProps) {
    const { user } = useAuth()
    const isViewer = user?.role === UserRole.VIEWER

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Crew Management</h2>
                <p className="text-muted-foreground">Manage ongoing crews, assignments, and status.</p>
            </div>
            {!isViewer && (
                <div className="flex items-center gap-4">
                    <AddCrewModal onSave={onCrewAdded}>
                        <Button className="bg-[#011f5f] hover:bg-[#022a80]">
                            <Plus className="mr-2 h-4 w-4" /> Add New Crew
                        </Button>
                    </AddCrewModal>
                </div>
            )}
        </div>
    )
}
