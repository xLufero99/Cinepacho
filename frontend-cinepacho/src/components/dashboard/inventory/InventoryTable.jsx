import { useTranslation } from "react-i18next";

export default function InventoryTable({
  inventory,
  onAdjust,
  onDelete
}) {

  const { t } = useTranslation();

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[850px]">

          <thead className="bg-surface-container-high/40 border-b border-outline-variant/10">
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">

              <th className="px-6 py-4">
                {t('inventory.table.product')}
              </th>

              <th className="px-6 py-4">
                {t('inventory.table.brand')}
              </th>

              <th className="px-6 py-4">
                {t('inventory.table.stock')}
              </th>

              <th className="px-6 py-4">
                {t('inventory.table.price')}
              </th>

              <th className="px-6 py-4 text-right">
                {t('inventory.table.actions')}
              </th>

            </tr>
          </thead>

          <tbody>

            {inventory.map((item, index) => {

              const isLowStock = item.cantidad <= 15;

              return (
                <tr
                  key={item.id || item._id || index}
                  className="
                    border-b border-outline-variant/5
                    hover:bg-surface-container-high/20
                    transition-colors
                  "
                >

                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.nombre}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {item.marca}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <div className={`
                        w-2 h-2 rounded-full
                        ${isLowStock
                          ? 'bg-red-400'
                          : 'bg-emerald-400'}
                      `} />

                      <span className={`
                        text-sm font-bold
                        ${isLowStock
                          ? 'text-red-400'
                          : 'text-white'}
                      `}>
                        {item.cantidad}
                      </span>

                    </div>

                  </td>

                  <td className="px-6 py-5 text-sm text-white font-bold">
                    ${Number(item.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onAdjust(item)}
                        title={t('inventory.table.adjust')}
                        className="p-2 rounded-md bg-surface-container-high hover:bg-surface-container-high/80 text-on-surface-variant"
                      >
                        {/* Pencil icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 2.586a2 2 0 1 1 2.828 2.828l-8.793 8.793a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.265-1.265l1-3a1 1 0 0 1 .242-.39l8.793-8.793ZM12.172 4l-7.879 7.879-.5 1.5 1.5-.5L13.172 5.0 12.172 4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(item)}
                        title={t('inventory.table.delete')}
                        className="p-2 rounded-md bg-surface-container-high hover:bg-surface-container-high/80 text-error"
                      >
                        {/* X icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>

                </tr>
              );

            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}