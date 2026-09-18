// src/pages/MovieSurvey.jsx
import { useEffect, useState } from 'react';
import L from '../services/api';

import MainLayout from '../components/layout/MainLayout';
import SurveyHero from '../components/survey/SurveyHero';
import SurveyCard from '../components/survey/SurveyCard';
import MovieSelector from '../components/survey/MovieSelector';

export default function MovieSurvey({ user }) {

    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSurveyForm, setShowSurveyForm] = useState(false);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await L.get('/peliculas');
                console.log('🎬 Películas cargadas:', response.data);
                setMovies(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('❌ Error:', err);
                setError('No se pudieron cargar las películas');
            } finally {
                setLoading(false);
            }
        };
        
        fetchMovies();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // ✅ Manejar selección de película
    const handleSelectMovie = (movie) => {
        setSelectedMovie(movie);
        setShowSurveyForm(true);
    };

    // ✅ Manejar cuando se completa la encuesta - CORREGIDO con =>
    const handleSurveyComplete = () => {
        setShowSurveyForm(false);
        setSelectedMovie(null);
    };

    if (loading) {
        return (
            <MainLayout onSearch={handleSearch}>
                <div className="min-h-screen pt-32 flex items-center justify-center">
                    <p className="text-white">Cargando películas...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout onSearch={handleSearch}>
                <div className="min-h-screen pt-32 flex items-center justify-center">
                    <p className="text-red-400">{error}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout onSearch={handleSearch}>
            <main className="
                min-h-screen
                pt-32 pb-16
                px-4 md:px-8
                bg-background
                relative overflow-hidden
            ">
                <div className="
                    absolute inset-0
                    opacity-10
                    pointer-events-none
                    bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))]
                    from-primary
                    via-background
                    to-background
                " />

                <div className="
                    relative z-10
                    max-w-5xl
                    mx-auto
                    space-y-10
                ">

                    <SurveyHero />

                    {!showSurveyForm ? (
                        <MovieSelector
                            movies={movies}
                            selectedMovie={selectedMovie}
                            onSelect={handleSelectMovie}
                        />
                    ) : (
                        <SurveyCard 
                            selectedMovie={selectedMovie}
                            onComplete={handleSurveyComplete}
                        />
                    )}

                </div>

            </main>
        </MainLayout>
    );
}