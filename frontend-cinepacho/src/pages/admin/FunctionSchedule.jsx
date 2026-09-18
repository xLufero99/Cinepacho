import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteFuncion, getAllFunciones } from '../../services/adminFuncionService';
import { getMultiplexes } from '../../services/multiplexService';
import { getPeliculas } from '../../services/peliculaService';
import { getSalasBySede } from '../../services/salaService';

export default function FunctionSchedule() {
  const { t, i18n } = useTranslation();
  const [funciones, setFunciones] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [selectedSedeId, setSelectedSedeId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [funcionIdToDelete, setFuncionIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
    loadFunciones();
  }, []);

  const loadData = async () => {
    try {
      const [sedesData, peliculasData, funcionesData] = await Promise.all([
        getMultiplexes(),
        getPeliculas(),
        getAllFunciones()
      ]);
      setSedes(sedesData);
      setPeliculas(peliculasData);
      setFunciones(Array.isArray(funcionesData) ? funcionesData : []);

      const salasPromises = (sedesData || []).map(async (sede) => {
        const sedeId = sede.id || sede._id;
        const salasDeSede = await getSalasBySede(sedeId);
        return Array.isArray(salasDeSede)
          ? salasDeSede.map((sala) => ({ ...sala, sedeId }))
          : [];
      });

      const salasData = await Promise.all(salasPromises);
      setSalas(salasData.flat());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadFunciones = async () => {
    try {
      setLoading(true);
      const data = await getAllFunciones();
      setFunciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading funciones:', error);
      setFunciones([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFunciones = useMemo(() => {
    if (selectedSedeId === 'all') {
      return funciones;
    }
    return funciones.filter(f => String(f.sedeId) === String(selectedSedeId));
  }, [funciones, selectedSedeId]);

  const groupedFunciones = useMemo(() => {
    const grouped = {};
    const locale = (i18n.resolvedLanguage || i18n.language || 'es').toLowerCase().startsWith('en')
      ? 'en-US'
      : 'es-CO';

    filteredFunciones.forEach(funcion => {
      const date = funcion.fecha ? new Date(funcion.fecha).toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Sin fecha';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(funcion);
    });
    return grouped;
  }, [filteredFunciones, i18n.resolvedLanguage, i18n.language]);

  const getPeliculaById = (id) => {
    return peliculas.find(p => p.id === id || p._id === id);
  };

  const getSedeById = (id) => {
    return sedes.find(s => s.id === id || s._id === id);
  };

  const getSalaById = (id) => {
    return salas.find(s => String(s.id || s._id) === String(id));
  };

  const handleDelete = async (funcionId) => {
    setFuncionIdToDelete(funcionId);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!funcionIdToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteFuncion(funcionIdToDelete);
      loadFunciones();
      setIsConfirmOpen(false);
      setFuncionIdToDelete(null);
    } catch (error) {
      console.error('Error deleting funcion:', error);
      alert('Error al eliminar la función');
    }
    finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setFuncionIdToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-on-surface-variant">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-headline uppercase tracking-tight">
            {t('admin.functionSchedule.title')}
            <span className="text-primary italic"> {t('admin.functionSchedule.titleAccent')}</span>
          </h1>
          <p className="text-on-surface-variant mt-2">
            {t('admin.functionSchedule.subtitle')}
          </p>
        </div>

        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-surface-container-low rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-sm">{t('admin.functionSchedule.filterBySede')}:</span>
            <select
              value={selectedSedeId}
              onChange={(e) => setSelectedSedeId(e.target.value)}
              className="px-4 py-2 rounded-lg bg-surface-variant/40 text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t('admin.functionSchedule.allSedes')}</option>
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="font-medium">{t('admin.functionSchedule.totalFunctions')}:</span>
            <span className="text-primary font-bold">{filteredFunciones.length}</span>
          </div>
        </div>
      </div>

      {/* Functions Display */}
      {Object.keys(groupedFunciones).length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center border border-outline-variant/10">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
            event_busy
          </span>
          <p className="text-on-surface-variant text-lg">
            {t('admin.functionSchedule.noFunctions')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFunciones).map(([date, dayFunciones]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-2xl font-bold text-white font-headline uppercase tracking-tight border-b border-outline-variant/20 pb-2">
                {date}
              </h2>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayFunciones.map(funcion => {
                    const pelicula = getPeliculaById(funcion.peliculaId);
                    const sede = getSedeById(funcion.sedeId);
                    return (
                      <div
                        key={funcion.id}
                        className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all group"
                      >
                        <div className="relative h-48 bg-surface-variant">
                          {pelicula?.urlPoster || pelicula?.url_poster ? (
                            <img
                              src={pelicula.urlPoster || pelicula.url_poster}
                              alt={pelicula?.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
                                movie
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-bold">{funcion.hora}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-white font-bold text-lg line-clamp-2">
                              {pelicula?.nombre || 'Sin película'}
                            </h3>
                            <p className="text-on-surface-variant text-sm mt-1">
                              {sede?.nombre || 'Sin sede'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-primary text-lg">
                              theater_comedy
                            </span>
                            <span className="text-on-surface-variant">
                              {getSalaById(funcion.salaId)?.nombre || 'Sin sala'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-secondary text-lg">
                              format
                            </span>
                            <span className="text-on-surface-variant">
                              {funcion.formato || '2D'}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => window.location.href = `/admin/create-function?edit=${funcion.id}`}
                              className="flex-1 px-3 py-2 bg-surface-variant/40 text-on-surface rounded-lg hover:bg-surface-variant/60 transition-colors text-sm font-medium"
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(funcion.id)}
                              className="px-3 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors text-sm font-medium"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
                  <table className="w-full">
                    <thead className="bg-surface-variant/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-on-surface-variant text-sm font-medium">
                          {t('admin.functionSchedule.movie')}
                        </th>
                        <th className="px-4 py-3 text-left text-on-surface-variant text-sm font-medium">
                          {t('admin.functionSchedule.sede')}
                        </th>
                        <th className="px-4 py-3 text-left text-on-surface-variant text-sm font-medium">
                          {t('admin.functionSchedule.room')}
                        </th>
                        <th className="px-4 py-3 text-left text-on-surface-variant text-sm font-medium">
                          {t('admin.functionSchedule.time')}
                        </th>
                        <th className="px-4 py-3 text-left text-on-surface-variant text-sm font-medium">
                          {t('admin.functionSchedule.format')}
                        </th>
                        <th className="px-4 py-3 text-right text-on-surface-variant text-sm font-medium">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayFunciones.map(funcion => {
                        const pelicula = getPeliculaById(funcion.peliculaId);
                        const sede = getSedeById(funcion.sedeId);
                        return (
                          <tr key={funcion.id} className="border-t border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {pelicula?.urlPoster || pelicula?.url_poster ? (
                                  <img
                                    src={pelicula.urlPoster || pelicula.url_poster}
                                    alt={pelicula?.nombre}
                                    className="w-12 h-16 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-16 bg-surface-variant rounded flex items-center justify-center">
                                    <span className="material-symbols-outlined text-on-surface-variant/30">
                                      movie
                                    </span>
                                  </div>
                                )}
                                <span className="text-white font-medium">{pelicula?.nombre || 'Sin película'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">
                              {sede?.nombre || 'Sin sede'}
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">
                              {getSalaById(funcion.salaId)?.nombre || 'Sin sala'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                {funcion.hora}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">
                              {funcion.formato || '2D'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => window.location.href = `/admin/create-function?edit=${funcion.id}`}
                                  className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(funcion.id)}
                                  className="p-2 text-on-surface-variant hover:text-error transition-colors"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Modal de confirmación para eliminar
function ConfirmDeleteModal({ isOpen, onConfirm, onCancel, isDeleting }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-container mb-4">
            <span className="material-symbols-outlined text-error text-lg">warning</span>
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            ¿Eliminar función?
          </h2>
          <p className="text-on-surface-variant text-sm mt-2">
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-6 py-2 rounded-lg bg-surface-variant text-on-surface hover:bg-surface-variant/80 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 rounded-lg bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                Eliminando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">delete</span>
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
