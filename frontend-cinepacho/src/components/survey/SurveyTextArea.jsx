import { useTranslation } from 'react-i18next';

export default function SurveyTextArea({
    value,
    onChange
}) {

    const { t } = useTranslation();

    return (

        <div className="space-y-3">

            <label className="
                text-xl
                font-bold
                text-white
            ">
                {t('survey.feedback.title')}
            </label>

            <p className="
                text-sm
                text-on-surface-variant
            ">
                {t('survey.feedback.description')}
            </p>

            <textarea
                rows={5}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={t('survey.feedback.placeholder')}
                className="
                    w-full
                    bg-surface-container-high
                    border border-outline-variant/10
                    rounded-2xl
                    p-4
                    text-white
                    resize-none
                    outline-none
                    focus:border-primary
                    transition-all
                "
            />

        </div>

    );
}