import { useTranslation } from 'react-i18next';

export default function AdminSidebar({
  currentEmployee,
  onNewScreening,
  onNewMovie,
  onRemoveMovieFromBillboard,
  activeView,
  setView
}) {

  const { t } = useTranslation();

  const cargoLabel =
    currentEmployee?.cargo || 'Empleado';

  const employeeCode =
    currentEmployee?.codigo_empleado || 'EMP-XXXX';

  const menuItems = [
    {
      id: 'dashboard',
      icon: 'dashboard',
      label: t('admin.sidebar.dailySummary')
    },
    {
      id: 'usuarios',
      icon: 'manage_accounts',
      label: t('admin.sidebar.users')
    },
    {
      id: 'programacion',
      icon: 'calendar_today',
      label: t('admin.sidebar.programming')
    },
    {
      id: 'inventory',
      icon: 'fastfood',
      label: t('admin.sidebar.inventory')
    },
    {
      id: 'personal',
      icon: 'groups',
      label: t('admin.sidebar.staff')
    },
    {
      id: 'multiplex',
      icon: 'domain',
      label: t('admin.sidebar.multiplex')
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

      {/* EMPLOYEE */}
      <div className="
        px-6 py-4
        border-b border-stone-800
        mb-4
      ">

        <h2 className="
          text-xl font-bold
          text-red-600
          font-headline
          uppercase tracking-tight
        ">
          Cine Pacho
        </h2>

        <div className="mt-1">

          <p className="
            text-white text-sm
            font-medium capitalize
          ">
            {cargoLabel.replace('_', ' ')}
          </p>

          <p className="
            text-stone-500 text-xs
            font-label
          ">
            Cod: {employeeCode}
          </p>

        </div>

      </div>

      {/* ACTIONS */}
      <div className="px-4 mb-6 space-y-3">

        <button
          type="button"
          onClick={onNewScreening}
          className="
            w-full py-2
            bg-red-600 hover:bg-red-700
            text-white rounded
            text-sm font-bold
            transition-all
            active:scale-95
            shadow-lg shadow-red-600/10
          "
        >
          {t('admin.sidebar.newFunction')}
        </button>

        <div className="grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={onNewMovie}
            className="
              py-2 px-3
              bg-stone-900 hover:bg-stone-800
              border border-stone-700
              text-white rounded
              text-xs font-semibold
              transition-all
              active:scale-95
            "
          >
            <span className="material-symbols-outlined text-base block mb-1">
              movie
            </span>
            {t('admin.sidebar.newMovie')}
          </button>

          <button
            type="button"
            onClick={onRemoveMovieFromBillboard}
            className="
              py-2 px-3
              bg-stone-900 hover:bg-stone-800
              border border-stone-700
              text-white rounded
              text-xs font-semibold
              transition-all
              active:scale-95
            "
          >
            <span className="material-symbols-outlined text-base block mb-1">
              playlist_remove
            </span>
            {t('admin.sidebar.removeMovieFromBillboard')}
          </button>

        </div>

      </div>

      {/* NAV */}
      <nav className="
        flex-1 overflow-y-auto
        px-2
      ">

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

      {/* FOOTER */}
      <div className="
        border-t border-stone-800
        bg-stone-900/50
        py-2
        mt-auto
      ">
        <button
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
            {t('admin.sidebar.logout')}
          </span>

        </button>

      </div>

    </aside>
  );
}