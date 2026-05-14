import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
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

  // Função auxiliar para formatar a data de YYYY-MM-DD para DD/MM/YYYY
  const formatDate = (value: string) => {
    const parts = value.split('-');
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  };

  return (
    <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Análise de Crescimento Diário</h3>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            dy={10}
            tickFormatter={(value) => {
              const parts = value.split('-');
              return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : value;
            }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            labelFormatter={(label) => `Data: ${formatDate(label)}`} // ADICIONADO: Formata a data no topo do balão
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#fff'
            }}
            itemStyle={{ padding: '2px 0', color: '#fff' }}
            cursor={{ stroke: '#4B5563', strokeWidth: 1 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={40}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
          />

          <Line
            type="monotone"
            dataKey="userCount"
            stroke="#8B5CF6"
            strokeWidth={3}
            name="Novos Usuários"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

          <Line
            type="monotone"
            dataKey="eventCount"
            stroke="#10B981"
            strokeWidth={3}
            name="Novos Eventos"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

          <Line
            type="monotone"
            dataKey="rsvpCount"
            stroke="#F59E0B"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="RSVPs"
            dot={false}
            activeDot={{ r: 4 }}
          />

          <Line
            type="monotone"
            dataKey="checkInCount"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="3 3"
            name="Check-ins"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}