//Panel deslizante

export default function SlidePanel({ title, subtitle, onClose, children }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/5">
          <div>
            <h3 className="font-headline text-lg font-black uppercase tracking-wide text-on-surface">{title}</h3>
            {subtitle && <p className="font-body text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        
        {/* Contenido Inyectado */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}