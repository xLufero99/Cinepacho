import api from './api';

const normalizeHistorialEntry = (entry) => ({
  sede_id: entry.sedeId,
  cargo: entry.cargo,
  fecha_inicio: entry.fechaInicio,
  fecha_fin: entry.fechaFin
});

const normalizeEmployee = (employee) => ({
  id: employee.id,
  codigo_empleado: employee.codigoEmpleado,
  usuario_id: employee.usuarioId || '',
  salario: employee.salario ?? 0,
  sede_id: employee.sedeId || '',
  cargo: employee.cargo || '',
  historial_sedes: Array.isArray(employee.historialSedes)
    ? employee.historialSedes.map(normalizeHistorialEntry)
    : [],
  ultimo_cambio: employee.ultimoCambio || null
});

const normalizeUser = (user) => ({
  id: user.id,
  cedula: user.cedula || '',
  nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
  email: user.email || ''
});

const serializeEmployee = (employee) => ({
  codigoEmpleado: employee.codigo_empleado?.trim() || undefined,
  usuarioId: employee.usuario_id?.trim() || undefined,
  salario: employee.salario === '' || employee.salario === null || employee.salario === undefined
    ? undefined
    : Number(employee.salario),
  sedeId: employee.sede_id,
  cargo: employee.cargo
});

const getAllUsers = async () => {
  const response = await api.get('/usuarios');
  return Array.isArray(response.data)
    ? response.data.map(normalizeUser)
    : [];
};

const findUserByCedula = async (cedula) => {
  const normalizedCedula = cedula?.trim();

  if (!normalizedCedula) {
    return null;
  }

  const users = await getAllUsers();
  return users.find((user) => user.cedula === normalizedCedula) || null;
};

const getUserById = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return normalizeUser(response.data);
};

const getByUsuarioId = async (usuarioId) => {
  const normalizedUsuarioId = usuarioId?.trim?.() || usuarioId;

  if (!normalizedUsuarioId) {
    return null;
  }

  try {
    const response = await api.get(`/empleados/usuario/${normalizedUsuarioId}`);
    if (response.data) {
      return normalizeEmployee(response.data);
    }
  } catch (error) {
    console.warn('Falling back to local employee search by usuarioId');
  }

  const employees = await getAll();
  return employees.find((employee) => String(employee.usuario_id) === String(normalizedUsuarioId)) || null;
};

const getAll = async () => {
  const response = await api.get('/empleados');
  return Array.isArray(response.data)
    ? response.data.map(normalizeEmployee)
    : [];
};

const getByCodigo = async (codigo) => {
  const response = await api.get(`/empleados/codigo/${codigo}`);
  return normalizeEmployee(response.data);
};

const getHistorial = async (codigo) => {
  const response = await api.get(`/empleados/${codigo}/historial`);
  return Array.isArray(response.data)
    ? response.data.map(normalizeHistorialEntry)
    : [];
};

const create = async (payload) => {
  const response = await api.post('/empleados', serializeEmployee(payload));
  return normalizeEmployee(response.data);
};

const update = async (id, payload) => {
  const response = await api.put(`/empleados/${id}`, serializeEmployee(payload));
  return normalizeEmployee(response.data);
};

const bulkUpdate = async (employees) => {
  const results = await Promise.all(
    employees.map((emp) => update(emp.id, emp))
  );
  return results;
};

export default {
  getAll,
  getByCodigo,
  getHistorial,
  getAllUsers,
  getUserById,
  getByUsuarioId,
  findUserByCedula,
  create,
  update,
  bulkUpdate
};