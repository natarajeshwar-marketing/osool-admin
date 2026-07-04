import { CheckCircle2 } from "lucide-react"

export function DailyLogEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/5 text-center animate-in fade-in-50 duration-500">
            <div className="bg-muted/20 p-4 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Ready to Log</h3>
            <p className="text-muted-foreground max-w-sm mt-1">
                Please select a <span className="font-medium text-foreground">Building</span> from the controls above to view assigned active crews and begin entering data.
            </p>
        </div>
    )
}
