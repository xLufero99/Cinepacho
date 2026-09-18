//Lógica y presentación del carrusel
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useCarousel from '../../hooks/useCarousel';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import MovieCard from '../common/MovieCard';
import CarouselControls from '../common/CarouselControls';

export default function FeaturedCarousel({ movies }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // ✅ PRIMERO: llamar al hook SIEMPRE (con un valor seguro)
    const totalItems = movies?.length || 0;
    const { currentIndex, nextSlide, prevSlide, goToSlide } = useCarousel(totalItems, 6000);

    // ✅ DESPUÉS: el return condicional
    if (!movies || movies.length === 0) {
        return null;
    }

    // Índices para las tarjetas laterales
    const getPrevIndex = () => (currentIndex - 1 + movies.length) % movies.length;
    const getNextIndex = () => (currentIndex + 1) % movies.length;

    const handleMovieSelection = (movie) => {
        navigate(`/movie/${movie.id}`);
    };

    return (
        <section className="py-24 bg-surface overflow-hidden">
        <Container>
            <SectionTitle
            subtitle={t('carousel.subtitle')}
            className="mb-16"
            >
            {t('carousel.featuredMovies')} <span className="text-primary italic font-black"></span>
            </SectionTitle>

            <div className="relative">
            {/* Grilla del Carrusel (3 Tarjetas) */}
            <div className="flex items-center justify-center gap-4 lg:gap-8">

                {/* Tarjeta Izquierda (Previa) */}
                <div className="hidden md:block w-1/4">
                <MovieCard
                    movie={movies[getPrevIndex()]}
                    onClick={() => handleMovieSelection(movies[getPrevIndex()])}
                    className="opacity-40 scale-90 grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
                />
                </div>

                {/* Tarjeta Central (Actual) */}
                <div className="w-full md:w-1/3 z-10">
                <MovieCard
                    movie={movies[currentIndex]}
                    isLarge={true}
                    onClick={() => handleMovieSelection(movies[currentIndex])}
                />
                </div>

                {/* Tarjeta Derecha (Siguiente) */}
                <div className="hidden md:block w-1/4">
                <MovieCard
                    movie={movies[getNextIndex()]}
                    onClick={() => handleMovieSelection(movies[getNextIndex()])}
                    className="opacity-40 scale-90 grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
                />
                </div>
            </div>

            {/* Controles integrados */}
            <CarouselControls
                count={movies.length}
                currentIndex={currentIndex}
                onNext={nextSlide}
                onPrev={prevSlide}
                onGoTo={goToSlide}
            />
            </div>
        </Container>
        </section>
    );
}