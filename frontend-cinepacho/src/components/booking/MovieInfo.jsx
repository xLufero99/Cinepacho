import { useTranslation } from 'react-i18next';

export default function MovieInfo({ movie, showtime, selectedHeadquarters }) {
  const { t } = useTranslation();
  
  // ✅ Extraer hora correctamente
  const horaMostrar = showtime?.hora_inicio || showtime?.hora || '--:--';
  const fechaMostrar = showtime?.fecha || '';
  
  return (
    <div className="flex flex-col gap-6">
      {/* Imagen de la película */}
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/20">
        <img
          src={movie?.urlPoster || movie?.url_poster || '/placeholder-movie.jpg'}
          alt={movie?.nombre || 'Movie'}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Información de la función */}
      <div className="space-y-4">
        <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-on-surface leading-tight">
          {movie?.nombre || 'Movie'}
        </h1>
        
        <div className="space-y-2">
          <p className="font-body text-sm text-on-surface-variant">
            {fechaMostrar} - {horaMostrar.substring(0, 5)}
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            {t('movieInfo.language')}
          </p>
        </div>
        
        {/* Información de la sede */}
        <div className="p-4 bg-surface-container-high rounded-lg border border-outline-variant/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">
              location_on
            </span>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
              {t('movieInfo.selectedCinema')}
            </span>
          </div>
          <p className="font-headline text-base text-on-surface font-medium">
            {selectedHeadquarters?.nombre || ''}
          </p>
          {selectedHeadquarters?.direccion && (
            <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2">
              {selectedHeadquarters.direccion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}