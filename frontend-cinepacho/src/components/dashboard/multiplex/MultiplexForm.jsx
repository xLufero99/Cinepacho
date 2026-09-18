import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../ui/Button';

const clases = {
  input:
    'w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface font-body placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all',

  label:
    'block font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80 mb-1.5'
};

export default function MultiplexForm({
  initial,
  onSave,
  onCancel
}) {

  const { t } = useTranslation();

  const [form, setForm] = useState(
    initial || {
      _id: '',
      nombre: '',
      ciudad: '',
      direccion: '',
      url_imagen: '',  // ✅ CORREGIDO: antes era 'imagen_url'
      configuracion_sillas: {
        filas: 10,
        columnas: 12
      }
    }
  );

  const isEditing = !!initial?._id;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      configuracion_sillas: {
        filas: Number(form.configuracion_sillas.filas),
        columnas: Number(form.configuracion_sillas.columnas)
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body">

      {/* NOMBRE */}
      <div>
        <label className={clases.label}>
          {t('dashboard.multiplexForm.name')}
        </label>
        <input
          required
          className={clases.input}
          placeholder="Ej: Cine Pacho Titán Plaza"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </div>

      {/* CIUDAD */}
      <div>
        <label className={clases.label}>
          {t('dashboard.multiplexForm.city')}
        </label>
        <input
          required
          className={clases.input}
          placeholder="Ej: Bogotá"
          value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
        />
      </div>

      {/* DIRECCION */}
      <div>
        <label className={clases.label}>
          {t('dashboard.multiplexForm.address')}
        </label>
        <input
          required
          className={clases.input}
          placeholder="Ej: Av. Carrera 72 #80-94"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />
      </div>

      {/* IMAGEN - CORREGIDO */}
      <div>
        <label className={clases.label}>
          {t('dashboard.multiplexForm.image')}
        </label>
        <input
          className={clases.input}
          placeholder="https://..."
          value={form.url_imagen}
          onChange={(e) => setForm({ ...form, url_imagen: e.target.value })}
        />
      </div>

      {/* CONFIGURACION SILLAS */}
      <div className="border-t border-outline-variant/5 pt-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-4">
          {t('dashboard.multiplexForm.seatConfiguration')}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={clases.label}>
              {t('dashboard.multiplexForm.rows')}
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              className={clases.input}
              value={form.configuracion_sillas.filas}
              onChange={(e) => setForm({
                ...form,
                configuracion_sillas: {
                  ...form.configuracion_sillas,
                  filas: Number(e.target.value)
                }
              })}
            />
          </div>
          <div>
            <label className={clases.label}>
              {t('dashboard.multiplexForm.columns')}
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              className={clases.input}
              value={form.configuracion_sillas.columnas}
              onChange={(e) => setForm({
                ...form,
                configuracion_sillas: {
                  ...form.configuracion_sillas,
                  columnas: Number(e.target.value)
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-5 border-t border-outline-variant/5">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="font-label text-xs tracking-wider"
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          className="font-label text-xs tracking-wider"
        >
          {isEditing
            ? t('dashboard.multiplexForm.updateMultiplex')
            : t('dashboard.multiplexForm.registerMultiplex')}
        </Button>
      </div>
    </form>
  );
}