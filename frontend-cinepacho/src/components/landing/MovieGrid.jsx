//Contenedor de las películas - Diseño basado en CinemaGrid
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import MovieCard from '../common/MovieCard';
import { useTranslation } from 'react-i18next';

export default function MovieGrid({ movies: moviesProp, filter = '' }) {
  const { t } = useTranslation();

  // Filter movies based on search query
  const filteredMovies = (moviesProp || []).filter(movie =>
    movie.nombre.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section id="cartelera" className="py-20 bg-background scroll-mt-20">
      <Container>
        <SectionTitle
          subtitle={t('movies.subtitle')}
          className="mb-12"
        >
          {t('movies.title')} <span className="text-primary uppercase">{t('movies.titleHighlight')}</span>
        </SectionTitle>

        {/*Grid responsive*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-on-surface-variant">{t('movies.noResults')}</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
