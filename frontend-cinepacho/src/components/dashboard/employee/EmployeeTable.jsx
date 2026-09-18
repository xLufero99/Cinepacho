import { useTranslation } from 'react-i18next';

const ROLE_STYLES = {
  director: 'bg-red-500/15 text-red-400 border-red-500/20',
  encargado_sala: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  cajero: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  despachador_comida: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  aseador: 'bg-stone-500/15 text-stone-300 border-stone-500/20'
};

const ROLES = [
  'director',
  'encargado_sala',
  'cajero',
  'despachador_comida',
  'aseador'
];

export default function EmployeeTable({
  employees,
  multiplexes,
  usersById,
  onRoleChange,
  onSalaryChange,
  onMultiplexChange,
  onViewHistory
}) {

  const { t } = useTranslation();

  const getMultiplexName = (id) => {

    return multiplexes.find(
      multiplex => multiplex.routerKey === id || multiplex._id === id || multiplex.id === id
    )?.nombre || t('employee.table.unassigned');
  };

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-visible">

      <div className="overflow-x-auto overflow-y-visible">

        <table className="w-full min-w-[900px]">

          <thead className="bg-surface-container-high/50 border-b border-outline-variant/10">
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-6 py-4">{t('employee.table.code')}</th>
              <th className="px-6 py-4">{t('employee.table.user')}</th>
              <th className="px-6 py-4">{t('employee.table.salary')}</th>
              <th className="px-6 py-4">{t('employee.table.role')}</th>
              <th className="px-6 py-4">{t('employee.table.multiplex')}</th>
              <th className="px-6 py-4">{t('employee.table.lastChange')}</th>
              <th className="px-6 py-4 text-right">{t('employee.table.history')}</th>
            </tr>
          </thead>

          <tbody>

            {employees.map((employee) => (

              <tr
                key={employee.id}
                className={`
                border-b border-outline-variant/5
                hover:bg-surface-container-high/20
                transition-colors

                ${employee.hasChanges
                  ? 'bg-primary/5'
                  : ''}
              `}
              >

                <td className="px-6 py-5 text-sm font-black text-white whitespace-nowrap">
                  {employee.codigo_empleado}
                </td>

                <td className="px-6 py-5 min-w-[220px] text-sm text-white/80">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {usersById?.[employee.usuario_id]?.nombre || t('employee.table.unassigned')}
                    </p>

                    <p className="text-xs text-on-surface-variant">
                      {usersById?.[employee.usuario_id]?.cedula || employee.usuario_id || employee.id}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-5 min-w-[180px]">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={employee.salario ?? ''}
                    onChange={(e) => onSalaryChange(employee, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/10 bg-surface-container-high text-sm text-white outline-none focus:border-primary"
                  />
                </td>

                <td className="px-6 py-5 min-w-[220px]">

                  <select
                    value={employee.cargo}
                    onChange={(e) => onRoleChange(employee, e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-black uppercase bg-surface-container-high outline-none ${ROLE_STYLES[employee.cargo] || 'border-outline-variant/10 text-white'}`}
                  >

                    {ROLES.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {t(`employee.roles.${role}`)}
                      </option>
                    ))}

                  </select>

                </td>

                <td className="px-6 py-5 min-w-[220px]">
                  <select
                    value={employee.sede_id}
                    onChange={(e) =>
                      onMultiplexChange(employee, e.target.value)
                    }
                    className="
                      w-full px-3 py-2 rounded-xl border
                      text-xs font-black uppercase
                      bg-surface-container-high
                      border-outline-variant/10
                      text-white
                      outline-none
                    "
                  >
                    {multiplexes.map((multiplex) => (

                      <option
                        key={multiplex.routerKey || multiplex._id}
                        value={multiplex.routerKey || multiplex._id}
                      >
                        {multiplex.nombre}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-6 py-5 min-w-[220px] text-sm text-on-surface-variant whitespace-nowrap">
                  {employee.ultimo_cambio || t('employee.table.unassigned')}
                </td>

                <td className="px-6 py-5 text-right">

                  <button
                    onClick={() => onViewHistory(employee)}
                    className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/10 hover:border-primary/20 hover:text-primary transition-all text-xs font-black uppercase tracking-wider"
                  >
                    {t('employee.actions.viewHistory')}
                  </button>
                </td>

                
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}