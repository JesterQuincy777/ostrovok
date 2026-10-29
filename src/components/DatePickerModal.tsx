import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DatePickerModalProps {
  checkInDate: string;
  checkOutDate: string;
  onSelectDates: (checkIn: string, checkOut: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  targetField: 'checkIn' | 'checkOut';
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  checkInDate,
  checkOutDate,
  onSelectDates,
  isOpen,
  onToggle,
  targetField,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = React.useState<number>(9); // 0-indexed: 9 is October
  const [currentYear, setCurrentYear] = React.useState<number>(2026);
  const [tempCheckIn, setTempCheckIn] = React.useState<string>(checkInDate);
  const [tempCheckOut, setTempCheckOut] = React.useState<string>(checkOutDate);

  React.useEffect(() => {
    setTempCheckIn(checkInDate);
    setTempCheckOut(checkOutDate);
  }, [checkInDate, checkOutDate]);

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

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday-first
  };

  const daysInCurrent = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOffset(currentYear, currentMonth);

  const formatDate = (year: number, month: number, day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const parseDay = (dateStr: string) => {
    const parts = dateStr.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1,
      day: parseInt(parts[2], 10),
    };
  };

  const inParsed = parseDay(tempCheckIn);
  const outParsed = parseDay(tempCheckOut);

  const calculateNights = (inStr: string, outStr: string) => {
    const diff = new Date(outStr).getTime() - new Date(inStr).getTime();
    const nights = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    return nights;
  };

  const handleDayClick = (day: number) => {
    const selectedStr = formatDate(currentYear, currentMonth, day);

    if (targetField === 'checkIn') {
      if (new Date(selectedStr) >= new Date(tempCheckOut)) {
        // Automatically shift checkout to next day
        const nextDay = new Date(selectedStr);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        setTempCheckIn(selectedStr);
        setTempCheckOut(nextDayStr);
        onSelectDates(selectedStr, nextDayStr);
      } else {
        setTempCheckIn(selectedStr);
        onSelectDates(selectedStr, tempCheckOut);
      }
    } else {
      if (new Date(selectedStr) <= new Date(tempCheckIn)) {
        // If chosen checkout is before checkin, adjust checkin
        const prevDay = new Date(selectedStr);
        prevDay.setDate(prevDay.getDate() - 1);
        const prevDayStr = prevDay.toISOString().split('T')[0];
        setTempCheckIn(prevDayStr);
        setTempCheckOut(selectedStr);
        onSelectDates(prevDayStr, selectedStr);
      } else {
        setTempCheckOut(selectedStr);
        onSelectDates(tempCheckIn, selectedStr);
      }
    }
  };

  const setPreset = (nights: number) => {
    const start = new Date(tempCheckIn);
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    const endStr = end.toISOString().split('T')[0];
    setTempCheckOut(endStr);
    onSelectDates(tempCheckIn, endStr);
  };

  const nightsCount = calculateNights(tempCheckIn, tempCheckOut);

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 sm:left-auto right-0 sm:right-auto mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in select-none"
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-bold text-slate-900">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center text-xs font-semibold text-slate-400">
        {daysOfWeek.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs py-1">
        {[...Array(offset)].map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {[...Array(daysInCurrent)].map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(currentYear, currentMonth, day);
          const isCheckIn = dateStr === tempCheckIn;
          const isCheckOut = dateStr === tempCheckOut;
          const isInRange =
            new Date(dateStr) > new Date(tempCheckIn) && new Date(dateStr) < new Date(tempCheckOut);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`h-8 rounded-lg font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                isCheckIn || isCheckOut
                  ? 'bg-[#1652f0] text-white shadow-xs'
                  : isInRange
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Night summary & Presets */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Clock className="w-3.5 h-3.5 text-[#1652f0]" />
          <span>
            {nightsCount} {nightsCount === 1 ? 'ночь' : nightsCount < 5 ? 'ночи' : 'ночей'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPreset(2)}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            2 ночи
          </button>
          <button
            type="button"
            onClick={() => setPreset(6)}
            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#1652f0] font-semibold transition-colors cursor-pointer"
          >
            6 ночей
          </button>
          <button
            type="button"
            onClick={() => onToggle(false)}
            className="px-3 py-1 rounded bg-[#1652f0] text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
