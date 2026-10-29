import React from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Heart } from 'lucide-react';
import { Hotel, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/mockData';
import { HotelVisual } from './HotelVisual';

interface SeasonDealsCarouselProps {
  hotels: Hotel[];
  currentCurrency: CurrencyCode;
  onSelectHotel: (hotel: Hotel) => void;
  onOpenAuth: () => void;
  favorites: string[];
  onToggleFavorite: (hotelId: string) => void;
}

export const formatPrice = (priceRub: number, code: CurrencyCode): string => {
  const currency = CURRENCIES[code];
  const converted = Math.round(priceRub / currency.rateToRub);
  const formatted = converted.toLocaleString('ru-RU');
  if (code === 'RUB') return `${formatted} ₽`;
  if (code === 'USD') return `$${formatted}`;
  if (code === 'EUR') return `€${formatted}`;
  if (code === 'KZT') return `${formatted} ₸`;
  return `${formatted} ${currency.symbol}`;
};

export const SeasonDealsCarousel: React.FC<SeasonDealsCarouselProps> = ({
  hotels,
  currentCurrency,
  onSelectHotel,
  onOpenAuth,
  favorites,
  onToggleFavorite,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Render stars component
  const renderStars = (count: number) => {
    return (
      <div className="flex items-center text-amber-400 text-xs tracking-wider" aria-label={`${count} звезды`}>
        {'★'.repeat(count)}
      </div>
    );
  };

  return (
    <section className="relative w-full pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Section Title and Subtitle matching screenshot */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Сезон выгодных путешествий
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5">
            Скидки до 37% при бронировании до 15 октября 2026 года
          </p>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative group">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-xl border border-slate-100 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              aria-label="Назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Scroll Right Button matching screenshot */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-xl border border-slate-100 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
              aria-label="Вперед"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Horizontal Cards Reel */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Card 1: Cosmos Hotel SPb */}
            {hotels[0] && (
              <div
                onClick={() => onSelectHotel(hotels[0])}
                className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer group/card snap-start"
              >
                {/* Visual */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  <HotelVisual theme="cosmos" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(hotels[0].id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                    aria-label="В избранное"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(hotels[0].id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                  {hotels[0].discountPercent && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-sm">
                      -{hotels[0].discountPercent}%
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {renderStars(hotels[0].stars)}
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover/card:text-[#1652f0] transition-colors">
                      {hotels[0].name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{hotels[0].city}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-50 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-slate-950">
                        от {formatPrice(hotels[0].minPriceRub, currentCurrency)}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">
                      {hotels[0].rating} ★
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Promo Banner ГУРУ matching screenshot exactly */}
            <div className="w-[280px] sm:w-[310px] shrink-0 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between p-5 relative bg-gradient-to-b from-[#1853f2] to-[#0a3ec4] text-white snap-start">
              {/* Background Glows & Sparkles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-400/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/20 rounded-full blur-xl pointer-events-none" />

              {/* Title & Copy */}
              <div className="relative z-10">
                <h3 className="font-extrabold text-lg leading-tight">
                  Можно забронировать
                  <br />
                  дешевле с ГУРУ
                </h3>
                <p className="text-blue-100 text-xs mt-1 font-medium">
                  Авторизуйтесь
                  <br />
                  и получайте скидки
                </p>
              </div>

              {/* Center 3D Prize Box with -40% Badge */}
              <div className="relative my-3 flex items-center justify-center">
                {/* 3D Box Illustration */}
                <div className="relative w-36 h-28 flex items-center justify-center">
                  <div className="w-28 h-20 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-[0_12px_25px_rgba(0,100,255,0.45)] border border-sky-200/50 flex items-center justify-center transform -rotate-3">
                    <div className="text-white text-3xl font-black drop-shadow-md">
                      %
                    </div>
                  </div>

                  {/* Sparkling Badge with -40% */}
                  <div className="absolute -left-2 top-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-extrabold text-sm rounded-lg border border-sky-300 shadow-lg transform -rotate-12 flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-sky-200">до</span>
                    <span>-40%</span>
                  </div>

                  {/* Sparkle icons */}
                  <Sparkles className="absolute top-1 right-2 w-5 h-5 text-sky-200 animate-pulse" />
                  <Sparkles className="absolute bottom-2 left-6 w-4 h-4 text-white" />
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#1652f0] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Авторизоваться
                </button>
              </div>
            </div>

            {/* Card 3: Cosmos Hotel Pulkovskaya */}
            {hotels[1] && (
              <div
                onClick={() => onSelectHotel(hotels[1])}
                className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer group/card snap-start"
              >
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  <HotelVisual theme="classic" name="COSMOS PULKOVO" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(hotels[1].id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                    aria-label="В избранное"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(hotels[1].id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                  {hotels[1].discountPercent && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-sm">
                      -{hotels[1].discountPercent}%
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {renderStars(hotels[1].stars)}
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover/card:text-[#1652f0] transition-colors">
                      {hotels[1].name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{hotels[1].city}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-50 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-slate-950">
                        от {formatPrice(hotels[1].minPriceRub, currentCurrency)}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">
                      {hotels[1].rating} ★
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 4: Гостиница Пекин */}
            {hotels[2] && (
              <div
                onClick={() => onSelectHotel(hotels[2])}
                className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer group/card snap-start"
              >
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  <HotelVisual theme="pekin" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(hotels[2].id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                    aria-label="В избранное"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(hotels[2].id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                  {hotels[2].discountPercent && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-sm">
                      -{hotels[2].discountPercent}%
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {renderStars(hotels[2].stars)}
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover/card:text-[#1652f0] transition-colors">
                      {hotels[2].name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{hotels[2].city}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-50 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-slate-950">
                        от {formatPrice(hotels[2].minPriceRub, currentCurrency)}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">
                      {hotels[2].rating} ★
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Hotel Cards for rich exploration */}
            {hotels.slice(3).map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => onSelectHotel(hotel)}
                className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer group/card snap-start"
              >
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  <HotelVisual theme={hotel.accentTheme} name={hotel.name} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(hotel.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                    aria-label="В избранное"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(hotel.id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                  {hotel.discountPercent && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-sm">
                      -{hotel.discountPercent}%
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {renderStars(hotel.stars)}
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover/card:text-[#1652f0] transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{hotel.city}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-50 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-slate-950">
                        от {formatPrice(hotel.minPriceRub, currentCurrency)}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">
                      {hotel.rating} ★
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
