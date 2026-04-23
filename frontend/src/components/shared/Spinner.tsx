import { cn } from '@/lib/utils'

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
