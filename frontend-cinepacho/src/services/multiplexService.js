import api from './api';

const normalizeSedeId = (sede) => sede?.id || sede?._id;

const normalizeSedes = (sedesData = []) => (
    sedesData.map((sede) => ({
        ...sede,
        id: normalizeSedeId(sede)
    }))
);

// Lista pública de sedes desde backend. No usamos plantilla local.
export const getMultiplexes = async () => {
    try {
        const response = await api.get('/sedes/publicas');
        if (Array.isArray(response.data)) {
            return normalizeSedes(response.data);
        }
    } catch (error) {
        console.error('Error loading sedes from backend:', error);
    }

    return [];
};

export const getMultiplexById = async (multiplexId) => {
    if (!multiplexId) {
        return null;
    }

    const normalizedTarget = String(multiplexId).trim().toLowerCase();

    try {
        const response = await api.get(`/sedes/${multiplexId}`);
        if (response.data) {
            return {
                ...response.data,
                id: normalizeSedeId(response.data)
            };
        }
    } catch (error) {
        console.error('Error loading sede from backend:', error);
    }

    try {
        const sedes = await getMultiplexes();
        const matchedSede = sedes.find((sede) => {
            const candidates = [sede.id, sede._id, sede.routerKey, sede.nombre];
            return candidates.some((value) => String(value || '').trim().toLowerCase() === normalizedTarget);
        });

        if (matchedSede) {
            return matchedSede;
        }
    } catch (error) {
        console.error('Error resolving sede from multiplex list:', error);
    }

    return null;
};