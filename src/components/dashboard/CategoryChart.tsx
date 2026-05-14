import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  category: string;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

// Cores modernas para as categorias
const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899'];

export default function CategoryChart({ data, loading }: CategoryChartProps) {
  if (loading) return <div className="h-80 animate-pulse bg-surface rounded-2xl" />;

  // Ajuste para evitar que o componente quebre a página se não houver dados
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-surfaceBorder h-80 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-white mb-4 self-start">Distribuição por Categoria</h3>
        <p className="text-textTertiary text-sm italic">Nenhum evento cadastrado</p>
      </div>
    );
  }

  // Tratamento visual para dados nulos/indefinidos vindos do banco
  const chartData = data.map(item => ({
    ...item,
    category: item.category === "Indefinido" || !item.category ? "Outros" : item.category
  }));

  return (
    <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg overflow-hidden">
      <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Categoria</h3>

      {/* Altura fixa definida para evitar erros de medição do Recharts */}
      <div className="h-80 w-full min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
              nameKey="category"
              // Adicionado animação para suavizar o render inicial
              animationDuration={1000}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}