import React from 'react';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Building,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Hotel, CurrencyCode, UserBooking } from '../types';
import { formatPrice } from './SeasonDealsCarousel';
import { HotelVisual } from './HotelVisual';
import { apiService, ApiHotelDetailsResponse, FactItem } from '../services/apiService';

interface HotelDetailModalProps {
  hotel: Hotel | null;
  onClose: () => void;
  currentCurrency: CurrencyCode;
  checkInDate: string;
  checkOutDate: string;
  onConfirmBooking: (booking: UserBooking) => void;
  onOpenHotelierCabinet?: () => void;
}

const CHARACTERISTIC_TITLES: Record<string, string> = {
  air_quality_good: '🍃 Чистый воздух',
  baby_friendly_no_steps: '👶 Гулять с коляской без ступенек',
  cafe_nearby: '☕ Кафе поблизости',
  dog_walk_nearby: '🌳 Прогулки с собакой',
  early_check_in: '⏱️ Ранний заезд',
  female_hotelier: '👩 Отельер женщина',
  fireplace_in_hotel: '🔥 Камин в отеле',
  good_coffee_in_hotel: '☕ Вкусный кофе в отеле',
  good_sleep: '😴 Хороший сон',
  good_wifi_for_work: '💻 Быстрый Wi-Fi для работы',
  hairdryer_in_room: '💨 Фен в номере',
  hotel_in_old_building: '🏛️ Отель в старинном доме',
  kitchen_in_room: '🍳 Кухня в номере',
  museum_nearby: '🏛️ Музеи поблизости',
  non_smoking_room: '🚭 Номер для некурящих',
  parking_nearby: '🅿️ Парковка поблизости',
  park_nearby: '🌲 Зелёный парк рядом',
  pets_allowed: '🐾 Можно с питомцами',
  pharmacy_nearby: '💊 Аптека поблизости',
  pleasant_neighbors: '🤝 Приятные соседи',
  pool_in_hotel: '🏊 Бассейн в отеле',
  quiet_nearby: '🔇 Тихая сторона',
  quiet_room_courtyard: '🤫 Тихий номер во двор',
  receipts_on_request: '🧾 Выдача чеков по запросу',
  reception_24h: '🛎️ Круглосуточная стойка регистрации',
  room_blackout_curtains: '🌙 Плотные шторы blackout',
  soft_blankets: '🛏️ Мягкие одеяла',
  view_from_window: '🌆 Красивый вид из окна',
  view_of_sunset: '🌅 Вид на закат',
  walk_to_hermitage: '🏛️ Пешком до Эрмитажа',
  walk_to_metro_10_min: '🚇 До метро до 10 минут',
  walk_to_metro_5_min: '🚇 До метро до 5 минут',
  washing_machine_in_room: '🧺 Стиральная машина в номере',
  work_table_in_room: '🖥️ Рабочий стол в номере',
};

