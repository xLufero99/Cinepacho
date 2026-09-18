import { useTranslation } from 'react-i18next';

export default function InventoryFilters({
  sedes,
  selectedSedeId,
  setSelectedSedeId,
  search,
  setSearch
}) {

  const { t } = useTranslation();

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 space-y-4">

      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
          Sede
        </label>

        <select
          value={selectedSedeId}
          onChange={(e) => setSelectedSedeId(e.target.value)}
          className="
            w-full
            bg-surface-container-high
            border border-outline-variant/10
            rounded-xl
            px-4 py-3
            text-sm text-white
            outline-none
            focus:border-primary
          "
        >
          <option value="" disabled>
            Selecciona una sede
          </option>

          {sedes.map((sede) => {
            const sedeId = sede.id || sede._id;

            return (
              <option key={sedeId} value={sedeId}>
                {sede.nombre}
              </option>
            );
          })}
        </select>
      </div>

      <input
        type="text"
        placeholder={t('inventory.filters.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full
          bg-surface-container-high
          border border-outline-variant/10
          rounded-xl
          px-4 py-3
          text-sm text-white
          outline-none
          focus:border-primary
        "
      />

    </div>
  );
}