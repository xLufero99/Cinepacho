//Contenedor de cartas visual
import { cn } from '../../utils/cn';

export default function Card({ children, className, variant = 'default', ...props }) {
    //Variantes de las tarjetas
    const variants = {
        default: "bg-surface-container border-outline-variant",
        high: "bg-surface-container-high border-outline-variant/50 shadow-xl",
        low: "bg-surface-container-low border-transparent",
        bright: "bg-surface-bright border-primary/20"
    };

    return (
        <div className={cn(
        "border transition-all duration-300",
        "rounded-xl",
        variants[variant],
        className
        )} {...props}>
        {children}
        </div>
    );
}