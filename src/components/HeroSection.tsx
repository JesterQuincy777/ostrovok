import React from 'react';
import {
  BedDouble,
  Car,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X,
} from 'lucide-react';
import { SearchAutocomplete } from './SearchAutocomplete';
import { DatePickerModal } from './DatePickerModal';
import { GuestsSelector } from './GuestsSelector';
import { CurrencyCode, Hotel, SearchState } from '../types';
import {
  apiService,
  mapApiHotelToAppHotel,
} from '../services/apiService';

interface HeroSectionProps {
  searchState: SearchState;
  onSearchChange: (newState: Partial<SearchState>) => void;
  onSearchSubmit: () => void;
  activeMainTab: 'stays' | 'transfers' | 'corporate';
  onSelectMainTab: (tab: 'stays' | 'transfers' | 'corporate') => void;
  onSelectHotel?: (hotel: Hotel) => void;
  onOpenFullCatalog: (data: {
    hotels: Hotel[];
    alternatives: Hotel[];
    intent: any;
    warnings: string[];
    commentsMap: Record<string, string>;
    prompt: string;
    nextOffset?: number | null;
  }) => void;
  currentCurrency: CurrencyCode;
}

export const formatDateRu = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthNames = [
    'янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.',
    'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.',
  ];
  const mIndex = parseInt(month, 10) - 1;
  const d = parseInt(day, 10);
  return `${d} ${monthNames[mIndex] || ''} ${year} г.`;
};

