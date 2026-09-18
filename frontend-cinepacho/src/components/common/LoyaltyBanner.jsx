//Banner del programa de "lealtad"
import { cn } from '../../utils/cn';
import Card from '../ui/Card';
import { useTranslation } from 'react-i18next';

/*loyaltyConfig: puntos_boletas - Puntos otorgados por boleta
                 puntos_snacks - Puntos otorgados por snack
                 puntos_redencion - Puntos necesarios para una boleta gratis
*/

export default function LoyaltyBanner({ loyaltyConfig, className }) {
    const { t } = useTranslation();
    // Valores por defecto de los puntos
    const config = {
        puntos_boletas: loyaltyConfig?.puntos_boletas || 10,
        puntos_snacks: loyaltyConfig?.puntos_snacks || 5,
        puntos_redencion: loyaltyConfig?.puntos_redencion || 100,
    };

    return (
        <Card variant="high" className={cn("mt-24 p-8 md:p-12 border-primary/10 overflow-hidden relative", className)}>
        {/*Background*/}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
            {/*Marca*/}
            <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner">
                <span className="material-symbols-outlined text-4xl">workspace_premium</span>
            </div>
            <div>
                <h3 className="font-headline text-3xl font-black text-on-surface uppercase tracking-tighter leading-none mb-2">
                {t('loyalty.brandTitle')} <span className="text-secondary italic">{t('loyalty.brandHighlight')}</span>
                </h3>
                <p className="font-body text-on-surface-variant text-sm">{t('loyalty.description')}</p>
            </div>
            </div>

            {/*Estadisticas Grid*/}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full lg:w-auto">
            <StatItem value={config.puntos_boletas} label={t('loyalty.perTicket')} color="text-secondary" />
            <StatItem value={config.puntos_snacks} label={t('loyalty.perSnack')} color="text-secondary" />
            <StatItem 
                value={config.puntos_redencion} 
                label={t('loyalty.freeTicket')} 
                color="text-primary" 
                className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-6 md:pt-0 md:pl-8"
            />
            </div>
        </div>
        </Card>
    );
}
// Sub-Componente para los cambios de valores
function StatItem({ value, label, color, className }) {
    return (
        <div className={cn("flex flex-col items-center md:items-start", className)}>
        <p className={cn("font-label text-3xl font-black leading-none mb-1", color)}>
            {value}<span className="text-xs ml-1 opacity-70">PTS</span>
        </p>
        <p className="font-label text-[10px] text-on-surface-variant uppercase font-bold tracking-[0.2em]">
            {label}
        </p>
        </div>
    );
}