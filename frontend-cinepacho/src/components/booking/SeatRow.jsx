import SeatButton from './SeatButton';

export default function SeatRow({
  row,
  seats,
  selectedSeats,
  onSelectSeat,
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-xs text-on-surface-variant">
        {row}
      </span>

      <div className="flex gap-2">
        {seats.map((seat) => (
          <SeatButton
            key={seat.id}
            seat={seat}
            isSelected={selectedSeats.includes(seat.id)}
            onSelect={onSelectSeat}
          />
        ))}
      </div>
    </div>
  );
}