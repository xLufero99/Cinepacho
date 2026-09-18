import { useTranslation } from 'react-i18next';

export default function SurveyActions({
    onSubmit,
    onSkip,
    isSubmitting = false
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center gap-5">
            <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="
                    w-full md:w-auto
                    px-12 py-4
                    rounded-2xl
                    bg-primary
                    hover:opacity-90
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-white
                    text-lg
                    font-black
                    tracking-wide
                    transition-all
                    shadow-xl shadow-primary/20
                    flex items-center justify-center gap-2
                "
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('common.sending') || 'Enviando...'}
                    </>
                ) : (
                    t('survey.actions.submit')
                )}
            </button>
            
            <button
                onClick={onSkip}
                disabled={isSubmitting}
                className="
                    text-sm text-on-surface-variant
                    hover:text-primary
                    transition-colors
                    disabled:opacity-50
                "
            >
                {t('survey.actions.skip') || 'Omitir'}
            </button>
        </div>
    );
}