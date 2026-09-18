//Bloque de botones primarios, secundarios o acción
import { cn } from '../../utils/cn';

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
    //Variantes de los botones
    const variants = {
        primary: "bg-primary text-on-primary hover:bg-primary-fixed-dim shadow-lg shadow-primary/10",
        secondary: "bg-secondary text-on-secondary hover:bg-secondary-dim",
        outline: "border-2 border-outline text-on-surface hover:bg-surface-bright hover:border-primary",
        ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
    };

    //Tamaños para los botones
    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    };

    return (
        <button 
        className={cn(
            "font-label font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50",
            "rounded-full",
            variants[variant],
            sizes[size],
            className
        )}
        {...props}
        >
        {children}
        </button>
    );
}