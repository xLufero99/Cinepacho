import api from './api';

// Obtener snacks por sede (desde el backend real)
export const getSnacksBySede = async (sedeId) => {
    try {
        const response = await api.get(`/inventario/publico/sede/${sedeId}`);
        // Transformar los datos del backend al formato que usa el frontend
        return response.data.map(snack => ({
    id: snack.id,
    name: snack.nombre,
    description: `${snack.marca || 'Snack'} - ${snack.nombre}`,
    price: snack.precio,
    points: 5,
    image: snack.imageUrl || "https://via.placeholder.com/150",  // ← Usar imageUrl
    category: "snack",
    featured: false,
    cantidad: snack.cantidad,
    disponible: snack.disponible
}));
    } catch (error) {
        console.error('Error fetching snacks:', error);
        return [];
    }
};

// Mantener getSnacks por compatibilidad (usa la sede del contexto)
export const getSnacks = async () => {
    console.warn('getSnacks deprecated - use getSnacksBySede instead');
    return [];
};

export const createSnack = async (snackData) => {
    const response = await api.post('/inventario', snackData);
    return response.data;
};

export const checkSnackAvailability = async (inventarioId) => {
    try {
        const response = await api.get(`/inventario/${inventarioId}/disponible`);
        return response.data;
    } catch (error) {
        console.error('Error checking availability:', error);
        return 0;
    }
};