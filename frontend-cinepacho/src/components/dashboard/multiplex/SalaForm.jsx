import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_SEATS = 60;
const PRECIO_GENERAL = 11000;
const PRECIO_PREFERENCIAL = 15000;

function PreviewSeatButton({ seat, onPaintSeat, isDragging, dragMode }) {
  const handleMouseEnter = () => {
    if (isDragging && seat.status === 'available') {
      onPaintSeat(seat.id, dragMode);
    }
  };
  const handleClick = () => {
    onPaintSeat(seat.id, !(seat.type === 'preferential'));
  };
  return (
    <button
      type="button"
      className={`
        w-8 h-8 rounded text-xs font-medium transition-all
        ${seat.type === 'preferential' 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-stone-700 hover:bg-stone-600'}
      `}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {seat.label}
    </button>
  );
}

function PreviewSeatRow({ rowLabel, seats, onPaintSeat, isDragging, dragMode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-4">{rowLabel}</span>
      <div className="flex gap-1">
        {seats.map((seat) => (
          <PreviewSeatButton
            key={seat.id}
            seat={seat}
            onPaintSeat={onPaintSeat}
            isDragging={isDragging}
            dragMode={dragMode}
          />
        ))}
      </div>
    </div>
  );
}

export default function SalaForm({ sedeId, initial, onSave, onCancel }) {
  const { t } = useTranslation();

  // Estado del formulario
  const [formData, setFormData] = useState(
    initial || {
      nombre: '',
      tipo: '2D',
      filas: 6,
      columnas: 10
    }
  );

  // Función para obtener IDs de asientos preferenciales a partir del initial (solo se ejecuta una vez al montar)
  const getInitialPreferentialSeats = () => {
    if (initial && initial.sillas_preferencial) {
      const prefArray = initial.sillas_preferencial;
      const prefIds = prefArray.map(silla => {
        const label = silla.id; // "A1", "B3", etc.
        if (!label) return null;
        // Extraer número de la columna
        const numeroMatch = label.match(/\d+/);
        if (!numeroMatch) return null;
        const numeroColumna = parseInt(numeroMatch[0], 10);
        const letraFila = label.charAt(0);
        const filaIndex = letraFila.charCodeAt(0) - 65; // A=0
        // Calcular ID secuencial: filaIndex * columnas + (numeroColumna - 1) + 1
        const columnasActuales = formData.columnas;
        const idSecuencial = filaIndex * columnasActuales + numeroColumna;
        return idSecuencial;
      }).filter(id => id !== null && id <= MAX_SEATS);
      return prefIds;
    }
    // Por defecto (nueva sala): últimos 20 asientos (41-60)
    const defaultPref = [];
    for (let i = 41; i <= 60; i++) {
      defaultPref.push(i);
    }
    return defaultPref;
  };

  const [preferentialSeats, setPreferentialSeats] = useState(getInitialPreferentialSeats);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(true);
  const [visitedSeats, setVisitedSeats] = useState(new Set());

  // Sincronizar cuando cambie initial (por si se abre edición después de nueva)
  useEffect(() => {
    if (initial) {
      setFormData({
        nombre: initial.nombre || '',
        tipo: initial.tipo || '2D',
        filas: initial.filas || 6,
        columnas: initial.columnas || 10
      });
      // Recalcular preferenciales cuando cambie initial o las columnas
      const recalcular = () => {
        if (initial.sillas_preferencial) {
          const prefArray = initial.sillas_preferencial;
          const prefIds = prefArray.map(silla => {
            const label = silla.id;
            if (!label) return null;
            const numeroMatch = label.match(/\d+/);
            if (!numeroMatch) return null;
            const numeroColumna = parseInt(numeroMatch[0], 10);
            const letraFila = label.charAt(0);
            const filaIndex = letraFila.charCodeAt(0) - 65;
            const columnasActuales = initial.columnas || formData.columnas;
            const idSecuencial = filaIndex * columnasActuales + numeroColumna;
            return idSecuencial;
          }).filter(id => id !== null && id <= MAX_SEATS);
          setPreferentialSeats(prefIds);
        } else {
          // Si no hay preferenciales (caso extraño), usar por defecto
          const def = [];
          for (let i = 41; i <= 60; i++) def.push(i);
          setPreferentialSeats(def);
        }
      };
      recalcular();
    }
  }, [initial]);

  useEffect(() => {
    const stopDragging = () => {
      setIsDragging(false);
      setVisitedSeats(new Set());
    };
    window.addEventListener('mouseup', stopDragging);
    return () => window.removeEventListener('mouseup', stopDragging);
  }, []);

  const totalSeats = formData.filas * formData.columnas;

  const previewSeats = useMemo(() => {
    const layout = [];
    let seatCounter = 1;
    for (let rowIndex = 0; rowIndex < formData.filas; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < formData.columnas; colIndex++) {
        if (seatCounter > MAX_SEATS) break;
        const rowLetter = String.fromCharCode(65 + rowIndex);
        const seatLabel = `${rowLetter}${colIndex + 1}`;
        row.push({
          id: seatCounter,
          label: seatLabel,
          fila: rowLetter,
          numero: colIndex + 1,
          status: 'available',
          type: preferentialSeats.includes(seatCounter) ? 'preferential' : 'general'
        });
        seatCounter++;
      }
      if (row.length > 0) layout.push(row);
    }
    return layout;
  }, [formData, preferentialSeats]);

  const onPaintSeat = (seatId, makePreferential) => {
    if (visitedSeats.has(seatId)) return;
    setVisitedSeats(prev => {
      const next = new Set(prev);
      next.add(seatId);
      return next;
    });
    setDragMode(makePreferential);
    setIsDragging(true);
    setPreferentialSeats(prev => {
      const alreadyPreferential = prev.includes(seatId);
      if (makePreferential) {
        if (alreadyPreferential) return prev;
        return [...prev, seatId];
      }
      return prev.filter(id => id !== seatId);
    });
  };

  const handleSave = () => {
    if (!sedeId) {
      alert('Error: No se ha seleccionado una sede');
      return;
    }
    if (!formData.nombre?.trim()) {
      alert('Por favor ingresa un nombre para la sala');
      return;
    }

    const flatSeats = previewSeats.flat();
    const payload = {
      // Si es edición, incluimos el id
      ...(initial && initial.id ? { id: initial.id } : {}),
      nombre: formData.nombre,
      tipo: formData.tipo,
      estado: 'activa',
      filas: formData.filas,
      columnas: formData.columnas,
      capacidadGeneral: flatSeats.filter(seat => seat.type === 'general').length,
      capacidadPreferencial: flatSeats.filter(seat => seat.type === 'preferential').length,
      sedeId: sedeId,
      sillas_general: flatSeats.filter(seat => seat.type === 'general').map(seat => ({
        id: seat.label,
        tipo: 'general',
        precio: PRECIO_GENERAL,
        disponible: true,
        compraId: null
      })),
      sillas_preferencial: flatSeats.filter(seat => seat.type === 'preferential').map(seat => ({
        id: seat.label,
        tipo: 'preferential',
        precio: PRECIO_PREFERENCIAL,
        disponible: true,
        compraId: null
      }))
    };
    
    console.log('📤 Enviando al backend:', payload);
    onSave(payload);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone-500 uppercase mb-2">
            {t('dashboard.roomForm.roomName')}
          </label>
          <input
            className="w-full bg-stone-900 border border-stone-800 rounded p-2 text-sm"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder={t('dashboard.roomForm.roomPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 uppercase mb-2">
            {t('dashboard.roomForm.type')}
          </label>
          <select
            className="w-full bg-stone-900 border border-stone-800 rounded p-2 text-sm"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="IMAX">IMAX</option>
            <option value="MacroXE">MacroXE</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone-500 uppercase mb-2">
            {t('dashboard.roomForm.rows')} ({formData.filas})
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.filas}
            className="w-full accent-red-600"
            onChange={(e) => {
              const filas = parseInt(e.target.value);
              if (filas * formData.columnas <= MAX_SEATS) {
                setFormData({ ...formData, filas });
              }
            }}
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 uppercase mb-2">
            {t('dashboard.roomForm.columns')} ({formData.columnas})
          </label>
          <input
            type="range"
            min="1"
            max="12"
            value={formData.columnas}
            className="w-full accent-red-600"
            onChange={(e) => {
              const columnas = parseInt(e.target.value);
              if (formData.filas * columnas <= MAX_SEATS) {
                setFormData({ ...formData, columnas });
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-stone-400">
        <span>{t('dashboard.roomForm.totalSeats')} {Math.min(totalSeats, MAX_SEATS)} / {MAX_SEATS}</span>
        <span>
          {t('dashboard.roomForm.general')} {previewSeats.flat().filter(s => s.type === 'general').length} |{' '}
          {t('dashboard.roomForm.preferential')}{' '}
          <span className="text-red-500">{previewSeats.flat().filter(s => s.type === 'preferential').length}</span>
        </span>
      </div>

      <div className="border border-stone-800 rounded-xl p-6 bg-stone-950/50">
        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-6 text-center">
          {t('dashboard.roomForm.seatDistribution')}
        </p>
        <div className="w-full flex justify-center mb-8">
          <div className="w-2/3 h-1 bg-red-600/30 rounded-full" />
        </div>
        <div
          className="flex flex-col gap-2 items-center"
          onMouseLeave={() => {
            setIsDragging(false);
            setVisitedSeats(new Set());
          }}
        >
          {previewSeats.map((row, idx) => (
            <PreviewSeatRow
              key={idx}
              rowLabel={String.fromCharCode(65 + idx)}
              seats={row}
              onPaintSeat={onPaintSeat}
              isDragging={isDragging}
              dragMode={dragMode}
            />
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-stone-700" />
            <span>{t('dashboard.roomForm.general')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600" />
            <span>{t('dashboard.roomForm.preferential')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={onCancel} className="flex-1 py-2 text-sm font-bold text-stone-400 hover:text-white transition-colors">
          {t('common.cancel')}
        </button>
        <button onClick={handleSave} className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold">
          {initial ? t('dashboard.roomForm.updateRoom') : t('dashboard.roomForm.createRoom')}
        </button>
      </div>
    </div>
  );
}