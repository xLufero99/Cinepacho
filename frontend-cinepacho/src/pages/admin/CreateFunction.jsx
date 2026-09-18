import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import { getPeliculas } from '../../services/peliculaService';
import { getMultiplexes } from '../../services/multiplexService';
import { getSalasBySede } from '../../services/salaService';
import { createFuncion, getFuncionesBySede } from '../../services/adminFuncionService';

export default function CreateFunction() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const getEntityId = (entity) => entity?.id || entity?._id || '';

    const [formData, setFormData] = useState({
        peliculaId: '',
        sedeId: '',
        salaId: '',
        fecha: '',
        hora: '',
        formato: '2D',
        precioGeneral: '15000',
        precioPreferencial: '20000'
    });

    const [peliculas, setPeliculas] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [salas, setSalas] = useState([]);
    const [funcionesSede, setFuncionesSede] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSalas, setLoadingSalas] = useState(false);
    const [loadingFunciones, setLoadingFunciones] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Cargar películas y sedes al montar
    useEffect(() => {
        const loadData = async () => {
            try {
                const [peliculasData, sedesData] = await Promise.all([
                    getPeliculas(),
                    getMultiplexes()
                ]);
                setPeliculas(peliculasData);
                setSedes(sedesData);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Cargar salas cuando se selecciona una sede
    useEffect(() => {
        if (formData.sedeId) {
            const loadSalas = async () => {
                try {
                    setLoadingSalas(true);
                    const salasData = await getSalasBySede(formData.sedeId);
                    const salasDisponibles = Array.isArray(salasData)
                        ? salasData.filter((sala) => String(sala.estado || '').toLowerCase() === 'activa')
                        : [];
                    setSalas(salasDisponibles);
                } catch (err) {
                    console.error('Error loading salas:', err);
                    setError('Error al cargar las salas de la sede seleccionada');
                    setSalas([]);
                } finally {
                    setLoadingSalas(false);
                }
            };
            loadSalas();
        } else {
            setSalas([]);
            setFuncionesSede([]);
            setFormData(prev => ({
                ...prev,
                salaId: ''
            }));
        }
    }, [formData.sedeId]);

    useEffect(() => {
        if (!formData.sedeId) {
            return;
        }

        const loadFunciones = async () => {
            try {
                setLoadingFunciones(true);
                const funcionesData = await getFuncionesBySede(formData.sedeId);
                setFuncionesSede(Array.isArray(funcionesData) ? funcionesData : []);
            } catch (err) {
                console.error('Error loading existing funciones for sede:', err);
                setFuncionesSede([]);
            } finally {
                setLoadingFunciones(false);
            }
        };

        loadFunciones();
    }, [formData.sedeId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            if (name === 'sedeId') {
                return {
                    ...prev,
                    sedeId: value,
                    salaId: ''
                };
            }

            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            if (!formData.sedeId || !formData.salaId || !formData.peliculaId) {
                setError('Debes completar película, sede y sala antes de guardar');
                return;
            }

            if (loadingFunciones) {
                setError('Validando disponibilidad de la sala, intenta de nuevo en unos segundos');
                return;
            }

            // Mantener hora en formato HH:mm
            const horaFormatted = formData.hora.length === 5 
                ? formData.hora 
                : formData.hora.slice(0, 5);

            const conflictoExistente = funcionesSede.some((funcion) => {
                const fechaExistente = String(funcion.fecha || '').slice(0, 10);
                const horaExistente = String(funcion.hora || '').slice(0, 5);
                const horaNueva = String(horaFormatted || '').slice(0, 5);

                return String(funcion.sedeId) === String(formData.sedeId)
                    && String(funcion.salaId) === String(formData.salaId)
                    && fechaExistente === String(formData.fecha)
                    && horaExistente === horaNueva;
            });

            if (conflictoExistente) {
                setError('Ya existe una función en esta sede, sala y hora');
                return;
            }

            const funcionData = {
                peliculaId: formData.peliculaId,
                sedeId: formData.sedeId,
                salaId: formData.salaId,
                fecha: formData.fecha,
                hora: horaFormatted,
                formato: formData.formato,
                precioGeneral: parseFloat(formData.precioGeneral),
                precioPreferencial: parseFloat(formData.precioPreferencial)
            };

            await createFuncion(funcionData);
            navigate('/admin/programacion');
        } catch (err) {
            console.error('Error creating funcion:', err);
            const backendMessage = err.response?.data?.message || err.response?.data || '';
            setError(
                backendMessage || 'Error al crear la función. Por favor, verifica los datos.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout showFooter={false}>
                <Container>
                    <div className="flex justify-center items-center min-h-screen">
                        <p className="text-on-surface">Cargando...</p>
                    </div>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout showFooter={false}>
            <Container>
                <div className="max-w-4xl mx-auto py-12">
                    <SectionTitle
                        subtitle={t('admin.createFunction.subtitle')}
                        className="mb-8"
                    >
                        {t('admin.createFunction.title')}
                    </SectionTitle>

                    {error && (
                        <div className="bg-error-container text-error p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selección de Película */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.movie')}
                            </label>
                            <select
                                name="peliculaId"
                                value={formData.peliculaId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">{t('admin.createFunction.selectMovie')}</option>
                                {peliculas.map(pelicula => (
                                    <option key={getEntityId(pelicula)} value={getEntityId(pelicula)}>
                                        {pelicula.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selección de Sede */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.headquarters')}
                            </label>
                            <select
                                name="sedeId"
                                value={formData.sedeId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">{t('admin.createFunction.selectHeadquarters')}</option>
                                {sedes.map(sede => (
                                    <option key={getEntityId(sede)} value={getEntityId(sede)}>
                                        {sede.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selección de Sala */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.room')}
                            </label>
                            <select
                                name="salaId"
                                value={formData.salaId}
                                onChange={handleChange}
                                required
                                disabled={!formData.sedeId || loadingSalas}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                <option value="">
                                    {loadingSalas
                                        ? 'Cargando salas...'
                                        : t('admin.createFunction.selectRoom')}
                                </option>
                                {salas.map(sala => (
                                    <option key={getEntityId(sala)} value={getEntityId(sala)}>
                                        {sala.nombre} - {t('admin.createFunction.capacity')}: {(sala.capacidadGeneral || 0) + (sala.capacidadPreferencial || 0)}
                                    </option>
                                ))}
                            </select>
                            {!loadingSalas && formData.sedeId && salas.length === 0 && (
                                <p className="mt-2 text-sm text-on-surface-variant">
                                    No hay salas activas disponibles para esta sede.
                                </p>
                            )}
                        </div>

                        {/* Fecha */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.date')}
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                placeholder={t('admin.createFunction.dateFormat')}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Hora */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.time')}
                            </label>
                            <input
                                type="time"
                                name="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                required
                                placeholder={t('admin.createFunction.timeFormat')}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Formato */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.format')}
                            </label>
                            <select
                                name="formato"
                                value={formData.formato}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="2D">2D</option>
                                <option value="3D">3D</option>
                                <option value="IMAX">IMAX</option>
                            </select>
                        </div>

                        {/* Precio General */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.generalPrice')}
                            </label>
                            <input
                                type="number"
                                name="precioGeneral"
                                value={formData.precioGeneral}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder={t('admin.createFunction.pricePlaceholder')}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Precio Preferencial */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {t('admin.createFunction.preferentialPrice')}
                            </label>
                            <input
                                type="number"
                                name="precioPreferencial"
                                value={formData.precioPreferencial}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder={t('admin.createFunction.pricePlaceholder')}
                                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-6">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/admin/dashboard')}
                                className="flex-1"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Container>
        </MainLayout>
    );
}
