import api from './api';

// GET /salas - Obtener todas las salas
export const getSalas = async () => {
    try {
        const response = await api.get('/salas');
        return response.data;
    } catch (error) {
        console.error('Error loading salas:', error);
        throw error;
    }
};

// GET /salas/sede/{sedeId} - Obtener salas por sede
export const getSalasBySede = async (sedeId) => {
    try {
        const response = await api.get(`/salas/sede/${sedeId}`);
        return response.data;
    } catch (error) {
        console.error('Error loading salas by sede:', error);
        throw error;
    }
};

// GET /salas/{id} - Obtener sala por ID
export const getSalaById = async (id) => {
    try {
        const response = await api.get(`/salas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error loading sala by id:', error);
        throw error;
    }
};
