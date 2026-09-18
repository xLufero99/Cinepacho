import api from './api';

// GET /peliculas - Obtener todas las películas
export const getPeliculas = async () => {
    try {
        const response = await api.get('/peliculas');
        return response.data;
    } catch (error) {
        console.error('Error loading peliculas:', error);
        throw error;
    }
};

// GET /peliculas/cartelera - Obtener películas en cartelera
export const getPeliculasCartelera = async () => {
    try {
        const response = await api.get('/peliculas/cartelera');
        return response.data;
    } catch (error) {
        console.error('Error loading peliculas cartelera:', error);
        throw error;
    }
};

// GET /peliculas/{id} - Obtener película por ID
export const getPeliculaById = async (id) => {
    try {
        const response = await api.get(`/peliculas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error loading pelicula by id:', error);
        throw error;
    }
};

// POST /peliculas - Crear película
export const createPelicula = async (pelicula) => {
    try {
        const response = await api.post('/peliculas', pelicula);
        return response.data;
    } catch (error) {
        console.error('Error creating pelicula:', error);
        throw error;
    }
};

// DELETE /peliculas/{id} - Eliminar película
export const deletePelicula = async (id) => {
    try {
        const response = await api.delete(`/peliculas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting pelicula:', error);
        throw error;
    }
};
