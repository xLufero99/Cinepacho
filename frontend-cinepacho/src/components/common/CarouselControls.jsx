//Controles del carrusel
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';

export default function CarouselControls({ count, currentIndex, onNext, onPrev, onGoTo }) {
  const { t } = useTranslation();
  
  return (
      <>
        {/*Navegación Lateral*/}
        <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-30 flex items-center justify-between px-4 lg:-mx-20">
          <button 
            onClick={onPrev}
            className="pointer-events-auto w-12 h-12 rounded-full bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all duration-300 flex items-center justify-center shadow-lg active:scale-90 group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">chevron_left</span>
          </button>

          <button 
            onClick={onNext}
            className="pointer-events-auto w-12 h-12 rounded-full bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all duration-300 flex items-center justify-center shadow-lg active:scale-90 group"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </div>

        {/*Indicadores*/}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === currentIndex 
                  ? "bg-primary w-10" 
                  : "bg-surface-container-highest hover:bg-outline w-3"
              )}
              aria-label={t('carousel.goToSlide', { index: index + 1 })}
            />
          ))}
        </div>
      </>
    );
}