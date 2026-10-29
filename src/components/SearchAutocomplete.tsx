import React from 'react';
import { MapPin, Building, Search, X } from 'lucide-react';
import { POPULAR_CITIES } from '../data/mockData';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggle]);

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.name.toLowerCase().includes(value.toLowerCase()) ||
    city.country.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative flex-1">
      <div
        onClick={() => onToggle(true)}
        className="h-full px-4 py-2.5 flex flex-col justify-center cursor-pointer hover:bg-slate-50/60 rounded-xl transition-colors"
      >
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
          Направление
        </span>
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              onToggle(true);
            }}
            placeholder="Город, отель или аэропорт"
            className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-hidden"
          />
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in">
          <div className="px-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Популярные направления</span>
            <Search className="w-3 h-3 text-slate-400" />
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {filteredCities.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => {
                  onSelect(city.name);
                  onToggle(false);
                }}
                className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#1652f0] transition-colors mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{city.name}</span>
                    <span className="text-xs font-normal text-slate-400">({city.country})</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{city.count}</div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                onSelect('Отель Cosmos Санкт-Петербург');
                onToggle(false);
              }}
              className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mt-0.5">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">Отель Cosmos Санкт-Петербург</div>
                <div className="text-xs text-slate-500 mt-0.5">Популярный отель в Санкт-Петербурге</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
