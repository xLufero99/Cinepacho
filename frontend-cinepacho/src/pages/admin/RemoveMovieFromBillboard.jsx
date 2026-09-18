import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import { deletePelicula, getPeliculas } from '../../services/peliculaService';

export default function RemoveMovieFromBillboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [peliculas, setPeliculas] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPeliculas = async () => {
      try {
        const peliculasData = await getPeliculas();
        setPeliculas(Array.isArray(peliculasData) ? peliculasData : []);
      } catch (err) {
        console.error('Error loading peliculas:', err);
        setError(t('admin.removeMovieForm.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadPeliculas();
  }, []);

  const selectedMovie = useMemo(
    () => peliculas.find((movie) => String(movie.id || movie._id) === String(selectedId)),
    [peliculas, selectedId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedId) {
      setError(t('admin.removeMovieForm.selectMovieRequired'));
      return;
    }

    setSubmitting(true);

    try {
      await deletePelicula(selectedId);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error deleting pelicula:', err);
      const backendMessage = err.response?.data?.message || err.response?.data || '';
      setError(backendMessage || t('admin.removeMovieForm.deleteFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <SectionTitle subtitle={t('admin.removeMovieForm.subtitle')} className="mb-8">
            {t('admin.removeMovieForm.title')}
          </SectionTitle>

          {loading ? (
            <div className="rounded-xl border border-outline-variant bg-surface-container px-4 py-6 text-on-surface-variant">
              {t('admin.removeMovieForm.loading')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-error/20 bg-error-container text-error px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('admin.removeMovieForm.selectMovie')}
                </label>
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t('admin.removeMovieForm.selectPlaceholder')}</option>
                  {peliculas.map((movie) => {
                    const movieId = movie.id || movie._id;
                    return (
                      <option key={movieId} value={movieId}>
                        {movie.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedMovie && (
                <div className="rounded-2xl border border-outline-variant bg-surface-container px-5 py-4 space-y-2">
                  <p className="text-sm text-on-surface-variant">{t('admin.removeMovieForm.selectedMovie')}</p>
                  <h3 className="text-xl font-semibold text-on-surface">{selectedMovie.nombre}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {selectedMovie.clasificacion} • {selectedMovie.duracionMin || selectedMovie.duracion || 'N/A'} min
                  </p>
                  <p className="text-sm text-on-surface-variant line-clamp-3">
                    {selectedMovie.descripcion}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting || !selectedId}>
                  {submitting ? t('admin.removeMovieForm.deleting') : t('admin.removeMovieForm.confirmDelete')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </MainLayout>
  );
}
