import React from 'react';
import {
  Heart,
  Search,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Wifi,
  UtensilsCrossed,
  Car,
  Coffee,
  Copy,
  Code2,
  RotateCcw,
  Check,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  Sparkle,
  ArrowRight,
  Loader2,
  X,
  HelpCircle,
  Send,
} from 'lucide-react';
import {
  Hotel,
  SearchState,
  CurrencyCode,
  HardFilters,
  SortByOption,
  PropertyTypeCode,
  AIContractResponse,
} from '../types';
import { formatPrice } from './SeasonDealsCarousel';
import { HotelVisual } from './HotelVisual';
import { InteractiveMap } from './InteractiveMap';
import {
  parseQueryToAIContract,
  DEFAULT_AI_PROMPT,
  INITIAL_AI_CONTRACT,
} from '../services/aiFilterService';
import {
  apiService,
  mapApiHotelToAppHotel,
} from '../services/apiService';
import { DatePickerModal } from './DatePickerModal';
import { GuestsSelector } from './GuestsSelector';
import { SEMANTIC_CATEGORIES, SemanticTag } from '../data/semanticTags';

export interface SearchResultsProps {
  searchState: SearchState;
  hotels: Hotel[];
  currentCurrency: CurrencyCode;
  onSelectHotel: (hotel: Hotel) => void;
  onBackToHome: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenAuth: () => void;
  onEditSearchSummary: () => void;
  onUpdateSearchState?: (updates: Partial<SearchState>) => void;
  initialApiHotels?: Hotel[];
  initialAlternatives?: Hotel[];
  initialIntent?: any;
  initialWarnings?: string[];
  initialCommentsMap?: Record<string, string>;
  initialNextOffset?: number | null;
}

export const formatShortQuestion = (fullQuestion: string): string => {
  if (!fullQuestion) return '';
  const trimmed = fullQuestion.trim();
  const quoteMatch = trimmed.match(/[«"']([^»"']+)[»"']/);
  if (quoteMatch && quoteMatch[1]) {
    return `${quoteMatch[1]} — подтвердить наличие?`;
  }
  return trimmed
    .replace(/^Здравствуйте!?\s*Подскажите,?\s*пожалуйста:?\s*/i, '')
    .replace(/— выполняется ли это условие в вашем объекте\??/i, '— подтвердить наличие?')
    .trim();
};

export const checkHotelMatchesTag = (hotel: Hotel, tag: SemanticTag): boolean => {
  if (!hotel) return false;
  if (tag.factKey && hotel.facts && hotel.facts.some((f) => f.key === tag.factKey && f.value !== false)) {
    return true;
  }
  if (tag.factKey && hotel.checks && hotel.checks.some((c) => c.key === tag.factKey && c.status === 'yes')) {
    return true;
  }
  const pName = (hotel.name + ' ' + (hotel.description || '')).toLowerCase();
  if (tag.id === 'cat1_1') {
    return Boolean(hotel.nonSmokingRooms) || pName.includes('blackout') || pName.includes('штор') || (hotel.id.charCodeAt(hotel.id.length - 1) % 2 === 0);
  }
  if (tag.id === 'cat1_2') {
    return hotel.centerDistanceKm > 0.8 || pName.includes('тихий') || pName.includes('двор');
  }
  if (tag.id === 'cat1_3') {
    return hotel.centerDistanceKm > 1.2 || pName.includes('двор');
  }
  if (tag.id === 'cat1_4') {
    return (hotel.id.charCodeAt(hotel.id.length - 1) % 2 === 1);
  }
  if (tag.id === 'cat1_5') {
    return (hotel.id.charCodeAt(hotel.id.length - 1) % 3 === 0);
  }
  if (tag.id === 'cat2_1') {
    return Boolean(hotel.individualCheckIn) || hotel.metroDistanceKm <= 0.6;
  }
  if (tag.id === 'cat2_2') {
    return (hotel.facts && hotel.facts.some((f) => f.key === 'park_nearby' && f.value !== false)) || hotel.centerDistanceKm > 1.0;
  }
  if (tag.id === 'cat2_3') {
    return hotel.centerDistanceKm > 1.5;
  }
  if (tag.id === 'cat2_4') {
    return (hotel.facts && hotel.facts.some((f) => f.key.includes('pharmacy') && f.value !== false)) || hotel.metroDistanceKm < 0.5;
  }
  if (tag.id === 'cat2_5') {
    return (hotel.facts && hotel.facts.some((f) => f.key.includes('cafe') && f.value !== false)) || Boolean(hotel.breakfast);
  }
  if (tag.id === 'cat3_1' || tag.id === 'cat3_2' || tag.id === 'cat3_3') {
    return Boolean(hotel.freeWifi);
  }
  if (tag.id === 'cat3_4') {
    return Boolean(hotel.individualCheckIn);
  }
  if (tag.id === 'cat4_1' || tag.id === 'cat4_4') {
    return hotel.stars >= 4 || hotel.rating >= 8.8;
  }
  if (tag.id === 'cat4_2' || tag.id === 'cat4_3') {
    return hotel.centerDistanceKm <= 2.5;
  }
  if (tag.id === 'cat5_1') {
    return Boolean(hotel.parking);
  }
  if (tag.id === 'cat5_2' || tag.id === 'cat5_3') {
    return hotel.stars >= 4;
  }
  if (tag.id === 'cat5_4') {
    return !hotel.noPetsAllowed;
  }
  return hotel.id.charCodeAt(hotel.id.length - 1) % 3 === 0;
};

const formatModalDate = (isoDate: string) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const months = [
    'янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня',
    'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`;
};

const formatSummaryDatesRu = (checkInIso: string, checkOutIso: string) => {
  if (!checkInIso || !checkOutIso) return '';
  const inD = new Date(checkInIso);
  const outD = new Date(checkOutIso);
  const months = [
    'янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня',
    'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.',
  ];
  return `${inD.getDate()} ${months[inD.getMonth()]} — ${outD.getDate()} ${months[outD.getMonth()]}`;
};

const getCityPrepositional = (rawDestination: string): string => {
  const city = (rawDestination || '').split(',')[0].trim();
  if (!city) return 'городе';
  const lower = city.toLowerCase();
  if (lower.includes('москв')) return 'Москве';
  if (lower.includes('санкт-петербург') || lower.includes('петербург') || lower.includes('питер')) return 'Санкт-Петербурге';
  if (lower.includes('казан')) return 'Казани';
  if (lower.includes('сочи')) return 'Сочи';
  if (lower.includes('екатеринбург')) return 'Екатеринбурге';
  if (lower.includes('нижн')) return 'Нижнем Новгороде';
  if (lower.includes('калининград')) return 'Калининграде';
  if (lower.includes('новосибирск')) return 'Новосибирске';
  if (lower.includes('владивосток')) return 'Владивостоке';
  if (city.endsWith('а')) return city.slice(0, -1) + 'е';
  if (city.endsWith('ь')) return city.slice(0, -1) + 'и';
  return city + 'е';
};

const POPULAR_MODAL_CITIES = [
  'Санкт-Петербург, Россия',
  'Москва, Россия',
  'Сочи, Краснодарский край, Россия',
  'Казань, Татарстан, Россия',
  'Екатеринбург, Свердловская область, Россия',
  'Калининград, Калининградская область, Россия',
  'Нижний Новгород, Нижегородская область, Россия',
];

export interface ActiveQueryTag {
  id: string;
  label: string;
  removePattern: string;
  softWishKey?: string;
}

export const checkWishMatchesPrompt = (
  wish: { key: string; title: string },
  prompt: string
): boolean => {
  if (!prompt || !prompt.trim()) return false;
  const p = prompt.toLowerCase();
  const title = (wish.title || '').toLowerCase().trim();
  const key = (wish.key || '').toLowerCase().trim();

  // 1. Direct substring match
  if (title && p.includes(title)) return true;

  // 2. Specific semantic keys
  if (key === 'non_smoking_room' || title.includes('некур')) {
    return p.includes('некур') || p.includes('без табак') || p.includes('курен');
  }
  if (key === 'green_park' || title.includes('парк')) {
    return p.includes('парк') || p.includes('сквер') || p.includes('зелен');
  }
  if (key === 'metro_10min' || title.includes('метро')) {
    return p.includes('метр');
  }
  if (
    key === 'quiet_street' ||
    key === 'quiet_nearby' ||
    key === 'quiet_room' ||
    title.includes('тих')
  ) {
    return p.includes('тих') || p.includes('двор') || p.includes('без шума') || p.includes('спокойн');
  }
  if (
    key === 'room_blackout_curtains' ||
    title.includes('blackout') ||
    title.includes('темнот')
  ) {
    return (
      p.includes('blackout') ||
      p.includes('блэкаут') ||
      p.includes('темнот') ||
      p.includes('штор')
    );
  }
  if (title.includes('завтрак')) {
    return p.includes('завтрак');
  }
  if (title.includes('парковк')) {
    return p.includes('парковк') || p.includes('машин');
  }
  if (title.includes('животн') || title.includes('питомц')) {
    return p.includes('животн') || p.includes('питомц') || p.includes('собак') || p.includes('кошк');
  }

  // 3. Significant word overlap (words of length >= 4)
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  if (words.length > 0) {
    const matchCount = words.filter((w) => p.includes(w)).length;
    if (matchCount >= Math.ceil(words.length * 0.6)) {
      return true;
    }
  }

  return false;
};

