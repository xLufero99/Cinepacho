import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

export default function InventoryAdjustModal({
  isOpen,
  onClose,
  item,
  onSave
}) {

  const { t } = useTranslation();
  const [amount, setAmount] = useState(0);

  useEffect(() => {

    setAmount(0);

  }, [item]);

  if (!isOpen || !item) {
    return null;
  }

  return (
    <div className="
      fixed inset-0 z-[999]
      bg-black/70
      backdrop-blur-sm
      flex items-center justify-center
      p-4
    ">

      <div className="
        w-full max-w-md
        bg-surface-container
        border border-outline-variant/10
        rounded-3xl
        overflow-hidden
      ">

        <div className="px-6 py-5 border-b border-outline-variant/10">

          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
            {t('inventory.adjust.title')}
          </p>

          <h2 className="text-2xl font-black text-white uppercase">
            {item.nombre}
          </h2>

        </div>

        <div className="p-6 space-y-5">

          <div className="
            bg-surface-container-high
            border border-outline-variant/10
            rounded-2xl
            p-4
          ">

            <p className="text-xs text-on-surface-variant mb-2">
              {t('inventory.adjust.currentStock')}
            </p>

            <h3 className="text-3xl font-black text-white">
              {item.cantidad}
            </h3>

          </div>

          <div>

            <label className="
              block text-[10px]
              uppercase tracking-[0.2em]
              text-on-surface-variant
              mb-2
            ">
              {t('inventory.adjust.adjustment')}
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="
                w-full
                bg-surface-container-high
                border border-outline-variant/10
                rounded-xl
                px-4 py-3
                text-white
                outline-none
                focus:border-primary
              "
            />

            <p className="text-xs text-on-surface-variant mt-2">
              {t('inventory.adjust.helper')}
            </p>

          </div>

        </div>

        <div className="
          flex gap-3
          px-6 py-5
          border-t border-outline-variant/10
        ">

          <button
            onClick={onClose}
            className="
              flex-1 py-3
              rounded-xl
              border border-outline-variant/10
              text-sm font-bold
              hover:border-primary/20
              transition-all
            "
          >
            {t('common.cancel')}
          </button>

          <button
            onClick={() => onSave(amount)}
            className="
              flex-1 py-3
              rounded-xl
              bg-primary
              hover:bg-red-700
              text-white
              text-sm font-black
              uppercase tracking-wider
              transition-all
            "
          >
            {t('common.save')}
          </button>

        </div>

      </div>

    </div>
  );
}