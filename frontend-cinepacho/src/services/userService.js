import api from './api';

const normalizeUser = (user) => ({
  id: user.id,
  cedula: user.cedula || '',
  nombre: user.nombre || '',
  apellido: user.apellido || '',
  email: user.email || '',
  telefono: user.telefono || '',
  direccion: user.direccion || '',
  rol: user.rol || 'CLIENTE',
  puntos: user.puntos || null,
  calificaciones: Array.isArray(user.calificaciones) ? user.calificaciones : [],
  createdAt: user.createdAt || null,
  updatedAt: user.updatedAt || null
});

const serializeUser = (user) => ({
  cedula: user.cedula?.trim(),
  nombre: user.nombre?.trim(),
  apellido: user.apellido?.trim(),
  email: user.email?.trim(),
  telefono: user.telefono?.trim(),
  direccion: user.direccion?.trim(),
  contrasena: user.contrasena?.trim(),
  rol: user.rol?.trim() || 'CLIENTE'
});

export const getAllUsers = async () => {
  const response = await api.get('/usuarios');
  return Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
};

export const getUserById = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return normalizeUser(response.data);
};

export const getUserByEmail = async (email) => {
  const response = await api.get(`/usuarios/email/${email}`);
  return normalizeUser(response.data);
};

export const createUser = async (userData) => {
  const response = await api.post('/auth/register', serializeUser(userData));
  return normalizeUser(response.data);
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/usuarios/${id}`, serializeUser(userData));
  return normalizeUser(response.data);
};

export const deleteUser = async (id) => {
  await api.delete(`/usuarios/${id}`);
  return true;
};

export const getUserPoints = async (id) => {
  const response = await api.get(`/usuarios/${id}/puntos`);
  return response.data;
};

export const getUserPointsHistory = async (id) => {
  const response = await api.get(`/usuarios/${id}/puntos/historial`);
  return response.data;
};

export const getUserBoletas = async (id) => {
  const response = await api.get(`/usuarios/${id}/boletas`);
  return response.data;
};

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUserPoints,
  getUserPointsHistory,
  getUserBoletas
};
