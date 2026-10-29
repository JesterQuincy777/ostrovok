import React from 'react';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Check,
  Wifi,
  Car,
  UtensilsCrossed,
  Baby,
  Dumbbell,
  Clock,
  Sparkles,
  Info,
  X,
  Share2,
  CheckCircle2,
  Loader2,
  Calendar,
  Users,
  Compass,
  HelpCircle,
  Send,
} from 'lucide-react';
import { Hotel, CurrencyCode, UserBooking, RoomOption } from '../types';
import { formatPrice } from './SeasonDealsCarousel';
import { apiService, ApiHotelDetailsResponse, FactItem } from '../services/apiService';
import { InteractiveMap } from './InteractiveMap';

interface HotelDetailPageProps {
  hotel: Hotel;
  onBackToResults: () => void;
  onBackToHome: () => void;
  currentCurrency: CurrencyCode;
  checkInDate: string;
  checkOutDate: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onConfirmBooking: (booking: UserBooking) => void;
  onOpenAuth?: () => void;
  onOpenHotelierCabinet?: () => void;
}

// Characteristic titles dictionary
const CHARACTERISTIC_TITLES: Record<string, string> = {
  air_quality_good: '🍃 Чистый воздух вокруг',
  baby_friendly_no_steps: '👶 Маршрут с коляской без ступенек',
  cafe_nearby: '☕ Кофе и выпечка поблизости',
  dog_walk_nearby: '🐕 Прогулки с собакой (парк рядом)',
  early_check_in: '⏱️ Ранний заезд',
  female_hotelier: '👩 Отельер женщина',
  fireplace_in_hotel: '🔥 Камин в отеле',
  good_coffee_in_hotel: '☕ Вкусный свежий кофе в отеле',
  good_sleep: '😴 Отличная шумоизоляция для сна',
  good_wifi_for_work: '💻 Скоростной Wi-Fi для работы',
  hairdryer_in_room: '💨 Мощный фен в номере',
  hotel_in_old_building: '🏛️ Отель в старинном фонде',
  kitchen_in_room: '🍳 Кухня в номере',
  museum_nearby: '🏛️ Музеи в шаговой доступности',
  non_smoking_room: '🚭 Номер для некурящих',
  parking_nearby: '🅿️ Парковка поблизости',
  park_nearby: '🌲 Зелёный сквер или парк рядом',
  pets_allowed: '🐾 Разрешено проживание с питомцами',
  pharmacy_nearby: '💊 Аптека и маркет 24/7 рядом',
  pleasant_neighbors: '🤝 Спокойные тихие соседи',
  pool_in_hotel: '🏊 Бассейн в отеле',
  quiet_nearby: '🔇 Тихий двор без баров и трамваев',
  quiet_room_courtyard: '🤫 Окна во внутренний тихий двор',
  receipts_on_request: '🧾 Отчётные документы и чеки',
  reception_24h: '🛎️ Круглосуточная стойка регистрации',
  room_blackout_curtains: '🌙 Плотные шторы blackout (темнота днём)',
  soft_blankets: '🛏️ Удобные матрасы и мягкие одеяла',
  view_from_window: '🌆 Красивый вид из окна',
  view_of_sunset: '🌅 Вид на закат с верхних этажей',
  walk_to_hermitage: '🏛️ Пешком до Эрмитажа',
  walk_to_metro_10_min: '🚇 До метро до 10 минут пешком',
  walk_to_metro_5_min: '🚇 До метро до 5 минут пешком',
  washing_machine_in_room: '🧺 Стиральная машина',
  work_table_in_room: '🖥️ Рабочий стол с розетками',
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
    return 'Проверено в этом сезоне';
  }
  return 'Актуально';
};

