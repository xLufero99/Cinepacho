//Barra de navegación Superior
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../contexts/AuthContext';

import logoImage from '../../assets/logo.png';

import Container from '../layout/Container';

import SearchBar from '../common/SearchBar';
import LanguageSwitcher from '../common/LanguageSwitcher';
import LocationSwitcher from '../common/LocationSwitcher';

import Button from '../ui/Button';

import { cn } from '../../utils/cn';

export default function NavBar({ onSearch }) {
    const { t } = useTranslation();
    const { user } = useAuth();

    // ✅ Normalizar rol para comparaciones consistentes
    const userRol = user?.rol?.toLowerCase();
    const isAdmin = userRol === 'administrador' || userRol === 'admin';
    const isEmployee = userRol === 'empleado';
    
    // Debug: Ver qué rol tiene el usuario
    console.log('Usuario:', user?.nombre, 'Rol:', user?.rol, 'isAdmin:', isAdmin, 'isEmployee', isEmployee);

    const navLinks = [
        { id: 'cartelera', name: t('nav.cartelera'), href: '/?redeem=true#cartelera', hideForAdmin: true, public: true },
        { id: 'loyalty', name: t('nav.loyalty'), href: '/loyalty', hideForAdmin: true, public: true },
        { id: 'survey', name: t('nav.survey'), href: '/survey', hideForAdmin: true, public: true },
        { id: 'dashboard', name: t('nav.dashboard'), href: '/admin', roles: ['administrador', 'admin'] },
        { id: 'dashboard-employee', name: t('nav.dashboard'), href: '/employee', roles: ['empleado'] },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-2xl shadow-black/50">
            <Container>
                <div className="flex justify-between items-center h-20 w-full">
                
                    {/* Logo y Marca */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src={logoImage} alt="Cine Pacho Logo" className="h-9 w-auto group-hover:scale-105 transition-transform" />
                        <div className="font-headline text-2xl font-black uppercase tracking-tighter text-on-surface">
                            CINE <span className="text-primary italic">PACHO</span>
                        </div>
                    </Link>

                    {/* Menú de Navegación con Lógica de Roles */}
                    <div className="hidden md:flex gap-8 items-center">
                        {navLinks.map((link) => {
                            // Ocultar items marcados como hideForAdmin si el usuario es administrador
                            if ((isAdmin || isEmployee) && link.hideForAdmin) return null;
                            // Validación normalizada
                            const isVisible = link.public || (user && link.roles?.includes(userRol));
                            if (!isVisible) return null;

                            const isDashboard = link.id === 'dashboard';
                            const isCartelera = link.id === 'cartelera';

                            return isCartelera ? (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    className={cn(
                                        "font-label text-[11px] font-black uppercase tracking-[0.15em] transition-all",
                                        "text-on-surface-variant hover:text-primary"
                                    )}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.id}
                                    to={link.href}
                                    className={cn(
                                        "font-label text-[11px] font-black uppercase tracking-[0.15em] transition-all",
                                        isDashboard
                                            ? "text-primary hover:text-primary-fixed-dim font-bold"
                                            : "text-on-surface-variant hover:text-primary"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Acciones de Usuario */}
                    <div className="flex items-center gap-4">
                        {!isAdmin && <SearchBar onSearch={onSearch} />}
                        {!(isAdmin|| isEmployee) && <LocationSwitcher />}
                        {!(isAdmin || isEmployee) && (
                            <Link to="/snacks" className="relative group" aria-label={t('nav.snacks')}>
                                <button 
                                    aria-label={t('nav.snacks')}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors focus:outline-none"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-lg text-on-surface">restaurant</span>
                                    <span className="hidden lg:inline font-label text-[11px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
                                        {t('nav.snacks')}
                                    </span>
                                </button>
                            </Link>
                        )}
                        <LanguageSwitcher />

                        {/* USER AUTH */}
                        {user ? (
                            <UserMenu />
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" size="sm" className="font-label tracking-widest px-6">
                                    {t('nav.ingresar')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </Container>
        </nav>
    );
}

function UserMenu() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, logoutUser } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    // ✅ CORREGIDO: Normalizar rol para comparación
    const userRol = user?.rol?.toLowerCase();
    const isAdmin = userRol === 'administrador' || userRol === 'admin';
    const isEmployee = userRol === 'empleado';

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/10 rounded-2xl px-3 py-2 transition-all"
            >
                <img
                    alt="Perfil"
                    className="w-10 h-10 rounded-full object-cover border border-outline-variant/10"
                    src={user?.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'}
                />
                <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-white leading-none">
                        {user?.nombre || 'Usuario'}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-black mt-1">
                        {user?.rol}
                    </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    expand_more
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-16 w-64 bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl z-[100]">
                    <div className="px-5 py-4 border-b border-outline-variant/10">
                        <p className="text-white font-bold text-sm">
                            {user?.nombre || 'Usuario'}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                            {user?.email}
                        </p>
                    </div>

                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-high transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary">dashboard</span>
                            <span className="text-sm font-medium text-white">{t('nav.adminPanel')}</span>
                        </Link>
                    )}

                    {(isEmployee) && (
                        <Link
                            to="/employee/assistedBooking"
                            className="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-high transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary">dashboard</span>
                            <span className="text-sm font-medium text-white">{t('nav.adminPanel')}</span>
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-500/10 text-red-400 transition-colors border-t border-outline-variant/10"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">{t('admin.sidebar.logout')}</span>
                    </button>
                </div>
            )}
        </div>
    );
}