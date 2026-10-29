import React from 'react';
import { POPULAR_CITIES } from '../data/mockData';
import { MapPin, ArrowRight } from 'lucide-react';

interface PopularDestinationsProps {
  onSelectCity: (cityName: string) => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({ onSelectCity }) => {
  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Популярные направления
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Лучшие отели и апартаменты для отдыха и деловых поездок
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {POPULAR_CITIES.slice(0, 8).map((city) => (
            <div
              key={city.name}
              onClick={() => onSelectCity(city.name)}
              className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="text-base font-extrabold text-slate-900 group-hover:text-[#1652f0] transition-colors">
                  {city.name}
                </div>
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-[#1652f0] transition-colors" />
              </div>
              <div className="text-xs text-slate-500 mt-1">{city.country}</div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">
                {city.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
