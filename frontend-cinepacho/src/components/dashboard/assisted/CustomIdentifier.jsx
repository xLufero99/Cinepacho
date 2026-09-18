import { useTranslation } from 'react-i18next';

export default function CustomerIdentifier({ email, setEmail }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-surface-container-low border border-stone-800 rounded-xl p-4 mb-6 flex items-center gap-4">
      <div className="flex-1">
        <label className="text-xs text-stone-500 uppercase font-bold mb-1 block">
          Identificación del Cliente (Opcional)
        </label>
        <input
          type="email"
          placeholder="correo@ejemplo.com para acumular puntos"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>
      <div className="text-right">
        <span className={`text-[10px] px-2 py-1 rounded font-bold ${email ? 'bg-green-500/20 text-green-500' : 'bg-stone-500/20 text-stone-400'}`}>
          {email ? 'CLIENTE REGISTRADO' : 'VENTA ANÓNIMA'}
        </span>
      </div>
    </div>
  );
}