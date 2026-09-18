//Barra de búsqueda
import { useState } from 'react';
import Input from '../ui/Input';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ className, onSearch }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      // Scroll to cartelera section
      const carteleraSection = document.getElementById('cartelera');
      if (carteleraSection) {
        carteleraSection.scrollIntoView({ behavior: 'smooth' });
      }
      setIsExpanded(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          aria-label={t('nav.searchPlaceholder')}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          type="button"
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">search</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('nav.searchPlaceholder')}
            type="text"
            icon="search"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-48 lg:w-64 bg-surface-container-high border-none focus:ring-primary/20 transition-all"
            onBlur={() => setIsExpanded(false)}
          />
          <button
            onClick={() => {
              setIsExpanded(false);
              setSearchValue('');
              if (onSearch) onSearch('');
            }}
            aria-label="Cerrar búsqueda"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            type="button"
          >
            <span className="material-symbols-outlined text-lg text-on-surface-variant">close</span>
          </button>
        </div>
      )}
    </div>
  );
}