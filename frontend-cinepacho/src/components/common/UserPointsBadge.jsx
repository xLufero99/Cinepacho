//Indicador de los puntos del usuario
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';
import { useLoyaltyContext } from '../../contexts/LoyaltyContext';

/*user: puntostotal - Total de puntos del programa "Lealtad"*/

export default function UserPointsBadge({ user, className }) {
    const { t } = useTranslation();
    const { userPoints } = useLoyaltyContext();
    
    return (
        <Link to="/loyalty">
            <Button 
            variant="ghost" 
            className={cn(
                "gap-3 px-4 py-2 hover:bg-tertiary-container/10 group",
                className
            )}
            >
            {/*Muestra los puntos, si no hay es 0*/}
            <div className="flex flex-col items-end leading-none">
                <span className="font-label text-[9px] font-black uppercase tracking-widest text-tertiary">{t('user.myPoints')}</span>
                <span className="font-label text-sm font-bold text-on-surface">
                {userPoints || 0}
                </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
                <span className="material-symbols-outlined text-xl">stars</span>
            </div>
            </Button>
        </Link>
    );
}