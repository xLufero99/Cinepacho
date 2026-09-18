import api from './api';

// POST /auth/login
export async function login(credentials) {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        const mensaje = error.response?.data?.message || 'Error en el login';
        const apiError = new Error(mensaje);
        apiError.response = error.response;
        apiError.details = error.response?.data?.errors || [];
        throw apiError;
    }
}

// POST /auth/register
export async function register(userData) {
    console.log("🔍 authService - register recibió:", userData);
    try {
        const response = await api.post('/auth/register', userData);
        console.log("✅ authService - status:", response.status);
        console.log("✅ authService - data:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ authService - error:", error);
        console.error("❌ authService - error.response:", error.response);
        console.error("❌ authService - error.response.data:", error.response?.data);
        const mensaje = error.response?.data?.message || 'Error en el registro';
        const apiError = new Error(mensaje);
        apiError.response = error.response;
        apiError.details = error.response?.data?.errors || [];
        throw apiError;
    }
}