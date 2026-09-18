//Insignias/Etiquetas (como el de puntos de usuario)
import { cn } from '../../utils/cn';

export default function Badge({ children, variant = 'primary', size = 'md', className }) {
    //Variantes de las insignias
    const variants = {
        primary: "bg-primary-container text-on-primary-container border-primary/20",
        secondary: "bg-secondary-container text-on-secondary-container border-secondary/20",
        tertiary: "bg-tertiary-container text-on-tertiary-container border-tertiary/20",
        error: "bg-error-container text-on-error-container border-error/20",
        outline: "bg-transparent border border-outline text-on-surface-variant"
    };

    return (
        <span className={cn(
        "font-label font-bold uppercase tracking-tighter border inline-flex items-center rounded-lg",
        variant === 'outline' ? '' : 'backdrop-blur-sm',
        size === 'xs' ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[11px]',
        variants[variant],
        className
        )}>
        {children}
        </span>
    );
}