import api from './api';

// GET /peliculas (endpoint correcto para películas)
export const getMovies = async () => {
    try {
        const response = await api.get('/peliculas');
        console.log('Películas del backend:', response.data);
        
        // Siempre devolver lo que diga el backend (aunque esté vacío)
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        
        return [];  // Array vacío si no hay datos
        
    } catch (error) {
        console.error('Error cargando películas:', error);
        // ❌ NO devuelvas datos hardcodeados
        return [];
    }
};

// GET /peliculas/:id (endpoint correcto para detalle de película)
export const getMovieById = async (movieId) => {
    try {
        const response = await api.get(`/peliculas/${movieId}`);
        if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error cargando película:', error);
        return null;
    }
};