interface MetricCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  growth?: number
  loading?: boolean
  color?: 'purple' | 'green' | 'blue' | 'orange' | 'pink'
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  growth, 
  loading = false,
  color = 'purple' 
}: MetricCardProps) {
  const colorClasses = {
    purple: 'from-purple-600 via-violet-600 to-indigo-600 border-purple-400/50 ring-purple-500/20',
    green: 'from-emerald-600 via-green-600 to-teal-600 border-emerald-400/50 ring-emerald-500/20',
    blue: 'from-blue-600 via-cyan-600 to-sky-600 border-blue-400/50 ring-blue-500/20',
    orange: 'from-orange-600 via-amber-600 to-yellow-600 border-orange-400/50 ring-orange-500/20',
    pink: 'from-pink-600 via-rose-600 to-red-600 border-pink-400/50 ring-pink-500/20',
  }

  const growthColor = growth && growth > 0 ? 'text-emerald-400' : growth && growth < 0 ? 'text-red-400' : 'text-gray-400'

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} border shadow-lg ring-2 backdrop-blur-sm`}>
          {icon}
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${growthColor}`}>
            {growth > 0 ? '↑' : growth < 0 ? '↓' : '→'}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-textTertiary font-medium">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
