//Películas que más clientes han tenido
import { useTranslation } from 'react-i18next';

export default function TopPerformingMovies({ topMovies = [], emptyStateMessage, loading = false }) {
  const { t } = useTranslation();
  const displayMovies = Array.isArray(topMovies) ? topMovies : [];

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 h-full">
      <h3 className="font-headline font-bold text-xl mb-6 text-white">{t('admin.topMovies.title')}</h3>

      {loading && (
        <div className="h-64 flex items-center justify-center text-on-surface-variant font-body">
          {t('admin.dailySummary.loadingMetrics')}
        </div>
      )}

      {!loading && displayMovies.length === 0 && (
        <div className="h-64 flex items-center justify-center text-on-surface-variant font-body text-center px-4">
          {emptyStateMessage || t('admin.dailySummary.noSalesToday')}
        </div>
      )}

      <div className="space-y-6">
        {!loading && displayMovies.map((item) => (
          <div key={item._id} className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-16 bg-surface-variant rounded flex-shrink-0 overflow-hidden relative border border-stone-800/50">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
              {/* Propiedad de la BD: url_poster */}
              <img 
                alt={item.nombre} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                src={item.url_poster} 
              />
            </div>
            <div className="flex-1 min-w-0">
              {/* Propiedad de la BD: nombre */}
              <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-white font-headline">
                {item.nombre}
              </h4>
              <p className="text-xs text-on-surface-variant truncate mt-0.5 font-body">
                {item.funcionInfo?.sala_id || '-'} • {item.funcionInfo?.hora || '-'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {/* Cálculo derivado de Funciones.sillas general/preferencial ocupadas */}
              <p className="font-label font-bold text-sm text-secondary">{item.funcionInfo?.sillasVendidas || 0}</p>
              <p className="text-[10px] text-on-surface-variant font-label uppercase">{t('admin.topMovies.tickets')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}