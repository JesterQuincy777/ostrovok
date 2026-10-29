import React from 'react';
import { Car, MapPin, Calendar, Clock, UserCheck, Shield } from 'lucide-react';

export const TransferSearch: React.FC = () => {
  const [from, setFrom] = React.useState('Аэропорт Пулково (LED)');
  const [to, setTo] = React.useState('Невский проспект, Санкт-Петербург');
  const [date, setDate] = React.useState('2026-10-12');
  const [time, setTime] = React.useState('14:30');
  const [carClass, setCarClass] = React.useState<'economy' | 'comfort' | 'minivan'>('comfort');
  const [booked, setBooked] = React.useState(false);

  const carOptions = [
    { id: 'economy', name: 'Эконом', model: 'Skoda Rapid / VW Polo', price: 1450, capacity: '3 пассажира, 2 багажа' },
    { id: 'comfort', name: 'Комфорт+', model: 'Toyota Camry / Chery Arrizo', price: 2300, capacity: '4 пассажира, 3 багажа' },
    { id: 'minivan', name: 'Минивэн', model: 'Mercedes-Benz V-Class / Vito', price: 4600, capacity: '7 пассажиров, 6 багажа' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 max-w-4xl mx-auto my-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-[#1652f0] rounded-2xl">
          <Car className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Заказ трансфера из аэропорта или вокзала
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Водитель встретит с именной табличкой в зоне прилета, бесплатное ожидание 60 минут при задержке рейса
          </p>
        </div>
      </div>

      {!booked ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Откуда</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Куда</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#1652f0] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Дата подачи</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Время встречи</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Car Classes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Класс автомобиля</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {carOptions.map((car) => (
                <div
                  key={car.id}
                  onClick={() => setCarClass(car.id as any)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    carClass === car.id
                      ? 'border-[#1652f0] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-extrabold text-slate-900 text-sm">{car.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{car.model}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{car.capacity}</div>
                  <div className="mt-3 text-base font-extrabold text-[#1652f0]">
                    {car.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBooked(true)}
            className="w-full py-3.5 rounded-xl bg-[#1652f0] hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            Заказать трансфер
          </button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Трансфер успешно забронирован!</h4>
          <p className="text-xs text-slate-600">
            Водитель свяжется с вами за 1 час до поездки. Номер заказа <strong>TR-{Math.floor(10000 + Math.random() * 90000)}</strong>.
          </p>
          <button
            onClick={() => setBooked(false)}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Новый поиск
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Фиксированная цена без доплат за пробки</span>
        </div>
        <span>Бесплатная отмена за 24 часа</span>
      </div>
    </div>
  );
};
