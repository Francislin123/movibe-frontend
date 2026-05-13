import {
  colors,
  purpleGlassmorphism,
  purpleGradients,
  purpleShadows
} from '../../styles/purple-design-system';

interface PremiumGrowthChartProps {
  data: Array<{
    date: string;
    users: number;
    events: number;
    rsvps: number;
    checkIns: number;
  }>;
  metrics: ('users' | 'events' | 'rsvps' | 'checkIns')[];
  title: string;
  subtitle?: string;
  height?: number;
}

export default function PremiumGrowthChartNew({
  data,
  metrics,
  title,
  subtitle,
  height = 300
}: PremiumGrowthChartProps) {

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'users': return colors.purple.DEFAULT;
      case 'events': return '#10B981';
      case 'rsvps': return '#F59E0B';
      case 'checkIns': return '#3B82F6';
      default: return colors.purple.DEFAULT;
    }
  };

  const getMetricGradient = (metric: string) => {
    switch (metric) {
      case 'users': return purpleGradients.primary;
      case 'events': return 'linear-gradient(135deg, #10B981 0%, #34D399 100%)';
      case 'rsvps': return 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)';
      case 'checkIns': return 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)';
      default: return purpleGradients.primary;
    }
  };

  const maxValue = Math.max(
    ...data.flatMap(item =>
      metrics.map(m => item[m])
    )
  );

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${purpleGlassmorphism.light.background}
        ${purpleGlassmorphism.light.backdropFilter}
        ${purpleGlassmorphism.light.border}
        ${purpleShadows.card}
      `}
      style={{ height }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="text-sm opacity-80"
            style={{ color: colors.text.secondary }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Chart */}
      <div
        className={`
          relative rounded-xl p-4
          ${purpleGlassmorphism.medium.background}
          ${purpleGlassmorphism.medium.backdropFilter}
          ${purpleGlassmorphism.medium.border}
        `}
        style={{ height: height - 100 }}
      >
        <div className="relative h-full flex items-end justify-between gap-2">

          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
              style={{
                animation: 'fadeUp 0.4s ease-out',
                animationDelay: `${index * 60}ms`,
              }}
            >
              {/* Bars */}
              {metrics.map((metric, i) => {
                const value = item[metric];
                const percent = maxValue ? (value / maxValue) : 0;

                return (
                  <div key={i} className="w-full flex flex-col items-center relative">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${percent * (height - 140)}px`,
                        background: getMetricGradient(metric),
                        boxShadow: `0 -4px 12px ${getMetricColor(metric)}40`,
                      }}
                    />

                    <div
                      className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(to top, ${getMetricColor(metric)}40, transparent)`
                      }}
                    />
                  </div>
                );
              })}

              {/* Date */}
              <span
                className="text-xs mt-2 opacity-60"
                style={{ color: colors.text.secondary }}
              >
                {new Date(item.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short'
                })}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{
                background: purpleGlassmorphism.light.background,
                border: `1px solid ${getMetricColor(metric)}40`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: getMetricGradient(metric)
                }}
              />
              <span
                className="text-xs capitalize"
                style={{ color: colors.text.secondary }}
              >
                {metric}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}