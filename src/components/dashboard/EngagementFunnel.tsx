import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface FunnelData {
  step: string;
  count: number;
}

interface EngagementFunnelProps {
  data: FunnelData[];
  loading?: boolean;
}

const COLORS = ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'];

export default function EngagementFunnel({ data, loading }: EngagementFunnelProps) {
  if (loading) return <div className="h-80 animate-pulse bg-gray-800/20 rounded-2xl" />;

  return (
    <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-6">Funil de Engajamento</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="step"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              width={120}
            />
            {/* CORREÇÃO AQUI: Estilização do Tooltip para visibilidade */}
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{
                backgroundColor: '#1F2937', // bg-gray-800
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fill: '#fff', fontSize: 12, fontWeight: 'bold' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}