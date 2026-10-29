import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Hotel, CurrencyCode } from '../types';
import { formatPrice } from './SeasonDealsCarousel';
import { HotelVisual } from './HotelVisual';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  hotels: Hotel[];
  currentCurrency: CurrencyCode;
  onSelectHotel: (hotel: Hotel) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  hotels,
  currentCurrency,
  onSelectHotel,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  const favoriteHotels = hotels.filter((h) => favorites.includes(h.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <h3 className="font-extrabold text-lg text-slate-900">
              Избранное ({favoriteHotels.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {favoriteHotels.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">В избранном пока пусто</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Нажимайте на сердечко на карточках отелей, чтобы сохранять их для сравнения и быстрого бронирования.
              </p>
            </div>
          ) : (
            favoriteHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white shadow-xs flex gap-3 group transition-all"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                  <HotelVisual theme={hotel.accentTheme} name={hotel.name} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{hotel.name}</h4>
                    <p className="text-xs text-slate-500">{hotel.city}</p>
                    <div className="text-sm font-extrabold text-slate-950 mt-1">
                      от {formatPrice(hotel.minPriceRub, currentCurrency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <button
                      onClick={() => onRemoveFavorite(hotel.id)}
                      className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Удалить
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectHotel(hotel);
                      }}
                      className="text-xs font-bold text-[#1652f0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Перейти <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
          Цены обновляются в реальном времени
        </div>
      </div>
    </div>
  );
};
