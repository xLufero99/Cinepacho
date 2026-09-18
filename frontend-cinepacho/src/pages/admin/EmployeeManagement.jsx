import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import api from '../../services/api';
import employeeService from '../../services/employeeService';

import EmployeeFilters from '../../components/dashboard/employee/EmployeeFilters';
import EmployeeTable from '../../components/dashboard/employee/EmployeeTable';
import EmployeeHistoryModal from '../../components/dashboard/employee/EmployeeHistoryModal';

import EmployeeCreateModal from '../../components/dashboard/employee/EmployeeCreateModal';
import CredentialModal from '../../components/dashboard/employee/CredentialModal';

const normalizeMultiplex = (multiplex) => ({
  _id: multiplex._id || multiplex.id || multiplex.routerKey,
  routerKey: multiplex.routerKey || multiplex._id || multiplex.id,
  nombre: multiplex.nombre || multiplex.name || multiplex.routerKey || 'Sin nombre'
});

export default function EmployeeManagement() {

  const { t } = useTranslation();

  const [employees, setEmployees] = useState([]);

  const [multiplexes, setMultiplexes] = useState([]);

  const [usersById, setUsersById] = useState({});

  const [search, setSearch] = useState('');

  const [selectedRole, setSelectedRole] = useState('all');

  const [selectedMultiplex, setSelectedMultiplex] = useState('all');

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isSavingCreate, setIsSavingCreate] = useState(false);

  const [isSavingChanges, setIsSavingChanges] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState('');

  const [operationError, setOperationError] = useState('');
  const [credentialInfo, setCredentialInfo] = useState(null);
  const [isCredentialOpen, setIsCredentialOpen] = useState(false);

  const filteredEmployees = useMemo(() => {

    return employees.filter((employee) => {

      const matchesSearch =
        employee.codigo_empleado
          ?.toLowerCase()
          .includes(search.toLowerCase())
        || employee.usuario_id
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        selectedRole === 'all'
        || employee.cargo === selectedRole;

      const matchesMultiplex =
        selectedMultiplex === 'all'
        || employee.sede_id === selectedMultiplex;

      return (
        matchesSearch
        && matchesRole
        && matchesMultiplex
      );

    });

  }, [
    employees,
    search,
    selectedRole,
    selectedMultiplex
  ]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [employeesData, usersData, multiplexResponse] = await Promise.all([
          employeeService.getAll(),
          employeeService.getAllUsers(),
          api.get('/sedes/publicas')
        ]);

        if (!mounted) {
          return;
        }

        setEmployees(employeesData);
        setUsersById(
          Array.isArray(usersData)
            ? Object.fromEntries(usersData.map((user) => [user.id, user]))
            : {}
        );
        setMultiplexes(Array.isArray(multiplexResponse.data)
          ? multiplexResponse.data.map(normalizeMultiplex)
          : []);
      } catch (error) {
        if (mounted) {
          setLoadError(t('employee.management.loadError'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [t]);

  const getBackendErrorMessage = (error) => {
    const responseData = error?.response?.data;

    return responseData?.message
      || responseData?.error
      || responseData?.errors?.[0]
      || (typeof responseData === 'string' ? responseData : '')
      || error?.message
      || t('employee.management.saveError');
  };

  const handleMultiplexChange = async (
    employee,
    newMultiplex
  ) => {

    setEmployees(prev => prev.map((emp) => {
      if (emp.id !== employee.id) {
        return emp;
      }

      return {
        ...emp,
        sede_id: newMultiplex,
        hasChanges: true
      };
    }));
  };

  const handleRoleChange = async (employee, newRole) => {

    setEmployees(prev => prev.map((emp) => {
      if (emp.id !== employee.id) {
        return emp;
      }

      return {
        ...emp,
        cargo: newRole,
        hasChanges: true
      };
    }));
  };

  const handleSalaryChange = async (employee, newSalary) => {

    setEmployees(prev => prev.map((emp) => {
      if (emp.id !== employee.id) {
        return emp;
      }

      return {
        ...emp,
        salario: newSalary,
        hasChanges: true
      };
    }));
  };

  const handleViewHistory = (employee) => {
    setSelectedEmployee(employee);

    setIsHistoryOpen(true);

    if (!employee.historial_sedes || employee.historial_sedes.length === 0) {
      employeeService.getHistorial(employee.codigo_empleado)
        .then((historial) => {
          setSelectedEmployee((prev) => ({
            ...(prev || employee),
            historial_sedes: historial
          }));
        })
        .catch(() => {});
    }
  };

  const handleCreateEmployee = async (payload) => {
    setIsSavingCreate(true);
    setOperationError('');
    setCredentialInfo(null);

    try {
      const user = await employeeService.findUserByCedula(payload.cedula);

      let userId = user?.id;
      let generatedCreds = null;

      const generatePassword = (len = 12) => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~';
        let out = '';
        for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
        return out;
      };

      // If user exists, create a separate Login with role EMPLEADO
      if (userId) {
        const generatedEmail = `${payload.cedula}@cinepacho.com`.toLowerCase();
        const password = generatePassword(12);

        try {
          await api.post('/auth/create-login', {
            userId,
            username: generatedEmail,
            password,
            rol: 'EMPLEADO'
          });

          generatedCreds = { email: generatedEmail, password };
        } catch (err) {
          // if creation of login failed, surface backend error and abort
          throw err;
        }
      } else {
        // Auto-generate corporate email and password, then register user (this also creates a login)
        const generatedEmail = `${payload.cedula}@cinepacho.com`.toLowerCase();
        const password = generatePassword(12);

        const userPayload = {
          cedula: payload.cedula,
          nombre: payload.nombre || payload.cedula,
          apellido: payload.apellido || '',
          email: generatedEmail,
          telefono: payload.telefono || '3000000000',
          direccion: payload.direccion || 'Sin direccion',
          contrasena: password,
          rol: 'EMPLEADO'
        };

        const resp = await api.post('/auth/register', userPayload);
        const savedUser = resp.data;
        userId = savedUser.id;
        generatedCreds = { email: generatedEmail, password };
      }

      const createdEmployee = await employeeService.create({
        codigo_empleado: payload.codigo_empleado,
        usuario_id: userId,
        salario: payload.salario,
        sede_id: payload.sede_id,
        cargo: payload.cargo
      });

      // refresh local users map
      if (userId) {
        try {
          const refreshed = await employeeService.getUserById(userId);
          setUsersById(prev => ({ ...prev, [userId]: refreshed }));
        } catch (e) {
          // ignore
        }
      }

      setEmployees(prev => [createdEmployee, ...prev]);

      if (generatedCreds) {
        setCredentialInfo(generatedCreds);
        setIsCredentialOpen(true);
        // keep the create modal open so admin can copy/confirm credentials; it will be closed when credentials modal is dismissed
      } else {
        setIsCreateOpen(false);
      }
    } catch (error) {
      setOperationError(getBackendErrorMessage(error));
    } finally {
      setIsSavingCreate(false);
    }
  };

  const handleSaveChanges = async () => {
    const modifiedEmployees =
      employees.filter(emp => emp.hasChanges);

    if (modifiedEmployees.length === 0) {
      return;
    }

    setIsSavingChanges(true);
    setOperationError('');

    try {
      const updated = await employeeService.bulkUpdate(modifiedEmployees);

      setEmployees(prev => prev.map((emp) => {
        const match = updated.find(u => u.id === emp.id);
        if (match) {
          return {
            ...match,
            hasChanges: false
          };
        }
        return {
          hasChanges: false
        };
      }));

    } catch (err) {
      setOperationError(getBackendErrorMessage(err));
    } finally {
      setIsSavingChanges(false);
    }
  };

  const hasPendingChanges = employees.some(emp => emp.hasChanges);

  return (
    <div className="space-y-6">

      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
          {t('employee.management.internalAdmin')}
        </p>

        <h1 className="text-4xl font-black text-white font-headline uppercase">
          {t('employee.management.title')}
        </h1>

        <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
          {t('employee.management.description')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-6 py-3 rounded-2xl border border-outline-variant/10 text-white text-xs font-black uppercase tracking-[0.2em] transition-all hover:border-primary/20"
        >
          {t('employee.management.new')}
        </button>

        {hasPendingChanges && (
          <button
            onClick={handleSaveChanges}
            disabled={isSavingChanges}
            className="px-6 py-3 rounded-2xl bg-primary hover:opacity-90 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all disabled:opacity-60"
          >
            {isSavingChanges ? t('common.saving') : t('employee.management.save')}
          </button>
        )}
      </div>

      {operationError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {operationError}
        </div>
      )}

      {/* credentials modal is shown when credentialInfo is set */}
      <CredentialModal
        isOpen={isCredentialOpen}
        credentialInfo={credentialInfo}
        onClose={() => { setIsCredentialOpen(false); setCredentialInfo(null); setIsCreateOpen(false); }}
      />

      <EmployeeFilters
        search={search}
        setSearch={setSearch}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedMultiplex={selectedMultiplex}
        setSelectedMultiplex={setSelectedMultiplex}
        multiplexes={multiplexes}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6 text-sm text-on-surface-variant">
          {t('common.loading')}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6 text-sm text-red-300">
          {loadError}
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          multiplexes={multiplexes}
          usersById={usersById}
          onRoleChange={handleRoleChange}
          onSalaryChange={handleSalaryChange}
          onMultiplexChange={handleMultiplexChange}
          onViewHistory={handleViewHistory}
        />
      )}

      <EmployeeHistoryModal
        employee={selectedEmployee}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        multiplexes={multiplexes}
      />

      <EmployeeCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateEmployee}
        multiplexes={multiplexes}
        isSaving={isSavingCreate}
      />

    </div>
  );
}