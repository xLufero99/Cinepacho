// src/components/survey/SurveyCard.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

import SurveySection from './SurveySection';
import SurveyTextArea from './SurveyTextArea';
import SurveyActions from './SurveyActions';

export default function SurveyCard({ selectedMovie, onComplete }) { // ✅ Recibir onComplete
    const { t } = useTranslation();
    const { user } = useAuth();

    const [movieRating, setMovieRating] = useState(0);
    const [amenitiesRating, setAmenitiesRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async () => {
        if (movieRating === 0) {
            setSubmitError(t('survey.errors.movieRatingRequired') || 'Por favor califica la película');
            return;
        }

        if (amenitiesRating === 0) {
            setSubmitError(t('survey.errors.amenitiesRatingRequired') || 'Por favor califica las comodidades');
            return;
        }

        if (!user?._id && !user?.id) {
            setSubmitError('Debes iniciar sesión para calificar');
            return;
        }

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const usuarioId = user._id || user.id;
            const peliculaId = selectedMovie.id || selectedMovie._id;
            
            const reviewData = {
                tipo: 'pelicula',
                referenciaId: peliculaId,
                puntuacion: movieRating,
                comentario: feedback || `Calificación: ${movieRating}/5 estrellas`,
                usuarioId: usuarioId
            };

            console.log('📝 Enviando reseña:', reviewData);
            await L.post('/calificaciones', reviewData);
            
            setSubmitSuccess(true);
            
            // ✅ Después de 2 segundos, notificar al padre que la encuesta se completó
            setTimeout(() => {
                setSubmitSuccess(false);
                setMovieRating(0);
                setAmenitiesRating(0);
                setFeedback('');
                if (onComplete) {
                    onComplete(); // ✅ Volver al selector de películas
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error:', error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               'Error al guardar tu reseña. Intenta nuevamente.';
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        setMovieRating(0);
        setAmenitiesRating(0);
        setFeedback('');
        setSubmitError(null);
        
        // ✅ También volver al selector si se omite
        if (onComplete) {
            onComplete();
        }
    };

    if (submitSuccess) {
        return (
            <div className="
                bg-surface-container
                rounded-3xl
                p-6 md:p-10
                border border-primary/20
                relative overflow-hidden
                text-center
                space-y-4
            ">
                <div className="
                    w-16 h-16 mx-auto
                    bg-primary/20
                    rounded-full
                    flex items-center justify-center
                ">
                    <span className="material-symbols-outlined text-primary text-3xl">
                        check_circle
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                    ¡Gracias por tu reseña!
                </h3>
                <p className="text-on-surface-variant">
                    Tu opinión nos ayuda a mejorar la experiencia cinematográfica.
                </p>
            </div>
        );
    }

    if (!selectedMovie) return null;

    return (
        <div className="
            bg-surface-container
            rounded-3xl
            p-6 md:p-10
            border border-outline-variant/10
            relative overflow-hidden
            space-y-10
        ">
            <div className="
                absolute -top-24 -right-24
                w-48 h-48
                bg-primary/10
                rounded-full
                blur-3xl
                pointer-events-none
            " />

            {submitError && (
                <div className="
                    px-4 py-3 rounded-2xl
                    bg-red-500/10
                    border border-red-500/20
                    text-sm text-red-400
                ">
                    {submitError}
                </div>
            )}

            <SurveySection
                title={t('survey.movie.title')}
                subtitle={t('survey.movie.subtitle')}
                value={movieRating}
                onChange={setMovieRating}
                excellentLabel={t('survey.labels.masterpiece')}
            />

            <SurveySection
                title={t('survey.amenities.title')}
                subtitle={t('survey.amenities.subtitle')}
                value={amenitiesRating}
                onChange={setAmenitiesRating}
                excellentLabel={t('survey.labels.immaculate')}
            />

            <SurveyTextArea
                value={feedback}
                onChange={setFeedback}
            />

            <SurveyActions
                onSubmit={handleSubmit}
                onSkip={handleSkip}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}