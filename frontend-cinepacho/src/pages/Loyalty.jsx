// src/pages/Loyalty.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import Container from '../components/layout/Container';

export default function Loyalty() {
    const { t } = useTranslation();
    const { user } = useAuth();
    
    const [userPoints, setUserPoints] = useState(0);
    const [pointsHistory, setPointsHistory] = useState([]);
    const [freeTickets, setFreeTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loyaltyConfig, setLoyaltyConfig] = useState({
        puntos_redencion: 100,
        puntos_boletas: 10,
        puntos_snacks: 5,
        vigencia_boleta_gratis_meses: 6,
        tipo_boleta_gratis: 'general'
    });

    const userId = user?._id || user?.id;

    // Cargar configuración de lealtad
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await api.get('/cliente/mis-puntos/config');
                if (response.data) {
                    setLoyaltyConfig(response.data);
                }
            } catch (error) {
                console.error('Error loading loyalty config:', error);
            }
        };
        loadConfig();
    }, []);

    // Cargar puntos del usuario
    useEffect(() => {
        const loadUserPoints = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Obtener puntos totales
                const pointsRes = await api.get(`/usuarios/${userId}/puntos`);
                setUserPoints(pointsRes.data || 0);
                
                // Obtener historial
                const historyRes = await api.get(`/usuarios/${userId}/puntos/historial`);
                setPointsHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
                
                // Obtener boletas gratis
                const ticketsRes = await api.get(`/usuarios/${userId}/boletas`);
                setFreeTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
                
            } catch (error) {
                console.error('Error loading user points:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserPoints();
    }, [userId]);

    // Calcular progreso para la siguiente boleta
    const threshold = loyaltyConfig?.puntos_redencion || 100;
    const currentProgress = userPoints % threshold;
    const progressPercentage = (currentProgress / threshold) * 100;
    const pointsNeeded = threshold - currentProgress;
    
    // Boletas disponibles (no usadas y no expiradas)
    const availableTickets = freeTickets.filter(ticket => {
        const isExpired = ticket.expira ? new Date(ticket.expira) < new Date() : false;
        return !ticket.usada && !isExpired;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen pt-32 flex items-center justify-center">
                    <p className="text-white">Cargando tus puntos...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen pt-32 pb-16 px-4 md:px-8 bg-background">
                <Container>
                    
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-on-surface mb-4">
                            {t('loyalty.brandTitle')}{' '}
                            <span className="text-secondary italic">{t('loyalty.brandHighlight')}</span>
                        </h1>
                        <p className="font-body text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto">
                            {t('loyalty.description')}
                        </p>
                    </div>

                    {/* Puntos Totales */}
                    <div className="bg-surface-container-high rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner">
                                    <span className="material-symbols-outlined text-5xl">workspace_premium</span>
                                </div>
                                <div>
                                    <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-2">
                                        {t('user.myPoints')}
                                    </p>
                                    <p className="font-headline text-6xl font-black text-secondary leading-none">
                                        {userPoints}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <p className="font-label text-2xl text-primary mb-1">{loyaltyConfig?.puntos_boletas || 10}</p>
                                    <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider">{t('loyalty.perTicket')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-label text-2xl text-primary mb-1">{loyaltyConfig?.puntos_snacks || 5}</p>
                                    <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider">{t('loyalty.perSnack')}</p>
                                </div>
                                <div className="text-center border-l border-outline-variant/30 pl-8">
                                    <p className="font-label text-2xl text-secondary mb-1">{loyaltyConfig?.puntos_redencion || 100}</p>
                                    <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider">{t('loyalty.freeTicket')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progreso para siguiente boleta */}
                    <div className="bg-surface-container-low rounded-xl p-6 mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="font-headline text-xl font-bold text-on-surface">{t('loyalty.nextReward')}</h2>
                            <span className="font-label text-sm text-secondary">
                                {currentProgress} / {threshold}
                            </span>
                        </div>
                        
                        <div className="bg-surface-container-highest h-4 rounded-full overflow-hidden border border-outline-variant/15">
                            <div 
                                className="h-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-500 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                            <p className="font-body text-sm text-on-surface-variant">
                                {t('loyalty.pointsNeeded')}: {pointsNeeded} puntos
                            </p>
                        </div>
                    </div>

                    {/* Boletas Gratis Disponibles */}
                    {availableTickets.length > 0 && (
                        <div className="bg-surface-container-low rounded-xl p-6 mb-8">
                            <h2 className="font-headline text-xl font-bold mb-6 text-on-surface">
                                {t('loyalty.yourFreeTickets')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableTickets.map((ticket, index) => (
                                    <div key={ticket.id || index} className="bg-surface-container-high rounded-lg p-4 border border-outline-variant/20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-secondary">confirmation_number</span>
                                                <span className="font-label text-sm font-bold text-secondary uppercase">
                                                    {t('loyalty.freeTicket')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-body text-xs text-on-surface-variant">
                                                {t('loyalty.issued')}: {formatDate(ticket.generada)}
                                            </p>
                                            <p className="font-body text-xs text-on-surface-variant">
                                                {t('loyalty.expires')}: {formatDate(ticket.expira)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Historial de Puntos */}
                    <div className="bg-surface-container-low rounded-xl p-6">
                        <h2 className="font-headline text-xl font-bold mb-6 text-on-surface">
                            {t('loyalty.pointsHistory')}
                        </h2>
                        
                        {pointsHistory.length > 0 ? (
                            <div className="space-y-4">
                               {pointsHistory.slice(0, 20).map((item, index) => {
    // Determinar el texto a mostrar según el tipo
    let displayTitle = '';
    let displayIcon = '';
    let iconBgClass = '';
    
    if (item.tipo === 'GANADA_BOLETA') {
        displayTitle = 'Compra de boletas';
        displayIcon = 'movie';
        iconBgClass = 'bg-secondary/10 text-secondary';
    } 
    else if (item.tipo === 'GANADA_SNACK') {
        displayTitle = 'Compra de snacks';
        displayIcon = 'fastfood';
        iconBgClass = 'bg-secondary/10 text-secondary';
    }
    else if (item.tipo === 'CANJEADA_BOLETA') {
        displayTitle = 'Canje de boleta gratis';
        displayIcon = 'confirmation_number';
        iconBgClass = 'bg-primary/10 text-primary';
    }
    else if (item.tipo === 'REEMBOLSO') {
        displayTitle = 'Reembolso de puntos';
        displayIcon = 'history';
        iconBgClass = 'bg-primary/10 text-primary';
    }
    else {
        displayTitle = item.motivo || 'Movimiento de puntos';
        displayIcon = 'stars';
        iconBgClass = item.puntos > 0 ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary';
    }
    
    return (
        <div key={item.id || index} className="flex items-center justify-between p-4 bg-surface-container-high rounded-lg hover:bg-surface-bright transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${iconBgClass}`}>
                    <span className="material-symbols-outlined">
                        {displayIcon}
                    </span>
                </div>
                <div>
                    <h4 className="font-body font-semibold text-on-surface">
                        {displayTitle}
                    </h4>
                    <p className="font-body text-xs text-on-surface-variant">
                        {formatDate(item.fecha)}
                    </p>
                </div>
            </div>
            <div className={`font-label font-bold text-lg ${
                item.puntos > 0 ? 'text-secondary' : 'text-primary'
            }`}>
                {item.puntos > 0 ? '+' : ''}{item.puntos} pts
            </div>
        </div>
    );
})}
                            </div>
                        ) : (
                            <p className="font-body text-sm text-on-surface-variant text-center py-8">
                                {t('loyalty.noHistory')}
                            </p>
                        )}
                    </div>

                </Container>
            </div>
        </MainLayout>
    );
}