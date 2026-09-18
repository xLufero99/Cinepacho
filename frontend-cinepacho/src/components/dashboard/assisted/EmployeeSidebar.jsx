import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';

export default function EmployeeSidebar({
  currentEmployee,
  activeView,
  setView
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const cargoLabel = currentEmployee?.cargo || 'Taquillero';
  const employeeCode = currentEmployee?.codigo_empleado || 'EMP-XXXX';

  // Solo las dos funciones operativas esenciales requeridas
  const menuItems = [
    {
      id: 'assistedBooking',
      icon: 'confirmation_number', // Icono de ticket/boleto
      label: t('employee.sidebar.tickets', 'Venta de Boletos')
    },
    {
      id: 'assistedSnacks',
      icon: 'fastfood', // Icono de comida/snack
      label: t('employee.sidebar.food', 'Venta de Comida')
    },
  ];

  return (
    <aside
      className="
        w-64
        sticky top-20
        self-start
        h-[calc(100vh-5rem)]
        bg-stone-950
        border-r border-stone-800
        flex flex-col
        z-30
        font-body
      "
    >
      {/* INFO EMPLEADO */}
      <div className="px-6 py-4 border-b border-stone-800 mb-4">
        <h2 className="text-xl font-bold text-red-600 font-headline uppercase tracking-tight">
          Cine Pacho
        </h2>
        <div className="mt-1">
          <p className="text-white text-sm font-medium capitalize">
            {cargoLabel.replace('_', ' ')}
          </p>
          <p className="text-stone-500 text-xs font-label">
            Cod: {employeeCode}
          </p>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                className={`
                  w-full
                  flex items-center gap-3
                  px-4 py-3
                  rounded-xl
                  transition-all duration-200
                  ${
                    activeView === item.id
                      ? `
                        bg-red-600/10
                        text-red-500
                        border border-red-500/20
                        font-semibold
                      `
                      : `
                        text-stone-400
                        hover:text-stone-100
                        hover:bg-stone-900
                      `
                  }
                `}
              >
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>
                <span className="text-sm">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* CERRAR SESIÓN */}
      <div className="border-t border-stone-800 bg-stone-900/50 py-2 mt-auto">
        <button
          onClick={() => {
            logoutUser();
            navigate('/login', { replace: true });
          }}
          className="
            w-full
            flex items-center gap-3
            px-4 py-3
            text-stone-400
            hover:text-red-400
            hover:bg-red-500/10
            text-sm
            transition-colors
          "
        >
          <span className="material-symbols-outlined">
            logout
          </span>
          <span>
            {t('admin.sidebar.logout', 'Cerrar Sesión')}
          </span>
        </button>
      </div>
    </aside>
  );
}