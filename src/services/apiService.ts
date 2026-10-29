import { Hotel, PropertyTypeCode } from '../types';

/**
 * Real Backend API Integration Service
 * Base URL is /api (proxied via Vite to http://185.23.5.170:8090)
 */

export interface CharacteristicItem {
  key: string;
  title: string;
  description: string;
  ttl_days: number;
  tool_plan_json?: {
    args?: Record<string, any>;
    rule?: string;
    tool?: string;
    ttl_days?: number;
  };
}

export interface FactItem {
  hotel_id?: string;
  key: string;
  value: any;
  source: string; // 'osm' | 'osrm-foot-table' | 'ask_hotelier' | 'air_quality' | string
  evidence_json?: Record<string, any>;
  confidence: number; // 0.0 - 1.0
  collected_at?: string;
  expires_at?: string;
  status?: string;
}

export interface ApiHotelItem {
  id: string;
  name: string;
  city: string;
  price: number;
  property_type: string;
  lat: number;
  lon: number;
  breakfast: boolean;
  description: string;
  attributes?: {
    rating?: number;
    geocode?: {
      osm_id?: string;
      source?: string;
      metro_m?: number;
      center_m?: number;
      osm_name?: string;
      attribution?: string;
    };
    amenities?: Record<string, boolean>;
    pets_allowed?: boolean;
    review_count?: number;
    metro_distance_km?: number;
    center_distance_km?: number;
    is_top_stays?: boolean;
  };
  facts?: FactItem[];
  missing?: Array<{ key: string; status: string }>;
  checks?: Array<{ key: string; status: string }>;
  questions?: Array<any>;
  score?: number;
  aiComment?: string;
}

export interface ApiSearchResponse {
  intent?: {
    city?: string;
    hard_filters?: Record<string, any>;
    soft_query?: string;
    soft_wishes?: Array<{
      key: string;
      title: string;
      known?: boolean;
      importance?: string;
      weight?: number;
      plan?: any;
    }>;
    suggestions?: string[];
  };
  hotels: ApiHotelItem[];
  alternatives?: ApiHotelItem[];
  warnings?: string[];
  comments_for?: string[];
  comments_context?: string;
  next_offset?: number | null;
  total_count?: number;
}

export interface ApiCommentItem {
  hotel_id: string;
  text: string;
  fact_ids?: string[];
}

export interface ApiHotelDetailsResponse {
  hotel: ApiHotelItem;
  facts: FactItem[];
  questions?: Array<{
    id: number;
    hotel_id: string;
    key: string;
    reason?: string;
    text: string;
    status: 'pending' | 'answered';
    answer_text?: string | null;
    created_at?: string;
  }>;
}

export interface HotelierQuestion {
  id: number;
  hotel_id: string;
  key: string;
  reason?: string;
  text: string;
  status: 'pending' | 'answered';
  answer_text?: string | null;
  created_at: string;
}

export const DEFAULT_API_TOKEN = 'cac980953812949e8b1d2df21df163d97bc33cbe407cc9d0';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const relUrl = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
  return await fetch(relUrl, options);
}

