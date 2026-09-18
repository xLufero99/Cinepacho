import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

const DEFAULT_FORM = {
  codigo_empleado: '',
  cedula: '',
  nombre: '',
  apellido: '',
  telefono: '',
  direccion: '',
  salario: '',
  sede_id: '',
  cargo: 'director'
};

const ROLES = [
  'director',
  'encargado_sala',
  'cajero',
  'despachador_comida',
  'aseador'
];

export default function EmployeeCreateModal({
  isOpen,
  onClose,
  onCreate,
  multiplexes,
  isSaving
}) {

  const { t } = useTranslation();
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(DEFAULT_FORM);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-container border border-outline-variant/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
            {t('employee.management.create.badge')}
          </p>

          <h2 className="text-2xl font-black text-white uppercase">
            {t('employee.management.create.title')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('employee.form.codigoEmpleado')}
              </span>
              <input
                value={form.codigo_empleado}
                onChange={(e) => handleChange('codigo_empleado', e.target.value)}
                placeholder={t('employee.form.codigoPlaceholder')}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('employee.form.cedula')}
              </span>
              <input
                value={form.cedula}
                onChange={(e) => handleChange('cedula', e.target.value)}
                placeholder={t('employee.form.cedulaPlaceholder')}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('register.name')}
              </span>
              <input
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder={t('register.namePlaceholder')}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('register.lastName')}
              </span>
              <input
                value={form.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder={t('register.lastNamePlaceholder')}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('register.phone')}
              </span>
              <input
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="3001234567"
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('register.address')}
              </span>
              <input
                value={form.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder={t('register.addressPlaceholder')}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('employee.form.salario')}
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.salario}
                onChange={(e) => handleChange('salario', e.target.value)}
                placeholder={t('employee.form.salarioPlaceholder')}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('employee.table.multiplex')}
              </span>
              <select
                value={form.sede_id}
                onChange={(e) => handleChange('sede_id', e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="">{t('employee.form.selectMultiplex')}</option>
                {multiplexes.map((multiplex) => (
                  <option
                    key={multiplex.routerKey || multiplex._id}
                    value={multiplex.routerKey || multiplex._id}
                  >
                    {multiplex.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t('employee.table.role')}
              </span>
              <select
                value={form.cargo}
                onChange={(e) => handleChange('cargo', e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`employee.roles.${role}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-xs text-on-surface-variant">
            {t('employee.form.helper')}
          </p>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-outline-variant/10 text-sm font-bold hover:border-primary/20 transition-all"
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-primary hover:opacity-90 text-white text-sm font-black uppercase tracking-wider transition-all disabled:opacity-60"
            >
              {isSaving ? t('common.saving') : t('employee.management.create.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
