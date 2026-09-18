import { cn } from '../../../utils/cn';

import { useTranslation } from 'react-i18next';

import Badge from '../../ui/Badge';
import MiniSeatMap from './MiniSeatMap';

const ESTADO_CONFIG = {
  activa: {
    variant: 'tertiary',
    labelKey: 'dashboard.room.active',
    borderCls: 'bg-emerald-500'
  },

  mantenimiento: {
    variant: 'secondary',
    labelKey: 'dashboard.room.maintenance',
    borderCls: 'bg-amber-500'
  },

  inactiva: {
    variant: 'outline',
    labelKey: 'dashboard.room.inactive',
    borderCls: 'bg-primary'
  },
};

export default function SalaCard({
  sala,
  onEditSala
}) {

  const { t } = useTranslation();

  const cfg =
    ESTADO_CONFIG[sala.estado]
    || ESTADO_CONFIG.inactiva;

  const generalSeats =
    sala.sillas_general || [];

  const preferentialSeats =
    sala.sillas_preferencial || [];

  const totalAsientos =
    generalSeats.length + preferentialSeats.length;

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-4 flex flex-col justify-between group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">

      {/* Status Line */}
      <div
        className={cn(
          'absolute left-0 top-0 w-1 h-full rounded-l-xl',
          cfg.borderCls
        )}
      />

      <div>

        {/* Header */}
        <div className="flex justify-between items-start mb-2 pl-1">

          <div>

            <h4 className="font-headline text-sm font-black text-white uppercase group-hover:text-primary transition-colors truncate max-w-[140px]">
              {sala.nombre}
            </h4>

            <p className="text-[10px] text-stone-500 font-label tracking-wider">
              ID:
              {' '}
              {sala.id_sala?.toUpperCase?.() || 'N/A'}
            </p>

          </div>

          <button
            onClick={() => onEditSala(sala)}
            className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/10 hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">
              edit
            </span>
          </button>

        </div>

        {/* Badge */}
        <div className="my-2 pl-1">
          <Badge variant={cfg.variant} size="xs">
            {t(cfg.labelKey)}
          </Badge>
        </div>

        {/* Stats */}
        <div className="text-[11px] text-on-surface-variant space-y-1 pl-1">

          <div className="flex justify-between">

            <span className="text-stone-500">
              {t('dashboard.room.totalCapacity')}
            </span>

            <span className="text-white font-medium">
              {totalAsientos} {t('dashboard.room.seats')}
            </span>

          </div>

          <div className="flex justify-between text-[10px]">

            <span className="text-stone-500">
              {t('dashboard.room.generalVsPref')}
            </span>

            <span className="text-stone-300">

              {generalSeats.length}{t('dashboard.room.generalInitial')}

              {' / '}

              <span className="text-red-400">
                {preferentialSeats.length}{t('dashboard.room.preferentialInitial')}
              </span>

            </span>

          </div>

        </div>

      </div>

      {/* MiniMap */}
      <div className="flex justify-center border-t border-outline-variant/5 pt-3 mt-3">

        <MiniSeatMap
          gCount={generalSeats.length}
          pCount={preferentialSeats.length}
        />

      </div>

    </div>
  );
}