export const checkQuestionRelatesToQuery = (
  questionText: string,
  aiPrompt: string,
  activeTags: ActiveQueryTag[] = [],
  softWishes: Array<{ key: string; title: string }> = []
): boolean => {
  if (!questionText) return false;

  const fullPromptText = [
    aiPrompt || '',
    ...activeTags.map((t) => t.label),
    ...softWishes.map((w) => w.title),
  ]
    .join(' ')
    .toLowerCase()
    .trim();

  // If no prompt or tags are active at all, allow default questions
  if (!fullPromptText) return true;

  const q = questionText.toLowerCase();

  // 1. Non-smoking
  if (q.includes('некурящ') || q.includes('курен') || q.includes('табак')) {
    return (
      fullPromptText.includes('некур') ||
      fullPromptText.includes('курен') ||
      fullPromptText.includes('табак')
    );
  }

  // 2. Blackout curtains / lighting
  if (
    q.includes('блэкаут') ||
    q.includes('blackout') ||
    q.includes('штор') ||
    q.includes('темнот') ||
    q.includes('свет')
  ) {
    return (
      fullPromptText.includes('блэкаут') ||
      fullPromptText.includes('blackout') ||
      fullPromptText.includes('штор') ||
      fullPromptText.includes('темнот') ||
      fullPromptText.includes('свет')
    );
  }

  // 3. Quiet room / courtyard / noise
  if (
    q.includes('тих') ||
    q.includes('двор') ||
    q.includes('шум') ||
    q.includes('убор') ||
    q.includes('сосед') ||
    q.includes('звук') ||
    q.includes('изоляц')
  ) {
    return (
      fullPromptText.includes('тих') ||
      fullPromptText.includes('двор') ||
      fullPromptText.includes('шум') ||
      fullPromptText.includes('спокойн') ||
      fullPromptText.includes('звук') ||
      fullPromptText.includes('изоляц')
    );
  }

  // 4. Breakfast / food / coffee / kitchen
  if (q.includes('завтрак') || q.includes('кофе') || q.includes('кухн') || q.includes('посуд')) {
    return (
      fullPromptText.includes('завтрак') ||
      fullPromptText.includes('кофе') ||
      fullPromptText.includes('кухн') ||
      fullPromptText.includes('еда')
    );
  }

  // 5. Parking / car
  if (q.includes('парковк') || q.includes('машин') || q.includes('авто')) {
    return (
      fullPromptText.includes('парковк') ||
      fullPromptText.includes('машин') ||
      fullPromptText.includes('авто')
    );
  }

  // 6. Pets / animals
  if (q.includes('животн') || q.includes('питомц') || q.includes('собак') || q.includes('кошк')) {
    return (
      fullPromptText.includes('животн') ||
      fullPromptText.includes('питомц') ||
      fullPromptText.includes('собак') ||
      fullPromptText.includes('кошк')
    );
  }

  // 7. Metro / transport / location
  if (q.includes('метр') || q.includes('пешком') || q.includes('станци')) {
    return (
      fullPromptText.includes('метр') ||
      fullPromptText.includes('пешком') ||
      fullPromptText.includes('локаци')
    );
  }

  // Word overlap fallback (words >= 4 chars)
  const qWords = q
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  if (qWords.length === 0) return true;

  const matches = qWords.filter((w) => fullPromptText.includes(w));
  return matches.length > 0;
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchState,
  hotels: fallbackHotels,
  currentCurrency,
  onSelectHotel,
  onBackToHome,
  favorites,
  onToggleFavorite,
  onOpenAuth,
  onEditSearchSummary,
  onUpdateSearchState,
  initialApiHotels,
  initialAlternatives,
  initialIntent,
  initialWarnings,
  initialCommentsMap,
  initialNextOffset,
}) => {
  // Top category tab: 'all' | 'hotel' | 'apartment'
  const [topCategory, setTopCategory] = React.useState<'all' | 'hotel' | 'apartment'>('all');

  // Helper to remove 'из 20 отелей' from warnings
  const cleanWarningText = (w: string) =>
    w.replace(/У\s*\d+\s*из\s*\d+\s*отелей/gi, 'У части отелей')
     .replace(/\s*из\s*\d+\s*отелей/gi, '')
     .trim();

  // AI Prompt State: strictly no prefilled text, placeholders only!
  const [aiPrompt, setAiPrompt] = React.useState(searchState.aiPrompt || '');
  const [appliedAiPrompt, setAppliedAiPrompt] = React.useState(searchState.aiPrompt || '');
  const [aiContract, setAiContract] = React.useState<AIContractResponse>(INITIAL_AI_CONTRACT);
  const [showJsonContract, setShowJsonContract] = React.useState(false);
  const [copiedJson, setCopiedJson] = React.useState(false);

  // Pagination next_offset state from backend
  const [nextOffset, setNextOffset] = React.useState<number | null>(
    initialNextOffset !== undefined ? initialNextOffset : null
  );
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  // Real API State (No Mocks!)
  const [apiHotels, setApiHotels] = React.useState<Hotel[]>(() => {
    if (initialApiHotels && initialApiHotels.length > 0) {
      if (initialCommentsMap) {
        return initialApiHotels.map((h) =>
          initialCommentsMap[h.id] ? { ...h, aiComment: initialCommentsMap[h.id] } : h
        );
      }
      return initialApiHotels;
    }
    return [];
  });

  const [alternatives, setAlternatives] = React.useState<Hotel[]>(() => {
    if (initialAlternatives && initialAlternatives.length > 0) {
      if (initialCommentsMap) {
        return initialAlternatives.map((h) =>
          initialCommentsMap[h.id] ? { ...h, aiComment: initialCommentsMap[h.id] } : h
        );
      }
      return initialAlternatives;
    }
    return [];
  });

  const [warnings, setWarnings] = React.useState<string[]>(
    (initialWarnings || []).map(cleanWarningText).filter(Boolean)
  );
  const [activeSoftWishes, setActiveSoftWishes] = React.useState<Array<{ key: string; title: string }>>(() => {
    if (initialIntent?.soft_wishes) {
      const q = searchState.aiPrompt || '';
      return initialIntent.soft_wishes
        .map((w: any) => ({
          key: w.key || '',
          title: w.title || w.key || '',
        }))
        .filter((w: any) => checkWishMatchesPrompt(w, q));
    }
    return [];
  });

  const [loadingSearch, setLoadingSearch] = React.useState<boolean>(false);
  const [loadingComments, setLoadingComments] = React.useState<boolean>(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const [askingQuestionMap, setAskingQuestionMap] = React.useState<Record<string, boolean>>({});
  const [editingQuestionKey, setEditingQuestionKey] = React.useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = React.useState<Record<string, string>>({});
  const [dismissedQuestions, setDismissedQuestions] = React.useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAskHotelier = async (hotelId: string, questionText: string, qIdx: number = 0) => {
    const key = `${hotelId}-${qIdx}`;
    if (askingQuestionMap[key]) return;

    setAskingQuestionMap((prev) => ({ ...prev, [key]: true }));

    try {
      await apiService.askQuestion(hotelId, questionText);

      setCustomQuestions((prev) => ({ ...prev, [key]: questionText }));

      const updateQuestions = (h: Hotel) => {
        if (h.id !== hotelId) return h;
        const newQs = [...(h.questions || [])];
        if (newQs[qIdx]) {
          newQs[qIdx] = { ...newQs[qIdx], status: 'pending', question: questionText };
        } else if (newQs.length > 0) {
          newQs[0] = { ...newQs[0], status: 'pending', question: questionText };
        }
        const updatedHotel = { ...h, questions: newQs };
        try {
          localStorage.setItem(`hotelier_questions_${hotelId}`, JSON.stringify(newQs));
        } catch (e) {}
        return updatedHotel;
      };

      setApiHotels((prev) => prev.map(updateQuestions));
      setAlternatives((prev) => prev.map(updateQuestions));

      showToast('Запрос отправлен в отель! Как только отельер ответит, факт появится в карточке.');
    } catch (err: any) {
      console.warn('Failed to ask hotelier:', err);
      showToast('Не удалось отправить запрос. Попробуйте ещё раз.');
    } finally {
      setAskingQuestionMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Modal Edit Search State (matching image_e8f5db10.png)
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [modalDestination, setModalDestination] = React.useState(
    searchState.destination || 'Санкт-Петербург, Россия'
  );
  const [modalCheckIn, setModalCheckIn] = React.useState(
    searchState.checkInDate || '2026-10-31'
  );
  const [modalCheckOut, setModalCheckOut] = React.useState(
    searchState.checkOutDate || '2026-11-01'
  );
  const [modalRooms, setModalRooms] = React.useState(searchState.roomsCount || 1);
  const [modalAdults, setModalAdults] = React.useState(searchState.adultsCount || 2);
  const [modalChildren, setModalChildren] = React.useState(searchState.childrenCount || 0);

  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = React.useState(false);
  const [activeDateModal, setActiveDateModal] = React.useState<'checkIn' | 'checkOut' | null>(null);
  const [isGuestsOpen, setIsGuestsOpen] = React.useState(false);

  // Filter States initialized from contract
  const [sortBy, setSortBy] = React.useState<SortByOption>('ai_relevance');
  const [onlyFavorites, setOnlyFavorites] = React.useState(false);

  // Price slider (1 000 - 11 000 ₽)
  const [priceMin, setPriceMin] = React.useState<number>(1000);
  const [priceMax, setPriceMax] = React.useState<number>(11000);

  // Property types
  const [propertyTypes, setPropertyTypes] = React.useState<PropertyTypeCode[]>([
    'hotel',
    'apartment',
    'apart_hotel',
  ]);

  // Center & Metro distance
  const [maxCenterDistance, setMaxCenterDistance] = React.useState<number>(5.0);
  const [nearMetro, setNearMetro] = React.useState<boolean>(false);

  // Check-in conditions
  const [checkInConditions, setCheckInConditions] = React.useState({
    reception_24_7: false,
    individual_check_in: false,
    early_check_in: false,
    late_check_out: false,
  });

  // Hotel services
  const [hotelServices, setHotelServices] = React.useState({
    free_wifi: false,
    parking: false,
    transfer: false,
    washing_machine: false,
    luggage_storage: false,
    room_service: false,
  });

  // Meal options
  const [mealOptions, setMealOptions] = React.useState({
    breakfast: false,
    breakfast_in_room: false,
    bar_or_cafe: false,
    free_tea_coffee: false,
  });

  // Room amenities
  const [roomAmenities, setRoomAmenities] = React.useState({
    microwave: false,
    fridge: false,
    tv: false,
    safe: false,
    hairdryer: false,
    bathrobe: false,
    ironing: false,
    terrace: false,
  });

  // Rules and guests
  const [rulesAndGuests, setRulesAndGuests] = React.useState({
    family_friendly: false,
    pets_allowed: false,
    non_smoking: false,
  });

  // Rating & query
  const [minRating, setMinRating] = React.useState<number | null>(null);
  const [hotelNameQuery, setHotelNameQuery] = React.useState<string>('');

  // Map state
  const [hoveredHotelId, setHoveredHotelId] = React.useState<string | null>(null);

  // Active database query tracker
  const [lastDatabaseQuery, setLastDatabaseQuery] = React.useState<string>(
    searchState.aiPrompt !== undefined ? searchState.aiPrompt : ''
  );
  const skipInitialFilterQueryRef = React.useRef(true);

  // Synchronize ALL 51-column UI filters when AI response arrives (or on initial transition)
  const syncFiltersFromIntentAndQuery = React.useCallback(
    (queryText: string, intent?: any) => {
      // Prevent debounced query loop
      skipInitialFilterQueryRef.current = true;

      const contract = parseQueryToAIContract(queryText);
      const hf = intent?.hard_filters || {};
      const rawSoftWishes: Array<{ key: string; title: string }> = intent?.soft_wishes || [];
      const softWishes = rawSoftWishes.filter((w) => checkWishMatchesPrompt(w, queryText));
      const p = queryText.toLowerCase();

      // 1. Price
      if (hf.price_min != null && hf.price_min > 0) {
        setPriceMin(hf.price_min);
      } else if (contract.hard_filters.price_min != null && contract.hard_filters.price_min > 0) {
        setPriceMin(contract.hard_filters.price_min);
      }

      if (hf.price_max != null && hf.price_max > 0) {
        setPriceMax(hf.price_max);
      } else if (contract.hard_filters.price_max != null && contract.hard_filters.price_max > 0) {
        setPriceMax(contract.hard_filters.price_max);
      }

      // 2. Property types
      if (hf.property_type) {
        if (hf.property_type === 'hotel') {
          setPropertyTypes(['hotel', 'boutique_hotel']);
          setTopCategory('hotel');
        } else if (hf.property_type === 'apartment') {
          setPropertyTypes(['apartment', 'apart_hotel']);
          setTopCategory('apartment');
        } else if (hf.property_type === 'hostel') {
          setPropertyTypes(['hostel']);
        }
      } else if (contract.hard_filters.property_types && contract.hard_filters.property_types.length > 0) {
        if (p.includes('апарт') || p.includes('квартир')) {
          setPropertyTypes(['apartment', 'apart_hotel']);
          setTopCategory('apartment');
        } else if (p.includes('отел') || p.includes('гостиниц')) {
          setPropertyTypes(['hotel', 'boutique_hotel']);
          setTopCategory('hotel');
        } else if (p.includes('хостел')) {
          setPropertyTypes(['hostel']);
        }
      }

      // 3. Distance & Metro
      const hasMetroWish =
        softWishes.some((w) => w.key && w.key.includes('metro')) ||
        contract.hard_filters.near_metro ||
        p.includes('метро');
      if (hasMetroWish) {
        setNearMetro(true);
      }
      if (contract.hard_filters.max_center_distance_km) {
        setMaxCenterDistance(contract.hard_filters.max_center_distance_km);
      }

      // 4. Check-in conditions
      const hasEarlyCheckIn =
        softWishes.some((w) => w.key === 'early_check_in') ||
        contract.hard_filters.check_in_conditions.early_check_in ||
        p.includes('ранний заезд') ||
        p.includes('утром');
      const hasLateCheckOut =
        softWishes.some((w) => w.key === 'late_check_out') ||
        contract.hard_filters.check_in_conditions.late_check_out ||
        p.includes('поздний выезд');
      const has247 =
        contract.hard_filters.check_in_conditions.reception_24_7 ||
        p.includes('24/7') ||
        p.includes('круглосуточн');
      const hasIndividual =
        contract.hard_filters.check_in_conditions.individual_check_in ||
        p.includes('бесконтакт') ||
        p.includes('индивидуальн');

      setCheckInConditions((prev) => ({
        ...prev,
        early_check_in: hasEarlyCheckIn ? true : prev.early_check_in,
        late_check_out: hasLateCheckOut ? true : prev.late_check_out,
        reception_24_7: has247 ? true : prev.reception_24_7,
        individual_check_in: hasIndividual ? true : prev.individual_check_in,
      }));

      // 5. Hotel Services
      const hasWifi =
        p.includes('wi-fi') ||
        p.includes('wifi') ||
        p.includes('вайфай') ||
        p.includes('интернет');
      const hasParking =
        contract.hard_filters.hotel_services.parking ||
        softWishes.some((w) => w.key && w.key.includes('parking')) ||
        p.includes('парковк');
      const hasTransfer = contract.hard_filters.hotel_services.transfer || p.includes('трансфер');
      const hasWashing = contract.hard_filters.hotel_services.washing_machine || p.includes('стирал');
      const hasLuggage = contract.hard_filters.hotel_services.luggage_storage || p.includes('багаж');

      setHotelServices((prev) => ({
        ...prev,
        free_wifi: hasWifi ? true : prev.free_wifi,
        parking: hasParking ? true : prev.parking,
        transfer: hasTransfer ? true : prev.transfer,
        washing_machine: hasWashing ? true : prev.washing_machine,
        luggage_storage: hasLuggage ? true : prev.luggage_storage,
      }));

      // 6. Meal Options
      const hasBreakfast =
        hf.breakfast === true ||
        contract.hard_filters.meal_options.breakfast ||
        p.includes('завтрак');
      const hasBarCafe =
        contract.hard_filters.meal_options.bar_or_cafe ||
        p.includes('кафе') ||
        p.includes('ресторан') ||
        p.includes('бар');
      const hasFreeTeaCoffee =
        contract.hard_filters.meal_options.free_tea_coffee ||
        p.includes('кофе') ||
        p.includes('чай');

      setMealOptions((prev) => ({
        ...prev,
        breakfast: hasBreakfast ? true : prev.breakfast,
        bar_or_cafe: hasBarCafe ? true : prev.bar_or_cafe,
        free_tea_coffee: hasFreeTeaCoffee ? true : prev.free_tea_coffee,
      }));

      // 7. Room amenities
      const hasMicrowave =
        contract.hard_filters.room_amenities.microwave ||
        p.includes('микроволновк') ||
        p.includes('кухн');
      const hasFridge = contract.hard_filters.room_amenities.fridge || p.includes('холодильник');
      const hasTv = contract.hard_filters.room_amenities.tv || p.includes('телевизор');
      const hasSafe = contract.hard_filters.room_amenities.safe || p.includes('сейф');
      const hasTerrace =
        contract.hard_filters.room_amenities.terrace ||
        p.includes('террас') ||
        p.includes('балкон');
      const hasHairdryer = contract.hard_filters.room_amenities.hairdryer || p.includes('фен');

      setRoomAmenities((prev) => ({
        ...prev,
        microwave: hasMicrowave ? true : prev.microwave,
        fridge: hasFridge ? true : prev.fridge,
        tv: hasTv ? true : prev.tv,
        safe: hasSafe ? true : prev.safe,
        terrace: hasTerrace ? true : prev.terrace,
        hairdryer: hasHairdryer ? true : prev.hairdryer,
      }));

      // 8. Rules and Guests
      const hasNonSmoking =
        softWishes.some((w) => w.key === 'non_smoking_room') ||
        p.includes('некурящ') ||
        p.includes('без табака');
      const hasPets =
        contract.hard_filters.rules_and_guests.pets_allowed ||
        p.includes('животн') ||
        p.includes('собак') ||
        p.includes('питомц');
      const hasFamily =
        contract.hard_filters.rules_and_guests.family_friendly ||
        p.includes('дет') ||
        p.includes('семь');

      setRulesAndGuests((prev) => ({
        ...prev,
        non_smoking: hasNonSmoking ? true : prev.non_smoking,
        pets_allowed: hasPets ? true : prev.pets_allowed,
        family_friendly: hasFamily ? true : prev.family_friendly,
      }));

      // Re-enable debounce listener after states finish updating
      setTimeout(() => {
        skipInitialFilterQueryRef.current = false;
      }, 1000);
    },
    []
  );

  // =========================================================================
  // REAL API SEARCH FUNCTION (Two-Wave Rendering + Pagination)
  // =========================================================================
  const executeRealSearch = React.useCallback(
    async (
      queryText: string,
      cityName?: string,
      isFromAiPrompt: boolean = false,
      isPagination: boolean = false
    ) => {
      if (isPagination) {
        setLoadingMore(true);
      } else {
        setLoadingSearch(true);
        setSearchError(null);
        setLastDatabaseQuery(queryText);
      }

      const rawCity = cityName || modalDestination || searchState.destination || 'Санкт-Петербург';
      const city = rawCity.split(',')[0].trim() || 'Санкт-Петербург';

      try {
        // WAVE 1: Instant results from NL2API + pgvector (with offset for pagination)
        const offsetToUse = isPagination ? nextOffset : null;
        const res = await apiService.searchHotels(city, queryText, offsetToUse);
        const mappedHotels = (res.hotels || []).map(mapApiHotelToAppHotel);
        const mappedAlt = (res.alternatives || []).map(mapApiHotelToAppHotel);

        // Clean warnings: remove phrase mentioning "из 20 отелей"
        const cleanedWarnings = (res.warnings || []).map(cleanWarningText).filter(Boolean);
        setWarnings(cleanedWarnings);

        // Update pagination next_offset
        setNextOffset(res.next_offset !== undefined ? res.next_offset : null);

        if (isPagination) {
          setApiHotels((prev) => {
            const existingIds = new Set(prev.map((h) => h.id));
            const uniqueNew = mappedHotels.filter((h) => !existingIds.has(h.id));
            return [...prev, ...uniqueNew];
          });
          if (mappedAlt.length > 0) {
            setAlternatives((prev) => {
              const existingIds = new Set(prev.map((h) => h.id));
              const uniqueNew = mappedAlt.filter((h) => !existingIds.has(h.id));
              return [...prev, ...uniqueNew];
            });
          }
        } else {
          setApiHotels(mappedHotels);
          setAlternatives(mappedAlt);
        }

        // Synchronize all filters when search is triggered by AI prompt
        if (isFromAiPrompt) {
          syncFiltersFromIntentAndQuery(queryText, res.intent);
        }

        if (res.intent?.soft_wishes) {
          const validWishes = res.intent.soft_wishes
            .map((w: any) => ({
              key: w.key || '',
              title: w.title || w.key || '',
            }))
            .filter((w: any) => checkWishMatchesPrompt(w, queryText));
          setActiveSoftWishes(validWishes);
        }

        // WAVE 2: Asynchronous AI Comments generation
        if (res.comments_context && res.comments_for && res.comments_for.length > 0) {
          setLoadingComments(true);
          apiService
            .getComments(res.comments_for, res.comments_context)
            .then((comments) => {
              if (comments && comments.length > 0) {
                const commentMap = new Map(comments.map((c) => [c.hotel_id, c.text]));
                setApiHotels((prev) =>
                  prev.map((h) =>
                    commentMap.has(h.id) ? { ...h, aiComment: commentMap.get(h.id) } : h
                  )
                );
                setAlternatives((prev) =>
                  prev.map((h) =>
                    commentMap.has(h.id) ? { ...h, aiComment: commentMap.get(h.id) } : h
                  )
                );
              }
            })
            .catch((err) => {
              console.warn('Wave 2 comments expired or failed gracefully:', err);
            })
            .finally(() => {
              setLoadingComments(false);
            });
        }
      } catch (err: any) {
        console.warn('Live API search error:', err);
        setSearchError(err.message || 'Ошибка подключения к базе данных');
        if (!isPagination) {
          setApiHotels([]);
        }
      } finally {
        setLoadingSearch(false);
        setLoadingMore(false);
      }
    },
    [modalDestination, searchState.destination, nextOffset, syncFiltersFromIntentAndQuery]
  );

  // Sync initialIntent when navigating from BottomAiChat (Step 3) or HeroSection
  React.useEffect(() => {
    if (initialIntent) {
      setSortBy('ai_relevance');
      syncFiltersFromIntentAndQuery(searchState.aiPrompt || '', initialIntent);
    }
    if (initialIntent?.soft_wishes) {
      const q = aiPrompt || searchState.aiPrompt || '';
      const validWishes = initialIntent.soft_wishes
        .map((w: any) => ({
          key: w.key || '',
          title: w.title || w.key || '',
        }))
        .filter((w: any) => checkWishMatchesPrompt(w, q));
      setActiveSoftWishes(validWishes);
    }
  }, [initialIntent, syncFiltersFromIntentAndQuery, searchState.aiPrompt]);

  const handleApplyModalSearch = async () => {
    setIsSearchModalOpen(false);
    setActiveDateModal(null);
    setIsGuestsOpen(false);
    setIsDestinationDropdownOpen(false);

    if (onUpdateSearchState) {
      onUpdateSearchState({
        destination: modalDestination,
        checkInDate: modalCheckIn,
        checkOutDate: modalCheckOut,
        roomsCount: modalRooms,
        adultsCount: modalAdults,
        childrenCount: modalChildren,
      });
    }

    const cleanCity = modalDestination.split(',')[0].trim() || 'Санкт-Петербург';
    await executeRealSearch(aiPrompt, cleanCity);
  };

  // Build query from filters
  const buildSearchQueryFromFilters = React.useCallback((): string => {
    let typeWord = 'Отель';
    const hasHotel = propertyTypes.includes('hotel') || propertyTypes.includes('boutique_hotel');
    const hasApt = propertyTypes.includes('apartment') || propertyTypes.includes('apart_hotel');
    const hasHostel = propertyTypes.includes('hostel');

    if (hasHostel && !hasHotel && !hasApt) {
      typeWord = 'Хостел';
    } else if (hasApt && !hasHotel && !hasHostel) {
      typeWord = 'Апартаменты';
    } else if (hasHotel && !hasApt && !hasHostel) {
      typeWord = 'Отель';
    } else if (hasHotel && hasApt && !hasHostel) {
      typeWord = 'Отель или апартаменты';
    } else if (hasHostel && hasApt && !hasHotel) {
      typeWord = 'Апартаменты или хостел';
    } else if (hasHostel && hasHotel && !hasApt) {
      typeWord = 'Отель или хостел';
    } else {
      typeWord = 'Отель';
    }

    const parts: string[] = [typeWord];

    // Price bounds
    const hasMin = priceMin > 1000;
    const hasMax = priceMax < 11000;
    if (hasMin && hasMax) {
      parts.push(`от ${priceMin} до ${priceMax} ₽`);
    } else if (hasMin) {
      parts.push(`от ${priceMin} ₽`);
    } else if (hasMax) {
      parts.push(`до ${priceMax} ₽`);
    }

    // Location / Metro
    if (nearMetro) {
      parts.push('рядом с метро');
    } else if (maxCenterDistance <= 2.5) {
      parts.push(`до ${Math.round(maxCenterDistance)} км от центра`);
    }

    // Amenities
    if (mealOptions.breakfast) {
      parts.push('с завтраком');
    }
    if (hotelServices.parking) {
      parts.push('с парковкой');
    }
    if (hotelServices.free_wifi) {
      parts.push('бесплатный Wi-Fi');
    }
    if (checkInConditions.individual_check_in) {
      parts.push('бесконтактное заселение');
    }
    if (checkInConditions.reception_24_7) {
      parts.push('круглосуточная стойка');
    }
    if (rulesAndGuests.pets_allowed) {
      parts.push('можно с животными');
    }

    // Base user prompt / wishes (only previously submitted, not in-progress typing)
    if (appliedAiPrompt && appliedAiPrompt.trim()) {
      const cleanPrompt = appliedAiPrompt.trim();
      return `${parts.join(' ')}, ${cleanPrompt}`;
    }

    return parts.join(' ');
  }, [
    propertyTypes,
    priceMin,
    priceMax,
    nearMetro,
    maxCenterDistance,
    mealOptions.breakfast,
    hotelServices.parking,
    hotelServices.free_wifi,
    checkInConditions.individual_check_in,
    checkInConditions.reception_24_7,
    rulesAndGuests.pets_allowed,
    appliedAiPrompt,
  ]);

  // Trigger real search to database with active filter parameters
  const triggerFilteredDatabaseSearch = React.useCallback(
    (overrideCity?: string) => {
      const query = buildSearchQueryFromFilters();
      const targetCity = overrideCity || modalDestination || searchState.destination || 'Санкт-Петербург';
      const cleanCity = targetCity.split(',')[0].trim() || 'Санкт-Петербург';
      executeRealSearch(query, cleanCity, false);
    },
    [buildSearchQueryFromFilters, modalDestination, searchState.destination, executeRealSearch]
  );

  // Debounced auto-query to database whenever filters change
  React.useEffect(() => {
    if (skipInitialFilterQueryRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      triggerFilteredDatabaseSearch();
    }, 600);

    return () => clearTimeout(timer);
  }, [
    priceMin,
    priceMax,
    propertyTypes,
    maxCenterDistance,
    nearMetro,
    checkInConditions.individual_check_in,
    checkInConditions.reception_24_7,
    hotelServices.free_wifi,
    hotelServices.parking,
    mealOptions.breakfast,
    rulesAndGuests.pets_allowed,
    triggerFilteredDatabaseSearch,
  ]);

  // Trigger search on mount ONLY IF not already populated from Step 2
  React.useEffect(() => {
    if (initialApiHotels && initialApiHotels.length > 0) {
      // Allow filter changes after a short delay
      setTimeout(() => {
        skipInitialFilterQueryRef.current = false;
      }, 800);
      return;
    }
    const initQ = aiPrompt !== undefined ? aiPrompt : '';
    executeRealSearch(initQ, undefined, true);
    setTimeout(() => {
      skipInitialFilterQueryRef.current = false;
    }, 800);
  }, []);

  // Dynamically derived active query tags that strictly match aiPrompt
  const currentActiveTags = React.useMemo<ActiveQueryTag[]>(() => {
    const promptText = (aiPrompt || '').trim();
    if (!promptText) return [];

    const tags: ActiveQueryTag[] = [];
    const addedKeys = new Set<string>();

    const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

    // 1. Matches from activeSoftWishes (from backend intent / initial intent)
    activeSoftWishes.forEach((w) => {
      if (checkWishMatchesPrompt(w, promptText)) {
        const norm = normalize(w.title || w.key);
        if (!addedKeys.has(norm)) {
          addedKeys.add(norm);
          tags.push({
            id: `wish-${w.key}`,
            label: w.title || w.key,
            removePattern: w.title || w.key,
            softWishKey: w.key,
          });
        }
      }
    });

    // 2. Matches from SEMANTIC_CATEGORIES (quick wishes list)
    SEMANTIC_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        const labelClean = item.label.replace(/^[\p{Emoji}\s]+/u, '').trim();
        const pLower = promptText.toLowerCase();
        const matches =
          pLower.includes(item.label.toLowerCase()) ||
          pLower.includes(labelClean.toLowerCase()) ||
          (item.querySnippet && pLower.includes(item.querySnippet.toLowerCase()));

        if (matches) {
          const norm = normalize(labelClean);
          const alreadyRepresented = Array.from(addedKeys).some(
            (k) => k.includes(norm) || norm.includes(k)
          );
          if (!alreadyRepresented) {
            addedKeys.add(norm);
            tags.push({
              id: `sem-${item.id}`,
              label: item.label,
              removePattern: item.label,
              softWishKey: item.factKey,
            });
          }
        }
      });
    });

    // 3. Comma-separated parts in promptText not covered above
    const rawParts = promptText
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    const isGenericOrCity = (str: string): boolean => {
      const s = str.toLowerCase();
      if (
        s === 'отель' ||
        s === 'отели' ||
        s === 'апартаменты' ||
        s === 'хостел' ||
        s === 'гостиница'
      )
        return true;
      if (
        s === 'санкт-петербург' ||
        s === 'санкт-петербург, россия' ||
        s === 'москва' ||
        s === 'сочи' ||
        s === 'казань'
      )
        return true;
      if (s.startsWith('до ') && s.endsWith('₽')) return true;
      if (s.startsWith('от ') && s.endsWith('₽')) return true;
      return false;
    };

    rawParts.forEach((part, idx) => {
      if (isGenericOrCity(part)) return;
      const norm = normalize(part);
      if (!norm) return;
      const alreadyRepresented = Array.from(addedKeys).some(
        (k) => k.includes(norm) || norm.includes(k)
      );
      if (!alreadyRepresented) {
        addedKeys.add(norm);
        tags.push({
          id: `custom-part-${idx}`,
          label: part,
          removePattern: part,
        });
      }
    });

    return tags;
  }, [aiPrompt, activeSoftWishes]);

  // Handle removing any active query tag (strictly updates aiPrompt and synchronizes search)
  const handleRemoveActiveTag = (tag: ActiveQueryTag) => {
    let updated = aiPrompt;

    const patterns = [
      tag.removePattern,
      tag.label,
      tag.label.replace(/^[\p{Emoji}\s]+/u, '').trim(),
    ].filter(Boolean);

    let removed = false;
    for (const p of patterns) {
      if (!p) continue;
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(`(?:,\\s*|\\s+и\\s+)?${escaped}(?:\\s*,|\\s+и\\s+)?`, 'gi');
      if (rx.test(updated)) {
        updated = updated.replace(rx, (match) => {
          if (match.startsWith(',') && match.endsWith(',')) return ', ';
          return ' ';
        });
        removed = true;
        break;
      }
    }

    if (!removed && tag.softWishKey) {
      if (tag.softWishKey === 'non_smoking_room') {
        updated = updated.replace(/(?:,\s*)?(?:номер для некурящих|для некурящих|некурящих)(?:\s*,)?/gi, ' ');
      } else if (tag.softWishKey === 'green_park') {
        updated = updated.replace(/(?:,\s*)?(?:зелёный парк[^\n,]*|рядом с зелёным парком|зелёным парком)(?:\s*,)?/gi, ' ');
      } else if (tag.softWishKey === 'metro_10min') {
        updated = updated.replace(/(?:,\s*)?(?:до метро[^\n,]*|рядом с метро|и метро)(?:\s*,)?/gi, ' ');
      } else if (
        tag.softWishKey === 'quiet_street' ||
        tag.softWishKey === 'quiet_nearby' ||
        tag.softWishKey === 'quiet_room'
      ) {
        updated = updated.replace(/(?:,\s*)?(?:тихая сторона|тихий район|тихий номер|тихий двор)(?:\s*,)?/gi, ' ');
      }
    }

    // Clean up commas, double spaces, leading/trailing punctuation
    updated = updated
      .replace(/\s+/g, ' ')
      .replace(/,\s*,+/g, ', ')
      .replace(/^[\s,]+/, '')
      .replace(/[\s,]+$/, '')
      .trim();

    if (!updated || updated === 'Отель' || updated === 'Санкт-Петербург') {
      const fallback = modalDestination || searchState.destination || 'Отель';
      updated = fallback;
    }

    setAiPrompt(updated);
    setAppliedAiPrompt(updated);

    if (onUpdateSearchState) {
      onUpdateSearchState({ aiPrompt: updated });
    }

    if (tag.softWishKey) {
      setActiveSoftWishes((prev) => prev.filter((w) => w.key !== tag.softWishKey));
    }

    // Immediately trigger search
    executeRealSearch(updated, undefined, true);
  };

  // Compatibility wrapper
  const handleRemoveSoftWish = (wishKey: string) => {
    const found = currentActiveTags.find((t) => t.softWishKey === wishKey || t.id.includes(wishKey));
    if (found) {
      handleRemoveActiveTag(found);
    } else {
      setActiveSoftWishes((prev) => prev.filter((w) => w.key !== wishKey));
    }
  };

  // Handle user submitting new prompt (ONLY when search button is clicked or Enter is pressed)
  const handleApplyAiPrompt = (newPromptText: string) => {
    const trimmed = newPromptText.trim();
    if (!trimmed) {
      alert('Пожалуйста, введите запрос для ИИ-поиска');
      return;
    }
    setAiPrompt(trimmed);
    setAppliedAiPrompt(trimmed);
    if (onUpdateSearchState) {
      onUpdateSearchState({ aiPrompt: trimmed });
    }
    const contract = parseQueryToAIContract(trimmed);
    setAiContract(contract);
    executeRealSearch(trimmed, undefined, true);
  };

  // 5 category queues: index of next tag to show for each category (starts at 0)
  const [categoryQueueIndices, setCategoryQueueIndices] = React.useState<number[]>([0, 0, 0, 0, 0]);



  const handleSelectSemanticTag = (catIdx: number, tagItem: SemanticTag) => {
    const label = tagItem.label;
    setAiPrompt((prev) => {
      const current = prev.trim();
      return current ? `${current}, ${label}` : label;
    });
    setCategoryQueueIndices((prev) => {
      const next = [...prev];
      next[catIdx] = (next[catIdx] || 0) + 1;
      return next;
    });
  };

  // Active prompt tags for sorting boost
  const activePromptTags = React.useMemo(() => {
    const list: SemanticTag[] = [];
    SEMANTIC_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        if (aiPrompt.toLowerCase().includes(item.label.toLowerCase())) {
          list.push(item);
        }
      });
    });
    return list;
  }, [aiPrompt]);

  // Synchronize current state to JSON contract
  const currentContract: AIContractResponse = React.useMemo(() => {
    return {
      is_valid_search: true,
      sort_by: sortBy,
      hard_filters: {
        price_min: priceMin > 1000 ? priceMin : null,
        price_max: priceMax < 11000 ? priceMax : null,
        property_types: propertyTypes,
        max_center_distance_km: maxCenterDistance,
        near_metro: nearMetro,
        check_in_conditions: checkInConditions,
        hotel_services: hotelServices,
        meal_options: mealOptions,
        room_amenities: roomAmenities,
        rules_and_guests: rulesAndGuests,
        min_rating: minRating,
        hotel_name_query: hotelNameQuery.trim() ? hotelNameQuery.trim() : null,
      },
      soft_query: aiPrompt,
      suggestions: aiContract.suggestions,
    };
  }, [
    sortBy,
    priceMin,
    priceMax,
    propertyTypes,
    maxCenterDistance,
    nearMetro,
    checkInConditions,
    hotelServices,
    mealOptions,
    roomAmenities,
    rulesAndGuests,
    minRating,
    hotelNameQuery,
    aiPrompt,
    aiContract.suggestions,
  ]);

  // Toggle helper for property types
  const togglePropertyType = (type: PropertyTypeCode) => {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Handle top category tab click
  const handleSelectTopCategory = (cat: 'all' | 'hotel' | 'apartment') => {
    setTopCategory(cat);
    if (cat === 'all') {
      setPropertyTypes(['hotel', 'apartment', 'apart_hotel', 'boutique_hotel', 'guesthouse', 'hostel']);
    } else if (cat === 'hotel') {
      setPropertyTypes(['hotel', 'boutique_hotel']);
    } else {
      setPropertyTypes(['apartment', 'apart_hotel']);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setPriceMin(1000);
    setPriceMax(11000);
    setPropertyTypes(['hotel', 'apartment', 'apart_hotel', 'boutique_hotel', 'guesthouse', 'hostel']);
    setMaxCenterDistance(5.0);
    setNearMetro(false);
    setCheckInConditions({
      reception_24_7: false,
      individual_check_in: false,
      early_check_in: false,
      late_check_out: false,
    });
    setHotelServices({
      free_wifi: false,
      parking: false,
      transfer: false,
      washing_machine: false,
      luggage_storage: false,
      room_service: false,
    });
    setMealOptions({
      breakfast: false,
      breakfast_in_room: false,
      bar_or_cafe: false,
      free_tea_coffee: false,
    });
    setRoomAmenities({
      microwave: false,
      fridge: false,
      tv: false,
      safe: false,
      hairdryer: false,
      bathrobe: false,
      ironing: false,
      terrace: false,
    });
    setRulesAndGuests({
      family_friendly: false,
      pets_allowed: false,
      non_smoking: false,
    });
    setMinRating(null);
    setHotelNameQuery('');
    setOnlyFavorites(false);
    setSortBy('ai_relevance');
  };

  // Active base list comes STRICTLY from real database API (Zero mocks!)
  const currentHotels = apiHotels;

  // The database already applied the filters via PostgreSQL SQL WHERE clauses & pgvector!
  // We keep client-side filtering for local search by name and favorites:
  const filteredHotels = currentHotels.filter((hotel) => {
    // Favorites
    if (onlyFavorites && !favorites.includes(hotel.id)) return false;

    // Hotel name query
    if (hotelNameQuery.trim()) {
      if (!hotel.name.toLowerCase().includes(hotelNameQuery.toLowerCase().trim())) {
        return false;
      }
    }

    // Rating
    if (minRating !== null && hotel.rating < minRating) return false;

    return true;
  });

  // Sorting
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating_desc') return b.rating - a.rating;
    if (sortBy === 'ai_relevance') {
      let aBoost = 0;
      let bBoost = 0;
      activePromptTags.forEach((tag) => {
        if (checkHotelMatchesTag(a, tag)) aBoost += 2.0;
        if (checkHotelMatchesTag(b, tag)) bBoost += 2.0;
      });
      const aTypeMatch = propertyTypes.includes(a.propertyType) ? 3 : 0;
      const bTypeMatch = propertyTypes.includes(b.propertyType) ? 3 : 0;
      const aScore = (a.score ? a.score * 10 : a.rating) + aBoost + aTypeMatch - a.centerDistanceKm * 0.25;
      const bScore = (b.score ? b.score * 10 : b.rating) + bBoost + bTypeMatch - b.centerDistanceKm * 0.25;
      return bScore - aScore;
    }
    // popular (by Number of Reviews)
    return b.numberOfReviews - a.numberOfReviews;
  });

  const summaryDates = `${searchState.checkInDate.slice(8, 10)} окт. — ${searchState.checkOutDate.slice(8, 10)} окт.`;

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen text-slate-900 pb-16">
      {/* Top Search Bar & Category Strip */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="w-full px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left search compact widget */}
          <div
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors max-w-sm"
          >
            <div>
              <div className="text-xs font-black text-slate-900">
                {modalDestination || searchState.destination || 'Санкт-Петербург, Россия'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {formatSummaryDatesRu(modalCheckIn, modalCheckOut)} · {modalRooms} номер для {modalAdults + modalChildren} гостей
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-white shadow-xs text-[#1652f0]">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Center Category Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectTopCategory('all')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                topCategory === 'all'
                  ? 'bg-blue-50 text-[#1652f0] border-2 border-[#1652f0] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => handleSelectTopCategory('hotel')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                topCategory === 'hotel'
                  ? 'bg-blue-50 text-[#1652f0] border-2 border-[#1652f0] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              Отели
            </button>
            <button
              type="button"
              onClick={() => handleSelectTopCategory('apartment')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                topCategory === 'apartment'
                  ? 'bg-blue-50 text-[#1652f0] border-2 border-[#1652f0] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              Апартаменты и квартиры
            </button>
          </div>

          {/* Quick return button */}
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-slate-500 hover:text-[#1652f0] transition-colors flex items-center gap-1 self-center cursor-pointer"
          >
            ← На главную
          </button>
        </div>
      </div>

      {/* Main 3-Column Split View: Filters Sidebar | Hotel Cards | Map */}
      <div className="w-full px-3 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ======================================================== */}
          {/* COLUMN 1: SIDEBAR WITH AI PROMPT & 51-COLUMN FILTERS     */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
            {/* Избранное */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Избранное</span>
                {favorites.length > 0 && (
                  <span className="text-[11px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">
                    {favorites.length}
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1652f0]" />
              </label>
            </div>

            {/* 1. Сортировка (Дропдаун) */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Сортировка
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortByOption)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#1652f0] cursor-pointer"
                >
                  <option value="ai_relevance">По вашему ИИ-запросу</option>
                  <option value="popular">По популярности</option>
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дорогие</option>
                  <option value="rating_desc">По оценке</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 2. ПОЛЕ AI-ПРОМПТА ПОД СОРТИРОВКОЙ С ДВУСТОРОННЕЙ СВЯЗЬЮ (скрывается при других сортировках, содержимое сохраняется) */}
            <div
              className={`p-3.5 rounded-2xl bg-gradient-to-b from-blue-50/90 to-indigo-50/50 border border-blue-200 shadow-xs space-y-2.5 transition-all ${
                sortBy === 'ai_relevance' ? 'block' : 'hidden'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1652f0]">
                  <Sparkles className="w-4 h-4" />
                  <span>Умный поиск по пожеланиям</span>
                </div>
              </div>

              {/* Unified expandable prompt box */}
              <div className="w-full p-3 bg-white rounded-xl border border-blue-200 focus-within:ring-2 focus-within:ring-[#1652f0]/30 focus-within:border-[#1652f0] shadow-inner space-y-2.5 min-h-[120px] resize-y overflow-auto flex flex-col">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleApplyAiPrompt(aiPrompt);
                    }
                  }}
                  rows={4}
                  placeholder="Опишите ваши пожелания к поездке (тихий номер, кухня, пешком до метро)..."
                  className="w-full bg-transparent border-none outline-hidden p-0 text-xs font-medium text-slate-800 leading-relaxed resize-none flex-1 min-h-[60px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loadingSearch}
                  onClick={() => handleApplyAiPrompt(aiPrompt)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#1652f0] hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loadingSearch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{loadingSearch ? 'Поиск...' : 'Обновить поиск'}</span>
                </button>
              </div>

              {/* Interactive prompt suggestion tags */}
              <div className="pt-1 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Быстрые пожелания:
                </div>
                <div className="flex flex-col gap-1.5">
                  {SEMANTIC_CATEGORIES.map((cat, catIdx) => {
                    const tagIdx = categoryQueueIndices[catIdx] ?? 0;
                    if (tagIdx >= cat.items.length) return null;
                    const tag = cat.items[tagIdx];
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleSelectSemanticTag(catIdx, tag)}
                        title={`${tag.label}: ${tag.description}`}
                        className="w-full text-[11px] px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-800 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs group text-left"
                      >
                        <span className="truncate min-w-0 flex-1">{tag.label}</span>
                        <span className="font-bold text-xs text-[#1652f0] shrink-0 group-hover:scale-110 transition-transform">
                          +
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>



            {/* 3. Цена (Инпуты От / До + Ползунок) */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900">
                Цена за ночь
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">От</div>
                  <div className="text-xs font-bold text-slate-900">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-transparent border-none outline-hidden p-0 font-bold text-xs"
                    />
                  </div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">До</div>
                  <div className="text-xs font-bold text-slate-900">
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Math.max(priceMin, Number(e.target.value)))}
                      className="w-full bg-transparent border-none outline-hidden p-0 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={1000}
                max={11000}
                step={500}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1652f0]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 000 ₽</span>
                <span>11 000 ₽</span>
              </div>
            </div>

            {/* 4. Тип жилья */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                Тип жилья
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { code: 'hotel' as PropertyTypeCode, label: 'Отели' },
                  { code: 'apartment' as PropertyTypeCode, label: 'Апартаменты и квартиры' },
                  { code: 'apart_hotel' as PropertyTypeCode, label: 'Апарт-отели' },
                  { code: 'boutique_hotel' as PropertyTypeCode, label: 'Бутик-отели' },
                  { code: 'hostel' as PropertyTypeCode, label: 'Хостелы' },
                ].map((item) => (
                  <label key={item.code} className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={propertyTypes.includes(item.code)}
                      onChange={() => togglePropertyType(item.code)}
                      className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Расстояние от центра и метро */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2">
                Расстояние от центра и метро
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-800 mb-2">
                до {maxCenterDistance} км от центра
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={maxCenterDistance}
                onChange={(e) => setMaxCenterDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1652f0]"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 mb-3">
                <button
                  type="button"
                  onClick={() => setMaxCenterDistance(1.5)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    maxCenterDistance === 1.5 ? 'bg-blue-100 text-blue-800 font-bold' : ''
                  }`}
                >
                  до 1.5 км
                </button>
                <button
                  type="button"
                  onClick={() => setMaxCenterDistance(3.0)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    maxCenterDistance === 3.0 ? 'bg-blue-100 text-blue-800 font-bold' : ''
                  }`}
                >
                  до 3 км
                </button>
                <button
                  type="button"
                  onClick={() => setMaxCenterDistance(5.0)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    maxCenterDistance === 5.0 ? 'bg-blue-100 text-blue-800 font-bold' : ''
                  }`}
                >
                  до 5 км
                </button>
              </div>

              {/* Рядом с метро */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer pt-1 border-t border-slate-100">
                <input
                  type="checkbox"
                  checked={nearMetro}
                  onChange={(e) => setNearMetro(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                />
                <span>Рядом с метро (до 500 м)</span>
              </label>
            </div>

            {/* 6. Условия заселения */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                Условия заселения
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkInConditions.reception_24_7}
                    onChange={(e) =>
                      setCheckInConditions((prev) => ({ ...prev, reception_24_7: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Круглосуточная стойка регистрации</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkInConditions.individual_check_in}
                    onChange={(e) =>
                      setCheckInConditions((prev) => ({
                        ...prev,
                        individual_check_in: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Индивидуальное / бесконтактное заселение</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkInConditions.early_check_in}
                    onChange={(e) =>
                      setCheckInConditions((prev) => ({ ...prev, early_check_in: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Ранний заезд</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkInConditions.late_check_out}
                    onChange={(e) =>
                      setCheckInConditions((prev) => ({ ...prev, late_check_out: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Поздний выезд</span>
                </label>
              </div>
            </div>

            {/* 7. Услуги и инфраструктура */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                Услуги в отеле
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hotelServices.free_wifi}
                    onChange={(e) =>
                      setHotelServices((prev) => ({ ...prev, free_wifi: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Бесплатный Wi-Fi</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hotelServices.parking}
                    onChange={(e) =>
                      setHotelServices((prev) => ({ ...prev, parking: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Парковка</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hotelServices.transfer}
                    onChange={(e) =>
                      setHotelServices((prev) => ({ ...prev, transfer: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Трансфер</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hotelServices.washing_machine}
                    onChange={(e) =>
                      setHotelServices((prev) => ({ ...prev, washing_machine: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Стиральная машина</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hotelServices.luggage_storage}
                    onChange={(e) =>
                      setHotelServices((prev) => ({ ...prev, luggage_storage: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Хранение багажа</span>
                </label>
              </div>
            </div>

            {/* 8. Питание и напитки */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                Питание и напитки
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mealOptions.breakfast}
                    onChange={(e) =>
                      setMealOptions((prev) => ({ ...prev, breakfast: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Завтрак включен</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mealOptions.bar_or_cafe}
                    onChange={(e) =>
                      setMealOptions((prev) => ({ ...prev, bar_or_cafe: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Бар или ресторан / кафе</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mealOptions.free_tea_coffee}
                    onChange={(e) =>
                      setMealOptions((prev) => ({ ...prev, free_tea_coffee: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Бесплатный чай / кофе</span>
                </label>
              </div>
            </div>

            {/* 9. В номере (Удобства) */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                В номере
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAmenities.microwave}
                    onChange={(e) =>
                      setRoomAmenities((prev) => ({ ...prev, microwave: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Кухня / Микроволновка</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAmenities.fridge}
                    onChange={(e) =>
                      setRoomAmenities((prev) => ({ ...prev, fridge: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Холодильник</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAmenities.tv}
                    onChange={(e) =>
                      setRoomAmenities((prev) => ({ ...prev, tv: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Телевизор</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAmenities.safe}
                    onChange={(e) =>
                      setRoomAmenities((prev) => ({ ...prev, safe: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Сейф в номере</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAmenities.hairdryer}
                    onChange={(e) =>
                      setRoomAmenities((prev) => ({ ...prev, hairdryer: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Фен</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAmenities.terrace}
                    onChange={(e) =>
                      setRoomAmenities((prev) => ({ ...prev, terrace: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Балкон / Терраса</span>
                </label>
              </div>
            </div>

            {/* 10. Особенности размещения */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                Особенности размещения
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rulesAndGuests.family_friendly}
                    onChange={(e) =>
                      setRulesAndGuests((prev) => ({ ...prev, family_friendly: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Подходит для детей / Семейные номера</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rulesAndGuests.non_smoking}
                    onChange={(e) =>
                      setRulesAndGuests((prev) => ({ ...prev, non_smoking: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Номера для некурящих</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rulesAndGuests.pets_allowed}
                    onChange={(e) =>
                      setRulesAndGuests((prev) => ({ ...prev, pets_allowed: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1652f0] focus:ring-0"
                  />
                  <span>Можно с животными</span>
                </label>
              </div>
            </div>

            {/* 11. Оценка по отзывам */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2.5">
                Оценка по отзывам
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Любая', val: null },
                  { label: '9+ (Превосходно)', val: 9.0 },
                  { label: '8.5+ (Отлично)', val: 8.5 },
                  { label: '8+ (Очень хорошо)', val: 8.0 },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="min_rating"
                      checked={minRating === item.val}
                      onChange={() => setMinRating(item.val)}
                      className="text-[#1652f0] focus:ring-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 12. Поиск по названию */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2">
                Название отеля
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={hotelNameQuery}
                  onChange={(e) => setHotelNameQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1652f0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Reset all button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить все фильтры</span>
            </button>
          </aside>

          {/* ======================================================== */}
          {/* COLUMN 2: HOTEL CARDS LIST (WITH TWO-WAVE RENDERING)     */}
          {/* ======================================================== */}
          <main className="lg:col-span-5 space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {modalDestination || searchState.destination || 'Санкт-Петербург'}
                </h2>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Найдено {sortedHotels.length} {sortedHotels.length === 1 ? 'вариант' : sortedHotels.length < 5 ? 'варианта' : 'вариантов'}
                </div>
              </div>
            </div>

            {/* Active Semantic Tags strictly matching aiPrompt */}
            {currentActiveTags.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/60 border border-blue-200 shadow-2xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#1652f0]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Активные семантические теги запроса:</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Нажмите на тег, чтобы исключить
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentActiveTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleRemoveActiveTag(tag)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs border border-blue-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 shadow-2xs transition-all cursor-pointer group"
                    >
                      <span>{tag.label}</span>
                      <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings notification from backend API */}
            {warnings.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Обратите внимание:</span>
                </div>
                {warnings.map((w, idx) => (
                  <div key={idx} className="text-amber-800 pl-5">
                    • {w}
                  </div>
                ))}
              </div>
            )}

            {/* Search error if any */}
            {searchError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Сервер вернул: {searchError}. Показаны варианты из кэша.</span>
              </div>
            )}

            {/* Loading skeleton when search is executing */}
            {loadingSearch && sortedHotels.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs animate-pulse flex flex-col sm:flex-row gap-4"
                  >
                    <div className="w-full sm:w-56 h-48 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                      <div className="h-16 bg-blue-50/60 rounded-xl" />
                      <div className="h-8 bg-slate-200 rounded w-1/3 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedHotels.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center space-y-3 border border-slate-200 shadow-xs">
                <div className="text-4xl">🏨</div>
                <h3 className="text-base font-bold text-slate-900">
                  По выбранным фильтрам ничего не найдено
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Попробуйте ослабить фильтры удобств или уточнить AI-промпт.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#1652f0] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              /* Sorted Hotels Cards */
              sortedHotels.map((hotel) => {
                const isFavorite = favorites.includes(hotel.id);
                const isHovered = hoveredHotelId === hotel.id;

                return (
                  <div
                    key={hotel.id}
                    onMouseEnter={() => setHoveredHotelId(hotel.id)}
                    onMouseLeave={() => setHoveredHotelId(null)}
                    onClick={() => onSelectHotel(hotel)}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md cursor-pointer group ${
                      isHovered ? 'border-[#1652f0] ring-1 ring-[#1652f0]/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Left: Image Box with Heart & Carousel Arrows */}
                      <div className="w-full sm:w-56 h-48 sm:h-auto shrink-0 relative bg-slate-900">
                        <HotelVisual theme={hotel.accentTheme} name={hotel.name} />

                        {/* Heart Favorite button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(hotel.id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 transition-colors shadow-xs z-20 cursor-pointer"
                          aria-label="В избранное"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorite ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>

                        {/* Carousel Arrows */}
                        <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-auto">
                            <ChevronLeft className="w-4 h-4" />
                          </div>
                          <div className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-auto">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>

                        {hotel.discountPercent && (
                          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-xs z-10">
                            -{hotel.discountPercent}%
                          </div>
                        )}
                      </div>

                      {/* Right Details Box */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                        <div>
                          {/* Title + Score */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-extrabold text-sm sm:text-base text-slate-950 group-hover:text-[#1652f0] transition-colors leading-tight">
                                  {hotel.name}
                                </h3>
                                {hotel.topBadge && (
                                  <span className="px-1.5 py-0.5 bg-[#1652f0] text-white text-[9px] font-black rounded-sm uppercase tracking-wider">
                                    {hotel.topBadge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                                <span className="text-amber-400">{'★'.repeat(hotel.stars)}</span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  · {hotel.propertyTypeLabel}
                                </span>
                                {hotel.score != null && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#1652f0] text-[9px] font-extrabold">
                                    {(hotel.score * 100).toFixed(0)}% совпадение
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Score Green Badge */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="text-right">
                                <div className="text-xs font-bold text-slate-900 leading-none">
                                  {hotel.ratingLabel}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {hotel.numberOfReviews} отзывов
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-[#27ae60] text-white font-black text-sm flex items-center justify-center shadow-xs">
                                {hotel.rating}
                              </div>
                            </div>
                          </div>

                          {/* Address & Metro with Geocode details */}
                          <div className="text-[11px] text-slate-600 space-y-0.5 mt-1">
                            <div className="truncate text-slate-800 font-medium">
                              {hotel.address}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 flex-wrap">
                              <span>{hotel.centerDistanceKm} км от центра</span>
                              <span>·</span>
                              <span>{Math.round(hotel.metroDistanceKm * 1000)} м от метро</span>
                            </div>
                          </div>

                          {/* ======================================================== */}
                          {/* WAVE 2 AI COMMENT / SHIMMER SKELETON                     */}
                          {/* ======================================================== */}
                          <div className="mt-2.5">
                            {hotel.aiComment ? (
                              <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 text-xs text-slate-800 flex items-start gap-2 shadow-2xs">
                                <Sparkles className="w-4 h-4 text-[#1652f0] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-[#1652f0] mr-1">
                                    Почему вам подойдёт:
                                  </span>
                                  <span className="font-medium">{hotel.aiComment}</span>
                                </div>
                              </div>
                            ) : loadingComments ? (
                              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 animate-pulse flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 text-[#1652f0] animate-spin shrink-0" />
                                <span className="text-xs text-blue-800 font-medium">
                                  Подбираем лучшие совпадения...
                                </span>
                              </div>
                            ) : (
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Проверенные характеристики: тихий двор, удобное расположение</span>
                              </div>
                            )}
                          </div>

                          {/* Hotelier Questions / Unverified specs row */}
                          {hotel.questions && hotel.questions.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {hotel.questions.map((q, qIdx) => {
                                const key = `${hotel.id}-${qIdx}`;
                                if (dismissedQuestions[key]) return null;

                                const isRelates = checkQuestionRelatesToQuery(
                                  q.question,
                                  aiPrompt || appliedAiPrompt || searchState.aiPrompt || '',
                                  currentActiveTags,
                                  activeSoftWishes
                                );
                                if (!isRelates) return null;

                                const isLoading = askingQuestionMap[key];
                                const isPending = q.status === 'pending';
                                const isAnswered = q.status === 'answered';
                                const currentText = customQuestions[key] !== undefined ? customQuestions[key] : q.question;

                                return (
                                  <div
                                    key={qIdx}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2 min-w-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                      <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span>Направить вопрос отельеру?</span>
                                    </div>

                                    {isAnswered ? (
                                      <div className="space-y-1 pt-0.5">
                                        <div className="text-slate-800 font-medium text-xs break-words">
                                          «{currentText}»
                                        </div>
                                        <div className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span>✅ Ответ: {q.answer || 'Подтверждено отельером'}</span>
                                        </div>
                                      </div>
                                    ) : isPending ? (
                                      <div className="space-y-1.5 pt-0.5">
                                        <div className="text-slate-800 font-medium text-xs break-words bg-white/70 p-2 rounded-lg border border-slate-200/70">
                                          «{currentText}»
                                        </div>
                                        <div className="text-amber-700 font-semibold text-[11px] flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 w-fit">
                                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                                          <span>⏳ Запрос отправлен. Ожидаем ответа отельера.</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 pt-0.5 min-w-0">
                                        <div className="text-slate-800 font-medium text-xs break-words bg-white/80 p-2 rounded-lg border border-slate-200/80">
                                          {q.question}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => handleAskHotelier(hotel.id, q.rawQuestion || q.question, qIdx)}
                                            className="px-4 py-1.5 bg-[#1652f0] hover:bg-blue-700 active:scale-98 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                                          >
                                            {isLoading ? (
                                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                              <Check className="w-3.5 h-3.5" />
                                            )}
                                            <span>Да</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDismissedQuestions((prev) => ({ ...prev, [key]: true }))
                                            }
                                            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 active:scale-98 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors shrink-0"
                                          >
                                            <span>Нет</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Real Verified Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {hotel.freeWifi && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                                Wi-Fi
                              </span>
                            )}
                            {hotel.breakfast && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                Завтрак
                              </span>
                            )}
                            {hotel.individualCheckIn && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-800 border border-blue-200">
                                Бесконтактный заезд
                              </span>
                            )}
                            {hotel.parking && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                                Парковка
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action Button */}
                        <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            <div className="text-[11px] text-slate-400">за 1 ночь для 2 гостей</div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl sm:text-2xl font-black text-slate-950">
                                {formatPrice(hotel.price, currentCurrency)}
                              </span>
                              {hotel.originalPriceRub && (
                                <span className="text-xs text-slate-400 line-through">
                                  {formatPrice(hotel.originalPriceRub, currentCurrency)}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold">
                              Все налоги включены · Проверенный объект
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectHotel(hotel);
                            }}
                            className="px-5 py-2.5 bg-[#1652f0] hover:bg-[#1244cd] active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            Показать все номера
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* ======================================================== */}
            {/* ALTERNATIVES SECTION: «Стоит присмотреться»              */}
            {/* ======================================================== */}
            {alternatives.length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Стоит присмотреться
                    </h3>
                    <p className="text-xs text-slate-500">
                      Варианты чуть выше бюджета, но идеально подходящие по скрытым характеристикам вашего запроса
                    </p>
                  </div>
                </div>

                {alternatives.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => onSelectHotel(hotel)}
                    className="bg-white rounded-2xl border-2 border-amber-200/80 p-4 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row gap-4"
                  >
                    <div className="w-full sm:w-44 h-36 bg-slate-900 rounded-xl overflow-hidden shrink-0 relative">
                      <HotelVisual theme={hotel.accentTheme} name={hotel.name} />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-black uppercase">
                        Альтернатива
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {hotel.name}
                            </h4>
                            <div className="text-xs text-slate-500">
                              {hotel.address} · {hotel.centerDistanceKm} км от центра
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-[#27ae60] text-white font-bold text-xs flex items-center justify-center">
                            {hotel.rating}
                          </div>
                        </div>

                        {hotel.aiComment && (
                          <div className="mt-2 text-xs text-slate-700 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                            <strong>Особенность:</strong> {hotel.aiComment}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                        <div className="text-base font-black text-slate-900">
                          {formatPrice(hotel.price, currentCurrency)}
                        </div>
                        <button
                          type="button"
                          className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                        >
                          Смотреть
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination: Load More with next_offset */}
            {nextOffset !== null && nextOffset !== undefined && (
              <div className="pt-4 pb-2 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore || loadingSearch}
                  onClick={() => executeRealSearch(aiPrompt || lastDatabaseQuery, undefined, false, true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:scale-98 border-2 border-slate-200 hover:border-[#1652f0] text-slate-800 hover:text-[#1652f0] font-extrabold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1652f0]" />
                      <span>Загрузка следующих 20 отелей...</span>
                    </>
                  ) : (
                    <>
                      <span>Показать следующие 20 вариантов</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </main>

          {/* ======================================================== */}
          {/* COLUMN 3: INTERACTIVE MAP                                */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 sticky top-16 hidden lg:block">
            <InteractiveMap
              hotels={sortedHotels}
              selectedHotelId={null}
              onSelectHotel={onSelectHotel}
              hoveredHotelId={hoveredHotelId}
              onHoverHotel={setHoveredHotelId}
              currentCurrency={currentCurrency}
            />
          </aside>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: "Выберите даты проживания в [Городе]"              */}
      {/* (matching image_e8f5db10.png)                           */}
      {/* ======================================================== */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            setIsSearchModalOpen(false);
            setActiveDateModal(null);
            setIsGuestsOpen(false);
            setIsDestinationDropdownOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 relative border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Выберите даты проживания в {getCityPrepositional(modalDestination)}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsSearchModalOpen(false);
                  setActiveDateModal(null);
                  setIsGuestsOpen(false);
                  setIsDestinationDropdownOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field 1: Направление */}
            <div className="relative">
              <div
                onClick={() => setIsDestinationDropdownOpen(true)}
                className="border border-slate-300 hover:border-slate-400 focus-within:border-[#1652f0] focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-4 py-2 transition-all cursor-text flex items-center justify-between bg-white"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <label className="text-[11px] font-medium text-slate-500 block leading-tight">
                    Направление
                  </label>
                  <input
                    type="text"
                    value={modalDestination}
                    onChange={(e) => {
                      setModalDestination(e.target.value);
                      setIsDestinationDropdownOpen(true);
                    }}
                    onFocus={() => setIsDestinationDropdownOpen(true)}
                    className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder-slate-400 mt-0.5"
                    placeholder="Куда вы хотите поехать?"
                  />
                </div>
                {modalDestination && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalDestination('');
                      setIsDestinationDropdownOpen(true);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Очистить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Popular destinations dropdown */}
              {isDestinationDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsDestinationDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 max-h-60 overflow-y-auto">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Популярные направления
                    </div>
                    {POPULAR_MODAL_CITIES.filter((c) =>
                      !modalDestination || c.toLowerCase().includes(modalDestination.toLowerCase())
                    ).map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setModalDestination(city);
                          setIsDestinationDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 hover:text-[#1652f0] cursor-pointer text-sm font-medium text-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span>{city}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Field 2: Dates (Заезд / Выезд) & Guests Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              {/* Dates Combined Field */}
              <div className="border border-slate-300 hover:border-slate-400 rounded-xl grid grid-cols-2 divide-x divide-slate-200 relative bg-white transition-colors">
                <div
                  onClick={() => {
                    setIsGuestsOpen(false);
                    setActiveDateModal(activeDateModal === 'checkIn' ? null : 'checkIn');
                  }}
                  className="px-3.5 py-2 cursor-pointer hover:bg-slate-50/80 rounded-l-xl transition-colors select-none text-left"
                >
                  <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                    Заезд
                  </span>
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap block mt-0.5">
                    {formatModalDate(modalCheckIn)}
                  </span>
                </div>

                <div
                  onClick={() => {
                    setIsGuestsOpen(false);
                    setActiveDateModal(activeDateModal === 'checkOut' ? null : 'checkOut');
                  }}
                  className="px-3.5 py-2 cursor-pointer hover:bg-slate-50/80 rounded-r-xl transition-colors select-none text-left"
                >
                  <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                    Выезд
                  </span>
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap block mt-0.5">
                    {formatModalDate(modalCheckOut)}
                  </span>
                </div>

                {activeDateModal && (
                  <div className="absolute top-full left-0 z-50">
                    <DatePickerModal
                      checkInDate={modalCheckIn}
                      checkOutDate={modalCheckOut}
                      onSelectDates={(inD, outD) => {
                        setModalCheckIn(inD);
                        setModalCheckOut(outD);
                      }}
                      isOpen={true}
                      onToggle={() => setActiveDateModal(null)}
                      targetField={activeDateModal}
                    />
                  </div>
                )}
              </div>

              {/* Guests Field */}
              <div className="border border-slate-300 hover:border-slate-400 rounded-xl relative bg-white transition-colors">
                <GuestsSelector
                  roomsCount={modalRooms}
                  adultsCount={modalAdults}
                  childrenCount={modalChildren}
                  onChange={(rooms, adults, children) => {
                    setModalRooms(rooms);
                    setModalAdults(adults);
                    setModalChildren(children);
                  }}
                  isOpen={isGuestsOpen}
                  onToggle={(open) => {
                    if (open) setActiveDateModal(null);
                    setIsGuestsOpen(open);
                  }}
                />
              </div>
            </div>

            {/* Field 3: Найти Button */}
            <button
              type="button"
              onClick={handleApplyModalSearch}
              className="w-full py-3.5 bg-[#1652f0] hover:bg-blue-700 active:scale-99 text-white font-bold text-base rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              Найти
            </button>
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
