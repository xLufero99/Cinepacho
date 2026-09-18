import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLoyaltyContext } from './LoyaltyContext';

const PROCESSING_FEE = 1500;
const BookingContext = createContext();

export function BookingProvider({ children }) {
  // RESTORE HEADQUARTERS FROM LOCALSTORAGE
  const [selectedHeadquarters, setSelectedHeadquarters] = useState(() => {
    try {
      const stored = localStorage.getItem('selectedHeadquarters');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error restoring headquarters:', e);
      return null;
    }
  });

  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem('selectedCustomer');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error restoring customer:', e);
      return null;
    }
  });

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [snackCart, setSnackCart] = useState([]);
  const [bookingStatus, setBookingStatus] = useState('draft');
  const { addPoints, calculatePointsEarned } = useLoyaltyContext();

  // PERSIST HEADQUARTERS
  useEffect(() => {
    try {
      if (selectedHeadquarters) {
        localStorage.setItem('selectedHeadquarters', JSON.stringify(selectedHeadquarters));
      } else {
        localStorage.removeItem('selectedHeadquarters');
      }
    } catch (e) {
      console.error('Error saving headquarters:', e);
    }
  }, [selectedHeadquarters]);

  useEffect(() => {
    try {
      if (selectedCustomer) {
        localStorage.setItem('selectedCustomer', JSON.stringify(selectedCustomer));
        const selectedCustomerId = selectedCustomer.id || selectedCustomer._id || selectedCustomer.usuarioId || null;
        if (selectedCustomerId) {
          localStorage.setItem('selectedCustomerId', String(selectedCustomerId));
        } else {
          localStorage.removeItem('selectedCustomerId');
        }
      } else {
        localStorage.removeItem('selectedCustomer');
        localStorage.removeItem('selectedCustomerId');
      }
    } catch (e) {
      console.error('Error saving customer:', e);
    }
  }, [selectedCustomer]);

  const updateHeadquartersSelection = (headquarters) => {
    setSelectedHeadquarters(headquarters);
  };

  const updateCustomerSelection = (customer) => {
    setSelectedCustomer(customer);
  };

  const clearHeadquartersSelection = () => {
    setSelectedHeadquarters(null);
  };

  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    localStorage.removeItem('selectedCustomerId');
  };

  const triggerLocationModal = () => {
    clearHeadquartersSelection();
  };

  const closeLocationModal = () => {};

  const updateMovieSelection = (movie, showtime) => {
    setSelectedMovie(movie);
    setSelectedShowtime(showtime);
  };

  const updateSeatSelection = (seats) => {
    setSelectedSeats(seats);
  };

  const updateSnackCart = (snackItems) => {
    setSnackCart(snackItems);
  };

  const updateBookingStatus = (status) => {
    const previousStatus = bookingStatus;
    setBookingStatus(status);

    if (status === 'cancelled' || status === 'failed') {
      setSelectedSeats([]);
    }

    if (previousStatus !== 'completed' && status === 'completed') {
      const ticketCount = selectedSeats.length;
      const snackCount = snackCart.reduce((sum, item) => sum + item.quantity, 0);
      const pointsEarned = calculatePointsEarned(ticketCount, snackCount);
      if (pointsEarned > 0) {
        addPoints(pointsEarned, 'purchase', 'Compra completada');
      }
    }
  };

  const releaseSeats = () => {
    setSelectedSeats([]);
    setBookingStatus('draft');
  };

  const clearBookingData = () => {
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSnackCart([]);
    setBookingStatus('draft');
  };

  // TOTALS - CORREGIDO para usar precios del showtime
  const bookingTotals = useMemo(() => {
    const generalPrice = selectedShowtime?.precioGeneral || 0;
    const preferentialPrice = selectedShowtime?.precioPreferencial || 0;
    
    console.log('💰 Precios showtime:', { generalPrice, preferentialPrice });
    
    const seatTotal = selectedSeats.reduce((total, seatId) => {
      // Determinar por la primera letra (A = preferencial, resto general)
      const isPreferential = seatId.startsWith('A');
      const price = isPreferential ? preferentialPrice : generalPrice;
      console.log(`🎫 Asiento ${seatId}: ${isPreferential ? 'preferencial' : 'general'} - $${price}`);
      return total + price;
    }, 0);
    
    const snackTotal = snackCart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    const seatPoints = selectedSeats.length * 10;
    const snackPoints = snackCart.reduce((total, item) => {
      return total + (item.points * item.quantity);
    }, 0);
    
    const subtotal = seatTotal + snackTotal;
    const processingFee = selectedSeats.length > 0 ? PROCESSING_FEE : 0;
    const total = subtotal + processingFee;
    
    console.log('✅ Total calculado:', { seatTotal, snackTotal, processingFee, total });
    
    return {
      seatTotal,
      snackTotal,
      subtotal,
      processingFee,
      total,
      points: seatPoints + snackPoints,
      itemCount: selectedSeats.length + snackCart.reduce((sum, item) => sum + item.quantity, 0),
      seatsCount: selectedSeats.length
    };
  }, [selectedSeats, snackCart, selectedShowtime]);

  return (
    <BookingContext.Provider
      value={{
        selectedHeadquarters,
        selectedCustomer,
        selectedMovie,
        selectedShowtime,
        selectedSeats,
        snackCart,
        bookingStatus,
        hasHeadquartersSelection: selectedHeadquarters !== null,
        hasCustomerSelection: selectedCustomer !== null,
        hasMovieSelection: selectedMovie !== null,
        hasSeatSelection: selectedSeats.length > 0,
        hasSnackSelection: snackCart.length > 0,
        isBookingComplete: selectedHeadquarters !== null && selectedMovie !== null && selectedSeats.length > 0,
        isTicketsPaid: bookingStatus === 'confirmed' || bookingStatus === 'completed',
        isBookingFinalized: bookingStatus === 'completed',
        bookingTotals,
        updateHeadquartersSelection,
        updateCustomerSelection,
        clearHeadquartersSelection,
        clearCustomerSelection,
        updateMovieSelection,
        updateSeatSelection,
        updateSnackCart,
        updateBookingStatus,
        clearBookingData,
        releaseSeats,
        triggerLocationModal,
        closeLocationModal
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}