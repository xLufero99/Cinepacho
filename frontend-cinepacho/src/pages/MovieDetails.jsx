import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MainLayout from '../components/layout/MainLayout';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';

import { useBookingContext } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { getMovieById } from '../services/movieService';
import { getShowtimesByMovieAndHeadquarters } from '../services/showtimeService';
import api from '../services/api';

// Función para extraer la hora HH:MM de cualquier formato
const extractTime = (hora) => {
  if (!hora) return '--:--';
  if (typeof hora === 'string' && hora.includes(':')) {
    return hora.substring(0, 5);
  }
  try {
    const date = new Date(hora);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch(e) {}
  return '--:--';
};

const getEntityId = (entity) => entity?.id || entity?._id || entity?.routerKey || entity?.salaId || null;

export default function MovieDetails({ user }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const isEmployeeFlow = location.pathname.startsWith('/employee');
  
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salasMap, setSalasMap] = useState({});

  const { selectedHeadquarters, updateMovieSelection } = useBookingContext();
  
  // Cargar las salas de la sede actual
  useEffect(() => {
    const loadSalas = async () => {
      if (selectedHeadquarters?.id) {
        try {
          const response = await api.get(`/salas/sede/${selectedHeadquarters.id}`);
          const mapa = {};
          response.data.forEach(sala => {
            const salaId = getEntityId(sala);
            if (salaId) {
              mapa[salaId] = sala.nombre || sala.name || salaId;
            }
          });
          setSalasMap(mapa);
          console.log('🏢 Salas cargadas:', mapa);
        } catch (error) {
          console.error('Error cargando salas:', error);
        }
      }
    };
    loadSalas();
  }, [selectedHeadquarters]);

  useEffect(() => {
    const loadMissingSalaNames = async () => {
      if (!showtimes.length) {
        return;
      }

      const missingSalaIds = [...new Set(
        showtimes
          .map((showtime) => showtime?.salaId)
          .filter((salaId) => salaId && !salasMap[String(salaId)])
      )];

      if (missingSalaIds.length === 0) {
        return;
      }

      try {
        const salaResults = await Promise.all(
          missingSalaIds.map(async (salaId) => {
            const response = await api.get(`/salas/${salaId}`);
            const fetchedSalaId = getEntityId(response.data) || salaId;
            return [String(fetchedSalaId), response.data?.nombre || response.data?.name || fetchedSalaId];
          })
        );

        setSalasMap((prev) => ({
          ...prev,
          ...Object.fromEntries(salaResults)
        }));
      } catch (error) {
        console.error('Error cargando nombres de sala faltantes:', error);
      }
    };

    loadMissingSalaNames();
  }, [showtimes, salasMap]);

  // Cargar película y horarios
  useEffect(() => {
    window.scrollTo(0, 0);
    const loadMovieData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const movieData = await getMovieById(id);
        setMovie(movieData);

        if (!authUser) {
          setShowtimes([]);
        } else if (selectedHeadquarters?.id) {
          const rawShowtimes = await getShowtimesByMovieAndHeadquarters(id, selectedHeadquarters.id);
          
          // Transformar datos del backend (id -> _id, hora -> hora_inicio)
          const transformed = rawShowtimes.map(show => ({
            ...show,
            _id: show.id,
            hora_inicio: show.hora,
          }));
          setShowtimes(transformed);
        } else {
          setShowtimes([]);
        }
      } catch (err) {
        console.error(err);
        setError(t('landing.error'));
      } finally {
        setLoading(false);
      }
    };
    loadMovieData();
  }, [id, selectedHeadquarters, authUser, t]);

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-20">{t('landing.loading')}</div>
        </Container>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-20 text-red-500">{error}</div>
        </Container>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">{t('movieDetails.movieNotFound')}</h1>
            <Button onClick={() => navigate('/')}>{t('movieDetails.backToHome')}</Button>
          </div>
        </Container>
      </MainLayout>
    );
  }


  
const handleBookTickets = () => {
  if (!authUser) {
    navigate('/login');
    return;
  }

  if (!selectedShowtime) return;

  console.log('🎫 Showtime a guardar:', selectedShowtime);
  console.log('🎫 Precios:', {
    precio_general: selectedShowtime.precio_general,
    precio_preferencial: selectedShowtime.precio_preferencial
  });
  updateMovieSelection(movie, selectedShowtime);
  navigate(isEmployeeFlow
    ? `/employee/booking/showtime/${selectedShowtime.id}`
    : `/booking/showtime/${selectedShowtime.id}`);
};




  return (
    <MainLayout>
      <Container>
        <div className="max-w-6xl mx-auto py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Poster */}
            <div className="aspect-[2/3] rounded-xl overflow-hidden">
              <img
                src={movie.urlPoster || movie.url_poster || '/placeholder-movie.jpg'}
                alt={movie.nombre}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Información */}
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tighter mb-4">
                {movie.nombre}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-sm font-label">
                  {movie.clasificacion}
                </span>
                {movie.generos?.map((genre, index) => {
                  const genreKey = genre.toLowerCase().replace(/[^a-z]/g, '');
                  return (
                    <span key={index} className="px-3 py-1 bg-surface-container-high text-on-surface rounded-full text-sm font-label">
                      {t(`genres.${genreKey}`, genre)}
                    </span>
                  );
                })}
                <span className="px-3 py-1 bg-surface-container-high text-on-surface rounded-full text-sm font-label">
                  {movie.duracion || '120 min'}
                </span>
              </div>

              <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
                {movie.descripcion}
              </p>

              {/* Horarios */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{t('movieDetails.availableShowtimes')}</h3>
                {!selectedHeadquarters && (
                  <div className="text-on-surface-variant mb-4">
                    {t('movieDetails.pleaseSelectCinema')}
                  </div>
                )}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {showtimes.length > 0 ? (
                    showtimes.map((showtime) => (
                      <button
                        key={showtime._id}
                        onClick={() => setSelectedShowtime(showtime)}
                        className={`px-4 py-2 rounded-lg text-sm font-label transition-colors ${
                          selectedShowtime?._id === showtime._id
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high hover:bg-primary hover:text-on-primary'
                        }`}
                      >
                        <div>
                          {extractTime(showtime.hora_inicio)}
                        </div>
                        <div className="text-xs opacity-80">
                          {showtime.sala?.nombre || showtime.salaNombre || salasMap[String(showtime.salaId)] || showtime.salaId} • {showtime.formato}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full text-on-surface-variant">
                      {selectedHeadquarters
                        ? t('movieDetails.showtimesNotAvailable')
                        : t('movieDetails.selectCinemaFirst')}
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de reserva */}
              <div className="space-y-2">
                <Button
                  onClick={handleBookTickets}
                  className={`w-full md:w-auto px-8 py-4 text-lg ${
                    !authUser && !selectedShowtime ? '' : (!selectedShowtime ? 'opacity-50 cursor-not-allowed' : '')
                  }`}
                  disabled={authUser && !selectedShowtime}
                >
                  {!authUser
                    ? t('movieDetails.loginToSeeShowtimes')
                    : selectedShowtime
                    ? t('movieDetails.bookTicketsWithTime', {
                        showtime: extractTime(selectedShowtime.hora_inicio),
                      })
                    : t('movieDetails.bookTickets')}
                </Button>
                {authUser && !selectedShowtime && (
                  <p className="text-sm text-on-surface-variant">
                    {t('movieDetails.pleaseSelectShowtime')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}