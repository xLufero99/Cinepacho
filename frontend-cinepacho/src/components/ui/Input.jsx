//Ingreso de datos (campos de texto)
import { cn } from '../../utils/cn';

export default function Input({ icon, className, ...props }) {
  return (
    <div className="relative w-full group">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
          {icon}
        </span>
      )}
      <input 
        className={cn(
          "w-full bg-surface-container-lowest border border-outline-variant text-on-surface",
          "font-body text-sm rounded-xl py-3 transition-all",
          "placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
          icon ? "pl-12 pr-4" : "px-4",
          className
        )}
        {...props}
      />
    </div>
  );
}