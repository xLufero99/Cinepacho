import { useState, useMemo } from 'react';
import { SEAT_PRICES, PROCESSING_FEE } from '../data/bookingData';
import { movies } from '../data/movies';

export default function useBooking(movieId) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [multiplex, setMultiplex] = useState('Titán');
  
  // Load movie data dynamically based on movieId with error handling
  const movie = movieId ? movies.find(m => m.id === parseInt(movieId)) : null;
  
  // If no movie found, use first movie as fallback
  const movieData = movie || movies[0];

  // Calculate total price dynamically based on selected seats
  const priceBreakdown = useMemo(() => {
    const seatsTotal = selectedSeats.length * SEAT_PRICES.GENERAL;
    const processingFee = selectedSeats.length > 0 ? PROCESSING_FEE : 0;
    const total = seatsTotal + processingFee;

    return {
      seatsCount: selectedSeats.length,
      seatsPrice: seatsTotal,
      processingFee,
      total,
    };
  }, [selectedSeats.length]);

  /**
   * Toggle seat selection - prevents occupied seats from being selected
   * @param {string} seatId - The ID of the seat
   * @param {string} status - The status of the seat (available, occupied, reserved)
   */
  const toggleSeat = (seatId, status) => {
    // Don't allow selecting occupied seats
    if (status === 'occupied') {
      return;
    }

    setSelectedSeats((prev) => {
      try {
        return prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId];
      } catch (error) {
        console.error('Error in toggleSeat:', error);
        return prev; // Return previous state on error
      }
    });
  };

  /**
   * Change multiplex location and reset seat selection
   * @param {string} cinema - The cinema/multiplex name
   */
  const changeMultiplex = (cinema) => {
    setMultiplex(cinema);
    setSelectedSeats([]);
  };

  /**
   * Clear all selected seats
   */
  const clearSeats = () => {
    setSelectedSeats([]);
  };

  /**
   * Check if a specific seat is selected
   * @param {string} seatId - The ID of the seat
   * @returns {boolean} Whether the seat is selected
   */
  const isSelected = (seatId) => selectedSeats.includes(seatId);

  return {
    // State
    selectedSeats,
    multiplex,
    movie: movieData,

    // Price breakdown
    priceBreakdown,

    // Actions
    toggleSeat,
    changeMultiplex,
    clearSeats,
    isSelected,
  };
}
