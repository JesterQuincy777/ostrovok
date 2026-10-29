import React from 'react';
import { Minus, Plus, Users, ChevronDown } from 'lucide-react';

interface GuestsSelectorProps {
  roomsCount: number;
  adultsCount: number;
  childrenCount: number;
  onChange: (rooms: number, adults: number, children: number) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export const GuestsSelector: React.FC<GuestsSelectorProps> = ({
  roomsCount,
  adultsCount,
  childrenCount,
  onChange,
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
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => onToggle(!isOpen)}
        className="h-full px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 rounded-xl transition-colors select-none"
      >
        <div className="flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
            {roomsCount} {roomsCount === 1 ? 'номер' : 'номера'} для
          </span>
          <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
            {adultsCount + childrenCount} {adultsCount + childrenCount === 1 ? 'гостя' : 'гостей'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in select-none">
          <div className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1652f0]" />
            <span>Номера и гости</span>
          </div>

          <div className="py-3 space-y-4">
            {/* Rooms */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">Номера</div>
                <div className="text-xs text-slate-400">Количество комнат</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={roomsCount <= 1}
                  onClick={() => onChange(Math.max(1, roomsCount - 1), adultsCount, childrenCount)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-800">{roomsCount}</span>
                <button
                  type="button"
                  disabled={roomsCount >= 8}
                  onClick={() => onChange(roomsCount + 1, adultsCount, childrenCount)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">Взрослые</div>
                <div className="text-xs text-slate-400">От 18 лет</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={adultsCount <= 1}
                  onClick={() => onChange(roomsCount, Math.max(1, adultsCount - 1), childrenCount)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-800">{adultsCount}</span>
                <button
                  type="button"
                  disabled={adultsCount >= 10}
                  onClick={() => onChange(roomsCount, adultsCount + 1, childrenCount)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">Дети</div>
                <div className="text-xs text-slate-400">До 17 лет</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={childrenCount <= 0}
                  onClick={() => onChange(roomsCount, adultsCount, Math.max(0, childrenCount - 1))}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-800">{childrenCount}</span>
                <button
                  type="button"
                  disabled={childrenCount >= 6}
                  onClick={() => onChange(roomsCount, adultsCount, childrenCount + 1)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggle(false)}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#1652f0] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      )}
    </div>
  );
};
