import { useTranslation } from 'react-i18next';

export default function EmployeeFilters({
  search,
  setSearch,
  selectedRole,
  setSelectedRole,
  selectedMultiplex,
  setSelectedMultiplex,
  multiplexes
}) {

  const { t } = useTranslation();

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 space-y-4">

      <input
        type="text"
        placeholder={t('employee.filters.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white"
        >
          <option value="all">{t('employee.filters.allRoles')}</option>
          <option value="director">{t('employee.roles.director')}</option>
          <option value="cajero">{t('employee.roles.cajero')}</option>
          <option value="despachador_comida">{t('employee.roles.despachador_comida')}</option>
          <option value="encargado_sala">{t('employee.roles.encargado_sala')}</option>
          <option value="aseador">{t('employee.roles.aseador')}</option>
        </select>

        <select
          value={selectedMultiplex}
          onChange={(e) => setSelectedMultiplex(e.target.value)}
          className="bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white"
        >
          <option value="all">{t('employee.filters.allMultiplexes')}</option>

          {multiplexes.map((multiplex) => (
            <option
              key={multiplex.routerKey || multiplex._id}
              value={multiplex.routerKey || multiplex._id}
            >
              {multiplex.nombre}
            </option>
          ))}

        </select>

      </div>

    </div>
  );
}