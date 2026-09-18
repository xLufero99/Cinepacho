import { useTranslation } from 'react-i18next';

export default function StarRating({
    value,
    onChange,
    excellentLabel
}) {

    const { t } = useTranslation();

    return (

        <div className="
            flex gap-2 sm:gap-4
            justify-between
            bg-surface-container-high
            p-4
            rounded-2xl
            border border-outline-variant/10
        ">

            {[1, 2, 3, 4, 5].map((star) => {

                const active = star <= value;

                return (

                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className="
                            group
                            flex flex-col items-center gap-2
                            p-2
                            rounded-xl
                            hover:bg-surface-container-highest
                            transition-all
                            w-full
                        "
                    >

                        <span
                            className={`
                                material-symbols-outlined
                                text-3xl
                                transition-colors
                                ${active
                                    ? 'text-primary'
                                    : 'text-outline'}
                            `}
                            style={{
                                fontVariationSettings: `'FILL' ${active ? 1 : 0}`
                            }}
                        >
                            star
                        </span>

                        {star === 1 && (

                            <span className="
                                text-xs
                                text-on-surface-variant
                            ">
                                {t('survey.labels.poor')}
                            </span>

                        )}

                        {star === 5 && (

                            <span className="
                                text-xs
                                text-on-surface-variant
                            ">
                                {excellentLabel}
                            </span>

                        )}

                    </button>

                );

            })}

        </div>

    );
}