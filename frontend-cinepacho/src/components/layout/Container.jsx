//Ancho máximo-Contenedor para elementos que favorece UX
import { cn } from '../../utils/cn';

export default function Container({ children, className, clean = false }) {
  return (
    <div className={cn(
      "mx-auto w-full px-4 md:px-8 lg:px-12",
      !clean && "max-w-7xl", //Limita el ancho
      className
    )}>
      {children}
    </div>
  );
}