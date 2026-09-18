// Booking-specific Tailwind style utilities to reduce duplication
import { cn } from './cn';

// Section divider with label
export const sectionDivider = cn(
  'flex items-center gap-4 mb-6'
);

export const dividerLine = cn(
  'h-[1px] flex-grow bg-surface-container-highest'
);

export const sectionLabel = cn(
  'font-headline text-sm text-on-surface-variant uppercase tracking-widest font-bold'
);

// Border utilities
export const borderBottomLight = 'border-b border-outline-variant/20';
export const borderTopLight = 'border-t border-outline-variant/10';

// Price row styling
export const priceRowBase = cn(
  'flex justify-between font-body text-sm'
);

export const priceLabel = 'text-on-surface-variant';
export const priceValue = 'text-on-surface font-bold';

// Button styles
export const buttonBase = cn(
  'w-full font-headline font-bold py-3 rounded-lg transition-colors uppercase tracking-wider'
);

export const buttonPrimary = cn(
  buttonBase,
  'bg-primary hover:bg-primary-container text-on-primary'
);

export const buttonSecondary = cn(
  buttonBase,
  'bg-surface-container-high hover:bg-surface-variant text-on-surface'
);

export const buttonDisabled = 'disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:cursor-not-allowed';

// Seat tag/badge styling
export const seatBadge = cn(
  'bg-primary/20 text-primary font-body text-sm px-3 py-1 rounded-full font-bold'
);

// Info text styling
export const infoText = cn(
  'text-xs font-body text-on-surface-variant space-y-2'
);

// Card styling
export const cardBase = cn(
  'rounded-xl border border-outline-variant/10'
);

// Responsive grid - Unified 3-column layout
export const bookingGrid = cn(
  'grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 min-h-0'
);

export const leftColumn = cn(
  'col-span-1 xl:col-span-3 flex-shrink-0 min-h-0'
);

export const centerColumn = cn(
  'col-span-1 xl:col-span-6 flex-shrink-0 min-h-0'
);

export const rightColumn = cn(
  'col-span-1 xl:col-span-3 sticky top-24 max-h-fit flex-shrink-0'
);

