import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function OrderSummary({
  cart,
  cartTotals,
  onRemoveItem,
  onUpdateQuantity,
  onPayNow,
  onContinueToCheckout,
  onGoBackToBooking,
  bookingData = null,
  combinedTotals = null,
  isStandalone = false,
  className = ''
}) {
  const { t } = useTranslation();
  // UI-only component - all business logic is handled by parent
  const isCartEmpty = cart.length === 0;
  const hasBookingData = bookingData && bookingData.selectedMovie;

  if (isCartEmpty && !hasBookingData) {
    return (
      <div className={`bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 flex flex-col h-[calc(100vh-10rem)] max-h-[800px] ${className}`}>
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-8 border-b border-outline-variant/10 pb-4">
          {t('snacks.yourOrder')}
        </h2>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
            fastfood
          </span>
          <p className="font-body text-on-surface-variant mb-6">
            {t('snacks.cartEmpty')}
          </p>
          <Button
            onClick={onGoBackToBooking}
            variant="outline"
            className="w-full"
          >
            {hasBookingData ? t('snacks.backToBooking') : t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 flex flex-col h-[calc(100vh-10rem)] max-h-[800px] ${className}`}>
      <h2 className="font-headline text-2xl font-bold text-on-surface mb-8 border-b border-outline-variant/10 pb-4">
        {t('snacks.yourOrder')}
      </h2>

      {/* Booking Information (solo si hay reserva de boletas) */}
      {hasBookingData && (
        <div className="mb-6 pb-6 border-b border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-4">{t('snacks.bookingDetails')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-on-surface-variant">{t('snacks.movie')}</span>
              <span className="font-label text-sm text-on-surface">{bookingData.selectedMovie?.nombre}</span>
            </div>
            {bookingData.selectedShowtime && (
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-on-surface-variant">{t('snacks.showtime')}</span>
                <span className="font-label text-sm text-on-surface">{bookingData.selectedShowtime}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-on-surface-variant">{t('snacks.cinema')}</span>
              <span className="font-label text-sm text-on-surface">
                {bookingData.selectedHeadquarters?.nombre || bookingData.multiplex}
              </span>
            </div>
            {bookingData.selectedSeats && bookingData.selectedSeats.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-on-surface-variant">{t('snacks.seats')}</span>
                <span className="font-label text-sm text-on-surface">
                  {bookingData.selectedSeats.slice(0, 3).join(', ')}
                  {bookingData.selectedSeats.length > 3 && ` +${bookingData.selectedSeats.length - 3}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-6">
        {cart.map((item) => (
          <OrderItem
            key={item.id}
            item={item}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-outline-variant/10 pt-6 space-y-4">
        {/* Loyalty Points */}
        <div className="bg-surface-container-high rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>
              loyalty
            </span>
            <span className="font-body text-sm text-on-surface-variant">{t('snacks.pointsToEarn')}</span>
          </div>
          <span className="font-label font-bold text-secondary-container">
            {combinedTotals?.points || cartTotals.points} {t('snacks.points')}
          </span>
        </div>

        {/* Combined Totals (con boletas) o Solo Snacks (independiente) */}
        {combinedTotals ? (
          <>
            <div className="flex justify-between items-center py-2">
              <span className="font-body text-on-surface-variant">{t('snacks.tickets')}</span>
              <span className="font-label text-on-surface">
                ${combinedTotals.seatTotal?.toLocaleString() || 0}
              </span>
            </div>
            {!isCartEmpty && (
              <div className="flex justify-between items-center py-2">
                <span className="font-body text-on-surface-variant">{t('nav.snacks')}</span>
                <span className="font-label text-on-surface">
                  ${combinedTotals.snackTotal?.toLocaleString() || 0}
                </span>
              </div>
            )}
            {combinedTotals.processingFee > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="font-body text-on-surface-variant">{t('booking.processingFee')}</span>
                <span className="font-label text-on-surface">
                  ${combinedTotals.processingFee?.toLocaleString() || 0}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-between items-center py-2">
            <span className="font-body text-on-surface-variant">{t('snacks.subtotal')}</span>
            <span className="font-label text-on-surface">
              ${cartTotals.subtotal?.toLocaleString() || 0}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pb-4">
          <span className="font-headline font-bold text-lg text-on-surface">{t('booking.total')}</span>
          <span className="font-label font-bold text-2xl text-primary">
            ${combinedTotals?.total?.toLocaleString() || cartTotals.total?.toLocaleString() || 0}
          </span>
        </div>

        {/* Action Buttons */}
        <Button
          onClick={onPayNow}
          className="w-full py-4 text-lg flex justify-center items-center gap-2"
        >
          <span>{isStandalone ? (t('snacks.payNow') || 'Pagar ahora') : (t('snacks.proceedToCheckout') || 'Continuar')}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </Button>

        {hasBookingData && (
          <Button
            onClick={onGoBackToBooking}
            variant="outline"
            className="w-full py-3"
          >
            {t('snacks.backToBooking')}
          </Button>
        )}
      </div>
    </div>
  );
}

// UI-only sub-component for individual order items
function OrderItem({ item, onRemove }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-start gap-4">
      {/* Item Image */}
      <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
        <img 
          src={item.image || "https://via.placeholder.com/64"} 
          alt={item.name}
          className="w-full h-full object-cover opacity-80"
        />
      </div>
      
      {/* Item Details */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-headline font-bold text-on-surface text-sm leading-tight">
            {item.name}
          </h4>
          <span className="font-label text-primary font-medium text-sm">
            ${(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="font-label text-xs text-on-surface-variant">
            {t('snacks.qty')}: {item.quantity}
          </span>
          <button 
            onClick={onRemove}
            className="text-on-surface-variant hover:text-error transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}