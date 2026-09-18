import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import MainLayout from '../components/layout/MainLayout';

import LoginCard from '../components/login/LoginCard';
import LoginBackground from '../components/login/LoginBackground';
import { useTranslation } from 'react-i18next';

import { login } from '../services/authService';
import employeeService from '../services/employeeService';

export default function Login() {

  const { t } = useTranslation();
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const isInvalidCredentialsError = (errorMessage) => {
    if (!errorMessage) {
      return false;
    }

    const normalizedMessage = errorMessage.toLowerCase();
    return normalizedMessage.includes('credenciales inválidas')
      || normalizedMessage.includes('credenciales invalidas')
      || normalizedMessage.includes('invalid credentials');
  };

const handleLogin = async (credentials) => {
  try{ 
    setError('');
    const data = await login(credentials);
    
    console.log('🔍 Respuesta completa del login:', data);
    
    const usuarioId = data.usuarioId || data.id || data.userId;
    const rolNormalizado = (data.rol || '').toLowerCase();
    
    if (!usuarioId) {
      console.error('❌ No se encontró ID de usuario en la respuesta:', data);
    }
    
    const baseUser = {
      _id: usuarioId,
      nombre: data.usuario || credentials.email,
      email: credentials.email,
      rol: rolNormalizado || 'cliente'
    };

    loginUser(baseUser, data.accessToken);

    const employeeRecord = usuarioId
      ? await employeeService.getByUsuarioId(usuarioId).catch(() => null)
      : null;

    if (rolNormalizado === 'empleado' || employeeRecord) {
      const userProfile = usuarioId
        ? await employeeService.getUserById(usuarioId).catch(() => null)
        : null;

      loginUser(
        {
          ...baseUser,
          ...employeeRecord,
          ...userProfile,
          _id: usuarioId,
          rol: 'empleado',
          employeeId: employeeRecord?.id || employeeRecord?._id || null,
          nombre: userProfile?.nombre || data.usuario || credentials.email,
          email: userProfile?.email || credentials.email
        },
        data.accessToken
      );

      navigate('/employee', { replace: true });
    } else if (rolNormalizado === 'admin' || rolNormalizado === 'administrador') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }

    return data;

  } catch (err) {
    if (isInvalidCredentialsError(err.message) || err.response?.status === 401) {
      setError(t('auth.invalidCredentials'));
    } else {
      setError(err.message || t('login.failed'));
    }
    throw err;
  }
};


  return (
    <MainLayout>
      <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-4 py-20">
        <LoginBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-2xl">movie</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black uppercase text-white leading-none">Cine Pacho</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">{t('auth.cinemaExperience')}</p>
              </div>
            </Link>
          </div>
          <LoginCard
            onSubmit={handleLogin}
            error={error}
            clearError={() => setError('')}
          />
          <p className="text-center text-sm text-on-surface-variant mt-6">
            {t('login.notHaveAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline">{t('login.register')}</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}