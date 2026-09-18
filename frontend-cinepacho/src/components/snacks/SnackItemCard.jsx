import QuantitySelector from '../ui/QuantitySelector';
import { useTranslation } from 'react-i18next';

export default function SnackItemCard({ 
  snack, 
  quantity, 
  onAddToCart, 
  onUpdateQuantity,
  maxQuantity = 10,
  className = ''
}) {
  const { t } = useTranslation();
  // UI-only component - all business logic is handled by parent
  const hasQuantity = quantity > 0;
  
  const featuredClass = snack.featured 
    ? 'bg-surface-container-high shadow-[0_24px_48px_-12px_rgba(255,142,128,0.06)] relative group ambient-glow' 
    : 'bg-surface-container-low border border-transparent hover:border-outline-variant/10 transition-colors';

  return (
    <article className={`${featuredClass} rounded-xl overflow-hidden relative group flex flex-col h-full ${className}`}>
      {/* Image Section */}
      <div className="h-48 w-full bg-surface-container relative overflow-hidden">
        <img 
          src={snack.image} 
          alt={snack.name}
          className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent" />
        
        {/* Points Badge */}
        <div className="absolute top-4 right-4 bg-surface-variant/80 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/30 flex items-center gap-1">
          <span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>
            stars
          </span>
          <span className="font-label text-xs text-secondary-container">{snack.points} {t('snacks.points')}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline text-xl font-bold mb-1 text-on-surface">{snack.name}</h3>
          <p className="font-body text-sm text-on-surface-variant mb-4">{snack.description}</p>
        </div>
        
        {/* Price and Controls */}
        <div className="flex items-center justify-between mt-auto">
          <span className={`font-label text-xl ${snack.featured ? 'text-primary' : 'text-on-surface'} font-medium`}>
            ${snack.price.toFixed(2)}
          </span>
          
          {hasQuantity ? (
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => onUpdateQuantity(snack.id, quantity + 1)}
              onDecrease={() => onUpdateQuantity(snack.id, quantity - 1)}
              min={0}
              max={maxQuantity}
            />
          ) : (
            <button
              onClick={() => onAddToCart(snack.id)}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface hover:text-primary transition-colors border border-outline-variant/20"
              aria-label={`Add ${snack.name} to cart`}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
