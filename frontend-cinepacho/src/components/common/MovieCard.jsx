//Tarjeta para cada película - Diseño basado en CinemaCard
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';

/*movie: nombre - Titulo de la película
         url_poster - Carátula
         clasificación - PG
         generos - Lista con los géneros
         descripcion - Pequeño texto/Slogan para la película
         showtimes - Horarios disponibles
*/

export default function MovieCard({ movie, className }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  // Determine badge content based on movie properties
  const getBadgeContent = () => {
    if (movie.estreno) return t('movie.premiere');
    if (movie.formato) return movie.formato;
    return movie.clasificacion;
  };

  const getBadgeVariant = () => {
    if (movie.estreno) return 'primary';
    if (movie.formato) return 'secondary';
    return 'tertiary';
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "group relative aspect-[4/5] flex flex-col justify-end p-0 overflow-hidden border-none hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer",
        className
      )}
    >
      {/*Imagen de fondo*/}
      <div className="absolute inset-0 z-0">
        <img
  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000"
  src={movie.urlPoster || movie.url_poster || '/placeholder-movie.jpg'}
  alt={movie.nombre}
/>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />
      </div>

      {/*Contenido*/}
      <div className="relative z-10 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-base">movie</span>
            <span className="font-label text-[10px] font-black uppercase tracking-[0.2em]">
              {movie.generos?.[0] || t('movie.film')}
            </span>
          </div>
          <Badge variant={getBadgeVariant()} size="xs">
            {getBadgeContent()}
          </Badge>
        </div>

        <div>
          <h2 className="font-headline text-2xl font-black text-on-surface leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors">
            {movie.nombre}
          </h2>
          <p className="font-body text-xs text-on-surface-variant line-clamp-1 italic mt-1">
            {movie.descripcion}
          </p>
        </div>

        {/*Accion (Oculta por default, aparece con hover) */}
        <div className="pt-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <Button
            variant="primary"
            className="w-full font-label text-[10px] tracking-widest"
          >
            {t('movie.viewShowtimes')}
          </Button>
        </div>
      </div>
    </Card>
  );
}