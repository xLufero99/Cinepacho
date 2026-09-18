import api from './api';

export const getInventarioBySede = async (sedeId) => {
    try {
        const response = await api.get(`/inventario/sede/${sedeId}`);
        return response.data;
    } catch (error) {
        console.error('Error loading inventory by sede:', error);
        throw error;
    }
};

export const getInventarioById = async (id) => {
    try {
        const response = await api.get(`/inventario/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error loading inventory by id:', error);
        throw error;
    }
};

export const updateInventoryStock = async (id, cantidad, sedeId) => {
    try {
        const response = await api.patch(`/inventario/${id}/stock`, null, {
            params: { cantidad, sedeId }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating inventory stock:', error);
        throw error;
    }
};

export const createInventoryItem = async (inventario) => {
    try {
        const response = await api.post('/inventario', inventario);
        return response.data;
    } catch (error) {
        console.error('Error creating inventory item:', error);
        throw error;
    }
};

export const deleteInventoryItem = async (id, sedeId) => {
    try {
        const response = await api.delete(`/inventario/${id}`, {
            params: sedeId ? { sedeId } : undefined
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        throw error;
    }
};
