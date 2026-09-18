import StarRating from './StarRating';

export default function SurveySection({
    title,
    subtitle,
    value,
    onChange,
    excellentLabel
}) {

    return (

        <div className="flex flex-col gap-4">

            <div className="flex justify-between items-end">

                <label className="
                    text-xl
                    font-bold
                    text-white
                ">
                    {title}
                </label>

                <span className="
                    text-sm
                    text-on-surface-variant
                ">
                    {subtitle}
                </span>

            </div>

            <StarRating
                value={value}
                onChange={onChange}
                excellentLabel={excellentLabel}
            />

        </div>

    );
}