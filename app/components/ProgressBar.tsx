interface ProgressBarProps {
  progress: number
  colorClassName?: string
}

export default function ProgressBar({ progress, colorClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress))
  const fillColor =
    colorClassName ??
    'bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400'

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
        <span>Progress</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${fillColor} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

