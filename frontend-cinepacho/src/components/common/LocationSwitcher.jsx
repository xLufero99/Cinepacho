import { useBookingContext } from '../../contexts/BookingContext';
import { useTranslation } from 'react-i18next';

export default function LocationSwitcher() {
  const { selectedHeadquarters, triggerLocationModal } = useBookingContext();
  const { t } = useTranslation();

  const handleChangeLocation = () => {
    triggerLocationModal();
  };

  if (!selectedHeadquarters) {
    return null;
  }

  // Extract just the location name (remove "Cine Pacho" prefix if present)
  const locationName = selectedHeadquarters.nombre.replace('Cine Pacho ', '').trim();

  return (
    <button
      onClick={handleChangeLocation}
      aria-label={`Cambiar sede - Actual: ${locationName}`}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
      type="button"
    >
      <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">location_on</span>
      <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface max-w-[120px] truncate">
        {locationName}
      </span>
      <svg
        className="w-4 h-4 text-on-surface-variant"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
