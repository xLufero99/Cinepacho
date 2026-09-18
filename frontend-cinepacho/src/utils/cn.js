import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs)); //CLSX se encarga de unir los datos
                                //twMerge se encarga de evitar conflictos y tomar la última etiqueta enviada (cascada) 
}