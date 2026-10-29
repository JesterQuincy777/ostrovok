import { AIContractResponse, PropertyTypeCode } from '../types';

export const DEFAULT_AI_PROMPT =
  'уютная тихая квартира для удаленной работы, рядом с историческим центром и метро';

export const INITIAL_AI_CONTRACT: AIContractResponse = {
  is_valid_search: true,
  sort_by: 'ai_relevance',
  hard_filters: {
    price_min: null,
    price_max: 6000,
    property_types: ['apartment', 'apart_hotel'],
    max_center_distance_km: 3.0,
    near_metro: true,
    check_in_conditions: {
      reception_24_7: false,
      individual_check_in: true,
      early_check_in: false,
      late_check_out: true,
    },
    hotel_services: {
      free_wifi: true,
      parking: true,
      transfer: false,
      washing_machine: true,
      luggage_storage: false,
      room_service: false,
    },
    meal_options: {
      breakfast: false,
      breakfast_in_room: false,
      bar_or_cafe: false,
      free_tea_coffee: true,
    },
    room_amenities: {
      microwave: true,
      fridge: true,
      tv: true,
      safe: false,
      hairdryer: true,
      bathrobe: false,
      ironing: true,
      terrace: false,
    },
    rules_and_guests: {
      family_friendly: true,
      pets_allowed: false,
      non_smoking: true,
    },
    min_rating: 8.5,
    hotel_name_query: null,
  },
  soft_query: 'уютная тихая квартира для удаленной работы, рядом с историческим центром и метро',
  suggestions: [
    'С круглосуточным ресепшеном',
    'С террасой или балконом',
    'До 4 000 ₽ за ночь',
  ],
};

/**
 * Intelligent NL2API parser mapping natural language user queries to the strict 51-column HardFilters schema.
 * Respects business logic rule: +15% upsell added to price_max.
 */
