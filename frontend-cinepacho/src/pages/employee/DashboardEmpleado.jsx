import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MainLayout from '../../components/layout/MainLayout';
import EmployeeSidebar from '../../components/dashboard/assisted/EmployeeSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useBookingContext } from '../../contexts/BookingContext';
import employeeService from '../../services/employeeService';
import { getMultiplexById } from '../../services/multiplexService';
import { getUserByEmail } from '../../services/userService';

export default function EmployeeDashboard({ sedeActualInfo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const { selectedHeadquarters, updateHeadquartersSelection, updateCustomerSelection, clearCustomerSelection } = useBookingContext();
  
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerUser, setCustomerUser] = useState(null);
  const [customerLookupError, setCustomerLookupError] = useState('');
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(authUser);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [employeeReady, setEmployeeReady] = useState(false);
  const [loadingEmployeeHQ, setLoadingEmployeeHQ] = useState(false);
  const syncedEmployeeSedeRef = useRef(null);
  const { t } = useTranslation();

  // Obtenemos la sub-ruta (ej: 'assistedBooking')
  const activeView = location.pathname.split('/')[2];

  useEffect(() => {
    // Si entras a /employee a secas, te redirige a la sub-ruta correcta
    if (!activeView) {
      navigate('/employee/assistedBooking', { replace: true });
    }
  }, [activeView, navigate]);

  useEffect(() => {
    let mounted = true;

    const loadEmployeeData = async () => {
      if (!authUser) {
        if (mounted) {
          setCurrentEmployee(null);
          setLoadingEmployee(false);
          setEmployeeReady(true);
        }
        return;
      }

      try {
        setLoadingEmployee(true);
        const employee = await employeeService.getByUsuarioId(authUser._id || authUser.id || authUser.usuarioId);
        if (mounted) {
          if (employee) {
            setCurrentEmployee({ ...authUser, ...employee, rol: 'empleado' });
          } else {
            setCurrentEmployee(authUser);
          }
        }
      } catch (error) {
        if (mounted) {
          setCurrentEmployee(authUser);
        }
      } finally {
        if (mounted) {
          setLoadingEmployee(false);
          setEmployeeReady(true);
        }
      }
    };

    loadEmployeeData();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  useEffect(() => {
    let mounted = true;

    const syncEmployeeHeadquarters = async () => {
      if (!employeeReady) {
        return;
      }

      if (!currentEmployee || currentEmployee.rol?.toLowerCase() !== 'empleado') {
        return;
      }

      const employeeSedeId = currentEmployee.sede_id || currentEmployee.sedeId;

      if (!employeeSedeId) {
        return;
      }

      const currentSelectedId = selectedHeadquarters?.id || selectedHeadquarters?._id;
      if (String(currentSelectedId || '') === String(employeeSedeId)) {
        syncedEmployeeSedeRef.current = String(employeeSedeId);
        return;
      }

      if (syncedEmployeeSedeRef.current === String(employeeSedeId)) {
        return;
      }

      try {
        setLoadingEmployeeHQ(true);
        const employeeSede = await getMultiplexById(employeeSedeId);
        if (mounted && employeeSede) {
          syncedEmployeeSedeRef.current = String(employeeSedeId);
          updateHeadquartersSelection(employeeSede);
        }
      } finally {
        if (mounted) {
          setLoadingEmployeeHQ(false);
        }
      }
    };

    syncEmployeeHeadquarters();

    return () => {
      mounted = false;
    };
  }, [employeeReady, currentEmployee, selectedHeadquarters, updateHeadquartersSelection]);

  const handleCustomerEmailChange = (event) => {
    setCustomerEmail(event.target.value);
    setCustomerUser(null);
    setCustomerLookupError('');
  };

  const handleRegisterCustomer = async () => {
    const normalizedEmail = customerEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setCustomerUser(null);
      setCustomerLookupError('Ingresa el correo del cliente antes de registrar la compra.');
      return;
    }

    try {
      setCustomerLookupLoading(true);
      setCustomerLookupError('');
      const resolvedUser = await getUserByEmail(normalizedEmail);
      setCustomerUser(resolvedUser || null);

      if (!resolvedUser) {
        setCustomerLookupError('No se encontró un usuario con ese correo.');
        clearCustomerSelection();
        return;
      }

      try {
        localStorage.setItem('selectedCustomer', JSON.stringify({
          ...resolvedUser,
          email: resolvedUser.email || normalizedEmail,
        }));
        const resolvedUserId = resolvedUser.id || resolvedUser._id || resolvedUser.usuarioId || null;
        if (resolvedUserId) {
          localStorage.setItem('selectedCustomerId', String(resolvedUserId));
        }
      } catch (storageError) {
        console.error('Error saving confirmed customer immediately:', storageError);
      }

      updateCustomerSelection({
        ...resolvedUser,
        email: resolvedUser.email || normalizedEmail,
      });
    } catch (error) {
      setCustomerUser(null);
      setCustomerLookupError(t('employee.dashboard.customerLookupError'));
      clearCustomerSelection();
    } finally {
      setCustomerLookupLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeReady || loadingEmployee) {
      return;
    }

    if (!currentEmployee || currentEmployee.rol?.toLowerCase() !== 'empleado') {
      navigate('/login', { replace: true });
    }
  }, [employeeReady, loadingEmployee, currentEmployee, navigate]);

  if (loadingEmployee || loadingEmployeeHQ) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-primary text-sm uppercase tracking-[0.3em] font-black">{t('employee.dashboard.loading')}</div>
            <div className="text-on-surface-variant text-sm">{t('employee.dashboard.loadingMultiplex')}</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const resetCustomerSession = () => {
    setCustomerEmail('');
    setCustomerUser(null);
    setCustomerLookupError('');
    clearCustomerSelection();
    localStorage.removeItem('selectedCustomerId');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background text-on-background flex antialiased items-start">
        <EmployeeSidebar 
          currentEmployee={currentEmployee} 
          activeView={activeView || 'assistedBooking'}
          setView={(view) => navigate(`/employee/${view}`)}
        />

        <main className="flex-1 pt-24 px-8 pb-20 relative min-h-screen">
          {/* Fondo decorativo */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-screen"
            style={{ backgroundImage: "url('...')", backgroundSize: 'cover' }}
          />

          <div className="relative z-10 max-w-7xl mx-auto">

            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/employee/assistedBooking')}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-primary hover:bg-primary/15 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                {t('employee.dashboard.title')}
              </button>

              <div className="text-xs uppercase tracking-[0.25em] text-on-surface-variant font-black">
                {currentEmployee?.nombre || 'Empleado'}
              </div>
            </div>
            
            {/* --- NUEVA BARRA DE SESIÓN PERMANENTE --- */}
            <div className="mb-6 p-4 bg-surface-container-high/80 backdrop-blur-md rounded-2xl border border-primary/20 flex items-center gap-4 shadow-lg">
              <div className="flex items-center gap-2 text-primary ml-2">
                <span className="material-symbols-outlined">person</span>
                <span className="font-label text-xs uppercase font-bold tracking-widest">{t('employee.dashboard.client')}</span>
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={handleCustomerEmailChange}
                  placeholder={t('employee.dashboard.placeholderEmailBar')}
                  className="w-full bg-surface-container-lowest border border-outline/30 px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary transition-all text-sm text-white"
                />
                {customerEmail && (
                  <button 
                    onClick={resetCustomerSession}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleRegisterCustomer}
                disabled={customerLookupLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-on-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {customerLookupLoading ? 'hourglass_top' : 'how_to_reg'}
                </span>
                {customerLookupLoading ? t('employee.dashboard.registering') : t('employee.dashboard.registerClient')}
              </button>
              
              <div className="hidden md:block border-l border-outline/20 pl-4 h-8 flex items-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${customerEmail ? (customerUser ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-300') : 'bg-surface-variant text-on-surface-variant'}`}>
                  {customerEmail ? (customerLookupLoading ? t('employee.dashboard.validating') : customerUser ? t('employee.dashboard.registered') : t('employee.dashboard.pending')) : t('employee.dashboard.anonimous')}
                </span>
              </div>
            </div>

            {customerLookupError && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {customerLookupError}
              </div>
            )}

            {/* El contenido de las sub-rutas (BookingAssisted, MovieDetails, etc.) */}
            <Outlet context={{ 
              sedeActualInfo, 
              isEmployeeFlow: true, 
              employeeData: currentEmployee, 
              customerEmail,
              customerUser,
              customerRegistered: Boolean(customerUser),
              customerUserId: customerUser?.id || customerUser?._id || customerUser?.usuarioId || null,
              setCustomerEmail,
              setCustomerUser,
              resetCustomerSession
            }} />
          </div>
        </main>
      </div>
    </MainLayout>
  );
}