import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import Button from '../../components/ui/Button';
import MultiplexCard from '../../components/dashboard/multiplex/MultiplexCard';
import SlidePanel from '../../components/dashboard/multiplex/SlidePanel';
import MultiplexForm from '../../components/dashboard/multiplex/MultiplexForm';
import SalaForm from '../../components/dashboard/multiplex/SalaForm';
import { getMultiplexes } from '../../services/multiplexService';
import api from '../../services/api';

export default function MultiplexManagement() {
  const { t } = useTranslation();
  const [sedes, setSedes] = useState([]);
  const [salas, setSalas] = useState({});
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null);

  // Función para cargar las salas de una sede específica
  const cargarSalasDeSede = async (sedeId) => {
    try {
      const response = await api.get(`/salas/sede/${sedeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error cargando salas de sede ${sedeId}:`, error);
      return [];
    }
  };

  // Cargar sedes y sus salas desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // 1. Obtener todas las sedes
        const sedesData = await getMultiplexes();
        console.log('📊 Sedes cargadas:', sedesData);
        
        setSedes(sedesData);
        
        // 2. Para cada sede, cargar sus salas
        const salasPorSede = {};
        for (const sede of sedesData) {
          const sedeId = sede.id || sede._id;
          console.log(`Cargando salas para sede: ${sede.nombre} (ID: ${sedeId})`);
          const salasDeSede = await cargarSalasDeSede(sedeId);
          salasPorSede[sedeId] = salasDeSede;
        }
        setSalas(salasPorSede);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleSaveSede = async (savedSede) => {
    try {
      const response = await api.post('/sedes', {
        nombre: savedSede.nombre,
        ciudad: savedSede.ciudad,
        direccion: savedSede.direccion,
        url_imagen: savedSede.url_imagen,
        routerKey: savedSede.nombre.toLowerCase().replace(/\s/g, '_'),
        cantidadSalas: 0,
        configuracionSillas: {
          sillasGenerales: savedSede.configuracion_sillas.filas * savedSede.configuracion_sillas.columnas,
          sillasPreferenciales: 20
        }
      });

      if (response.status === 201 || response.status === 200) {
        // Recargar todas las sedes y sus salas
        const sedesData = await getMultiplexes();
        setSedes(sedesData);
        // Recargar salas para todas las sedes
        const nuevasSalas = {};
        for (const sede of sedesData) {
          const sedeId = sede.id || sede._id;
          nuevasSalas[sedeId] = await cargarSalasDeSede(sedeId);
        }
        setSalas(nuevasSalas);
        setPanel(null);
      }
    } catch (error) {
      console.error('Error al crear sede:', error);
      alert(error.response?.data?.message || 'Error al crear la sede');
    }
  };

 const handleSaveSala = async (salaData) => {
  try {
    console.log('📦 handleSaveSala - Sala data recibida:', salaData);
    
    let response;
    if (salaData.id) {
      // Edición: PUT /salas/{id}
      console.log('✏️ Actualizando sala con ID:', salaData.id);
      response = await api.put(`/salas/${salaData.id}`, salaData);
    } else {
      // Creación: POST /salas
      console.log('➕ Creando nueva sala');
      response = await api.post('/salas', salaData);
    }
    
    console.log('✅ Respuesta del servidor:', response.data);
    
    if (response.status === 201 || response.status === 200) {
      const sedeId = salaData.sedeId;
      // Recargar las salas de esa sede para asegurar consistencia
      const salasActualizadas = await cargarSalasDeSede(sedeId);
      setSalas(prev => ({
        ...prev,
        [sedeId]: salasActualizadas
      }));
      setPanel(null);
    }
  } catch (error) {
    console.error('❌ Error al guardar sala:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      alert(`Error del servidor: ${JSON.stringify(error.response.data)}`);
    } else {
      alert('Error al guardar la sala');
    }
  }
};

  const totalSalas = Object.values(salas).flat().length;
  const totalActivas = Object.values(salas).flat().filter(s => s.estado === 'activa').length;

  if (loading) {
    return <div className="text-center py-20">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-8 px-2 py-4">
      {/* Encabezado */}
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
          {t('dashboard.multiplexManagement.title')}
          <span className="text-primary italic"> {t('dashboard.multiplexManagement.titleAccent')}</span>
        </h1>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          {t('dashboard.multiplexManagement.subtitle')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        {[
          { icon: 'location_city', label: t('dashboard.multiplexManagement.registeredLocations'), value: sedes.length, color: 'text-primary' },
          { icon: 'theaters', label: t('dashboard.multiplexManagement.roomsInfrastructure'), value: totalSalas, color: 'text-secondary' },
          { icon: 'check_circle', label: t('dashboard.multiplexManagement.roomsOnline'), value: `${totalActivas} / ${totalSalas}`, color: 'text-emerald-400' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-surface-container-low border border-outline-variant/15 rounded-xl px-5 py-4 flex flex-col justify-center transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('material-symbols-outlined text-base', color)}>{icon}</span>
              <span className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant/80">{label}</span>
            </div>
            <p className="font-headline text-2xl font-black text-white leading-none mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de sedes */}
      <div className="space-y-6 relative z-10">
        {sedes.map(sede => {
          const sedeId = sede.id || sede._id;
          return (
            <MultiplexCard
              key={sedeId}
              sede={sede}
              salas={salas[sedeId] || []}
              onEditSede={(s) => setPanel({ mode: 'multiplex_edit', data: s })}
              onNewSala={() => setPanel({ mode: 'sala_new', sedeId: sedeId })}
              onEditSala={(sala) => setPanel({ mode: 'sala_edit', sedeId: sedeId, data: sala })}
            />
          );
        })}
      </div>

      {/* Panel deslizante */}
      {panel && (
        <SlidePanel
          title={panel.mode.includes('multiplex') ? (panel.mode.includes('new') ? t('dashboard.multiplexManagement.registerLocation') : t('dashboard.multiplexManagement.modifyLocation')) : (panel.mode.includes('new') ? t('dashboard.multiplexManagement.addRoom') : t('dashboard.multiplexManagement.configureRoom'))}
          subtitle={panel.sedeId ? `Destino: ${sedes.find(s => (s.id || s._id) === panel.sedeId)?.nombre}` : t('dashboard.multiplexManagement.catalogModule')}
          onClose={() => setPanel(null)}
        >
          {panel.mode.includes('multiplex') ? (
            <MultiplexForm initial={panel.data} onSave={handleSaveSede} onCancel={() => setPanel(null)} />
          ) : (
            <SalaForm 
              sedeId={panel.sedeId}
              initial={panel.data} 
              onSave={handleSaveSala} 
              onCancel={() => setPanel(null)} 
            />
          )}
        </SlidePanel>
      )}
    </div>
  );
}