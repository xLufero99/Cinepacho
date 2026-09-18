import { useTranslation } from "react-i18next";

export default function InventoryStats({ inventory }) {

  const { t } = useTranslation();

  const totalProducts = inventory.length;

  const totalUnits = inventory.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const lowStock = inventory.filter(
    item => item.cantidad <= 15
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
          {t('inventory.stats.products')}
        </p>

        <h2 className="text-3xl font-black text-white">
          {totalProducts}
        </h2>
      </div>

      <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
          {t('inventory.stats.totalUnits')}
        </p>

        <h2 className="text-3xl font-black text-white">
          {totalUnits}
        </h2>
      </div>

      <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
          {t('inventory.stats.lowStock')}
        </p>

        <h2 className="text-3xl font-black text-red-400">
          {lowStock}
        </h2>
      </div>

    </div>
  );
}