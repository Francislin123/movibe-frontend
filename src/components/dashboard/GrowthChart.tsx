import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { GrowthDataResponse } from '../../types'

interface GrowthChartProps {
  data: GrowthDataResponse[]
  loading?: boolean
}

export default function GrowthChart({ data, loading = false }: GrowthChartProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg h-96">
        <div className="animate-pulse h-full flex items-center justify-center">
          <div className="text-textTertiary">Carregando gráfico...</div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg h-96">
        <div className="h-full flex items-center justify-center">
          <div className="text-textTertiary">Sem dados disponíveis</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Crescimento da Plataforma</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="userCount" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            name="Usuários"
            dot={{ fill: '#8B5CF6' }}
          />
          <Line 
            type="monotone" 
            dataKey="eventCount" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Eventos"
            dot={{ fill: '#10B981' }}
          />
          <Line 
            type="monotone" 
            dataKey="rsvpCount" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="RSVPs"
            dot={{ fill: '#F59E0B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
