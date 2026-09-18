import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Reutilizamos tus servicios y componentes de la Landing
import { getMovies } from '../../../services/movieService';
import MovieGrid from '../../landing/MovieGrid';
import Container from '../../layout/Container';
import { useBookingContext } from '../../../contexts/BookingContext';

export default function BookingAssisted() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const { sedeActualInfo } = useOutletContext();
    const { clearBookingData } = useBookingContext();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        clearBookingData(); 
        
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const data = await getMovies();
                setMovies(data);
            } catch (err) {
                console.error("Error en taquilla asistida:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // <--- ARRAY VACÍO: Solo se ejecuta al montar el componente

    const handleMovieClick = (movie) => {
        navigate(`/employee/movie/${movie.id || movie._id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {t('employee.bookingAssisted.ticketOffice')} <span className="text-primary">{sedeActualInfo?.nombre || t('employee.bookingAssisted.general')}</span>
                    </h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                        {t('employee.bookingAssisted.select')}
                    </p>
                </div>
                
                <div className="relative w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input 
                        type="text"
                        placeholder={t('employee.bookingAssisted.placeHolderSearch')}
                        className="w-full bg-surface-container-highest rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none border border-outline-variant/20 focus:border-primary/50 text-white"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse text-primary">{t('landing.loading')}</div>
            ) : (
                <div className="bg-surface-container-low/30 rounded-3xl p-6">
                    <MovieGrid 
                        movies={movies} 
                        filter={searchQuery}
                        onMovieClick={handleMovieClick} 
                    />
                </div>
            )}
        </div>
    );
}