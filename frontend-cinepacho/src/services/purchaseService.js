import api from './api';

export const createPurchase = async (payload) => {
  const response = await api.post('/compras', payload);
  return response.data;
};

export const processPayment = async (compraId) => {
  const response = await api.post(`/compras/${compraId}/pagar`);
  return response.data;
};

export const purchaseSnacksOnly = async (usuarioId, sedeId, cart, metodoPago = 'EFECTIVO') => {
  const compraData = {
    usuarioId: usuarioId,
    sedeId: sedeId,
    compra: cart.map(item => ({
      tipo: 'snack',
      referenciaId: String(item.id),
      cantidad: Number(item.quantity),
      precioUnitario: Number(item.price),
      subtotal: Number(item.price) * Number(item.quantity),
      detalle: item.name
    })),
    metodoPago: metodoPago
  };
  
  const response = await api.post('/compras', compraData);
  return response.data;
};

export const getUserPurchases = async (usuarioId) => {
  const response = await api.get(`/compras/usuario/${usuarioId}`);
  return response.data;
};

export const getPurchasesBySede = async (sedeId) => {
  const url = `/reportes/compras/sede/${sedeId}`;
  // Debug logging to help trace which sedeId is being requested and what the backend returns
  // eslint-disable-next-line no-console
  console.debug('getPurchasesBySede -> requesting URL:', url);
  const response = await api.get(url);
  // eslint-disable-next-line no-console
  console.debug('getPurchasesBySede -> response length:', Array.isArray(response.data) ? response.data.length : 'non-array', response.data && response.data.slice ? response.data.slice(0, 3) : response.data);
  return response.data;
};