import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { colors, purpleGlassmorphism } from '../../styles/purple-design-system';

interface PerformanceData {
  name: string;
  rsvps: number;
  checkins: number;
}

interface PerformanceRankingProps {
  data: PerformanceData[];
  loading?: boolean;
}

export default function PerformanceRanking({ data, loading }: PerformanceRankingProps) {
  if (loading) return <div className="h-80 animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <div className={`
      p-6 rounded-2xl border
      ${purpleGlassmorphism.light.background}
      ${purpleGlassmorphism.light.border}
    `}>
      <h3 className="text-lg font-semibold text-white mb-6">Performance por Estabelecimento</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.text.secondary, fontSize: 12 }}
              width={100}
            />

            {/* CORREÇÃO APLICADA: Tooltip com cores visíveis */}
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{
                backgroundColor: '#1F2937', // Fundo escuro sólido
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '10px'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px' }} // Cor dos valores
              labelStyle={{ color: '#9CA3AF', fontWeight: 'bold', marginBottom: '4px' }} // Cor do nome da balada
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '20px', color: '#fff' }}
            />

            <Bar
              name="RSVPs"
              dataKey="rsvps"
              fill="#8B5CF6"
              radius={[0, 4, 4, 0]}
              barSize={12}
            />
            <Bar
              name="Check-ins"
              dataKey="checkins"
              fill="#10B981"
              radius={[0, 4, 4, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}