import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import MainLayout from '../../components/layout/MainLayout';
import AdminSidebar from '../../components/dashboard/AdminSidebar';

export default function Dashboard({
  user,
  sedeActualInfo
}) {

  const navigate = useNavigate();

  const location = useLocation();

  const mockEmployee = {
    codigo_empleado: 'EMP-9402',
    cargo: 'admin',
    sede_id: 'sede_titan_01'
  };

  // Detect active route from URL
  const activeView =
    location.pathname.split('/')[2] || 'dashboard';

  return (

    <MainLayout >

      <div className="min-h-screen bg-background text-on-background flex antialiased items-start">

        {/* SIDEBAR */}
        <AdminSidebar
          currentEmployee={mockEmployee}

          activeView={activeView}

          setView={(view) => {
            navigate(`/admin/${view}`);
          }}

          onNewScreening={() =>
            navigate('/admin/create-function')
          }

          onNewMovie={() =>
            navigate('/admin/create-movie')
          }

          onRemoveMovieFromBillboard={() =>
            navigate('/admin/remove-movie')
          }
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 pt-24 px-8 pb-20 relative min-h-screen">

          {/* CINEMATIC BACKGROUND */}
          <div
            className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-screen"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')",

              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* ROUTE CONTENT */}
          <div className="relative z-10 max-w-7xl mx-auto">

            <Outlet context={{ sedeActualInfo }} />

          </div>

        </main>

      </div>

    </MainLayout>
  );
}