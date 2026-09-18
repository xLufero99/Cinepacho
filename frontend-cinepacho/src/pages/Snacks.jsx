import { useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import Container from '../components/layout/Container';
import SnackItemCard from '../components/snacks/SnackItemCard';
import OrderSummary from '../components/snacks/OrderSummary';
import useSnacks from '../hooks/useSnacks';
import { useBookingContext } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { purchaseSnacksOnly, processPayment } from '../services/purchaseService';
import SuccessModal from '../components/ui/SuccessModal';
import { useState } from 'react';

export default function Snacks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isEmployeeFlow = location.pathname.startsWith('/employee');
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};

  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  const handleModalClose = () => {
    const redirectTo = modal?.redirectTo;
    setModal({ open: false, title: '', message: '' });
    if (redirectTo) navigate(redirectTo);
  };

  // Booking data from context
  const {
    selectedCustomer: bookingSelectedCustomer,
    selectedHeadquarters,
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    bookingTotals,
    updateSnackCart,
  } = useBookingContext();

  // Snack management
  const {
    cart,
    filteredSnacks,
    cartTotals,
    addToCart,
    removeFromCart,
    updateQuantity,
    getItemQuantity,
    clearCart,
    MAX_QUANTITY_PER_ITEM,
    loading
  } = useSnacks();

  const customerUserId = bookingSelectedCustomer?.id || bookingSelectedCustomer?._id || outletContext.customerUserId || outletContext.customerUser?.id || outletContext.customerUser?._id || null;
  const customerRegistered = Boolean(bookingSelectedCustomer || outletContext.customerRegistered || customerUserId);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync snack cart with context whenever cart changes
  useEffect(() => {
    if (selectedMovie) {
      updateSnackCart(cart);
    }
  }, [cart, updateSnackCart, selectedMovie]);

  const handleContinueToCheckout = () => {
    if (selectedMovie) {
      navigate(isEmployeeFlow ? '/employee/checkout' : '/checkout');
    } else {
      navigate(isEmployeeFlow ? '/employee/checkout' : '/checkout');
    }
  };

  const handleGoBackToBooking = () => {
    if (selectedMovie) {
      navigate(-1);
    } else {
      navigate(isEmployeeFlow ? '/employee/assistedBooking' : '/');
    }
  };

  const handleRemoveItem = (snackId) => {
    removeFromCart(snackId);
  };

  const handleUpdateQuantity = (snackId, quantity) => {
    updateQuantity(snackId, quantity);
  };

  // ✅ Función corregida: compra y paga automáticamente
  const handlePurchaseSnacksOnly = async () => {
    console.log('=== INICIANDO COMPRA DE SNACKS ===');
    
    // Validaciones
    if (!user) {
      alert('Debes iniciar sesión para comprar');
      navigate('/login');
      return;
    }

    if (!selectedHeadquarters) {
      alert('Debes seleccionar una sede');
      return;
    }

    if (cart.length === 0) {
      alert('Agrega snacks al carrito');
      return;
    }

    // Obtener ID del usuario (puede estar en diferentes campos)
    const finalUserId = isEmployeeFlow ? customerUserId : (user?.id || user?._id || user?.usuarioId);
    console.log('🎯 ID de usuario:', finalUserId);
    
    if (isEmployeeFlow && !customerRegistered) {
      alert('Debes registrar primero al cliente con el botón de guardar antes de comprar snacks.');
      return;
    }

    if (!finalUserId) {
      alert('No se pudo identificar al usuario.');
      navigate('/login');
      return;
    }

    try {
      // 1. Crear reserva de snacks
      const reservation = await purchaseSnacksOnly(
        finalUserId, 
        selectedHeadquarters.id, 
        cart, 
        'EFECTIVO'
      );
      console.log('📦 Reserva creada:', reservation);
      
      // 2. Procesar pago inmediatamente (compra independiente)
      await processPayment(reservation.id);
      console.log('✅ Pago procesado exitosamente');

      // Mostrar modal de éxito con puntos ganados; redirige al cerrar
      setModal({ open: true, title: t('snacks.purchaseSuccessTitle'), message: `${t('snacks.purchaseSuccessMessage')}: $${reservation.total}\n${t('snacks.points')}: ${reservation.puntosTotal}`, redirectTo: '/', type: 'success' });

      // Limpiar carrito
      clearCart();
      
    } catch (error) {
      console.error('❌ Error en compra:', error);
      console.error('❌ Detalle error compra snacks:', error.response?.data);
      const rawMsg = error.response?.data?.message || error.message || '';
      const lowered = String(rawMsg).toLowerCase();
      const isStockError = lowered.includes('stock') || lowered.includes('insuf') || lowered.includes('inventario') || error.response?.status === 409;
      const displayMsg = isStockError ? t('snacks.stockInsufficient') : (rawMsg || t('snacks.purchaseError'));
      setModal({ open: true, title: t('snacks.purchaseFailedTitle'), message: displayMsg, type: 'error' });
    }
  };

  const hasBookingData = selectedMovie && selectedHeadquarters;
  const isStandalonePurchase = !selectedMovie && selectedHeadquarters && cart.length > 0;

  if (loading) {
    return (
      <MainLayout user={user}>
        <Container className="max-w-screen-2xl">
          <div className="pt-24 text-center">
            {t('snacks.loading') || 'Cargando snacks...'}
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <Container className="max-w-screen-2xl">
        <main className="flex-1 pt-24 px-6 md:px-12 pb-24 flex flex-col lg:flex-row gap-12 w-full min-h-0">
          {/* Snack Grid Area */}
          <section className="flex-1 relative min-h-0 flex flex-col">
            {/* Header */}
            <header className="mb-12 relative z-10 flex-shrink-0">
              {hasBookingData && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3 flex-wrap">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <div>
                    <p className="font-label text-sm font-bold text-primary">
                      {t('snacks.addingSnacksToBooking') || 'Agregando snacks a tu reserva'}
                    </p>
                    <p className="font-body text-xs text-on-surface-variant">
                      {selectedMovie?.nombre} • {selectedShowtime || ''} • {selectedHeadquarters?.nombre || ''}
                    </p>
                  </div>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-on-surface mb-2 break-words">
                {t('snacks.concessions') || 'Confitería'}
              </h1>
              <p className="text-on-surface-variant font-body text-base md:text-lg max-w-2xl">
                {hasBookingData 
                  ? (t('snacks.concessionsDescription') || 'Agrega snacks a tu experiencia de cine')
                  : (t('snacks.independentPurchaseDescription') || 'Compra snacks sin necesidad de boletas')}
              </p>
            </header>

            {/* Snacks Grid - Botones de categorías eliminados */}
            <div className="flex-grow min-h-0 overflow-y-auto">
              {filteredSnacks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-on-surface-variant">{t('snacks.noSnacks') || 'No hay snacks disponibles'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {filteredSnacks.map((snack) => (
                    <SnackItemCard
                      key={snack.id}
                      snack={snack}
                      quantity={getItemQuantity(snack.id)}
                      onAddToCart={addToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      maxQuantity={MAX_QUANTITY_PER_ITEM}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Order Summary Sidebar */}
          <aside className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky top-24 lg:top-32">
              <OrderSummary
                cart={cart}
                cartTotals={cartTotals}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
                onPayNow={handlePurchaseSnacksOnly}
                onContinueToCheckout={handlePurchaseSnacksOnly}
                onGoBackToBooking={handleGoBackToBooking}
                bookingData={hasBookingData ? {
                  selectedMovie,
                  selectedHeadquarters,
                  selectedShowtime,
                  selectedSeats,
                } : null}
                combinedTotals={hasBookingData ? bookingTotals : null}
                isStandalone={!hasBookingData}
                hasBookingData={hasBookingData}
              />
            </div>
          </aside>
        </main>
      </Container>
      <SuccessModal isOpen={modal.open} title={modal.title} message={modal.message} onClose={handleModalClose} type={modal.type} />
    </MainLayout>
  );
}