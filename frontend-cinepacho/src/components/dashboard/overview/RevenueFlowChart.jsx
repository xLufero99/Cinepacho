//Gráfico para las compras del día
import { useTranslation } from 'react-i18next';

export default function RevenueFlowChart({ comprasHoy = [], emptyStateMessage, loading = false }) {

  const { t } = useTranslation();

  const chartPoints = Array.isArray(comprasHoy) ? comprasHoy : [];

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline font-bold text-xl text-white">{t('admin.revenueChart.title')}</h3>
        <span className="text-xs font-label text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
          {t('admin.revenueChart.paidOnly')}
        </span>
      </div>

      {loading && (
        <div className="h-64 flex items-center justify-center text-on-surface-variant font-body">
          {t('admin.dailySummary.loadingMetrics')}
        </div>
      )}

      {!loading && chartPoints.length === 0 && (
        <div className="h-64 flex items-center justify-center text-on-surface-variant font-body text-center px-4">
          {emptyStateMessage || t('admin.dailySummary.noSalesToday')}
        </div>
      )}

      {!loading && chartPoints.length > 0 && (
        <>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {chartPoints.map((point, index) => (
              <div
                key={index}
                className={`w-full transition-colors rounded-t-sm relative group ${
                  point.isHigh ? 'bg-primary/60 hover:bg-primary' : 'bg-surface-variant/30 hover:bg-primary/20'
                }`}
                style={{ height: `${point.heightPct || 8}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-label opacity-0 group-hover:opacity-100 transition-opacity text-white bg-stone-900 px-1 py-0.5 rounded shadow">
                  {point.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-on-surface-variant font-label mt-2 px-2">
            {chartPoints.map((point, idx) => (
              <span key={idx}>{point.time}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}