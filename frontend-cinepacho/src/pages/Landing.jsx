import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MainLayout from '../components/layout/MainLayout';
import HeroSection from '../components/landing/HeroSection';
import FeaturedCarousel from '../components/landing/FeaturedCarousel';
import MovieGrid from '../components/landing/MovieGrid';
import LoyaltyBanner from '../components/common/LoyaltyBanner';
import Container from '../components/layout/Container';
import SectionTitle from '../components/ui/SectionTitle';

import { useBookingContext } from '../contexts/BookingContext';

import { getMovies } from '../services/movieService';
import { getLoyaltyConfig } from '../services/loyaltyService';

export default function Landing({ user }) {

    const { t } = useTranslation();

    //Datos de las películas
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loyaltyConfig, setLoyaltyConfig] = useState(null);

    const { clearBookingData, selectedHeadquarters } = useBookingContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams] = useSearchParams();

    // Clear booking data when user returns to home page, but keep headquarters if navigating from redeem
    useEffect(() => {
        const isRedeemFlow = searchParams.get('redeem') === 'true';
        
        // Only clear headquarters if not in redeem flow (to avoid forcing cinema selection when navigating to cartelera)
        if (!isRedeemFlow) {
            clearBookingData();
        }
    }, []);

    //Cargar las películas
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const data = await getMovies();
                setMovies(data);
            } catch (err) {
                console.error(err);
                setError(t('landing.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    //Cargar configuración de lealtad
    useEffect(() => {
        const fetchLoyaltyConfig = async () => {
            try {
                const config = await getLoyaltyConfig();
                setLoyaltyConfig(config);
            } catch (err) {
                console.error('Error fetching loyalty config:', err);
            }
        };
        fetchLoyaltyConfig();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    ///////////////////////////////////////////////////////
    //Comentado hasta conexión con back xD TEMP

    // //Si cargan las películas
    // if (loading) {
    //     return (
    //         <MainLayout>
    //             <div className="pt-40 text-center">
    //                 {t('landing.loading')}
    //             </div>
    //         </MainLayout>
    //     );
    // }

    // //Si falla retornar las películas
    // if (error) {
    //     return (
    //         <MainLayout>
    //             <div className="pt-40 text-center text-red-500">
    //                 {error}
    //             </div>
    //         </MainLayout>
    //     );
    // }

    return (
        //1. Header
        <MainLayout  onSearch={handleSearch}>

        {/*2. Hero Section */}
        <HeroSection />

        {/*3.Carrusel de Películas*/}
        <FeaturedCarousel movies={movies} />

        {/*4. Grid de Películas (Cartelera)*/}
        <MovieGrid movies={movies} filter={searchQuery} />

        {/*5. Banner de Loyalty*/}
        <Container>
            {loyaltyConfig && <LoyaltyBanner loyaltyConfig={loyaltyConfig} />}
        </Container>

        {/*6. Footer */}
        </MainLayout>
    );
}