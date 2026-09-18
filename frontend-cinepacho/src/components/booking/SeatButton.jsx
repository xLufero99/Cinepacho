const SEAT_STATUS_STYLES = {
  occupied:
    'bg-surface-variant/30 cursor-not-allowed',

  selected:
    'bg-primary text-on-primary',

  available:
    'bg-surface-container-highest hover:bg-surface-variant',
};

export default function SeatButton({
  seat,
  isSelected,
  onSelect,
}) {
  const currentStyle =
    seat.status === 'occupied'
      ? SEAT_STATUS_STYLES.occupied
      : isSelected
        ? SEAT_STATUS_STYLES.selected
        : SEAT_STATUS_STYLES.available;

  return (
    <button
      disabled={seat.status === 'occupied'}
      onClick={() => onSelect(seat.id)}
      className={`
        w-8 h-8 rounded-md
        flex items-center justify-center
        transition-all
        ${currentStyle}
      `}
    >
      {isSelected && (
        <span className="material-symbols-outlined text-sm">
          check
        </span>
      )}
    </button>
  );
}