const POPULAR_SCENARIOS = [
  'Рядом с зелёным парком и метро, тихий район, номер для некурящих до 7000 ₽',
  'Отель с быстрым Wi-Fi, кондиционером и круглосуточной стойкой в центре',
  'Апартаменты с кухней, холодильником и стиральной машиной до 5000 ₽',
  'Отель с собственной парковкой, быстрый выезд на проспект, можно с питомцем',
  'Тихий номер во двор без шума баров, плотные шторы blackout до 6000 ₽',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchState,
  onSearchChange,
  onSearchSubmit,
  activeMainTab,
  onSelectMainTab,
  onOpenFullCatalog,
  currentCurrency,
}) => {
  const [isCityOpen, setIsCityOpen] = React.useState(false);
  const [activeDateModal, setActiveDateModal] = React.useState<'checkIn' | 'checkOut' | null>(null);
  const [isGuestsOpen, setIsGuestsOpen] = React.useState(false);

  // Toggle «Поиск с ИИ» from prototype
  const [isAiEnabled, setIsAiEnabled] = React.useState(true);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = React.useState(searchState.aiPrompt || '');
  const [isLoadingSearch, setIsLoadingSearch] = React.useState(false);

  // Submit AI search: directly transitions to full screen with filters
  const handleAiSearchSubmit = async (queryText?: string) => {
    const trimmed = (queryText !== undefined ? queryText : aiPrompt).trim();
    if (!trimmed) {
      alert('Пожалуйста, введите запрос для ИИ-поиска');
      return;
    }
    setAiPrompt(trimmed);
    onSearchChange({ aiPrompt: trimmed, searchMode: 'ai' });

    setIsLoadingSearch(true);

    try {
      const rawCity = searchState.destination || 'Санкт-Петербург';
      const city = rawCity.split(',')[0].trim() || 'Санкт-Петербург';

      // 1. POST /api/search
      const res = await apiService.searchHotels(city, trimmed);
      const mappedHotels = (res.hotels || []).map(mapApiHotelToAppHotel);
      const mappedAlt = (res.alternatives || []).map(mapApiHotelToAppHotel);

      // 2. Immediately transition to full catalog with filters
      onOpenFullCatalog({
        hotels: mappedHotels,
        alternatives: mappedAlt,
        intent: res.intent,
        warnings: res.warnings || [],
        commentsMap: {},
        prompt: trimmed,
        nextOffset: res.next_offset,
      });
    } catch (err: any) {
      console.warn('Hero AI search error, transitioning anyway:', err);
      onSearchSubmit();
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleScenarioClick = (sc: string) => {
    setAiPrompt(sc);
  };

  const handleKeyDownAi = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSearchSubmit(aiPrompt);
    }
  };

  const handleClearPrompt = () => {
    setAiPrompt('');
    onSearchChange({ aiPrompt: '' });
  };



  return (
    <div className="w-full bg-[#9fed43] pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Main Title matching screenshot & prototype */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] font-sans">
          Ооооочень много отелей
          <br />
          и квартир!
        </h1>

        {/* Tabs Row: [Жильё] [Трансферы] [Для командировок] + [Поиск с ИИ (switch)] */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectMainTab('stays')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMainTab === 'stays'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'bg-black/10 hover:bg-black/15 text-slate-900'
              }`}
            >
              <BedDouble className="w-4 h-4 text-[#1652f0]" />
              <span>Жильё</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMainTab('transfers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMainTab === 'transfers'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'bg-black/10 hover:bg-black/15 text-slate-900'
              }`}
            >
              <Car className="w-4 h-4 text-slate-800" />
              <span>Трансферы</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMainTab('corporate')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeMainTab === 'corporate'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'bg-black/10 hover:bg-black/15 text-slate-900'
              }`}
            >
              <span>Для командировок</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>

          {/* Purple Capsule: «Поиск с ИИ» Toggle Switch from Prototype */}
          <div
            onClick={() => setIsAiEnabled(!isAiEnabled)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 border border-purple-400/50 shadow-lg text-white text-xs font-extrabold cursor-pointer select-none hover:border-purple-300 transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Поиск с ИИ</span>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                isAiEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAiEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CLASSIC OSTROVOK SEARCH BAR (Always present)              */}
        {/* ======================================================== */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-1.5 flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-100 relative ${
            isCityOpen || activeDateModal || isGuestsOpen ? 'z-50' : 'z-30'
          }`}
        >
          {/* 1. Направление */}
          <div className={`flex-2 min-w-[240px] relative ${isCityOpen ? 'z-50' : ''}`}>
            <SearchAutocomplete
              value={searchState.destination}
              onChange={(val) => onSearchChange({ destination: val })}
              onSelect={(val) => onSearchChange({ destination: val })}
              isOpen={isCityOpen}
              onToggle={setIsCityOpen}
            />
          </div>

          {/* 2. Заезд */}
          <div className={`relative flex-1 min-w-[140px] ${activeDateModal === 'checkIn' ? 'z-50' : ''}`}>
            <div
              onClick={() => {
                setActiveDateModal(activeDateModal === 'checkIn' ? null : 'checkIn');
              }}
              className="h-full px-4 py-2.5 flex flex-col justify-center cursor-pointer hover:bg-slate-50/60 rounded-xl transition-colors select-none"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                Заезд
              </span>
              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                {formatDateRu(searchState.checkInDate)}
              </span>
            </div>

            {activeDateModal === 'checkIn' && (
              <DatePickerModal
                checkInDate={searchState.checkInDate}
                checkOutDate={searchState.checkOutDate}
                onSelectDates={(inD, outD) => {
                  onSearchChange({ checkInDate: inD, checkOutDate: outD });
                }}
                isOpen={true}
                onToggle={() => setActiveDateModal(null)}
                targetField="checkIn"
              />
            )}
          </div>

          {/* 3. Выезд */}
          <div className={`relative flex-1 min-w-[140px] ${activeDateModal === 'checkOut' ? 'z-50' : ''}`}>
            <div
              onClick={() => {
                setActiveDateModal(activeDateModal === 'checkOut' ? null : 'checkOut');
              }}
              className="h-full px-4 py-2.5 flex flex-col justify-center cursor-pointer hover:bg-slate-50/60 rounded-xl transition-colors select-none"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                Выезд
              </span>
              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                {formatDateRu(searchState.checkOutDate)}
              </span>
            </div>

            {activeDateModal === 'checkOut' && (
              <DatePickerModal
                checkInDate={searchState.checkInDate}
                checkOutDate={searchState.checkOutDate}
                onSelectDates={(inD, outD) => {
                  onSearchChange({ checkInDate: inD, checkOutDate: outD });
                }}
                isOpen={true}
                onToggle={() => setActiveDateModal(null)}
                targetField="checkOut"
              />
            )}
          </div>

          {/* 4. Номера и гости */}
          <div className={`flex-1 min-w-[160px] relative ${isGuestsOpen ? 'z-50' : ''}`}>
            <GuestsSelector
              roomsCount={searchState.roomsCount}
              adultsCount={searchState.adultsCount}
              childrenCount={searchState.childrenCount}
              onChange={(rooms, adults, children) => {
                onSearchChange({
                  roomsCount: rooms,
                  adultsCount: adults,
                  childrenCount: children,
                });
              }}
              isOpen={isGuestsOpen}
              onToggle={setIsGuestsOpen}
            />
          </div>

          {/* 5. Найти Button: only shown when AI search toggle is OFF */}
          {!isAiEnabled && (
            <div className="p-1 flex items-center justify-center">
              <button
                type="button"
                onClick={onSearchSubmit}
                className="w-full lg:w-auto h-full min-h-[48px] px-8 sm:px-10 bg-[#1652f0] hover:bg-[#1244cd] active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 lg:hidden" />
                <span>Найти</span>
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* WHITE AI SEARCH CARD (Prototype matching)                */}
        {/* ======================================================== */}
        {isAiEnabled && (
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-5 border border-white/60 relative z-10 space-y-3.5 animate-in fade-in duration-200">
            {/* Search Input Row with Blue Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Input field */}
              <div className="flex-1 relative flex items-center">
                <div className="absolute left-4 text-[#1652f0]">
                  <Sparkles className="w-5 h-5 text-[#1652f0]" />
                </div>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={handleKeyDownAi}
                  placeholder="Отель до 8000 с завтраком, рядом парк, тихий двор и плотные шторы..."
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-200 focus:border-[#1652f0] focus:ring-2 focus:ring-[#1652f0]/20 focus:outline-hidden transition-all shadow-inner"
                />
                {aiPrompt && (
                  <button
                    type="button"
                    onClick={handleClearPrompt}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Очистить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Button: «✨ Найти с ИИ ➔» (transitions immediately to full screen with filters) */}
              <button
                type="button"
                disabled={isLoadingSearch}
                onClick={() => handleAiSearchSubmit(aiPrompt)}
                className="shrink-0 px-8 py-3.5 bg-[#1652f0] hover:bg-[#1244cd] active:scale-98 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoadingSearch ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-amber-300" />
                )}
                <span>Найти с ИИ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Scenario Chips */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                СЦЕНАРИИ:
              </span>
              {POPULAR_SCENARIOS.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleScenarioClick(sc)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#1652f0] hover:border-blue-200 border border-slate-200/70 text-slate-700 text-xs font-medium transition-all text-left cursor-pointer"
                >
                  {sc}
                </button>
              ))}
            </div>


          </div>
        )}
      </div>
    </div>
  );
};
