import { useTranslation } from 'react-i18next';
import { useBookingContext } from '../../contexts/BookingContext';

const PriceRow = ({ label, value }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between font-body text-sm">
      <span className="text-on-surface-variant">{t(label)}</span>
      <span className="text-on-surface font-bold">${typeof value === 'number' ? value.toLocaleString() : 0}</span>
    </div>
  );
};

export default function BookingSummary({ selectedSeats, onContinueToCheckout }) {
  const { t } = useTranslation();
  const { bookingTotals } = useBookingContext();
  
  const { seatTotal, processingFee, total, seatsCount } = bookingTotals;
  
  if (!selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="col-span-1 xl:col-span-3 sticky top-24 max-h-fit">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">
            {t('booking.bookingSummary')}
          </h2>
          <div className="mb-6 pb-6 border-b border-outline-variant/20">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
              {t('booking.selectedSeats')}
            </p>
            <p className="text-on-surface-variant font-body text-sm italic">
              {t('booking.noSeatsSelected')}
            </p>
          </div>
          <button
            disabled={true}
            className="w-full font-headline font-bold py-3 rounded-lg transition-colors uppercase tracking-wider disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:cursor-not-allowed"
          >
            {t('booking.selectSeatsToContinue')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="col-span-1 xl:col-span-3 sticky top-24 max-h-fit">
      <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">
          {t('booking.bookingSummary')}
        </h2>
        
        <div className="mb-6 pb-6 border-b border-outline-variant/20">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
            {t('booking.selectedSeats')}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <span key={seat} className="bg-primary/20 text-primary font-body text-sm px-3 py-1 rounded-full font-bold">
                {seat}
              </span>
            ))}
          </div>
        </div>
        
        <div className="space-y-3 mb-6 pb-6 border-b border-outline-variant/20">
          <PriceRow label="booking.seats" value={seatTotal} />
          <PriceRow label="booking.processingFee" value={processingFee} />
        </div>
        
        <div className="mb-6 pb-6 border-b border-outline-variant/20">
          <div className="flex justify-between">
            <span className="font-headline text-lg text-on-surface-variant">{t('booking.total')}</span>
            <span className="font-headline text-2xl text-primary font-bold">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <button
            onClick={onContinueToCheckout}
            className="w-full font-headline font-bold py-3 rounded-lg transition-colors uppercase tracking-wider bg-primary hover:bg-primary-container text-on-primary"
          >
            {t('booking.continueToCheckout')}
          </button>
        </div>
        
        <div className="pt-6 border-t border-outline-variant/10 text-xs font-body text-on-surface-variant space-y-2">
          <p>✓ {t('booking.allPricesIncludeTaxes')}</p>
          <p>✓ {t('booking.seatsHeldFor10Min')}</p>
          <p>✓ {t('booking.cancellationAvailable')}</p>
        </div>
      </div>
    </div>
  );
}