import { useState, useEffect } from 'react';
import { getMultiplexes } from '../../services/multiplexService';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function CinemaSelectionModal({ 
  isOpen, 
  onClose, 
  onCinemaSelect, 
  selectedMovie 
}) {
  const { t } = useTranslation();
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMultiplexes = async () => {
      try {
        const data = await getMultiplexes();
        setSedes(data);
      } catch (error) {
        console.error('Error loading multiplexes:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      loadMultiplexes();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            {t('cinemaModal.loading')}
          </div>
        </div>
      </div>
    );
  }

  const handleCinemaSelect = (cinema) => {
    onCinemaSelect(cinema);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
              {t('cinemaModal.selectCinemaLocation')}
            </h2>
            <p className="font-body text-on-surface-variant">
              {t('cinemaModal.chooseWhereToWatch')} <span className="text-primary font-medium">{selectedMovie?.nombre}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Cinema Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedes.map((cinema) => (
            <button
              key={cinema.id}
              onClick={() => handleCinemaSelect(cinema)}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-outline-variant/20 hover:border-primary/30 transition-all duration-300"
            >
              {/* Cinema Image */}
              <div className="absolute inset-0">
                <img 
                  src={cinema.url_imagen || '/placeholder-cinema.jpg'}
                  alt={cinema.nombre}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />
              </div>

              {/* Cinema Info */}
              <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                <div className="flex items-center gap-1.5 text-primary mb-2">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span className="font-label text-[10px] font-black uppercase tracking-[0.2em]">{cinema.ciudad}</span>
                </div>
                
                <h3 className="font-headline text-xl font-black text-on-surface leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors mb-1">
                  {cinema.nombre}
                </h3>
                
                <p className="font-body text-xs text-on-surface-variant line-clamp-2 italic">
                  {cinema.direccion}
                </p>

                {/* Selection Indicator */}
                <div className="mt-3 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span className="font-label text-xs font-medium">{t('cinemaModal.select')}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-label tracking-widest"
          >
            {t('cinemaModal.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
