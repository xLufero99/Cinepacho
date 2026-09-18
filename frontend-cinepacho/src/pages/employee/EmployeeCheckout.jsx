import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';
import { createPurchase, processPayment } from '../../services/purchaseService';
import { useBookingContext } from '../../contexts/BookingContext';
import { useLoyaltyContext } from '../../contexts/LoyaltyContext';
import { useTranslation } from 'react-i18next';
import {
  borderBottomLight,
  borderTopLight,
  priceRowBase,
  priceLabel,
  priceValue,
  seatBadge,
  infoText,
  cardBase,
} from '../../utils/bookingStyles';
import SuccessModal from '../../components/ui/SuccessModal';

const PriceRow = ({ label, value }) => (
  <div className={priceRowBase}>
    <span className={priceLabel}>{label}</span>
    <span className={priceValue}>${value.toLocaleString()}</span>
  </div>
);

export default function EmployeeCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};
  const {
    selectedCustomer,
    selectedHeadquarters,
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    snackCart,
    bookingTotals,
    bookingStatus,
    hasSeatSelection,
    hasSnackSelection,
    isTicketsPaid,
    updateBookingStatus,
    releaseSeats,
  } = useBookingContext();

  const storedCustomer = (() => {
    try {
      return JSON.parse(localStorage.getItem('selectedCustomer') || 'null');
    } catch (error) {
      return null;
    }
  })();
  const storedCustomerId = localStorage.getItem('selectedCustomerId');
  const customerUserId = selectedCustomer?.id || selectedCustomer?._id || selectedCustomer?.usuarioId || storedCustomer?.id || storedCustomer?._id || storedCustomer?.usuarioId || storedCustomerId || outletContext.customerUserId || outletContext.customerUser?.id || outletContext.customerUser?._id || outletContext.customerUser?.usuarioId || null;
  const customerRegistered = Boolean(selectedCustomer || storedCustomer || outletContext.customerRegistered || customerUserId);

  const {
    availableFreeTickets,
    canRedeemFreeTicket,
    redeemFreeTicket,
  } = useLoyaltyContext();

  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  const handleModalClose = () => {
    const redirectTo = modal?.redirectTo;
    setModal({ open: false, title: '', message: '' });
    if (redirectTo) navigate(redirectTo);
  };

  const handleAddSnacks = () => {
    navigate('/employee/assistedSnacks');
  };

  const handleCompletePurchase = async () => {
    try {
      if (!customerRegistered) {
        setModal({
          open: true,
          title: t('checkout.paymentFailedTitle'),
          message: 'Debes registrar primero al cliente con el botón de guardar antes de completar la compra.',
          type: 'error'
        });
        return;
      }

      if (!customerUserId) {
        setModal({
          open: true,
          title: t('checkout.paymentFailedTitle'),
          message: 'No se pudo identificar al usuario del cliente.',
          type: 'error'
        });
        return;
      }

      const items = [];

      selectedSeats.forEach((seatId) => {
        const isPreferential = seatId.startsWith('A');
        const price = isPreferential ? selectedShowtime?.precioPreferencial : selectedShowtime?.precioGeneral;

        items.push({
          tipo: 'boleta',
          referenciaId: selectedShowtime?._id || selectedShowtime?.id,
          sillaId: seatId,
          cantidad: 1,
          precioUnitario: price,
          subtotal: price,
          detalle: `Boleta ${seatId} - ${selectedMovie?.nombre}`
        });
      });

      snackCart.forEach((snack) => {
        items.push({
          tipo: 'snack',
          referenciaId: snack.id,
          sillaId: null,
          cantidad: snack.quantity,
          precioUnitario: snack.price,
          subtotal: snack.price * snack.quantity,
          detalle: snack.name
        });
      });

      const payload = {
        usuarioId: customerUserId,
        sedeId: selectedHeadquarters?.id || selectedHeadquarters?._id,
        compra: items
      };

      const compra = await createPurchase(payload);
      await processPayment(compra.id);
      updateBookingStatus('confirmed');

      setModal({
        open: true,
        title: t('checkout.paymentSuccessTitle'),
        message: `${t('checkout.paymentSuccessMessage', { id: compra.id.slice(-6) })}\n${t('snacks.points')}: ${bookingTotals.points}`,
        type: 'success',
        redirectTo: '/employee/assistedBooking'
      });
    } catch (err) {
      updateBookingStatus('failed');
      releaseSeats();
      const rawMsg = err.response?.data?.message || err.message || '';
      const lowered = String(rawMsg).toLowerCase();
      const isStockError = lowered.includes('stock') || lowered.includes('insuf') || lowered.includes('inventario') || err.response?.status === 409;
      const displayMsg = isStockError ? t('snacks.stockInsufficient') : (rawMsg || t('checkout.purchaseError'));
      setModal({ open: true, title: t('checkout.paymentFailedTitle'), message: displayMsg, type: 'error' });
    }
  };

  const handleUseFreeTicket = () => {
    if (availableFreeTickets.length > 0 && selectedSeats.length > 0) {
      const freeTicket = availableFreeTickets[0];
      redeemFreeTicket(freeTicket.id);
      setModal({ open: true, title: t('loyalty.freeTicketUsedTitle') || t('loyalty.freeTicketUsed'), message: t('loyalty.freeTicketUsed') });
    }
  };

  const handleGoBackToBooking = () => {
    releaseSeats();
    navigate(-1);
  };

  const handleStartNewBooking = () => {
    navigate('/employee/assistedBooking');
  };

  if (!hasSeatSelection) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">{t('checkout.noActiveBooking')}</h1>
            <p className="text-on-surface-variant mb-6">{t('checkout.selectMovieAndSeats')}</p>
            <Button onClick={() => navigate('/employee/assistedBooking')}>{t('checkout.browseMovies')}</Button>
          </div>
        </Container>
      </MainLayout>
    );
  }

  const {
    seatTotal,
    snackTotal,
    processingFee,
    total,
    points,
    seatsCount,
  } = bookingTotals;

  return (
    <MainLayout>
      <Container className="min-h-0 flex flex-col pt-6">
        <div className="max-w-3xl mx-auto flex-grow min-h-0 flex flex-col">
          <div className="flex-shrink-0 mb-6">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-2">{t('checkout.title')}</h1>
            <p className="text-on-surface-variant font-body text-lg mb-10">{t('checkout.subtitle')}</p>
          </div>

          <div className="flex-grow min-h-0 overflow-y-auto pb-32">
            <div className={`${cardBase} bg-surface-container-low p-6 md:p-8 mb-8`}>
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">{t('checkout.bookingSummary')}</h2>

              {isTicketsPaid && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <div>
                    <p className="font-label text-sm font-bold text-primary">{t('checkout.ticketsConfirmed')}</p>
                    <p className="font-body text-xs text-on-surface-variant">{t('checkout.ticketsConfirmedSubtitle')}</p>
                  </div>
                </div>
              )}

              <div className={`mb-6 pb-6 ${borderBottomLight}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">{t('checkout.movie')}</p>
                    <p className="font-headline text-lg text-on-surface font-medium">{selectedMovie?.nombre || t('checkout.selectedMovie')}</p>
                    {selectedShowtime && <p className="font-body text-sm text-on-surface-variant">{selectedShowtime.fecha} • {selectedShowtime.hora}</p>}
                  </div>
                </div>
                <div>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">{t('checkout.cinema')}</p>
                  <p className="font-headline text-lg text-on-surface font-medium">{selectedHeadquarters?.nombre || t('checkout.selectedCinema')}</p>
                  {selectedHeadquarters?.direccion && <p className="font-body text-sm text-on-surface-variant">{selectedHeadquarters.direccion}</p>}
                </div>
              </div>

              <div className={`mb-6 pb-6 ${borderBottomLight}`}>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">{t('checkout.selectedSeats', { count: seatsCount })}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => <span key={seat} className={seatBadge}>{seat}</span>)}
                </div>
              </div>

              {hasSnackSelection && (
                <div className={`mb-6 pb-6 ${borderBottomLight}`}>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">{t('checkout.snacks')}</p>
                  <div className="space-y-3">
                    {snackCart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="font-body text-sm text-on-surface">{item.name} x{item.quantity}</span>
                        <span className="font-label text-sm text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`space-y-3 mb-6 pb-6 ${borderBottomLight}`}>
                {isTicketsPaid ? (
                  <>
                    <div className={priceRowBase}>
                      <span className={priceLabel}>{t('checkout.ticketsWithCount', { count: seatsCount })}</span>
                      <span className="font-label text-sm text-on-surface-variant line-through">${seatTotal.toLocaleString()}</span>
                    </div>
                    <div className={priceRowBase}>
                      <span className={priceLabel}>{t('checkout.processingFee')}</span>
                      <span className="font-label text-sm text-on-surface-variant line-through">${processingFee.toLocaleString()}</span>
                    </div>
                    {hasSnackSelection && <PriceRow label={t('checkout.snacks')} value={snackTotal} />}
                  </>
                ) : (
                  <>
                    {hasSnackSelection && <PriceRow label={t('checkout.snacks')} value={snackTotal} />}
                    <PriceRow label={t('checkout.processingFee')} value={processingFee} />
                  </>
                )}
              </div>

              <div className={`mb-6 pb-6 ${borderBottomLight}`}>
                <div className="bg-surface-container-high rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
                    <span className="font-body text-sm text-on-surface-variant">{t('loyalty.pointsToEarn')}</span>
                  </div>
                  <span className="font-label font-bold text-secondary-container">{points} pts</span>
                </div>

                {canRedeemFreeTicket && hasSeatSelection && !isTicketsPaid && (
                  <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                        <div>
                          <p className="font-label text-sm font-bold text-primary">{t('loyalty.freeTicketAvailable')}</p>
                          <p className="font-body text-xs text-on-surface-variant">{availableFreeTickets.length} {t('loyalty.freeTicket')} {t('loyalty.available')}</p>
                        </div>
                      </div>
                      <Button onClick={handleUseFreeTicket} variant="primary" size="sm" className="font-label text-xs tracking-wider">{t('loyalty.redeemNow')}</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`mb-8 ${borderBottomLight}`}>
                <div className="flex justify-between items-baseline">
                  <span className="font-headline text-xl text-on-surface-variant">{isTicketsPaid ? t('checkout.amountDue') : t('checkout.total')}</span>
                  <span className="font-headline text-3xl text-primary font-bold">${isTicketsPaid ? snackTotal.toLocaleString() : total.toLocaleString()}</span>
                </div>
                {isTicketsPaid && <p className="font-body text-xs text-on-surface-variant text-right mt-1">{t('checkout.ticketsAlreadyPaid', { amount: seatTotal.toLocaleString() })}</p>}
              </div>

              <div className={`pt-6 ${borderTopLight} ${infoText}`}>
                <p>✓ {t('booking.allPricesIncludeTaxes')}</p>
                <p>✓ {t('booking.seatsHeldFor10Min')}</p>
                <p>✓ {t('booking.cancellationAvailable')}</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 mt-6">
            <div className={`${cardBase} bg-surface-container-low p-6 md:p-8`}>
              <div className="space-y-3">
                {bookingStatus !== 'completed' ? (
                  <Button onClick={handleCompletePurchase} className="w-full py-4 text-lg flex justify-center items-center gap-2">
                    <span>
                      {bookingStatus === 'draft'
                        ? t('checkout.completePurchase')
                        : hasSnackSelection
                          ? t('checkout.payForSnacks')
                          : t('checkout.completePurchase')}
                    </span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Button>
                ) : (
                  <div className="w-full py-4 text-lg text-center bg-surface-container-high rounded-full font-label font-bold text-on-surface-variant">{t('checkout.bookingComplete')}</div>
                )}

                {bookingStatus === 'confirmed' && !hasSnackSelection && (
                  <Button onClick={handleAddSnacks} variant="outline" className="w-full py-3">{t('checkout.addSnacks')}</Button>
                )}

                {bookingStatus === 'completed' && (
                  <Button onClick={handleStartNewBooking} variant="primary" className="w-full py-3">{t('checkout.startNewBooking')}</Button>
                )}

                <Button onClick={handleGoBackToBooking} variant="ghost" className="w-full py-3">{t('checkout.backToBooking')}</Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <SuccessModal isOpen={modal.open} title={modal.title} message={modal.message} onClose={handleModalClose} type={modal.type} />
    </MainLayout>
  );
}