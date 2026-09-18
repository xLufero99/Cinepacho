//Tarjeta para cada cinema
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Badge from '../ui/Badge'; 
import Button from '../ui/Button'; 
import { cn } from '../../utils/cn';

/* sede: id - Identificador
        nombre - Nombre de la sede
        url_imagen - Imágen de la sede
        ciudad - Ciudad de la sede
        direccion - Dirección de la sede
*/

export default function CinemaCard({ sede, className, onSelectHeadquarters }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSelectHeadquarters = () => {
        // Update headquarters selection
        if (onSelectHeadquarters) {
            onSelectHeadquarters(sede);
        }
        // Navigate to movies page (or wherever appropriate in the flow)
        navigate('/');
    };

    return (
        <Card 
        className={cn(
            "group relative aspect-[4/5] flex flex-col justify-end p-0 overflow-hidden border-none hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500", 
            className
        )}
        >
        {/*Informacion*/}
        <div className="absolute inset-0 z-0">
            <img 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000" 
            src={sede.url_imagen || '/placeholder-cinema.jpg'}
            alt={sede.nombre} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />
        </div>

        {/*Contenido*/}
        <div className="relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span className="font-label text-[10px] font-black uppercase tracking-[0.2em]">{sede.ciudad}</span>
            </div>
            <Badge variant="tertiary" size="xs">{t('cinema.open')}</Badge>
            </div>

            <div>
            <h2 className="font-headline text-2xl font-black text-on-surface leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors">
                {sede.nombre}
            </h2>
            {sede.esCineDelAmor && (
                <p className="font-label text-xs text-secondary font-medium uppercase tracking-wider mt-1">
                    {t('cinema.atlantisSubtitle')}
                </p>
            )}
            <p className="font-body text-xs text-on-surface-variant line-clamp-1 italic mt-1">
                {sede.direccion}
            </p>
            </div>

            {/*Accion (Oculta por default, aparece con hover) */}
            <div className="pt-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <Button 
                variant="primary" 
                className="w-full font-label text-[10px] tracking-widest"
                onClick={handleSelectHeadquarters}
            >
                {t('cinema.selectHeadquarters')}
            </Button>
            </div>
        </div>
        </Card>
    );
}