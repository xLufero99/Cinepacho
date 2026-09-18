import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SuccessModal({ isOpen, title, message, onClose, type = 'success' }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const isError = type === 'error';
  const icon = isError ? 'error' : 'check_circle';
  const bgClass = isError ? 'bg-error/10' : 'bg-secondary/10';
  const iconColor = isError ? 'text-error' : 'text-secondary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-md w-full bg-surface-container rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`${bgClass} w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
            <div className="text-sm text-on-surface-variant whitespace-pre-wrap">{message}</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 bg-primary rounded-md text-white font-medium">{t('common.close') || 'OK'}</button>
        </div>
      </div>
    </div>
  );
}
