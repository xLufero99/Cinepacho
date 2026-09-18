import api from './api';

// GET /admin/funciones/sede/{sedeId} - Listar funciones por sede
export const getFuncionesBySede = async (sedeId) => {
    try {
        const response = await api.get(`/admin/funciones/sede/${sedeId}`);
        return response.data;
    } catch (error) {
        console.error('Error loading funciones by sede:', error);
        throw error;
    }
};

// POST /admin/funciones - Crear nueva función
export const createFuncion = async (funcionData) => {
    try {
        const response = await api.post('/admin/funciones', funcionData);
        return response.data;
    } catch (error) {
        console.error('Error creating funcion:', error);
        throw error;
    }
};

// PUT /admin/funciones/{id} - Actualizar función
export const updateFuncion = async (id, funcionData) => {
    try {
        const response = await api.put(`/admin/funciones/${id}`, funcionData);
        return response.data;
    } catch (error) {
        console.error('Error updating funcion:', error);
        throw error;
    }
};

// DELETE /admin/funciones/{id} - Eliminar función
export const deleteFuncion = async (id) => {
    try {
        await api.delete(`/admin/funciones/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting funcion:', error);
        throw error;
    }
};

export const getAllFunciones = async () => {
    try {
        const response = await api.get('/admin/funciones');
        return response.data;
    } catch (error) {
        console.error('Error loading all funciones:', error);
        throw error;
    }
};
