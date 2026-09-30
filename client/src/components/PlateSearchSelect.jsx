import { useEffect, useRef, useState } from 'react';

export default function PlateSearchSelect({ vehicles, value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const selected = vehicles.find((v) => v._id === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = vehicles.filter((v) => v.plate.toLowerCase().includes(query.toLowerCase()));

  function handlePick(v) {
    onChange(v._id);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="relative" ref={boxRef}>
      {selected && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-3 text-base font-mono font-semibold text-left"
        >
          {selected.plate}
          <span className="text-xs text-gray-400 font-sans">trocar</span>
        </button>
      ) : (
        <input
          autoFocus={open}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Digite a placa..."
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base uppercase"
        />
      )}

      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Nenhuma placa encontrada</p>}
          {filtered.map((v) => (
            <button
              key={v._id}
              type="button"
              onClick={() => handlePick(v)}
              className="w-full text-left px-3 py-2.5 text-base font-mono hover:bg-brand-50"
            >
              {v.plate}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