const formatSourceLabel = (source: string, factKey?: string): string => {
  const s = (source || '').toLowerCase().trim();
  const k = (factKey || '').toLowerCase();

  if (s.includes('osrm') || s.includes('foot') || k.includes('metro') || k.includes('walk')) {
    return 'Пешеходный маршрут';
  }
  if (s.includes('hotelier') || s.includes('ask') || k.includes('curtain') || k.includes('quiet_room') || k.includes('female')) {
    return 'Отельер';
  }
  if (s.includes('air') || k.includes('air_quality')) {
    return 'Экологический датчик';
  }
  if (s.includes('dem') || k.includes('sunset') || k.includes('view') || k.includes('old_building')) {
    return '3D-модель застройки';
  }
  if (s.includes('osm') || s.includes('overpass') || k.includes('park') || k.includes('quiet') || k.includes('cafe') || k.includes('pharmacy') || k.includes('museum')) {
    return 'Городские карты';
  }
  if (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return 'Городские карты';
};

// Curated atmospheric gallery photos for boutique hotel representation (matching image_7287ba24.png)
const GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
];

const DEFAULT_NEARBY_PLACES = [
  { icon: '🎭', name: 'Мариинский театр', dist: '605 м' },
  { icon: '🏛️', name: 'Новая Голландия', dist: '776 м' },
  { icon: '🖼️', name: 'Юсуповский дворец', dist: '954 м' },
  { icon: '🚢', name: 'Ледокол «Красин»', dist: '1,3 км' },
  { icon: '🏛️', name: 'Манеж', dist: '1,5 км' },
];

