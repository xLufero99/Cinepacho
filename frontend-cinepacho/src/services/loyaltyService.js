import api from './api';
import { loyaltyConfig } from '../data/loyalty';

// GET /cliente/mis-puntos (placeholder endpoint)
export const getUserPoints = async (userId) => {
    try {
        const response = await api.get('/cliente/mis-puntos');
        // If backend returns actual data, use it
        if (response.data && typeof response.data === 'object') {
            return response.data;
        }
        // Fallback to hardcoded config if backend returns placeholder
        return { puntos: 0, config: loyaltyConfig };
    } catch (error) {
        console.warn('Backend endpoint not available, using hardcoded loyalty config');
        // Fallback to hardcoded config
        return { puntos: 0, config: loyaltyConfig };
    }
};

export const getLoyaltyConfig = async () => {
    try {
        const response = await api.get('/cliente/mis-puntos/config');
        if (response.data) {
            return response.data;
        }
        // Fallback to hardcoded config
        return loyaltyConfig;
    } catch (error) {
        console.warn('Backend endpoint not available, using hardcoded loyalty config');
        return loyaltyConfig;
    }
};
