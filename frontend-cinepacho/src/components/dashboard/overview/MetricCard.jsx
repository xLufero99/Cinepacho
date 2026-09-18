import { useTranslation } from 'react-i18next';

export default function MetricCard({
  title,
  value,
  subValue,
  icon,
  trend,
  trendDirection,
  trendLabel,
  colorTheme = "primary",
  progress
}) {

  const { t } = useTranslation();

  const themeStyles = {
    primary: {
      border: "hover:border-primary/30",
      glow: "bg-primary/10",
      iconText: "text-primary"
    },
    secondary: {
      border: "hover:border-secondary/30",
      glow: "bg-secondary/10",
      iconText: "text-secondary"
    },
    tertiary: {
      border: "hover:border-tertiary/30",
      glow: "bg-tertiary/10",
      iconText: "text-tertiary"
    },
    white: {
      border: "hover:border-white/20",
      glow: "bg-white/10",
      iconText: "text-zinc-400"
    }
  };

  const activeTheme =
    themeStyles[colorTheme] || themeStyles.white;

  return (

    <div className={`bg-surface-container-high rounded-xl p-6 glow-ambient border border-outline-variant/10 relative overflow-hidden group ${activeTheme.border} transition-colors`}>

      <div className={`absolute -right-4 -top-4 w-24 h-24 ${activeTheme.glow} rounded-full blur-2xl transition-all group-hover:scale-110`} />

      <div className="flex justify-between items-start mb-4 relative z-10">

        <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider">
          {title}
        </p>

        <span className={`material-symbols-outlined ${activeTheme.iconText}`}>
          {icon}
        </span>

      </div>

      <h3 className="text-4xl font-label font-bold text-white mb-2 relative z-10">
        {value}
        {subValue && (
          <span className="text-lg text-zinc-500">
            {subValue}
          </span>
        )}
      </h3>

      <div className="relative z-10">

        {progress !== undefined ? (

          <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">

            <div
              className="bg-gradient-to-r from-secondary to-tertiary h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

          </div>

        ) : (

          <div className="flex items-center gap-2 text-xs font-label">

            <span className={`px-1.5 py-0.5 rounded flex items-center ${
              trendDirection === 'up'
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-primary bg-primary/10'
            }`}>

              <span className="material-symbols-outlined text-[10px] mr-1">
                {trendDirection === 'up'
                  ? 'trending_up'
                  : 'trending_down'}
              </span>

              {trend}

            </span>

            <span className="text-zinc-500">
              {trendLabel || t('admin.metrics.vsYesterday')}
            </span>

          </div>

        )}

      </div>

    </div>
  );
}