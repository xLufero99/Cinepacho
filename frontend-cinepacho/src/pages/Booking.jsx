import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MainLayout from '../components/layout/MainLayout';
import Container from '../components/layout/Container';
import MovieInfo from '../components/booking/MovieInfo';
import SeatMap from '../components/booking/SeatMap';
import BookingSummary from '../components/booking/BookingSummary';

import { useBookingContext } from '../contexts/BookingContext';

import { getShowtimeSeats } from '../services/showtimeService';

import { bookingGrid, leftColumn, centerColumn, rightColumn } from '../utils/bookingStyles';

const SEAT_LEGEND = [
  { status: 'available', label: 'booking.available', color: 'bg-surface-container-highest' },
  { status: 'selected', label: 'booking.selected', color: 'bg-primary' },
  { status: 'occupied', label: 'booking.occupied', color: 'bg-surface-variant/30' },
];

const SeatLegendItem = ({ status, label, color }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-md ${color}`} />
      <span className="font-body text-sm text-on-surface-variant">{t(label)}</span>
    </div>
  );
};

const SeatLegend = () => (
  <div className="flex flex-wrap gap-6 md:gap-8 justify-center py-6 md:py-8 border-t border-outline-variant/10">
    {SEAT_LEGEND.map((item) => (
      <SeatLegendItem key={item.status} status={item.status} label={item.label} color={item.color} />
    ))}
  </div>
);

export default function Booking({ user }) {
  const { t } = useTranslation();
  
  const navigate = useNavigate();
  const location = useLocation();
  const isEmployeeFlow = location.pathname.startsWith('/employee');
  
  const { selectedMovie, selectedShowtime, selectedHeadquarters, selectedSeats, updateSeatSelection, updateMovieSelection } = useBookingContext();

console.log('🔍 Booking - selectedShowtime:', selectedShowtime);
console.log('🔍 Booking - selectedMovie:', selectedMovie);

  const [seats, setSeats] = useState({general: [], preferencial: [],});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const handleContinueToSnacks = () => {
    if (selectedSeats.length === 0) {
      alert(t('booking.pleaseSelectAtLeastOneSeat'));
      return;
    }
    updateSeatSelection(selectedSeats);
    navigate(isEmployeeFlow ? '/employee/assistedSnacks' : '/snacks');
  };

  const handleContinueToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert(t('booking.pleaseSelectAtLeastOneSeat'));
      return;
    }
    updateSeatSelection(selectedSeats);
    navigate(isEmployeeFlow ? '/employee/checkout' : '/checkout');
  };

 useEffect(() => {
  // Si el contexto no tiene selectedShowtime, intentar restaurar desde localStorage
  if (!selectedShowtime) {
    const savedShowtime = localStorage.getItem('temp_showtime');
    const savedMovie = localStorage.getItem('temp_movie');
    
    if (savedShowtime && savedMovie) {
      console.log('🔄 Restaurando showtime desde localStorage');
      const showtime = JSON.parse(savedShowtime);
      const movie = JSON.parse(savedMovie);
      updateMovieSelection(movie, showtime);
      localStorage.removeItem('temp_showtime');
      localStorage.removeItem('temp_movie');
    }
  }
}, [selectedShowtime, updateMovieSelection]);

useEffect(() => {
  const loadSeats = async () => {
    try {
      setLoading(true);
      console.log('🎯 Cargando asientos para showtime ID:', selectedShowtime?.id || selectedShowtime?._id);
      const seatsData = await getShowtimeSeats(selectedShowtime?.id || selectedShowtime?._id);
      console.log('📊 Datos COMPLETOS de asientos:', JSON.stringify(seatsData, null, 2)); // <----- AQUÍ
      setSeats(seatsData);
    } catch (err) {
      console.error('❌ Error cargando asientos:', err);
      setError(t('landing.error'));
    } finally {
      setLoading(false);
    }
  };

  if (selectedShowtime?.id || selectedShowtime?._id) {
    loadSeats();
  }
}, [selectedShowtime, t]);

  const toggleSeat = (seatId) => {
    const alreadySelected =
      selectedSeats.includes(seatId);

    if (alreadySelected) {
      updateSeatSelection(
        selectedSeats.filter(
          (id) => id !== seatId
        )
      );
    } else {
      updateSeatSelection([
        ...selectedSeats,
        seatId,
      ]);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-20">
            {t('landing.loading')}
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-20 text-red-500">
            {error}
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (!selectedMovie || !selectedShowtime){
    return (
      <MainLayout >
        <Container>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">{t('booking.movieNotFound')}</h1>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-primary text-on-primary rounded-full"
            >
              {t('booking.goBack')}
            </button>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout >
      <Container className="min-h-0 flex flex-col pt-6">
        {/* Main Grid Layout - Unified 3-column interface */}
        <div className={`${bookingGrid} mt-4 md:mt-6 flex-grow min-h-0`}>
          {/* Left Column: Movie Cover & Details */}
          <section className={leftColumn}>
            <MovieInfo
              movie={selectedMovie}
              showtime={selectedShowtime}
              selectedHeadquarters={selectedHeadquarters}
            />
          </section>

          {/* Center Column: Showtime Selector & Seat Map */}
          <section className={centerColumn}>
            {/* Seat Map */}
            <SeatMap
              seats={seats}
              selectedSeats={selectedSeats}
              onSelectSeat={toggleSeat}
              generalPrice={selectedShowtime.precio_general}
              preferentialPrice={selectedShowtime.precio_preferencial}
            />

            {/* Seat Legend */}
            <SeatLegend />
          </section>

          {/* Right Column: Invoice Panel */}
          <BookingSummary
  selectedSeats={selectedSeats}
  onContinueToCheckout={handleContinueToCheckout}
/>
        </div>
      </Container>
    </MainLayout>
  );
}
