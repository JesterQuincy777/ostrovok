import React from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SeasonDealsCarousel } from './components/SeasonDealsCarousel';
import { SearchResults } from './components/SearchResults';
import { HotelDetailPage } from './components/HotelDetailPage';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AuthModal } from './components/AuthModal';
import { SupportModal } from './components/SupportModal';
import { RegisterObjectModal } from './components/RegisterObjectModal';
import { CookieBanner } from './components/CookieBanner';
import { TransferSearch } from './components/TransferSearch';
import { CorporateSection } from './components/CorporateSection';
import { PopularDestinations } from './components/PopularDestinations';
import { Footer } from './components/Footer';
import { HotelierCabinetModal } from './components/HotelierCabinetModal';
import { INITIAL_HOTELS } from './data/mockData';
import { CurrencyCode, Hotel, SearchState, UserBooking } from './types';

export default function App() {
  // Search parameters matching screenshot & AI concept (NO PREFILLED TEXT, ONLY PLACEHOLDERS)
  const [searchState, setSearchState] = React.useState<SearchState>({
    destination: 'Санкт-Петербург, Россия',
    checkInDate: '2026-10-17',
    checkOutDate: '2026-10-18',
    roomsCount: 1,
    adultsCount: 2,
    childrenCount: 0,
    onlyApartments: false,
    searchMode: 'ai',
    aiPrompt: '',
  });

  // App UI states
  const [viewMode, setViewMode] = React.useState<'home' | 'search_results' | 'hotel_page'>('home');
  const [activeMainTab, setActiveMainTab] = React.useState<'stays' | 'transfers' | 'corporate'>('stays');
  const [currentCurrency, setCurrentCurrency] = React.useState<CurrencyCode>('RUB');
  const [selectedHotel, setSelectedHotel] = React.useState<Hotel | null>(null);

  // Handle hotel selection to open dedicated Hotel Page
  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setViewMode('hotel_page');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Initial catalog state populated from Step 2 / BottomAiChat
  const [initialCatalogData, setInitialCatalogData] = React.useState<{
    hotels: Hotel[];
    alternatives: Hotel[];
    intent: any;
    warnings: string[];
    commentsMap: Record<string, string>;
    prompt: string;
    nextOffset?: number | null;
  } | null>(null);

  // User & Data state
  const [favorites, setFavorites] = React.useState<string[]>([
    'azimut-aerostar-moscow',
    'safmar-grand-moscow',
  ]);
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);
  const [bookings, setBookings] = React.useState<UserBooking[]>([]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = React.useState(false);
  const [isRegisterObjectOpen, setIsRegisterObjectOpen] = React.useState(false);
  const [isHotelierCabinetOpen, setIsHotelierCabinetOpen] = React.useState(false);

  // Toggle favorite
  const handleToggleFavorite = (hotelId: string) => {
    setFavorites((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
  };

  // Handle transition from BottomAiChat (Step 3: «Показать ещё»)
  const handleOpenFullCatalogFromChat = (data: {
    hotels: Hotel[];
    alternatives: Hotel[];
    intent: any;
    warnings: string[];
    commentsMap: Record<string, string>;
    prompt: string;
    nextOffset?: number | null;
  }) => {
    setInitialCatalogData(data);
    setSearchState((prev) => ({ ...prev, aiPrompt: data.prompt, searchMode: 'ai' }));
    setViewMode('search_results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search submission
  const handleSearchSubmit = () => {
    setViewMode('search_results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select city from popular list
  const handleSelectCity = (cityName: string) => {
    setSearchState((prev) => ({ ...prev, destination: `${cityName}, Россия` }));
    setViewMode('search_results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update search state from child components
  const handleSearchStateChange = (updates: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  };

  // Add confirmed booking
  const handleConfirmBooking = (booking: UserBooking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-lime-200">
      {/* Header: Lime green on home, crisp white on search results and hotel page */}
      <div className={viewMode === 'home' ? 'bg-[#9fed43]' : 'bg-white border-b border-slate-200'}>
        <Header
          currentCurrency={currentCurrency}
          onSelectCurrency={setCurrentCurrency}
          favoritesCount={favorites.length}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenRegisterObject={() => setIsRegisterObjectOpen(true)}
          onOpenHotelierCabinet={() => setIsHotelierCabinetOpen(true)}
          onNavigateHome={() => {
            setViewMode('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          user={user}
          onLogout={() => setUser(null)}
        />

        {/* Hero Section shown in Home mode */}
        {viewMode === 'home' && (
          <HeroSection
            searchState={searchState}
            onSearchChange={(updated) => setSearchState((prev) => ({ ...prev, ...updated }))}
            onSearchSubmit={handleSearchSubmit}
            activeMainTab={activeMainTab}
            onSelectMainTab={(tab) => {
              setActiveMainTab(tab);
            }}
            onSelectHotel={handleSelectHotel}
            onOpenFullCatalog={handleOpenFullCatalogFromChat}
            currentCurrency={currentCurrency}
          />
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-white relative z-20">
        {viewMode === 'hotel_page' && selectedHotel ? (
          <HotelDetailPage
            hotel={selectedHotel}
            onBackToResults={() => {
              setViewMode('search_results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToHome={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentCurrency={currentCurrency}
            checkInDate={searchState.checkInDate}
            checkOutDate={searchState.checkOutDate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onConfirmBooking={handleConfirmBooking}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenHotelierCabinet={() => setIsHotelierCabinetOpen(true)}
          />
        ) : viewMode === 'search_results' ? (
          <SearchResults
            searchState={searchState}
            hotels={INITIAL_HOTELS}
            currentCurrency={currentCurrency}
            onSelectHotel={handleSelectHotel}
            onBackToHome={() => setViewMode('home')}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenAuth={() => setIsAuthOpen(true)}
            onEditSearchSummary={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onUpdateSearchState={handleSearchStateChange}
            initialApiHotels={initialCatalogData?.hotels}
            initialAlternatives={initialCatalogData?.alternatives}
            initialIntent={initialCatalogData?.intent}
            initialWarnings={initialCatalogData?.warnings}
            initialCommentsMap={initialCatalogData?.commentsMap}
            initialNextOffset={initialCatalogData?.nextOffset}
          />
        ) : activeMainTab === 'transfers' ? (
          <div className="py-8 px-4 sm:px-8 -mt-8 rounded-t-[32px] sm:rounded-t-[44px] bg-white shadow-lg border-t border-black/5">
            <TransferSearch />
          </div>
        ) : activeMainTab === 'corporate' ? (
          <div className="py-8 px-4 sm:px-8 -mt-8 rounded-t-[32px] sm:rounded-t-[44px] bg-white shadow-lg border-t border-black/5">
            <CorporateSection />
          </div>
        ) : (
          <div className="-mt-8 sm:-mt-12 rounded-t-[32px] sm:rounded-t-[44px] bg-white shadow-lg border-t border-black/5 pt-4">
            {/* Season Deals Carousel matching screenshot 1 */}
            <SeasonDealsCarousel
              hotels={INITIAL_HOTELS}
              currentCurrency={currentCurrency}
              onSelectHotel={handleSelectHotel}
              onOpenAuth={() => setIsAuthOpen(true)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Popular destinations showcase */}
            <PopularDestinations onSelectCity={handleSelectCity} />

            {/* Value Proposition Strip */}
            <section className="py-12 bg-slate-50 border-y border-slate-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
                  <div className="p-4">
                    <div className="text-2xl font-black text-slate-900 mb-1">2 500 000+</div>
                    <div className="text-xs text-slate-600">
                      Отелей, апартаментов, хостелов и вилл по всему миру
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl font-black text-[#1652f0] mb-1">До 40%</div>
                    <div className="text-xs text-slate-600">
                      Скидки для участников программы лояльности ГУРУ
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl font-black text-emerald-600 mb-1">0 ₽</div>
                    <div className="text-xs text-slate-600">
                      Без комиссий и скрытых сборов при оплате
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl font-black text-slate-900 mb-1">24 / 7</div>
                    <div className="text-xs text-slate-600">
                      Круглосуточная русскоязычная служба заботы о клиентах
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      {(viewMode === 'home' || viewMode === 'hotel_page') && <Footer />}

      {/* Cookie notification banner matching bottom of screenshot */}
      <CookieBanner />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        hotels={INITIAL_HOTELS}
        currentCurrency={currentCurrency}
        onSelectHotel={handleSelectHotel}
        onRemoveFavorite={handleToggleFavorite}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <RegisterObjectModal
        isOpen={isRegisterObjectOpen}
        onClose={() => setIsRegisterObjectOpen(false)}
      />

      <HotelierCabinetModal
        isOpen={isHotelierCabinetOpen}
        onClose={() => setIsHotelierCabinetOpen(false)}
      />
    </div>
  );
}
