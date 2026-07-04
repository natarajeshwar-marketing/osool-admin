import { cn } from '@/lib/utils';

export interface ProgressSegment {
  id: string;
  label: string;
  color: string;
  percentage: number;
}

interface MultiProgressBarProps {
  segments: ProgressSegment[];
  className?: string;
}

export function MultiProgressBar({ segments, className }: MultiProgressBarProps) {
  return (
    <div className={cn("flex-1 h-full bg-slate-100 rounded-[10px] overflow-hidden flex shadow-inner relative group", className)}>
      {segments.map((stat) => (
        <div
          key={stat.id}
          className={cn("h-full transition-all duration-500 flex items-center justify-center overflow-hidden", stat.color)}
          style={{ width: `${stat.percentage}%` }}
          title={`${stat.label}: ${stat.percentage}%`}
        >
          {stat.percentage > 0 && (
            <span className="text-white text-md font-medium whitespace-nowrap px-2 truncate drop-shadow-sm">
              {stat.label} {stat.percentage}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
