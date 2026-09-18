import { useTranslation } from 'react-i18next';

const SectionHeader = ({ label, price }) => {
  const { t } = useTranslation();
  const precioNumerico = typeof price === 'number' ? price : Number(price) || 0;
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-outline-variant/20" />
      <span className="text-sm uppercase tracking-widest text-on-surface-variant">
        {t(label)} - ${precioNumerico.toLocaleString()}
      </span>
      <div className="flex-1 h-px bg-outline-variant/20" />
    </div>
  );
};

const SeatButton = ({ seat, isSelected, onSelect }) => {
  const seatId = seat.id;
  const disponible = seat.disponible === true;
  
  return (
    <button
      onClick={() => disponible && onSelect(seatId)}
      disabled={!disponible}
      className={`
        w-8 h-8 rounded-md text-xs font-medium transition-all flex items-center justify-center
        ${!disponible 
          ? 'bg-surface-variant/30 cursor-not-allowed' 
          : isSelected
            ? 'bg-primary text-white'
            : seat.tipo === 'preferencial'
              ? 'bg-secondary-dim/80 hover:bg-secondary'
              : 'bg-surface-container-highest hover:bg-surface-variant'
        }
      `}
    >
      {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
    </button>
  );
};

export default function SeatMap({ 
  seats, 
  selectedSeats, 
  onSelectSeat, 
  generalPrice, 
  preferentialPrice 
}) {
  const { t } = useTranslation();
  
  // Obtener listas de asientos
  const generalSeats = seats?.general || [];
  const preferentialSeats = seats?.preferencial || [];
  
  // Función para agrupar por fila (extrae la letra del ID, ej: "A1" -> "A")
  const groupByRow = (seatList) => {
    const grouped = {};
    seatList.forEach(seat => {
      const seatId = seat.id;
      if (!seatId) return;
      // Extraer la parte alfabética (fila)
      const rowMatch = seatId.match(/^[A-Za-z]+/);
      const row = rowMatch ? rowMatch[0] : seatId.charAt(0);
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    });
    // Ordenar filas alfabéticamente
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };
  
  const preferentialRows = groupByRow(preferentialSeats);
  const generalRows = groupByRow(generalSeats);
  
  // Ordenar asientos dentro de cada fila por número
  const sortSeatsInRow = (seats) => {
    return [...seats].sort((a, b) => {
      const numA = parseInt(a.id.match(/\d+$/)?.[0] || 0);
      const numB = parseInt(b.id.match(/\d+$/)?.[0] || 0);
      return numA - numB;
    });
  };
  
  return (
    <div className="bg-surface-container-low rounded-xl p-4 md:p-8 overflow-auto flex flex-col items-center">
      {/* Pantalla */}
      <div className="flex flex-col items-center mb-16 w-full">
        <div className="w-3/4 h-2 rounded-full bg-primary mb-4" />
        <span className="text-xs uppercase tracking-[0.3em] text-on-surface-variant">
          {t('booking.screen')}
        </span>
      </div>
      
      {/* Asientos Preferenciales */}
      {preferentialRows.length > 0 && (
        <div className="w-full">
          <SectionHeader label="booking.preferential" price={preferentialPrice} />
          <div className="space-y-3 mb-12 flex flex-col items-center">
            {preferentialRows.map(([row, seatsInRow]) => (
              <div key={row} className="flex items-center gap-3">
                <span className="w-6 text-xs text-on-surface-variant font-bold">{row}</span>
                <div className="flex gap-2 flex-wrap justify-center">
                  {sortSeatsInRow(seatsInRow).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat.id)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Asientos Generales */}
      {generalRows.length > 0 && (
        <div className="w-full">
          <SectionHeader label="booking.general" price={generalPrice} />
          <div className="space-y-3 flex flex-col items-center">
            {generalRows.map(([row, seatsInRow]) => (
              <div key={row} className="flex items-center gap-3">
                <span className="w-6 text-xs text-on-surface-variant font-bold">{row}</span>
                <div className="flex gap-2 flex-wrap justify-center">
                  {sortSeatsInRow(seatsInRow).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat.id)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mensaje si no hay asientos */}
      {generalRows.length === 0 && preferentialRows.length === 0 && (
        <div className="text-center py-8 text-on-surface-variant">
          No hay asientos disponibles para esta función
        </div>
      )}
    </div>
  );
}