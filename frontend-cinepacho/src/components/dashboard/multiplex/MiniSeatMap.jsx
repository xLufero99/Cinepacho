//Representacion visual de las sillas

export default function MiniSeatMap({ gCount, pCount }) {
  
  const rowsP = Math.min(6, Math.ceil(pCount / 4));
  const rowsG = Math.min(8, Math.ceil(gCount / 8));

  return (
    <div className="flex flex-col gap-0.5 p-2 bg-background/60 rounded-lg border border-outline-variant/5 w-fit mt-3 shadow-inner">
      {/* Filas Preferenciales (Tonalidad Carmesí / Primary) */}
      <div className="flex gap-0.5 justify-center mb-1">
        {Array.from({ length: rowsP }).map((_, i) => (
          <div key={`p-${i}`} className="w-1 h-1 rounded-sm bg-primary/40 animate-pulse" />
        ))}
      </div>
      {/* Filas Generales (Tonalidad Gris Neutro / Muted) */}
      <div className="flex gap-0.5 justify-center">
        {Array.from({ length: rowsG }).map((_, i) => (
          <div key={`g-${i}`} className="w-1 h-1 rounded-sm bg-stone-700" />
        ))}
      </div>
    </div>
  );
}