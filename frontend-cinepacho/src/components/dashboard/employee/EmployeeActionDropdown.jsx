import { useState } from 'react';

import { useTranslation } from 'react-i18next';

export default function EmployeeActionsDropdown({
  employee,
  onPromote,
  onDegrade,
  onViewHistory,
  onFire
}) {

  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">

      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center hover:border-primary/20 hover:text-primary transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">
          more_vert
        </span>
      </button>

      {isOpen && (

        <div className="absolute right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden z-50">

          <button
            onClick={() => onPromote(employee)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-emerald-500/10 text-left"
          >
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">
              arrow_upward
            </span>

            {t('employee.actions.promote')}
          </button>

          <button
            onClick={() => onDegrade(employee)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-amber-500/10 text-left"
          >
            <span className="material-symbols-outlined text-amber-400 text-[18px]">
              arrow_downward
            </span>

            {t('employee.actions.degrade')}
          </button>

          <button
            onClick={() => onViewHistory(employee)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 text-left"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">
              history
            </span>

            {t('employee.actions.viewHistory')}
          </button>

          <button
            onClick={() => onFire(employee)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10 text-left text-red-400"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_off
            </span>

            {t('employee.actions.fire')}
          </button>

        </div>

      )}

    </div>
  );
}