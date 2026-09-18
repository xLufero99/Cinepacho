import { useTranslation } from 'react-i18next';

export default function EmployeeHistoryModal({
  employee,
  isOpen,
  onClose,
  multiplexes
}) {

  const { t } = useTranslation();

  if (!isOpen || !employee) {
    return null;
  }

  const getMultiplexName = (id) => {

    return multiplexes.find(
      multiplex => multiplex._id === id || multiplex.id === id || multiplex.routerKey === id
    )?.nombre || t('employee.history.unknown');
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-2xl bg-surface-container border border-outline-variant/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

        <div className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/10 bg-surface-container-high/60">

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
              {t('employee.history.title')}
            </p>

            <h2 className="text-2xl font-black text-white uppercase">
              {employee.codigo_empleado || employee.codigoEmpleado}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              {t('employee.history.current')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>

        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">

          <div className="relative pl-2">
            <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/40 to-transparent" />

            <div className="space-y-5">
              {employee.historial_sedes?.map((entry, index) => {
                const isLast = index === employee.historial_sedes.length - 1;

                return (
                  <div
                    key={index}
                    className="relative pl-10"
                  >
                    <div className="absolute left-[1px] top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-surface-container-high shadow-lg shadow-black/30">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>

                    <div className="bg-surface-container-high border border-outline-variant/10 rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/20">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant mb-2">
                            {t('employee.history.title')}
                            {' '}
                            {index + 1}
                          </p>
                          <h3 className="text-lg font-bold text-white">
                            {getMultiplexName(entry.sede_id || entry.sedeId)}
                          </h3>
                        </div>

                        <span className="text-xs uppercase tracking-widest text-primary font-black whitespace-nowrap">
                          {t(`employee.roles.${entry.cargo}`)}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 text-sm text-on-surface-variant">
                        <div className="rounded-xl border border-outline-variant/10 bg-black/10 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant mb-1">
                            {t('employee.history.start')}
                          </p>
                          <p className="text-on-surface font-medium">
                            {entry.fecha_inicio || entry.fechaInicio}
                          </p>
                        </div>

                        <div className="rounded-xl border border-outline-variant/10 bg-black/10 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant mb-1">
                            {t('employee.history.end')}
                          </p>
                          <p className="text-on-surface font-medium">
                            {entry.fecha_fin || entry.fechaFin || t('employee.history.current')}
                          </p>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                          <span className="h-px flex-1 bg-outline-variant/10" />
                          <span>{t('employee.history.title')}</span>
                          <span className="h-px flex-1 bg-outline-variant/10" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}