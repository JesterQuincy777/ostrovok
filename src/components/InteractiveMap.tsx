import React from 'react';
import { Maximize2, Minimize2, Search, Plus, Minus, MapPin, Navigation } from 'lucide-react';
import { Hotel, CurrencyCode } from '../types';
import { formatPrice } from './SeasonDealsCarousel';

interface InteractiveMapProps {
  hotels: Hotel[];
  selectedHotelId: string | null;
  onSelectHotel: (hotel: Hotel) => void;
  hoveredHotelId: string | null;
  onHoverHotel: (hotelId: string | null) => void;
  currentCurrency: CurrencyCode;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  hotels,
  selectedHotelId,
  onSelectHotel,
  hoveredHotelId,
  onHoverHotel,
  currentCurrency,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchMove, setSearchMove] = React.useState(false);
  const [mapLocationQuery, setMapLocationQuery] = React.useState('');
  const [zoomLevel, setZoomLevel] = React.useState(1);

  // Additional background decorative price markers from screenshot
  const backgroundPins = [
    { label: '3 от 5 058 ₽', x: 74, y: 15 },
    { label: '4 140 ₽', x: 67, y: 16 },
    { label: '5 770 ₽', x: 57, y: 18 },
    { label: '3 495 ₽', x: 62, y: 19 },
    { label: '21 425 ₽', x: 58, y: 21 },
    { label: '5 430 ₽', x: 69, y: 21 },
    { label: '5 739 ₽', x: 76, y: 22 },
    { label: '2 от 2 275 ₽', x: 53, y: 25 },
    { label: '8 010 ₽', x: 60, y: 29 },
    { label: '5 074 ₽', x: 49, y: 29 },
    { label: '4 560 ₽', x: 56, y: 35 },
    { label: '11 000 ₽', x: 64, y: 38 },
    { label: '13 500 ₽', x: 74, y: 43 },
    { label: '4 550 ₽', x: 55, y: 47 },
    { label: '11 430 ₽', x: 60, y: 47 },
    { label: '13 000 ₽', x: 76, y: 46 },
    { label: '2 от 2 968 ₽', x: 80, y: 46 },
    { label: '6 200 ₽', x: 57, y: 51 },
    { label: '2 от 9 500 ₽', x: 65, y: 56 },
    { label: '6 от 6 990 ₽', x: 72, y: 53 },
    { label: '18 000 ₽', x: 73, y: 56 },
    { label: '2 от 23 347 ₽', x: 60, y: 65 },
    { label: '7 438 ₽', x: 67, y: 71 },
    { label: '2 от 7 567 ₽', x: 73, y: 77 },
    { label: '6 500 ₽', x: 73, y: 80 },
    { label: '9 310 ₽', x: 78, y: 68 },
    { label: '4 947 ₽', x: 96, y: 27 },
    { label: '3 501 ₽', x: 95, y: 30 },
    { label: '5 044 ₽', x: 84, y: 38 },
    { label: '5 428 ₽', x: 86, y: 43 },
    { label: '4 250 ₽', x: 93, y: 53 },
    { label: '4 057 ₽', x: 96, y: 61 },
  ];

  return (
    <div
      className={`relative h-full flex flex-col bg-[#e6ece5] rounded-2xl overflow-hidden border border-slate-200 shadow-xs transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'w-full'
      }`}
    >
      {/* Top Map Action Bar matching screenshot */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left button: Развернуть */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg shadow-md border border-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isExpanded ? 'Свернуть карту' : 'Развернуть'}</span>
        </button>

        {/* Right side: Checkbox + Location input */}
        <div className="pointer-events-auto flex items-center gap-2">
          <label className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-xs rounded-lg shadow-md border border-slate-200 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={searchMove}
              onChange={(e) => setSearchMove(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] font-medium leading-none">Искать при перемещении карты</span>
          </label>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Введите местоположение"
              value={mapLocationQuery}
              onChange={(e) => setMapLocationQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white/95 rounded-lg shadow-md border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Map Surface (Stylized OpenStreetMap vector rendering with river, parks, roads, metro) */}
      <div className="relative flex-1 w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#f1efe8]">
        {/* SVG Cartographic base with Moskva river, highways and parks */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
        >
          {/* Base land */}
          <rect width="1000" height="800" fill="#f4efe1" />

          {/* Green Parks (Sokolniki, Izmailovsky, Gorky Park, Fili, Losiny Ostrov) */}
          <path
            d="M 680 80 Q 750 60 820 100 T 840 240 Q 780 260 700 200 Z"
            fill="#d5e8ce"
            stroke="#c4deb9"
          />
          <text x="730" y="150" fill="#759367" fontSize="12" fontWeight="bold">
            парк Сокольники
          </text>

          <path
            d="M 850 320 Q 940 310 990 380 T 960 520 Q 880 500 850 420 Z"
            fill="#d5e8ce"
          />
          <text x="890" y="420" fill="#759367" fontSize="12" fontWeight="bold">
            Измайлово
          </text>

          <path
            d="M 220 280 Q 280 260 300 340 T 260 440 Q 180 430 190 350 Z"
            fill="#d5e8ce"
          />
          <text x="220" y="360" fill="#759367" fontSize="11" fontWeight="bold">
            Фили
          </text>

          <path
            d="M 520 70 Q 560 50 620 90 T 590 180 Q 540 170 510 120 Z"
            fill="#d5e8ce"
          />
          <text x="530" y="120" fill="#759367" fontSize="11" fontWeight="bold">
            Главный ботанический сад
          </text>

          {/* Moskva River & Vodootvodny Canal (Cyan-blue curves) */}
          <path
            d="M 120 180 Q 180 240 260 270 T 320 400 Q 300 480 340 540 T 450 560 Q 500 580 540 540 T 600 490 Q 660 480 720 540 T 800 640 Q 860 720 940 760"
            fill="none"
            stroke="#9fd2ea"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 520 560 Q 560 575 600 540"
            fill="none"
            stroke="#9fd2ea"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <text x="680" y="580" fill="#6ba7c6" fontSize="11" fontStyle="italic">
            р. Москва
          </text>

          {/* Major Road Arteries (MKAD ring, Third Ring Road, Garden Ring, radial highways) */}
          {/* MKAD outer circle */}
          <ellipse
            cx="500"
            cy="420"
            rx="460"
            ry="360"
            fill="none"
            stroke="#fff"
            strokeWidth="6"
            opacity="0.8"
          />
          {/* Third Ring Road (TTK) */}
          <ellipse
            cx="530"
            cy="430"
            rx="260"
            ry="200"
            fill="none"
            stroke="#fff"
            strokeWidth="7"
          />
          <ellipse
            cx="530"
            cy="430"
            rx="260"
            ry="200"
            fill="none"
            stroke="#fed7aa"
            strokeWidth="4"
          />
          {/* Garden Ring (Sadovoye Koltso) */}
          <ellipse
            cx="540"
            cy="440"
            rx="130"
            ry="100"
            fill="none"
            stroke="#fff"
            strokeWidth="6"
          />
          <ellipse
            cx="540"
            cy="440"
            rx="130"
            ry="100"
            fill="none"
            stroke="#fde047"
            strokeWidth="3"
          />

          {/* Radial highways (Leningradsky, Tverskaya, Kutuzovsky, Leninsky, Mira) */}
          <line x1="540" y1="440" x2="300" y2="200" stroke="#fff" strokeWidth="6" />
          <line x1="540" y1="440" x2="300" y2="200" stroke="#fed7aa" strokeWidth="3" />
          <text x="360" y="270" fill="#94a3b8" fontSize="10" fontWeight="bold">
            Ленинградский просп.
          </text>

          <line x1="540" y1="440" x2="550" y2="100" stroke="#fff" strokeWidth="6" />
          <line x1="540" y1="440" x2="550" y2="100" stroke="#fed7aa" strokeWidth="3" />
          <text x="560" y="240" fill="#94a3b8" fontSize="10" fontWeight="bold">
            просп. Мира
          </text>

          <line x1="540" y1="440" x2="220" y2="480" stroke="#fff" strokeWidth="6" />
          <line x1="540" y1="440" x2="220" y2="480" stroke="#fed7aa" strokeWidth="3" />

          {/* Central Kremlin star marker */}
          <circle cx="538" cy="450" r="4" fill="#dc2626" />
          <text x="548" y="454" fill="#1e293b" fontSize="11" fontWeight="bold">
            Москва (Центр)
          </text>

          {/* District names */}
          <text x="440" y="320" fill="#94a3b8" fontSize="11">
            Аэропорт
          </text>
          <text x="630" y="320" fill="#94a3b8" fontSize="11">
            Марьина Роща
          </text>
          <text x="680" y="440" fill="#94a3b8" fontSize="11">
            Басманный
          </text>
          <text x="530" y="580" fill="#94a3b8" fontSize="11">
            Замоскворечье
          </text>
          <text x="410" y="510" fill="#94a3b8" fontSize="11">
            Хамовники
          </text>
          <text x="730" y="700" fill="#94a3b8" fontSize="11">
            Нагатинский Затон
          </text>
        </svg>

        {/* Background decorative price pins matching screenshot */}
        {backgroundPins.map((pin, i) => (
          <div
            key={`bg-${i}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <div className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold shadow-xs border border-slate-200/90 whitespace-nowrap hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{pin.label}</span>
            </div>
          </div>
        ))}

        {/* Primary Interactive Hotel Price Pins */}
        {hotels.map((hotel) => {
          const isSelected = selectedHotelId === hotel.id;
          const isHovered = hoveredHotelId === hotel.id;
          const priceText = formatPrice(hotel.minPriceRub, currentCurrency);

          return (
            <div
              key={hotel.id}
              onClick={() => onSelectHotel(hotel)}
              onMouseEnter={() => onHoverHotel(hotel.id)}
              onMouseLeave={() => onHoverHotel(null)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer transition-all duration-200 ${
                isSelected || isHovered ? 'scale-120 z-40' : 'hover:scale-110'
              }`}
              style={{
                left: `${hotel.mapCoords.xPercent}%`,
                top: `${hotel.mapCoords.yPercent}%`,
              }}
            >
              {/* Blue prominent pill marker matching screenshot */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg transition-all ${
                  isSelected || isHovered
                    ? 'bg-[#1652f0] text-white ring-4 ring-blue-300 ring-offset-1'
                    : 'bg-[#1652f0] text-white hover:bg-blue-700'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{priceText}</span>
              </div>

              {/* Tooltip on hover/active */}
              {(isHovered || isSelected) && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-white p-2.5 rounded-xl shadow-2xl border border-slate-200 text-slate-900 z-50 pointer-events-none animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-extrabold line-clamp-1">{hotel.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {hotel.rating} ★ ({hotel.reviewsCount} отзывов)
                  </div>
                  <div className="text-xs font-black text-[#1652f0] mt-1">
                    от {priceText} / ночь
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Scale indicator bottom-left */}
        <div className="absolute bottom-3 left-3 z-30 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-semibold text-slate-600 flex items-center gap-1.5 shadow-xs border border-slate-200">
          <div className="w-12 h-1 bg-slate-700 border-x border-slate-900" />
          <span>2 км</span>
        </div>

        {/* Zoom Controls bottom-right */}
        <div className="absolute right-3 bottom-8 z-30 flex flex-col gap-1 shadow-md rounded-xl overflow-hidden bg-white border border-slate-200">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
            aria-label="Приблизить карту"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
            aria-label="Отдалить карту"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* OpenStreetMap Attribution bottom-right matching screenshot */}
        <div className="absolute bottom-1 right-2 z-20 text-[9px] text-slate-500 bg-white/70 px-1.5 py-0.5 rounded">
          © Участники <span className="underline">OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
};
