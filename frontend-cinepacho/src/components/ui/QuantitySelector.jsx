import { useTranslation } from 'react-i18next';

export default function QuantitySelector({ 
  quantity, 
  onIncrease, 
  onDecrease, 
  min = 0, 
  max = 10,
  size = 'md',
  className = ''
}) {
  const { t } = useTranslation();
  
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const buttonSizes = sizes[size] || sizes.md;
  const textSize = textSizes[size] || textSizes.md;

  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest rounded-full px-2 py-1 border border-outline-variant/20">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${buttonSizes} rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={t('common.decreaseQuantity')}
      >
        <span className="material-symbols-outlined ${textSize}">remove</span>
      </button>
      <span className={`font-label ${textSize} w-4 text-center`}>{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${buttonSizes} rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={t('common.increaseQuantity')}
      >
        <span className="material-symbols-outlined ${textSize}">add</span>
      </button>
    </div>
  );
}