export const HotelDetailPage: React.FC<HotelDetailPageProps> = ({
  hotel,
  onBackToResults,
  onBackToHome,
  currentCurrency,
  checkInDate,
  checkOutDate,
  favorites,
  onToggleFavorite,
  onConfirmBooking,
  onOpenHotelierCabinet,
}) => {
  const [detailsData, setDetailsData] = React.useState<ApiHotelDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = React.useState<number | null>(null);
  const [showAllAmenitiesModal, setShowAllAmenitiesModal] = React.useState<boolean>(false);

  // Booking modal state
  const [selectedRoomToBook, setSelectedRoomToBook] = React.useState<RoomOption | null>(null);
  const [guestName, setGuestName] = React.useState('');
  const [guestEmail, setGuestEmail] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');
  const [bookingConfirmedId, setBookingConfirmedId] = React.useState<string | null>(null);

  const [hotelQuestions, setHotelQuestions] = React.useState<any[]>(() => {
    const defaultQ =
      hotel.questions || [
        {
          id: `${hotel.id}-q1`,
          question: 'Есть ли в стандартных номерах плотные шторы блэкаут?',
          status: 'not_sent',
        },
        {
          id: `${hotel.id}-q2`,
          question: 'Тихий ли двор и окна без шума утренней уборочной техники?',
          status: 'not_sent',
        },
      ];
    try {
      const saved = localStorage.getItem(`hotelier_questions_${hotel.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return defaultQ.map((q) => {
          const found = parsed.find(
            (p: any) => p.question === q.question || String(p.id) === String(q.id)
          );
          return found ? { ...q, status: found.status, answer: found.answer } : q;
        });
      }
    } catch (e) {}
    return defaultQ;
  });
  const [askingQuestionMap, setAskingQuestionMap] = React.useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAskHotelier = async (questionText: string, qIdx: number) => {
    const key = `${hotel.id}-${qIdx}`;
    if (askingQuestionMap[key]) return;

    setAskingQuestionMap((prev) => ({ ...prev, [key]: true }));

    try {
      await apiService.askQuestion(hotel.id, questionText);

      setHotelQuestions((prev) => {
        const next = [...prev];
        if (next[qIdx]) {
          next[qIdx] = { ...next[qIdx], status: 'pending' };
        }
        try {
          localStorage.setItem(`hotelier_questions_${hotel.id}`, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      showToast('Запрос отправлен в отель! Как только отельер ответит, факт появится в карточке.');
    } catch (err: any) {
      console.warn('Failed to ask hotelier:', err);
      showToast('Не удалось отправить запрос. Попробуйте ещё раз.');
    } finally {
      setAskingQuestionMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const isFavorite = favorites.includes(hotel.id);

  // Fetch backend facts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoadingDetails(true);
    apiService
      .getHotelDetails(hotel.id)
      .then((data) => {
        setDetailsData(data);
      })
      .catch((err) => {
        console.warn('Could not load extra hotel facts from API:', err);
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [hotel.id]);

  // Verified facts from backend
  const factsList: FactItem[] = React.useMemo(() => {
    if (hotel.facts && hotel.facts.length > 0) {
      return hotel.facts.filter((f) => f.value !== false && f.value !== null);
    }
    if (detailsData?.facts && detailsData.facts.length > 0) {
      return detailsData.facts.filter((f) => f.value === true);
    }
    return [];
  }, [hotel.facts, detailsData?.facts]);

  const calculateNights = (inStr: string, outStr: string) => {
    const diff = new Date(outStr).getTime() - new Date(inStr).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights(checkInDate, checkOutDate);
  const basePrice = hotel.price || hotel.minPriceRub || 4600;

  // Build room options
  const roomOptions: RoomOption[] = React.useMemo(() => {
    if (hotel.rooms && hotel.rooms.length > 0) {
      return hotel.rooms;
    }
    return [
      {
        id: 'room-std',
        name: 'Стандартный двухместный номер',
        areaM2: 24,
        bedType: '1 большая двуспальная кровать',
        maxGuests: 2,
        pricePerNight: basePrice,
        originalPricePerNight: Math.round(basePrice * 1.15),
        breakfastIncluded: Boolean(hotel.breakfast),
        freeCancellation: true,
        payAtHotel: true,
        amenities: ['Бесплатный Wi-Fi', 'Кондиционер', 'Собственная ванная', 'Шумоизоляция', 'Фен'],
      },
      {
        id: 'room-deluxe',
        name: 'Улучшенный номер Делюкс с видом на тихий двор',
        areaM2: 32,
        bedType: '1 большая кровать King Size',
        maxGuests: 2,
        pricePerNight: Math.round(basePrice * 1.25),
        originalPricePerNight: Math.round(basePrice * 1.45),
        breakfastIncluded: true,
        freeCancellation: true,
        payAtHotel: true,
        amenities: ['Blackout шторы', 'Кофемашина', 'Халаты и тапочки', 'Сейф', 'Рабочая зона'],
      },
      {
        id: 'room-suite',
        name: 'Двухкомнатный семейный люкс',
        areaM2: 48,
        bedType: '1 кровать King Size + 1 диван-кровать',
        maxGuests: 4,
        pricePerNight: Math.round(basePrice * 1.65),
        breakfastIncluded: true,
        freeCancellation: true,
        payAtHotel: false,
        amenities: ['Кухня / Микроволновка', 'Гостиная зона', 'Ванна и душ', 'Стиральная машина'],
      },
    ];
  }, [hotel.rooms, basePrice, hotel.breakfast]);

  // Handle booking form submission
  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !selectedRoomToBook) return;

    const newId = `OST-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingConfirmedId(newId);

    const booking: UserBooking = {
      id: newId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelCity: hotel.city,
      roomName: selectedRoomToBook.name,
      checkInDate,
      checkOutDate,
      nightsCount: nights,
      guestsCount: selectedRoomToBook.maxGuests,
      totalPrice: selectedRoomToBook.pricePerNight * nights,
      currency: currentCurrency,
      guestName,
      guestEmail: guestEmail || 'guest@ostrovok.ru',
      guestPhone,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(booking);
  };

  const scrollToRooms = () => {
    const el = document.getElementById('hotel-rooms-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cityPrepositional = (hotel.city || 'Санкт-Петербург').includes('Санкт')
    ? 'Санкт-Петербурге'
    : (hotel.city || 'городе');

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 pb-20">
      {/* 1. Sub-Header Navigation Strip matching image_7287ba24.png */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToResults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Все варианты в {cityPrepositional}</span>
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Новый поиск</span>
            </button>
          </div>

          {onOpenHotelierCabinet && (
            <button
              type="button"
              onClick={onOpenHotelierCabinet}
              className="text-xs font-bold text-[#1652f0] hover:underline hidden sm:block cursor-pointer"
            >
              Кабинет отельера
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* 2. Hotel Title & Key Badges Row matching image_7287ba24.png */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            {/* Stars & Category */}
            <div className="flex items-center gap-1.5 text-amber-400">
              {[...Array(hotel.stars || 4)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Name and Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
                {hotel.name}
              </h1>
              {hotel.topBadge && (
                <span className="px-2 py-0.5 bg-[#1652f0] text-white text-[10px] font-black rounded-sm uppercase tracking-wider">
                  {hotel.topBadge}
                </span>
              )}
              <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black rounded-sm uppercase tracking-wider">
                GURU
              </span>
            </div>

            {/* Address & Metro Distances */}
            <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
              <span className="text-slate-800 font-medium">{hotel.address}</span>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={scrollToRooms}
                className="text-[#1652f0] font-semibold hover:underline cursor-pointer"
              >
                Показать на карте
              </button>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{hotel.centerDistanceKm} км от центра</span>
              <span className="text-slate-300">•</span>
              <span>
                {Math.round(hotel.metroDistanceKm * 1000)} м от метро{' '}
                {hotel.metro || 'Садовая'}
              </span>
            </div>
          </div>

          {/* Right Price & Actions */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="text-[11px] text-slate-400 font-medium">от</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950">
                {formatPrice(basePrice, currentCurrency)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite(hotel.id)}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
                title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={scrollToRooms}
                className="px-6 py-3 rounded-xl bg-[#1652f0] hover:bg-[#1244cd] active:scale-98 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
              >
                Посмотреть цены
              </button>
            </div>
          </div>
        </div>

        {/* 3. Photo Gallery Grid matching image_7287ba24.png */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 p-1.5 bg-slate-100">
            {/* Big feature photo on the left (spanning 6 cols) */}
            <div
              onClick={() => setActivePhotoIndex(0)}
              className="md:col-span-6 h-64 sm:h-80 md:h-[420px] rounded-xl overflow-hidden relative cursor-pointer group"
            >
              <img
                src={GALLERY_PHOTOS[0]}
                alt={`${hotel.name} номер`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* 2 rows x 3 columns on the right (spanning 6 cols) */}
            <div className="md:col-span-6 grid grid-cols-3 grid-rows-2 gap-1.5 h-64 sm:h-80 md:h-[420px]">
              {GALLERY_PHOTOS.slice(1, 7).map((photoUrl, idx) => {
                const photoIdx = idx + 1;
                const isLast = idx === 5;
                return (
                  <div
                    key={photoIdx}
                    onClick={() => setActivePhotoIndex(photoIdx)}
                    className="relative rounded-lg overflow-hidden cursor-pointer group h-full bg-slate-900"
                  >
                    <img
                      src={photoUrl}
                      alt={`${hotel.name} фото ${photoIdx}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isLast ? (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-sm sm:text-base group-hover:bg-black/70 transition-colors">
                        +9 фото
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Three Information Cards Row matching image_7287ba24.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Review & Rating */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#27ae60] text-white font-black text-base flex items-center justify-center shadow-xs">
                    {hotel.rating}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-950 leading-tight">
                      {hotel.ratingLabel || 'Превосходно'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {hotel.numberOfReviews} отзывов
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                  {hotel.propertyTypeLabel || 'Исторический отель'}
                </span>
              </div>

              {/* Verified Guest Review quote */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span>🇷🇺</span>
                  <span>Татьяна К.</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-emerald-700">Что было хорошо:</strong> Чудесный отель, прекрасная локация и идеальная тишина в номере)))
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                className="flex-1 ml-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#1652f0] font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Читать все отзывы · {hotel.numberOfReviews}
              </button>
            </div>
          </div>

          {/* Card 2: Popular Amenities */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-950 mb-3">
                Популярные удобства
              </h3>
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                {hotel.freeWifi && (
                  <div className="flex items-center gap-2.5">
                    <Wifi className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Бесплатный интернет</span>
                  </div>
                )}
                {hotel.transfer && (
                  <div className="flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Трансфер от/до вокзала и аэропорта</span>
                  </div>
                )}
                {hotel.parking && (
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center font-bold text-[11px] bg-slate-200 text-slate-700 rounded-sm">P</span>
                    <span>Парковка</span>
                  </div>
                )}
                {hotel.breakfast && (
                  <div className="flex items-center gap-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Вкусный завтрак (шведский стол)</span>
                  </div>
                )}
                {hotel.individualCheckIn && (
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Бесконтактный заезд 24/7</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Baby className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Подходит для детей</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAllAmenitiesModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#1652f0] font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Все удобства · 34
            </button>
          </div>

          {/* Card 3: What's Nearby */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-950 mb-3">
                Что есть рядом
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                {DEFAULT_NEARBY_PLACES.map((place, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="shrink-0">{place.icon}</span>
                      <span className="truncate font-medium">{place.name}</span>
                    </div>
                    <span className="text-slate-400 font-medium shrink-0">{place.dist}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToRooms}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#1652f0] font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Смотреть на карте · 50
            </button>
          </div>
        </div>

        {/* 5. Embedded Semantic Passport with simpler title ("Проверенные особенности отеля") */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-slate-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Паспорт отеля
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Объективные факты, подтверждённые проверкой отеля и данными городской инфраструктуры
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Проверено сервисом</span>
            </div>
          </div>

          {loadingDetails ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1652f0]" />
              <span className="text-xs font-semibold">Загружаем подтверждённые данные...</span>
            </div>
          ) : factsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {factsList.map((fact, idx) => {
                const title = formatFactTitle(fact.key);
                const evidence = formatFactEvidence(fact);

                return (
                  <div
                    key={`${fact.key}-${idx}`}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                          {title}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Подтверждено
                        </span>
                      </div>

                      {evidence && (
                        <div className="text-xs text-slate-600 mt-2 leading-relaxed bg-white/80 p-2 rounded-lg border border-slate-200/60">
                          {evidence}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Источник: {formatSourceLabel(fact.source, fact.key)}</span>
                      <span>{formatFactTtl(fact)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Основные параметры отеля соответствуют стандартам категории {hotel.stars}★.
            </div>
          )}

          {/* Вопросы отельеру по этому объекту (Requirement 2.4) */}
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1652f0]" />
              <span>Вопросы отельеру по этому объекту</span>
            </h3>
            <div className="space-y-2.5">
              {hotelQuestions.map((q, qIdx) => {
                const key = `${hotel.id}-${qIdx}`;
                const isLoading = askingQuestionMap[key];
                const isPending = q.status === 'pending';
                const isAnswered = q.status === 'answered';

                return (
                  <div
                    key={qIdx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {isAnswered ? `✅ ${q.answer || 'Подтверждено отельером'}` : `❓ ${q.question}`}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isAnswered ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                          ✅ Подтверждено отельером (100%)
                        </span>
                      ) : isPending ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          ⏳ Запрос отправлен отельеру (PENDING)
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleAskHotelier(q.rawQuestion || q.question, qIdx)}
                          className="px-4 py-2 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-[#1652f0] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>📨 Отправить вопрос отельеру</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. Rooms and Prices Section (#hotel-rooms-section) */}
        <div id="hotel-rooms-section" className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                Номера и цены
              </h2>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Заезд {checkInDate} — Выезд {checkOutDate} ({nights} {nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'})
                </span>
                <span>•</span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>2 гостя</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {roomOptions.map((room) => {
              const totalPrice = room.pricePerNight * nights;
              return (
                <div
                  key={room.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden hover:border-[#1652f0]/60 transition-colors bg-white shadow-2xs"
                >
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Room Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-950">
                          {room.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                          {room.areaM2} м²
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        {room.bedType}
                      </div>

                      {/* Amenities pills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {room.amenities.map((am, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                        {room.freeCancellation && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Бесплатная отмена
                          </span>
                        )}
                        {room.breakfastIncluded ? (
                          <span className="text-blue-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                            Завтрак включен
                          </span>
                        ) : (
                          <span className="text-slate-400">Без завтрака</span>
                        )}
                      </div>
                    </div>

                    {/* Price and Book CTA */}
                    <div className="flex items-center lg:flex-col items-end justify-between lg:justify-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-slate-400 font-medium">
                          за {nights} {nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'}
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-slate-950">
                          {formatPrice(totalPrice, currentCurrency)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatPrice(room.pricePerNight, currentCurrency)} / ночь
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRoomToBook(room)}
                        className="px-6 py-2.5 rounded-xl bg-[#1652f0] hover:bg-[#1244cd] active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                      >
                        Забронировать
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Neighborhood Map */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-950">
            <Compass className="w-5 h-5 text-[#1652f0]" />
            <h3 className="text-base font-extrabold">Расположение на карте</h3>
          </div>
          <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
            <InteractiveMap
              hotels={[hotel]}
              selectedHotelId={hotel.id}
              onSelectHotel={() => {}}
              hoveredHotelId={null}
              onHoverHotel={() => {}}
              currentCurrency={currentCurrency}
            />
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {selectedRoomToBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-950">Бронирование номера</h3>
                <p className="text-xs text-slate-500">{selectedRoomToBook.name}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomToBook(null);
                  setBookingConfirmedId(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmedId ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">Бронирование подтверждено!</h4>
                  <p className="text-xs text-slate-500">
                    Номер бронирования:{' '}
                    <span className="font-mono font-bold text-slate-900">{bookingConfirmedId}</span>
                  </p>
                </div>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Ваучер на заселение отправлен на вашу почту. Оплата при заселении в отель.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoomToBook(null);
                    setBookingConfirmedId(null);
                  }}
                  className="w-full py-3 rounded-xl bg-[#1652f0] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Отлично, спасибо
                </button>
              </div>
            ) : (
              <form onSubmit={handleCompleteBooking} className="space-y-3.5">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{hotel.name}</span>
                    <span>{formatPrice(selectedRoomToBook.pricePerNight * nights, currentCurrency)}</span>
                  </div>
                  <div>
                    {checkInDate} — {checkOutDate} ({nights} ночей)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Имя и фамилия гостя
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Иван Иванов"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#1652f0] focus:ring-1 focus:ring-[#1652f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Номер телефона
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#1652f0] focus:ring-1 focus:ring-[#1652f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Электронная почта
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="ivan@example.ru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:border-[#1652f0] focus:ring-1 focus:ring-[#1652f0]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#1652f0] hover:bg-[#1244cd] active:scale-98 text-white font-extrabold text-sm shadow-xs transition-all cursor-pointer"
                  >
                    Подтвердить бронирование
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Photo Viewer Modal */}
      {activePhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setActivePhotoIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActivePhotoIndex((prev) => (prev! > 0 ? prev! - 1 : GALLERY_PHOTOS.length - 1));
            }}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={GALLERY_PHOTOS[activePhotoIndex]}
              alt={`${hotel.name} фото`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActivePhotoIndex((prev) => (prev! < GALLERY_PHOTOS.length - 1 ? prev! + 1 : 0));
            }}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* All Amenities Modal */}
      {showAllAmenitiesModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAllAmenitiesModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-950">Все удобства и услуги</h3>
              <button
                type="button"
                onClick={() => setShowAllAmenitiesModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-950 mb-1.5">Интернет</h4>
                <p>• Бесплатный Wi-Fi на всей территории</p>
                <p>• Скорость от 50 Мбит/с для работы</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-950 mb-1.5">Парковка</h4>
                <p>• Охраняемая парковка рядом</p>
                <p>• Места для электромобилей</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-950 mb-1.5">Питание</h4>
                <p>• Завтрак в номер или ресторан</p>
                <p>• Бесплатный чай/кофе в лобби</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-950 mb-1.5">Услуги стойки</h4>
                <p>• Круглосуточная регистрация</p>
                <p>• Камера хранения багажа</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
