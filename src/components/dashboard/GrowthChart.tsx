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
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dy={10}
            // Formata a data de YYYY-MM-DD para DD/MM para ficar mais limpo
            tickFormatter={(value) => {
              const parts = value.split('-');
              return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : value;
            }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: '#4B5563', strokeWidth: 2 }}
          />
          <Legend verticalAlign="top" align="right" height={36} />

          {/* ALTERAÇÃO CRÍTICA: dataKey="count"
              Isso deve bater exatamente com o campo 'count' do seu JSON Java
          */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8B5CF6"
            strokeWidth={3}
            name="Novos Registros"
            dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 2, stroke: '#1F2937' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}