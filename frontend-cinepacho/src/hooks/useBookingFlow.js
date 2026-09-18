import { useState, useMemo } from 'react';

// Booking flow state management across pages
export default function useBookingFlow() {
  // Headquarters selection state
  const [selectedHeadquarters, setSelectedHeadquarters] = useState(null);
  
  // Movie selection state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  
  // Seat selection state
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [multiplex, setMultiplex] = useState('Titán');
  
  // Snack cart state
  const [snackCart, setSnackCart] = useState([]);
  
  // Business logic functions
  const calculateBookingTotals = (seats, snackItems) => {
    // Seat pricing
    const seatPrices = {
      preferential: 15000,
      general: 11000
    };
    
    const processingFee = 1500;
    
    // Calculate seat total
    const seatTotal = seats.reduce((total, seat) => {
      const isPreferential = seat.id.startsWith('P'); // V1, V2, etc. are preferential
      const price = isPreferential ? seatPrices.preferential : seatPrices.general;
      return total + price;
    }, 0);
    
    // Calculate snack total
    const snackTotal = snackItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    
    // Calculate points
    const seatPoints = seats.length * 10; // 10 points per ticket
    const snackPoints = snackItems.reduce((total, item) => 
      total + (item.points * item.quantity), 0
    );
    
    const subtotal = seatTotal + snackTotal;
    const total = subtotal + (seats.length > 0 ? processingFee : 0);
    
    return {
      seatTotal,
      snackTotal,
      subtotal,
      processingFee,
      total,
      points: seatPoints + snackPoints,
      itemCount: seats.length + snackItems.reduce((total, item) => total + item.quantity, 0)
    };
  };
  
  const updateHeadquartersSelection = (headquarters) => {
    console.log('useBookingFlow - updateHeadquartersSelection called with:', headquarters);
    setSelectedHeadquarters(headquarters);
    // Update multiplex when headquarters changes
    if (headquarters && headquarters.nombre) {
      setMultiplex(headquarters.nombre);
    }
    console.log('useBookingFlow - after state update, selectedHeadquarters:', headquarters);
  };

  const updateMovieSelection = (movie, showtime) => {
    setSelectedMovie(movie);
    setSelectedShowtime(showtime);
  };
  
  const updateSeatSelection = (seats) => {
    setSelectedSeats(seats);
  };
  
  const updateMultiplex = (newMultiplex) => {
    setMultiplex(newMultiplex);
  };
  
  const updateSnackCart = (snackItems) => {
    setSnackCart(snackItems);
  };
  
  const clearBookingData = () => {
    setSelectedHeadquarters(null);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSnackCart([]);
  };
  
  // Computed values
  const bookingTotals = useMemo(() => 
    calculateBookingTotals(selectedSeats, snackCart), 
    [selectedSeats, snackCart]
  );
  
  const hasHeadquartersSelection = selectedHeadquarters !== null;
  const hasMovieSelection = selectedMovie !== null;
  const hasSeatSelection = selectedSeats.length > 0;
  const hasSnackSelection = snackCart.length > 0;
  const isBookingComplete = hasHeadquartersSelection && hasMovieSelection && hasSeatSelection;
  
  return {
    // State
    selectedHeadquarters,
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    multiplex,
    snackCart,
    bookingTotals,
    
    // Computed values
    hasHeadquartersSelection,
    hasMovieSelection,
    hasSeatSelection,
    hasSnackSelection,
    isBookingComplete,
    
    // Actions
    updateHeadquartersSelection,
    updateMovieSelection,
    updateSeatSelection,
    updateMultiplex,
    updateSnackCart,
    clearBookingData
  };
}
