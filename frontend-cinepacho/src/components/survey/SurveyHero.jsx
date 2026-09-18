import { useTranslation } from 'react-i18next';

export default function SurveyHero() {

    const { t } = useTranslation();

    return (

        <div className="text-center space-y-4 mb-4">

            <h1 className="
                font-headline
                text-4xl md:text-5xl
                font-black
                text-white
                tracking-tight
            ">
                {t('survey.hero.title')}
            </h1>

            <p className="
                text-on-surface-variant
                text-lg
                max-w-xl
                mx-auto
            ">
                {t('survey.hero.description')}
            </p>

        </div>

    );
}