const formatFactTitle = (key: string): string => {
  if (CHARACTERISTIC_TITLES[key]) return CHARACTERISTIC_TITLES[key];
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

const formatFactEvidence = (fact: FactItem): React.ReactNode => {
  const ev = fact.evidence_json;
  if (!ev) return null;

  if (ev.answer_text) {
    return (
      <span>
        Подтверждено отельером: <strong>«{ev.answer_text}»</strong>
      </span>
    );
  }

  if (ev.nearest && Array.isArray(ev.nearest) && ev.nearest.length > 0) {
    const nearest = ev.nearest[0];
    const dist = Math.round(nearest.distance_m || 0);
    const count = ev.count;
    const name = nearest.name ? `«${nearest.name}»` : '';
    return (
      <span>
        {count ? `${count} ${count === 1 ? 'объект' : count < 5 ? 'объекта' : 'объектов'} поблизости. ` : ''}
        {name ? `Ближайший: ${name}` : ''}
        {dist > 0 ? ` (${dist} м)` : ''}
      </span>
    );
  }

  if (ev.minutes !== undefined) {
    const mins = Math.round(ev.minutes);
    const dist = ev.distance_m ? ` (${Math.round(ev.distance_m)} м)` : '';
    const station = ev.entrance?.name || ev.destination?.name;
    return (
      <span>
        Пешком: <strong>около {mins} мин</strong>{dist}
        {station ? `, станция «${station}»` : ''}
      </span>
    );
  }

  return null;
};

const formatFactTtl = (fact: FactItem): string => {
  if (fact.expires_at) {
    const diffDays = Math.max(
      1,
      Math.round((new Date(fact.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    return `TTL: ${diffDays} дн.`;
  }
  return 'Актуально';
};

const formatSourceLabel = (source: string): string => {
  if (!source) return 'Сервис верификации';
  const s = source.toLowerCase();
  if (s === 'osm') return 'OpenStreetMap (Overpass API)';
  if (s === 'osrm' || s === 'osrm-foot-table') return 'OSRM Foot Graph';
  if (s === 'hotelier' || s === 'ask_hotelier') return 'Подтверждено отельером';
  if (s === 'air_quality') return 'Данные эко-мониторинга';
  return source;
};

export const HotelDetailModal: React.FC<HotelDetailModalProps> = ({
  hotel,
  onClose,
  currentCurrency,
  checkInDate,
  checkOutDate,
  onConfirmBooking,
  onOpenHotelierCabinet,
}) => {
  const [detailsData, setDetailsData] = React.useState<ApiHotelDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [bookingStep, setBookingStep] = React.useState<'details' | 'form' | 'success'>('details');

  // Booking form state
  const [guestName, setGuestName] = React.useState('');
  const [guestEmail, setGuestEmail] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');
  const [confirmedBookingId, setConfirmedBookingId] = React.useState('');

  React.useEffect(() => {
    if (hotel) {
      setBookingStep('details');
      setLoadingDetails(true);
      apiService
        .getHotelDetails(hotel.id)
        .then((data) => {
          setDetailsData(data);
        })
        .catch((err) => {
          console.warn('Failed to load hotel detail passport from API:', err);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    } else {
      setDetailsData(null);
    }
  }, [hotel]);

  // Priority: if the hotel was returned from /api/search with specific verified facts for the user query,
  // show strictly those facts. Otherwise, fallback to facts from /api/hotels/:id, strictly filtering
  // out facts where value === false or value is empty, so no irrelevant or false facts are displayed.
  const factsList: FactItem[] = React.useMemo(() => {
    if (!hotel) return [];
    if (hotel.facts && hotel.facts.length > 0) {
      return hotel.facts.filter((f) => f.value !== false);
    }
    if (detailsData?.facts && detailsData.facts.length > 0) {
      return detailsData.facts.filter((f) => f.value === true);
    }
    return [];
  }, [hotel, detailsData?.facts]);

  if (!hotel) return null;

  const calculateNights = (inStr: string, outStr: string) => {
    const diff = new Date(outStr).getTime() - new Date(inStr).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights(checkInDate, checkOutDate);
  const currentPrice = hotel.price || hotel.minPriceRub || 6500;
  const totalPriceRub = currentPrice * nights;

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    const newBookingId = `OST-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedBookingId(newBookingId);

    const booking: UserBooking = {
      id: newBookingId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelCity: hotel.city,
      roomName: hotel.rooms && hotel.rooms[0] ? hotel.rooms[0].name : 'Стандартный номер',
      checkInDate,
      checkOutDate,
      nightsCount: nights,
      guestsCount: 2,
      totalPrice: totalPriceRub,
      currency: currentCurrency,
      guestName,
      guestEmail: guestEmail || 'guest@ostrovok.ru',
      guestPhone,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(booking);
    setBookingStep('success');
  };

  const questionsList = detailsData?.questions || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-400">
              {[...Array(hotel.stars || 4)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {hotel.propertyTypeLabel || 'Отель'} · {hotel.city}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {bookingStep === 'details' && (
            <>
              {/* Hotel Overview Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5 h-56 sm:h-64 rounded-2xl overflow-hidden shadow-sm relative">
                  <HotelVisual theme={hotel.accentTheme || 'classic'} name={hotel.name} />
                  {hotel.discountPercent && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg shadow-sm">
                      Скидка {hotel.discountPercent}%
                    </div>
                  )}
                </div>

                <div className="md:col-span-7 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                      {hotel.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{hotel.address}</span>
                      {hotel.metro && (
                        <span className="text-blue-600 font-medium">
                          · Метро {hotel.metro} ({Math.round((hotel.metroDistanceKm || 0.5) * 1000)} м)
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-[#27ae60] text-white font-extrabold text-sm rounded-lg">
                        {hotel.rating}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{hotel.ratingLabel}</div>
                        <div className="text-xs text-slate-500">
                          {hotel.numberOfReviews || hotel.reviewsCount || 42} отзыва гостей
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {hotel.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Стоимость за 1 ночь:</div>
                      <div className="text-xl font-black text-slate-950">
                        {formatPrice(currentPrice, currentCurrency)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingStep('form')}
                      className="px-6 py-2.5 bg-[#1652f0] hover:bg-blue-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Забронировать номер
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Facts & Semantic Passport Section */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1652f0]" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      Семантический паспорт: Проверенные факты и скрытые характеристики
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100/80 text-[#1652f0] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Мультиагентная верификация
                  </span>
                </div>

                {loadingDetails ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Загрузка проверенных фактов из базы знаний...
                  </div>
                ) : factsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {factsList.map((fact, idx) => {
                      const confidencePct = Math.round((fact.confidence || 0.85) * 100);
                      const evidenceNode = formatFactEvidence(fact);

                      return (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {formatFactTitle(fact.key)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {confidencePct}% уверенность
                            </span>
                          </div>

                          {/* Fact description / evidence from real backend JSON */}
                          {evidenceNode && (
                            <div className="text-xs text-slate-600 leading-relaxed">
                              {evidenceNode}
                            </div>
                          )}

                          {/* Passport Metadata (Source + TTL) */}
                          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                            <div>
                              Источник: <strong className="text-slate-600">{formatSourceLabel(fact.source)}</strong>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatFactTtl(fact)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 p-3 bg-white rounded-xl">
                    Для данного отеля гео-факты валидируются агентом в фоновом режиме.
                  </div>
                )}

                {/* Questions to Hotelier pending block */}
                {questionsList.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Вопросы отельеру по этому объекту:</span>
                      </div>
                      {onOpenHotelierCabinet && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenHotelierCabinet();
                          }}
                          className="text-[11px] font-bold text-[#1652f0] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Открыть в кабинете отельера</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {questionsList.map((q) => (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{q.text}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Ключ: {q.key} · Статус: <strong>{q.status === 'pending' ? 'Ожидает ответа отельера' : 'Отвечен'}</strong>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            {q.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {bookingStep === 'form' && (
            <form onSubmit={handleCreateBooking} className="space-y-6 max-w-xl mx-auto">
              <div>
                <button
                  type="button"
                  onClick={() => setBookingStep('details')}
                  className="text-xs font-semibold text-[#1652f0] hover:underline mb-2 flex items-center gap-1 cursor-pointer"
                >
                  ← Назад к описанию
                </button>
                <h3 className="text-2xl font-extrabold text-slate-950">Оформление бронирования</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {hotel.name} · {nights} {nights === 1 ? 'ночь' : 'ночей'} ({checkInDate} — {checkOutDate})
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-lime-900">Итоговая стоимость:</div>
                  <div className="text-xl font-extrabold text-slate-950">
                    {formatPrice(totalPriceRub, currentCurrency)}
                  </div>
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  ✓ Оплата в объекте или картой
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Имя и фамилия гостя *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Александр Иванов"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Телефон для связи *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (999) 000-00-00"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Электронная почта
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.ru"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1652f0] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                Подтвердить бронирование
              </button>
            </form>
          )}

          {bookingStep === 'success' && (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-950">Бронирование подтверждено!</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Ваучер номер <span className="font-bold text-slate-900">{confirmedBookingId}</span> сформирован.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-1.5">
                <div><strong>Объект:</strong> {hotel.name}</div>
                <div><strong>Даты:</strong> {checkInDate} — {checkOutDate} ({nights} ночей)</div>
                <div><strong>Гость:</strong> {guestName}</div>
                <div><strong>К оплате:</strong> {formatPrice(totalPriceRub, currentCurrency)}</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Отлично, закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
