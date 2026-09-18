// src/components/survey/MovieSelector.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MovieSelector({
    movies,
    selectedMovie,
    onSelect
}) {

    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMovies = movies.filter(movie => {
        const movieName = movie.nombre || movie.titulo || '';
        return movieName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (

        <div className="
            bg-surface-container
            rounded-3xl
            p-8 md:p-10
            border border-outline-variant/10
            shadow-2xl
        ">

            {/* Header */}
            <div className="text-center mb-10">
                <p className="
                    text-[10px]
                    uppercase
                    tracking-[0.3em]
                    text-primary
                    font-black
                    mb-3
                ">
                    {t('survey.selector.badge')}
                </p>

                <h2 className="
                    font-headline
                    text-3xl md:text-4xl
                    font-black
                    text-white
                    uppercase
                    tracking-tight
                ">
                    {t('survey.selector.title')}
                </h2>

                <div className="w-12 h-1 bg-primary rounded-full mx-auto mt-4" />

                <p className="
                    text-sm
                    text-on-surface-variant
                    mt-4
                    max-w-md
                    mx-auto
                ">
                    {t('survey.selector.description')}
                </p>
            </div>

            {/* Campo de búsqueda */}
            <div className="max-w-md mx-auto mb-10">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder={t('survey.selector.searchPlaceholder') || t('employee.dashboard.placeHolderSearch')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                            w-full
                            bg-surface-container-high
                            border border-outline-variant/20
                            rounded-2xl
                            pl-12 pr-4 py-4
                            text-sm text-white
                            placeholder:text-outline/50
                            outline-none
                            focus:border-primary
                            focus:ring-2 focus:ring-primary/20
                            transition-all
                        "
                    />
                </div>
            </div>

            {/* Grid de películas */}
            {filteredMovies.length === 0 ? (
                <div className="text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-outline mb-4">
                        movie_off
                    </span>
                    <p className="text-on-surface-variant">
                        {searchTerm ? 'No se encontraron películas' : 'No hay películas disponibles'}
                    </p>
                </div>
            ) : (
                <div className="
                    grid 
                    grid-cols-1 
                    sm:grid-cols-2 
                    lg:grid-cols-3 
                    xl:grid-cols-4
                    gap-6
                ">
                    {filteredMovies.map((movie) => {

                        const movieId = movie.id || movie._id;
                        const isSelected = selectedMovie?._id === movie._id || selectedMovie?.id === movieId;
                        const movieName = movie.nombre || movie.titulo || 'Sin título';
                        const posterUrl = movie.urlPoster || movie.poster || movie.url_poster || '/placeholder-movie.jpg';
                        const genres = movie.generos || [];

                        return (

                            <button
                                key={movieId}
                                onClick={() => onSelect(movie)}
                                className={`
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-2xl
                                    transition-all
                                    duration-300
                                    text-left
                                    bg-surface-container-high
                                    hover:scale-[1.02]
                                    hover:shadow-2xl
                                    hover:shadow-primary/20
                                    ${isSelected ? 'scale-[1.02] shadow-xl shadow-primary/20' : ''}
                                `}
                            >

                                {/* Poster */}
                                <div className="relative aspect-[2/3] overflow-hidden">
                                    <img
                                        src={posterUrl}
                                        alt={movieName}
                                        className="
                                            w-full 
                                            h-full 
                                            object-cover 
                                            transition-transform 
                                            duration-700 
                                            group-hover:scale-110
                                        "
                                        onError={(e) => { e.target.src = '/placeholder-movie.jpg' }}
                                    />
                                    
                                    {/* Overlay gradiente */}
                                    <div className="
                                        absolute 
                                        inset-0 
                                        bg-gradient-to-t 
                                        from-black/80 
                                        via-black/20 
                                        to-transparent
                                        opacity-60
                                        group-hover:opacity-80
                                        transition-opacity
                                    " />
                                    
                                    {/* Géneros badge */}
                                    {genres.length > 0 && (
                                        <div className="
                                            absolute 
                                            top-3 
                                            left-3
                                            flex 
                                            gap-1
                                            flex-wrap
                                        ">
                                            <span className="
                                                text-[9px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                bg-black/60
                                                backdrop-blur-sm
                                                px-2
                                                py-0.5
                                                rounded-full
                                                text-primary
                                            ">
                                                {genres[0]}
                                            </span>
                                        </div>
                                    )}

                                    {/* Checkmark cuando está seleccionada - SIN BORDE ROJO */}
                                    
                                </div>

                                {/* Información */}
                                <div className="p-4 space-y-1 bg-surface-container-high">
                                    <h3 className="
                                        font-headline 
                                        font-bold 
                                        text-sm 
                                        text-white 
                                        line-clamp-1
                                        group-hover:text-primary
                                        transition-colors
                                    ">
                                        {movieName}
                                    </h3>
                                    
                                    {genres.length > 1 && (
                                        <p className="
                                            font-body 
                                            text-[10px] 
                                            text-on-surface-variant 
                                            line-clamp-1
                                        ">
                                            {genres.slice(1, 3).join(' • ')}
                                        </p>
                                    )}

                                    {/* Indicador de calificación */}
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="material-symbols-outlined text-primary text-xs">
                                            star
                                        </span>
                                        <span className="font-label text-xs text-on-surface-variant">
                                            {movie.calificacionPromedio && movie.calificacionPromedio > 0 
                                                ? movie.calificacionPromedio.toFixed(1) 
                                                : 'Nuevo'}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de selección - aparece al hover */}
                                <div className="
                                    absolute 
                                    inset-0 
                                    flex 
                                    items-center 
                                    justify-center
                                    bg-black/60
                                    backdrop-blur-sm
                                    opacity-0
                                    group-hover:opacity-100
                                    transition-opacity
                                    duration-300
                                ">
                                    <span className="
                                        px-6 
                                        py-2 
                                        bg-primary 
                                        text-on-primary 
                                        text-xs 
                                        font-black
                                        uppercase
                                        tracking-wider
                                        rounded-full
                                        shadow-lg
                                        transform
                                        translate-y-4
                                        group-hover:translate-y-0
                                        transition-transform
                                        duration-300
                                    ">
                                        {isSelected ? t('survey.selector.selected') || 'SELECCIONADA' : t('survey.selector.select') || 'SELECCIONAR'}
                                    </span>
                                </div>

                            </button>

                        );

                    })}
                </div>
            )}

            {/* Indicador de cantidad */}
            {filteredMovies.length > 0 && (
                <div className="text-center mt-8 pt-6 border-t border-outline-variant/10">
                    <p className="text-xs text-on-surface-variant">
                        Mostrando {filteredMovies.length} de {movies.length} películas
                    </p>
                </div>
            )}

        </div>

    );
}