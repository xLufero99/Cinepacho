import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { register } from '../services/authService';

import MainLayout from '../components/layout/MainLayout';

import LoginBackground from '../components/login/LoginBackground';
import RegisterCard from '../components/login/RegisterCard';

export default function Register() {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleRegister = async (form) => {
    try {
      setError('');
      
      console.log("🔍 1. Formulario recibido en Register:", form);
      
      const {
        confirmPassword,
        ...userData
      } = form;

      console.log("🔍 2. Datos a enviar al backend:", userData);
      
      const response = await register(userData);
      
      console.log("✅ 3. Respuesta del backend:", response);
      
      navigate('/login');
    } catch (err) {
      console.error("❌ 4. Error capturado:", err);
      console.error("❌ 5. Error response:", err.response);
      console.error("❌ 6. Error message:", err.message);
      
      setError(
        err.response?.data?.message
        || err.message
        || t('register.failed')
      );
    }
  };

  return (
    <MainLayout>

      <div className="
        relative min-h-screen
        overflow-hidden
        bg-background
        flex items-center justify-center
        px-4 py-20
      ">

        <LoginBackground />

        <div className="relative z-10 w-full max-w-md">

          <div className="mb-8 text-center">

            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-6"
            >

              <div className="
                w-12 h-12 rounded-2xl
                bg-primary
                flex items-center justify-center
                shadow-lg shadow-primary/20
              ">

                <span className="
                  material-symbols-outlined
                  text-white text-2xl
                ">
                  movie
                </span>

              </div>

              <div className="text-left">

                <h1 className="
                  text-2xl font-black uppercase
                  text-white leading-none
                ">
                  Cine Pacho
                </h1>

                <p className="
                  text-[10px]
                  uppercase tracking-[0.3em]
                  text-primary font-black
                ">
                  {t('auth.cinemaExperience')}
                </p>

              </div>

            </Link>

          </div>

          <RegisterCard
            onSubmit={handleRegister}
            error={error}
          />

          <p className="
            text-center
            text-sm text-on-surface-variant
            mt-6
          ">

            {t('register.haveAccount')}{' '}

            <Link
              to="/login"
              className="text-primary hover:underline"
            >
              {t('register.login')}
            </Link>

          </p>

        </div>

      </div>

    </MainLayout>
  );
}