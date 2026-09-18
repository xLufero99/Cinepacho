//Carta del multiplex == cinema + funcionalidades
import { useTranslation } from 'react-i18next';

import Button from '../../ui/Button';
import SalaCard from './SalaCard';

export default function MultiplexCard({ sede, salas, onEditSede, onNewSala, onEditSala }) {
  
  const { t } = useTranslation();
  
  // Log para ver la estructura de la sede
  console.log('🎬 MultiplexCard - Sede recibida:', sede);
  console.log('🎬 MultiplexCard - ID de sede (id):', sede.id);
  console.log('🎬 MultiplexCard - ID de sede (_id):', sede._id);
  console.log('🎬 MultiplexCard - Nombre de sede:', sede.nombre);
  
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all hover:border-outline-variant/30">
      {/* Efecto de iluminación cinemática ambiental */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Cabecera del Multiplex */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/5 pb-5 mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-headline font-black text-xl text-white tracking-tight uppercase">
              {sede.nombre?.replace('Cine Pacho ', '') || sede.nombre}
            </h3>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-stone-400 bg-surface-container px-2 py-0.5 rounded border border-outline-variant/10">
              {sede.ciudad}
            </span>
          </div>
          <p className="font-body text-xs text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">location_on</span>
            {sede.direccion}
          </p>
        </div>

        <div>
         
        </div>
      </div>

      {/* REQUISITO UX CRÍTICO: Grid de Salas Visibles al Instante sin colapsables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        {salas.map(sala => (
          <SalaCard 
            key={sala.id_sala || sala.id} 
            sala={sala} 
            onEditSala={onEditSala} 
          />
        ))}

        {/* Botón Integrado de Creación Rápida de Sala (Estilo Dashboard Tile) */}
        <div 
          onClick={() => {
            const sedeId = sede.id || sede._id;
            console.log('➕ Click en crear nueva sala para sede:', sedeId, sede.nombre);
            console.log('➕ Datos completos de sede:', sede);
            onNewSala();
          }} 
          className="border border-dashed border-outline-variant/30 hover:border-primary/50 bg-transparent rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 group cursor-pointer min-h-[140px]"
        >
          <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:scale-110 transition-all shadow-md">
            <span className="material-symbols-outlined text-sm">add</span>
          </div>
          <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant group-hover:text-white transition-all">
            {t('dashboard.multiplex.newRoom')}
          </span>
        </div>

        {/* Empty State contextual dentro de la sede */}
        {salas.length === 0 && (
          <div className="col-span-3 py-6 flex items-center text-left italic text-xs text-on-surface-variant/40 font-body">
            {t('dashboard.multiplex.emptyRooms')}
          </div>
        )}
      </div>
    </div>
  );
}