import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CredentialModal({ isOpen, credentialInfo, onClose }) {
  const { t } = useTranslation();

  if (!isOpen || !credentialInfo) return null;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // optionally show a small feedback — omitted for brevity
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-container border border-outline-variant/10 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10">
          <h3 className="text-lg font-black text-white">{t('employee.credentials.title')}</h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">{t('employee.credentials.email')}</div>
            <div className="mt-2 flex items-center">
              <span className="font-mono text-sm text-white break-all">{credentialInfo.email}</span>
              <button onClick={() => copy(credentialInfo.email)} className="ml-3 px-3 py-1 bg-primary rounded-md text-sm font-bold">{t('common.copy')}</button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">{t('employee.credentials.password')}</div>
            <div className="mt-2 flex items-center">
              <span className="font-mono text-sm text-white break-all">{credentialInfo.password}</span>
              <button onClick={() => copy(credentialInfo.password)} className="ml-3 px-3 py-1 bg-primary rounded-md text-sm font-bold">{t('common.copy')}</button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="px-5 py-3 rounded-xl border border-outline-variant/10 text-sm font-bold hover:border-primary/20">{t('common.done')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