export function parseQueryToAIContract(promptText: string): AIContractResponse {
  const p = promptText.toLowerCase().trim();

  // Price parsing
  let priceMin: number | null = null;
  let priceMax: number | null = null;

  const maxPriceMatch =
    p.match(/до\s*(\d+[\s\d]*)(?:\s*(?:руб|р|₽|тыс|k))?/i) ||
    p.match(/бюджет(?:ом)?\s*(?:до\s*)?(\d+[\s\d]*)/i) ||
    p.match(/не дороже\s*(\d+[\s\d]*)/i);

  if (maxPriceMatch) {
    let raw = maxPriceMatch[1].replace(/\s+/g, '');
    let val = parseInt(raw, 10);
    if (p.includes('тыс') && val < 100) val *= 1000;
    if (val > 0) {
      // +15% upsell logic
      priceMax = Math.round(val * 1.15);
    }
  }

  const minPriceMatch = p.match(/от\s*(\d+[\s\d]*)/i);
  if (minPriceMatch) {
    let raw = minPriceMatch[1].replace(/\s+/g, '');
    let val = parseInt(raw, 10);
    if (val > 0) priceMin = val;
  }

  if (!priceMax && (p.includes('недорого') || p.includes('бюджетно') || p.includes('дешево'))) {
    priceMax = 4000;
  }

  // Property Types
  const propertyTypes: PropertyTypeCode[] = [];
  if (p.includes('апарт-отел') || p.includes('апартотел')) {
    propertyTypes.push('apart_hotel');
  }
  if (p.includes('бутик')) {
    propertyTypes.push('boutique_hotel');
  }
  if (p.includes('гостев') || p.includes('усадьб')) {
    propertyTypes.push('guesthouse');
  }
  if (p.includes('хостел') || p.includes('койк')) {
    propertyTypes.push('hostel');
  }
  if (p.includes('квартир') || p.includes('апартамент') || p.includes('апарт') || p.includes('студи')) {
    if (!propertyTypes.includes('apartment')) propertyTypes.push('apartment');
    if (!propertyTypes.includes('apart_hotel')) propertyTypes.push('apart_hotel');
  }
  if (p.includes('отел') || p.includes('гостиниц') || p.includes('номер')) {
    if (!propertyTypes.includes('hotel')) propertyTypes.push('hotel');
  }
  if (propertyTypes.length === 0) {
    propertyTypes.push('hotel', 'apartment', 'apart_hotel');
  }

  // Distance from center
  let maxCenterDistance: number | null = null;
  if (p.includes('в самом центре') || p.includes('до 1.5 км') || p.includes('пешком до кремля')) {
    maxCenterDistance = 1.5;
  } else if (p.includes('до 3 км') || p.includes('в центре') || p.includes('историческ')) {
    maxCenterDistance = 3.0;
  } else if (p.includes('до 5 км')) {
    maxCenterDistance = 5.0;
  } else {
    maxCenterDistance = 5.0;
  }

  // Metro proximity (<= 500m)
  const nearMetro =
    p.includes('метро') ||
    p.includes('рядом со станцией') ||
    p.includes('пешком до транспорта') ||
    p.includes('маяковская') ||
    p.includes('пушкинская') ||
    p.includes('арбат');

  // Check-in conditions
  const reception24_7 =
    p.includes('круглосуточн') ||
    p.includes('24/7') ||
    p.includes('24 часа') ||
    p.includes('поздний прилет') ||
    p.includes('ночной заезд');

  const individualCheckIn =
    p.includes('индивидуальн') ||
    p.includes('бесконтактн') ||
    p.includes('электронный замок') ||
    p.includes('код от двери') ||
    p.includes('удаленн') ||
    p.includes('для работы') ||
    p.includes('тихая');

  const earlyCheckIn = p.includes('ранний заезд') || p.includes('утром');
  const lateCheckOut = p.includes('поздний выезд') || p.includes('вечером') || p.includes('для работы');

  // Hotel services
  const freeWifi =
    p.includes('вайфай') ||
    p.includes('wifi') ||
    p.includes('интернет') ||
    p.includes('для работы') ||
    p.includes('удаленн');

  const parking = p.includes('парковк') || p.includes('машин') || p.includes('авто');
  const transfer = p.includes('трансфер') || p.includes('встреч') || p.includes('аэропорт');
  const washingMachine =
    p.includes('стиралк') ||
    p.includes('стиральная машина') ||
    p.includes('надолго') ||
    p.includes('длительн');
  const luggageStorage = p.includes('багаж') || p.includes('вещи') || p.includes('камера хранения');
  const roomService = p.includes('рум-сервис') || p.includes('доставка в номер');

  // Meal options
  const breakfast = p.includes('завтрак') || p.includes('питание') || p.includes('шведский стол');
  const breakfastInRoom = p.includes('завтрак в номер') || p.includes('кофе в постель');
  const barOrCafe = p.includes('бар') || p.includes('кафе') || p.includes('ресторан');
  const freeTeaCoffee =
    p.includes('чай') ||
    p.includes('кофе') ||
    p.includes('кофемашина') ||
    p.includes('для работы');

  // Room amenities
  const microwave =
    p.includes('микроволновк') ||
    p.includes('кухн') ||
    p.includes('готовить') ||
    p.includes('плита');

  const fridge =
    p.includes('холодильник') ||
    p.includes('мини-бар') ||
    p.includes('продукты');

  const tv = p.includes('телевизор') || p.includes('тв') || p.includes('фильмы');
  const safe = p.includes('сейф') || p.includes('ценности') || p.includes('документы');
  const hairdryer = p.includes('фен') || p.includes('укладк');
  const bathrobe = p.includes('халат') || p.includes('люкс') || p.includes('спа');
  const ironing = p.includes('утюг') || p.includes('гладильн') || p.includes('деловая');
  const terrace = p.includes('террас') || p.includes('балкон') || p.includes('вид на город');

  // Rules and guests
  const familyFriendly =
    p.includes('дет') ||
    p.includes('семь') ||
    p.includes('семейный') ||
    p.includes('с ребенком');

  const petsAllowed =
    p.includes('животн') ||
    p.includes('собак') ||
    p.includes('кошк') ||
    p.includes('питомц');

  const nonSmoking =
    p.includes('некурящ') ||
    p.includes('без табака') ||
    p.includes('чистый воздух') ||
    !p.includes('курить');

  // Rating
  let minRating: number | null = null;
  if (p.includes('9+') || p.includes('от 9') || p.includes('люкс') || p.includes('идеальн')) {
    minRating = 9.0;
  } else if (p.includes('8.5+') || p.includes('от 8.5') || p.includes('отличн')) {
    minRating = 8.5;
  } else if (p.includes('8+') || p.includes('от 8')) {
    minRating = 8.0;
  }

  // Hotel Name Query
  let hotelNameQuery: string | null = null;
  const quoteMatch = p.match(/«([^»]+)»|"([^"]+)"/);
  if (quoteMatch) {
    hotelNameQuery = quoteMatch[1] || quoteMatch[2];
  } else if (p.includes('аэростар')) {
    hotelNameQuery = 'Аэростар';
  } else if (p.includes('пекин')) {
    hotelNameQuery = 'Пекин';
  } else if (p.includes('националь')) {
    hotelNameQuery = 'Националь';
  } else if (p.includes('сафмар')) {
    hotelNameQuery = 'Сафмар';
  }

  // Generate 3 dynamic suggestions
  const suggestions: string[] = [];
  if (!reception24_7) {
    suggestions.push('С круглосуточным ресепшеном');
  }
  if (!terrace) {
    suggestions.push('С террасой или балконом');
  }
  if (!priceMax || priceMax > 5000) {
    suggestions.push('До 4 000 ₽ за ночь');
  }
  if (!breakfast) {
    suggestions.push('С включенным завтраком');
  }
  if (maxCenterDistance && maxCenterDistance > 1.5) {
    suggestions.push('В самом центре (до 1.5 км)');
  }

  return {
    is_valid_search: true,
    sort_by: 'ai_relevance',
    hard_filters: {
      price_min: priceMin,
      price_max: priceMax || 6000,
      property_types: propertyTypes,
      max_center_distance_km: maxCenterDistance,
      near_metro: nearMetro,
      check_in_conditions: {
        reception_24_7: reception24_7,
        individual_check_in: individualCheckIn,
        early_check_in: earlyCheckIn,
        late_check_out: lateCheckOut,
      },
      hotel_services: {
        free_wifi: freeWifi || true,
        parking: parking,
        transfer: transfer,
        washing_machine: washingMachine,
        luggage_storage: luggageStorage,
        room_service: roomService,
      },
      meal_options: {
        breakfast: breakfast,
        breakfast_in_room: breakfastInRoom,
        bar_or_cafe: barOrCafe,
        free_tea_coffee: freeTeaCoffee,
      },
      room_amenities: {
        microwave: microwave,
        fridge: fridge,
        tv: tv,
        safe: safe,
        hairdryer: hairdryer,
        bathrobe: bathrobe,
        ironing: ironing,
        terrace: terrace,
      },
      rules_and_guests: {
        family_friendly: familyFriendly,
        pets_allowed: petsAllowed,
        non_smoking: nonSmoking,
      },
      min_rating: minRating,
      hotel_name_query: hotelNameQuery,
    },
    soft_query: promptText,
    suggestions: suggestions.slice(0, 3),
  };
}
