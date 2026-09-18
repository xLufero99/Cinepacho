import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import { createPelicula } from '../../services/peliculaService';

const CLASSIFICATIONS = [
  { value: 'G', labelKey: 'admin.movieForm.classifications.g' },
  { value: 'PG', labelKey: 'admin.movieForm.classifications.pg' },
  { value: 'PG-13', labelKey: 'admin.movieForm.classifications.pg13' },
  { value: 'R', labelKey: 'admin.movieForm.classifications.r' },
  { value: 'NC-17', labelKey: 'admin.movieForm.classifications.nc17' }
];

const MAX_DURATION = 420;

function TagInput({
  label,
  value,
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Agregar
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant text-sm text-on-surface"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-error hover:opacity-80"
                aria-label={`Eliminar ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateMovie() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [genreInput, setGenreInput] = useState('');
  const [protagonistInput, setProtagonistInput] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracionMin: 120,
    clasificacion: 'PG-13',
    urlPoster: '',
    generos: [],
    protagonistas: [],
    director: ''
  });

  const durationLabel = useMemo(() => `${formData.duracionMin} min`, [formData.duracionMin]);

  const posterPreviewUrl = formData.urlPoster.trim();

  const addGenre = () => {
    const nextValue = genreInput.trim();
    if (!nextValue) {
      return;
    }

    setFormData((prev) => {
      if (prev.generos.some((genre) => genre.toLowerCase() === nextValue.toLowerCase())) {
        return prev;
      }

      return {
        ...prev,
        generos: [...prev.generos, nextValue]
      };
    });
    setGenreInput('');
  };

  const addProtagonist = () => {
    const nextValue = protagonistInput.trim();
    if (!nextValue) {
      return;
    }

    setFormData((prev) => {
      if (prev.protagonistas.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
        return prev;
      }

      return {
        ...prev,
        protagonistas: [...prev.protagonistas, nextValue]
      };
    });
    setProtagonistInput('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.nombre.trim() || !formData.descripcion.trim() || !formData.director.trim()) {
      setError(t('admin.movieForm.validation.requiredFields'));
      return;
    }

    if (formData.generos.length === 0) {
      setError(t('admin.movieForm.validation.atLeastOneGenre'));
      return;
    }

    if (formData.protagonistas.length === 0) {
      setError(t('admin.movieForm.validation.atLeastOneProtagonist'));
      return;
    }

    setSubmitting(true);

    try {
      await createPelicula({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        duracionMin: Number(formData.duracionMin),
        clasificacion: formData.clasificacion,
        urlPoster: formData.urlPoster.trim(),
        generos: formData.generos,
        protagonistas: formData.protagonistas,
        director: formData.director.trim(),
        estreno: true,
        calificacionPromedio: 0,
        totalCalificaciones: 0
      });

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error creating movie:', err);
      const backendMessage = err.response?.data?.message || err.response?.data || '';
      setError(backendMessage || t('admin.movieForm.validation.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <Container>
        <div className="max-w-5xl mx-auto py-12">
          <SectionTitle subtitle={t('admin.movieForm.createSubtitle')} className="mb-8">
            {t('admin.movieForm.createTitle')}
          </SectionTitle>

          {error && (
            <div className="mb-6 rounded-xl border border-error/20 bg-error-container text-error px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('admin.movieForm.movieName')}
                </label>
                <input
                  value={formData.nombre}
                  onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('admin.movieForm.movieNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('admin.movieForm.director')}
                </label>
                <input
                  value={formData.director}
                  onChange={(event) => setFormData({ ...formData, director: event.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('admin.movieForm.directorPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('admin.movieForm.classification')}
                </label>
                <select
                  value={formData.clasificacion}
                  onChange={(event) => setFormData({ ...formData, clasificacion: event.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CLASSIFICATIONS.map((classification) => (
                    <option key={classification.value} value={classification.value}>
                      {t(classification.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('admin.movieForm.posterUrl')}
                </label>
                <input
                  value={formData.urlPoster}
                  onChange={(event) => setFormData({ ...formData, urlPoster: event.target.value })}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('admin.movieForm.posterUrlPlaceholder')}
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  {t('admin.movieForm.posterUrlHelp')}
                </p>
                {posterPreviewUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high">
                    <img
                      src={posterPreviewUrl}
                      alt={formData.nombre || 'Vista previa del póster'}
                      className="h-64 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-on-surface">
                    {t('admin.movieForm.duration')}
                  </label>
                  <span className="text-sm text-on-surface-variant">{durationLabel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={MAX_DURATION}
                  value={formData.duracionMin}
                  onChange={(event) => setFormData({ ...formData, duracionMin: Number(event.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                  <span>{t('admin.movieForm.durationMin', { minutes: 1 })}</span>
                  <span>{t('admin.movieForm.durationMax', { minutes: MAX_DURATION })}</span>
                </div>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                {t('admin.movieForm.description')}
              </label>
              <textarea
                rows="5"
                value={formData.descripcion}
                onChange={(event) => setFormData({ ...formData, descripcion: event.target.value })}
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                placeholder={t('admin.movieForm.descriptionPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TagInput
                label={t('admin.movieForm.genres')}
                value={genreInput}
                items={formData.generos}
                onChange={setGenreInput}
                onAdd={addGenre}
                onRemove={(item) => setFormData((prev) => ({
                  ...prev,
                  generos: prev.generos.filter((genre) => genre !== item)
                }))}
                placeholder={t('admin.movieForm.genresPlaceholder')}
              />

              <TagInput
                label={t('admin.movieForm.protagonists')}
                value={protagonistInput}
                items={formData.protagonistas}
                onChange={setProtagonistInput}
                onAdd={addProtagonist}
                onRemove={(item) => setFormData((prev) => ({
                  ...prev,
                  protagonistas: prev.protagonistas.filter((protagonist) => protagonist !== item)
                }))}
                placeholder={t('admin.movieForm.protagonistsPlaceholder')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : t('admin.movieForm.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </MainLayout>
  );
}