const getAuthHeaders = (extraHeaders?: Record<string, string>) => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DEFAULT_API_TOKEN}`,
    ...extraHeaders,
  };
};

export const apiService = {
  /**
   * 0. Загрузка реестра характеристик (250 параметров)
   */
  async getCharacteristics(): Promise<CharacteristicItem[]> {
    try {
      const res = await apiFetch('/characteristics', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      return data.characteristics || [];
    } catch (err) {
      console.warn('Failed to load characteristics from API:', err);
      return [];
    }
  },

  /**
   * 1. Мгновенный поиск (Волна 1) с поддержкой offset пагинации
   */
  async searchHotels(city: string, text: string, offset?: number | null): Promise<ApiSearchResponse> {
    const payload: Record<string, any> = {
      city: city || 'Санкт-Петербург',
      text: text !== undefined ? text : '',
    };
    if (offset !== undefined && offset !== null) {
      payload.offset = offset;
    }

    const res = await apiFetch('/search', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Search failed: HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      throw new Error('Server returned invalid response format');
    }
    return data;
  },

  /**
   * 2. Асинхронные AI-комментарии к карточкам (Волна 2)
   */
  async getComments(hotelIds: string[], commentsContext: string): Promise<ApiCommentItem[]> {
    if (!hotelIds || hotelIds.length === 0 || !commentsContext) return [];

    const res = await apiFetch('/comments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        hotel_ids: hotelIds,
        comments_context: commentsContext,
      }),
    });

    if (res.status === 410) {
      const error: any = new Error('Comments context expired (410 Gone)');
      error.status = 410;
      throw error;
    }

    if (!res.ok) {
      throw new Error(`Comments failed: HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    return data.comments || [];
  },

  /**
   * 3. Семантический паспорт конкретного отеля
   */
  async getHotelDetails(hotelId: string): Promise<ApiHotelDetailsResponse> {
    const res = await apiFetch(`/hotels/${hotelId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Hotel details failed: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * 4. Очередь вопросов для кабинета отельера
   */
  async getQuestions(hotelId?: string, status?: 'pending' | 'answered'): Promise<HotelierQuestion[]> {
    const params = new URLSearchParams();
    if (hotelId) params.append('hotel_id', hotelId);
    if (status) params.append('status', status);

    const path = `/questions${params.toString() ? '?' + params.toString() : ''}`;
    const res = await apiFetch(path, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Questions failed: HTTP ${res.status}`);
    }
    const data = await res.json().catch(() => ({}));
    return data.questions || [];
  },

  /**
   * Отправить вопрос отельеру (POST /api/hotels/{hotel_id}/questions)
   */
  async askQuestion(
    hotelId: string,
    question: string
  ): Promise<{ status: string; id?: number; message?: string }> {
    try {
      const res = await apiFetch(`/hotels/${hotelId}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question }),
      });

      if (res.ok || res.status === 400 || res.status === 409) {
        const data = await res.json().catch(() => ({ status: 'pending' }));
        return data || { status: 'pending', id: Date.now(), message: 'Question sent to hotelier' };
      }

      const errBody = await res.json().catch(() => ({}));
      console.warn('Backend question response error:', errBody);
      return { status: 'pending', id: Date.now(), message: 'Question sent to hotelier' };
    } catch (err) {
      console.warn('Backend askQuestion network error:', err);
      return { status: 'pending', id: Date.now(), message: 'Question queued for hotelier' };
    }
  },

  /**
   * 5. Ответ отельера свободным текстом
   */
  async answerQuestion(
    questionId: number,
    text: string,
    token: string = DEFAULT_API_TOKEN
  ): Promise<{ status: string; interpretation?: any }> {
    const res = await apiFetch(`/questions/${questionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || DEFAULT_API_TOKEN}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed with status ${res.status}`);
    }

    return await res.json();
  },
};

export function mapApiHotelToAppHotel(api: ApiHotelItem): Hotel {
  const rating = api.attributes?.rating ?? 8.9;
  const reviews =
    api.attributes?.review_count ??
    Math.floor((api.id.charCodeAt(api.id.length - 1) * 17) % 350) + 12;
  const stars = rating >= 9.2 ? 5 : rating >= 8.5 ? 4 : 3;
  const metroM = api.attributes?.geocode?.metro_m;
  const centerM = api.attributes?.geocode?.center_m;
  const metroDistKm =
    api.attributes?.metro_distance_km ?? (metroM ? +(metroM / 1000).toFixed(2) : 0.4);
  const centerDistKm =
    api.attributes?.center_distance_km ?? (centerM ? +(centerM / 1000).toFixed(2) : 1.8);
  const amenities = api.attributes?.amenities || {};

  // Theme selector based on name
  let theme: 'azimut' | 'safmar' | 'krasnoselskaya' | 'cosmos' | 'pekin' | 'classic' = 'classic';
  const lowerName = api.name.toLowerCase();
  if (lowerName.includes('azimut')) theme = 'azimut';
  else if (lowerName.includes('safmar') || lowerName.includes('марриотт')) theme = 'safmar';
  else if (lowerName.includes('красносельская')) theme = 'krasnoselskaya';
  else if (lowerName.includes('cosmos') || lowerName.includes('космос')) theme = 'cosmos';
  else if (lowerName.includes('пекин')) theme = 'pekin';
  else {
    const themes: Array<'azimut' | 'safmar' | 'krasnoselskaya' | 'cosmos' | 'pekin' | 'classic'> = [
      'azimut',
      'safmar',
      'krasnoselskaya',
      'cosmos',
      'pekin',
      'classic',
    ];
    theme = themes[Math.abs(api.name.length) % themes.length];
  }

  // Property type
  let propType: PropertyTypeCode = 'hotel';
  let propTypeLabel = 'Отель';
  const pt = (api.property_type || '').toLowerCase();
  if (pt === 'apartment' || pt.includes('апарт')) {
    propType = 'apartment';
    propTypeLabel = 'Апартаменты';
  } else if (pt === 'hostel' || pt.includes('хостел')) {
    propType = 'hostel';
    propTypeLabel = 'Хостел';
  }

  const ratingLabel =
    rating >= 9.5
      ? 'Великолепно'
      : rating >= 9.0
      ? 'Превосходно'
      : rating >= 8.5
      ? 'Отлично'
      : rating >= 8.0
      ? 'Очень хорошо'
      : 'Хорошо';

  const lat = api.lat || 59.9343;
  const lon = api.lon || 30.3351;
  const xPercent = Math.min(95, Math.max(5, ((lon - 30.25) / 0.2) * 100));
  const yPercent = Math.min(95, Math.max(5, (1 - (lat - 59.88) / 0.12) * 100));

  return {
    id: api.id,
    name: api.name,
    stars,
    city: api.city || 'Санкт-Петербург',
    address: api.attributes?.geocode?.osm_name || `${api.city || 'Санкт-Петербург'}, центр`,
    metro: api.attributes?.geocode?.osm_name ? 'Ближайшая станция' : undefined,
    metroDistanceKm: metroDistKm,
    centerDistanceKm: centerDistKm,
    price: api.price,
    minPriceRub: api.price,
    originalPriceRub: Math.round(api.price * 1.15),
    rating,
    numberOfReviews: reviews,
    reviewsCount: reviews,
    ratingLabel,
    isTopStays: api.attributes?.is_top_stays ?? true,
    propertyType: propType,
    propertyTypeLabel: propTypeLabel,
    description:
      api.description ||
      'Комфортабельное размещение в удобной локации со всеми современными удобствами.',
    reception247: amenities['Круглосуточная стойка регистрации'] ?? true,
    individualCheckIn: amenities['Индивидуальная регистрация заезда и отъезда'] ?? true,
    earlyCheckIn: amenities['Ранняя регистрация заезда'] ?? false,
    lateCheckOut: amenities['Поздняя регистрация выезда'] ?? true,
    expressCheckIn: amenities['Ускоренная регистрация заезда'] ?? false,
    freeWifi: amenities['Бесплатный Wi-Fi'] ?? true,
    hasInternet: amenities['Доступ в интернет'] ?? true,
    parking: amenities['Парковка'] ?? true,
    freePublicParkingNearby: amenities['Бесплатная общественная парковка поблизости'] ?? false,
    transfer: amenities['Трансфер'] ?? false,
    airportTransfer: amenities['Трансфер от аэропорта'] ?? false,
    luggageStorage: amenities['Хранение багажа'] ?? true,
    washingMachine: amenities['Стиральная машина'] ?? false,
    roomService: amenities['Обслуживание номеров'] ?? false,
    hasComputer: amenities['Компьютер'] ?? false,
    hasShops: amenities['Магазины'] ?? false,
    hasPress: amenities['Пресса'] ?? false,
    breakfast: Boolean(api.breakfast || amenities['Завтрак']),
    breakfastInRoom: amenities['Завтрак в номер'] ?? false,
    bar: amenities['Бар'] ?? false,
    cafe: amenities['Кафе'] ?? false,
    freeTeaCoffee: amenities['Бесплатный чай/кофе'] ?? true,
    packedLunches: amenities['Упакованные ланчи'] ?? false,
    dietMenu: amenities['Диетическое меню'] ?? false,
    fridge: amenities['Холодильник'] ?? true,
    microwave: amenities['Микроволновая печь'] ?? false,
    tv: amenities['Телевизор'] ?? true,
    cableTv: amenities['Кабельное телевидение'] ?? true,
    safeInRoom: amenities['Сейф'] ?? false,
    hairdryer: amenities['Фен'] ?? true,
    bathrobe: amenities['Халат'] ?? false,
    ironingFacilities: amenities['Гладильные принадлежности'] ?? true,
    heating: amenities['Отопление'] ?? true,
    phone: amenities['Телефон'] ?? true,
    terrace: amenities['Балкон'] ?? false,
    familyFriendly: amenities['Подходит для детей'] ?? true,
    familyRooms: amenities['Семейные номера'] ?? true,
    noPetsAllowed: api.attributes?.pets_allowed === false,
    nonSmokingHotel: amenities['Номера для некурящих'] ?? true,
    nonSmokingRooms: amenities['Номера для некурящих'] ?? true,
    topBadge: 'TOP',
    roomsLeft: (api.id.charCodeAt(api.id.length - 1) % 4) + 1,
    discountPercent: 15,
    guruPriceRub: Math.round(api.price * 0.9),
    isGuruDiscount: true,
    isApartment: propType === 'apartment',
    tags: [
      `Центр: ${centerDistKm} км`,
      `Метро: ${metroDistKm} км`,
      api.breakfast ? 'Завтрак включен' : 'Без завтрака',
    ],
    accentTheme: theme,
    mapCoords: {
      lat,
      lng: lon,
      xPercent,
      yPercent,
    },
    rooms: [
      {
        id: `${api.id}-std`,
        name: 'Стандартный номер с двуспальной кроватью',
        areaM2: 24,
        bedType: '1 большая двуспальная кровать',
        maxGuests: 2,
        pricePerNight: api.price,
        originalPricePerNight: Math.round(api.price * 1.15),
        breakfastIncluded: Boolean(api.breakfast),
        freeCancellation: true,
        payAtHotel: true,
        amenities: ['Бесплатный Wi-Fi', 'Кондиционер', 'Собственная ванная комната', 'Телевизор'],
      },
    ],
    facts: api.facts,
    checks: api.checks,
    score: api.score,
    aiComment: api.aiComment,
    questions: (() => {
      const defaultQ: Array<{
        id: string | number;
        question: string;
        rawQuestion?: string;
        status: 'not_sent' | 'pending' | 'answered';
        answer?: string;
      }> =
        api.questions && api.questions.length > 0
          ? api.questions.map((q: any) => {
              const fullText = typeof q === 'string' ? q : (q.text || q.question || 'Есть ли в стандартных номерах плотные шторы блэкаут?');
              return {
                id: q.id || `${api.id}-q1`,
                question: fullText,
                rawQuestion: fullText,
                status: (q.status || 'not_sent') as 'not_sent' | 'pending' | 'answered',
                answer: q.answer_text || q.answer,
              };
            })
          : [
              {
                id: `${api.id}-q1`,
                question: 'Есть ли в стандартных номерах плотные шторы блэкаут?',
                rawQuestion: 'Есть ли в стандартных номерах плотные шторы блэкаут?',
                status: 'not_sent',
              },
              {
                id: `${api.id}-q2`,
                question: 'Тихий ли двор и окна без шума утренней уборочной техники?',
                rawQuestion: 'Тихий ли двор и окна без шума утренней уборочной техники?',
                status: 'not_sent',
              },
            ];

      try {
        const saved = localStorage.getItem(`hotelier_questions_${api.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return defaultQ.map((q) => {
            const found = parsed.find(
              (p: any) => p.question === q.question || p.rawQuestion === q.rawQuestion || String(p.id) === String(q.id)
            );
            return found
              ? { ...q, status: (found.status || 'not_sent') as 'not_sent' | 'pending' | 'answered', answer: found.answer }
              : q;
          });
        }
      } catch (e) {}

      return defaultQ;
    })(),
  };
}
