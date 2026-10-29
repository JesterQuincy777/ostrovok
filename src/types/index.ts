export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'KZT' | 'BYN';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToRub: number;
}

export type SortByOption = 'ai_relevance' | 'popular' | 'price_asc' | 'price_desc' | 'rating_desc';

export type PropertyTypeCode =
  | 'hotel'
  | 'apartment'
  | 'apart_hotel'
  | 'boutique_hotel'
  | 'guesthouse'
  | 'hostel';

export interface CheckInConditionsFilter {
  reception_24_7: boolean;
  individual_check_in: boolean;
  early_check_in: boolean;
  late_check_out: boolean;
}

export interface HotelServicesFilter {
  free_wifi: boolean;
  parking: boolean;
  transfer: boolean;
  washing_machine: boolean;
  luggage_storage: boolean;
  room_service: boolean;
}

export interface MealOptionsFilter {
  breakfast: boolean;
  breakfast_in_room: boolean;
  bar_or_cafe: boolean;
  free_tea_coffee: boolean;
}

export interface RoomAmenitiesFilter {
  microwave: boolean;
  fridge: boolean;
  tv: boolean;
  safe: boolean;
  hairdryer: boolean;
  bathrobe: boolean;
  ironing: boolean;
  terrace: boolean;
}

export interface RulesAndGuestsFilter {
  family_friendly: boolean;
  pets_allowed: boolean;
  non_smoking: boolean;
}

export interface HardFilters {
  price_min: number | null;
  price_max: number | null;
  property_types: PropertyTypeCode[];
  max_center_distance_km: number | null;
  near_metro: boolean; // Metro Distance <= 0.5 km
  check_in_conditions: CheckInConditionsFilter;
  hotel_services: HotelServicesFilter;
  meal_options: MealOptionsFilter;
  room_amenities: RoomAmenitiesFilter;
  rules_and_guests: RulesAndGuestsFilter;
  min_rating: number | null;
  hotel_name_query: string | null;
}

export interface AIContractResponse {
  is_valid_search: boolean;
  sort_by: SortByOption;
  hard_filters: HardFilters;
  soft_query: string;
  suggestions: string[];
}

export interface RoomOption {
  id: string;
  name: string;
  areaM2: number;
  bedType: string;
  maxGuests: number;
  pricePerNight: number;
  originalPricePerNight?: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  payAtHotel: boolean;
  amenities: string[];
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  city: string;
  address: string;
  metro?: string;
  metroDistanceKm: number;
  centerDistanceKm: number;
  price: number; // matches Price column (1 500 - 10 500)
  minPriceRub: number; // alias for compatibility
  originalPriceRub?: number;
  rating: number; // 7.6 - 10.0
  numberOfReviews: number; // 2 - 438
  reviewsCount: number; // alias
  ratingLabel: string;
  isTopStays: boolean; // all True in dataset
  propertyType: PropertyTypeCode;
  propertyTypeLabel: string;
  description: string;

  // Check-in and Reception
  reception247: boolean;
  individualCheckIn: boolean;
  earlyCheckIn: boolean;
  lateCheckOut: boolean;
  expressCheckIn: boolean;

  // Hotel services
  freeWifi: boolean;
  hasInternet: boolean;
  parking: boolean;
  freePublicParkingNearby: boolean;
  transfer: boolean;
  airportTransfer: boolean;
  luggageStorage: boolean;
  washingMachine: boolean;
  roomService: boolean;
  hasComputer: boolean;
  hasShops: boolean;
  hasPress: boolean;

  // Meal & Drinks
  breakfast: boolean;
  breakfastInRoom: boolean;
  bar: boolean;
  cafe: boolean;
  freeTeaCoffee: boolean;
  packedLunches: boolean;
  dietMenu: boolean;

  // Room equipment
  fridge: boolean;
  microwave: boolean;
  tv: boolean;
  cableTv: boolean;
  safeInRoom: boolean;
  hairdryer: boolean;
  bathrobe: boolean;
  ironingFacilities: boolean;
  heating: boolean;
  phone: boolean;
  terrace: boolean;

  // Rules and guests
  familyFriendly: boolean;
  familyRooms: boolean;
  noPetsAllowed: boolean; // Inverted column: true if pets NOT allowed
  nonSmokingHotel: boolean;
  nonSmokingRooms: boolean;

  // Visual & Display metadata
  topBadge?: string;
  roomsLeft?: number;
  discountPercent?: number;
  guruPriceRub?: number;
  isGuruDiscount: boolean;
  isApartment: boolean;
  tags?: string[];
  accentTheme: 'azimut' | 'safmar' | 'krasnoselskaya' | 'cosmos' | 'pekin' | 'classic';
  mapCoords: {
    lat: number;
    lng: number;
    xPercent: number;
    yPercent: number;
  };
  rooms: RoomOption[];
  score?: number;
  aiComment?: string;
  facts?: any[];
  checks?: Array<{ key: string; status: string }>;
  questions?: Array<{
    id?: string | number;
    question: string;
    rawQuestion?: string;
    status?: 'not_sent' | 'pending' | 'answered';
    answer?: string;
  }>;
}

export interface SearchState {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
  adultsCount: number;
  childrenCount: number;
  onlyApartments: boolean;
  searchMode?: 'ai' | 'classic';
  aiPrompt?: string;
}

export interface UserBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  guestsCount: number;
  totalPrice: number;
  currency: CurrencyCode;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}
