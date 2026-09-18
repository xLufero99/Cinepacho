//Presentación de título de sección
import { cn } from '../../utils/cn';

export default function SectionTitle({ children, subtitle, className }) {
  return (
    <div className={cn("mb-10 space-y-2", className)}>
      <h2 className="font-headline text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase italic leading-none">
        {children}
      </h2>
      {/*Si no hay subtítulo, no se renderiza*/}
      {subtitle && (
        <p className="font-body text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
      {/*Línea decorativa según el estilo*/}
      <div className="h-1 w-12 bg-primary rounded-full mt-4" />
    </div>
  );
}