import React from 'react';
import { Heart, Bell, HelpCircle, User, Menu, X, Coins, Building2 } from 'lucide-react';
import { CurrencyCode } from '../types';

interface HeaderProps {
  currentCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenAuth: () => void;
  onOpenSupport: () => void;
  onOpenRegisterObject: () => void;
  onOpenHotelierCabinet?: () => void;
  onNavigateHome?: () => void;
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onSelectCurrency,
  favoritesCount,
  onOpenFavorites,
  onOpenAuth,
  onOpenSupport,
  onOpenRegisterObject,
  onOpenHotelierCabinet,
  onNavigateHome,
  user,
  onLogout,
}) => {
  const [showCurrencyMenu, setShowCurrencyMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showMobileNav, setShowMobileNav] = React.useState(false);

  const currencyOptions: CurrencyCode[] = ['RUB', 'USD', 'EUR', 'KZT', 'BYN'];

  return (
    <header className="relative w-full px-4 sm:px-8 py-3.5 flex items-center justify-between text-slate-900 select-none">
      {/* Brand Wordmark */}
      <div className="flex items-center gap-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-1 group cursor-pointer"
          title="На главную"
        >
          <span className="font-extrabold text-2xl sm:text-[28px] tracking-tight text-[#1652f0] transition-transform group-hover:scale-105 font-sans">
            Островок!
          </span>
        </a>
      </div>

      {/* Right Action Icons & Buttons */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Кабинет отельера (B2B) */}
        {onOpenHotelierCabinet && (
          <button
            onClick={onOpenHotelierCabinet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white/60 hover:bg-white rounded-lg border border-black/10 transition-colors shadow-2xs cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-[#1652f0]" />
            <span>Кабинет отельера (B2B)</span>
          </button>
        )}

        {/* Зарегистрировать объект */}
        <button
          onClick={onOpenRegisterObject}
          className="hidden lg:inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 hover:text-black hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
        >
          Зарегистрировать объект
        </button>

        {/* Favorites Heart */}
        <button
          onClick={onOpenFavorites}
          title="Избранное"
          className="relative p-2 text-slate-800 hover:text-rose-600 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          aria-label="Избранное"
        >
          <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Уведомления"
            className="p-2 text-slate-800 hover:text-slate-950 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Уведомления"
          >
            <Bell className="w-5 h-5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">Уведомления</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-3 space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-lime-50 border border-lime-200">
                  <div className="font-semibold text-slate-900">Скидки до 37% на осенний сезон!</div>
                  <div className="text-slate-600 mt-1">
                    Специальные предложения на отели в Санкт-Петербурге и Москве до 15 октября 2026.
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="font-semibold text-slate-900">Программа лояльности ГУРУ</div>
                  <div className="text-slate-600 mt-1">
                    Авторизуйтесь, чтобы открывать закрытые цены со скидкой до 40%.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Language Flag 🇷🇺 */}
        <div className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-black/5 cursor-pointer">
          <span className="text-base" role="img" aria-label="Россия">
            🇷🇺
          </span>
        </div>

        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
            title="Выбор валюты"
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <Coins className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-xs">{currentCurrency}</span>
          </button>

          {showCurrencyMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Выберите валюту
              </div>
              {currencyOptions.map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    onSelectCurrency(code);
                    setShowCurrencyMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    currentCurrency === code ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{code}</span>
                  <span className="text-slate-400">
                    {code === 'RUB' ? '₽' : code === 'USD' ? '$' : code === 'EUR' ? '€' : code === 'KZT' ? '₸' : 'Br'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Support Help ? */}
        <button
          onClick={onOpenSupport}
          title="Служба поддержки"
          className="p-2 text-slate-800 hover:text-slate-950 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          aria-label="Поддержка"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Account / Войти */}
        {user ? (
          <div className="relative group">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-900 bg-white/70 hover:bg-white rounded-full border border-black/10 transition-colors shadow-xs cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#1652f0] text-white flex items-center justify-center font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : 'У'}
              </div>
              <span className="max-w-[80px] truncate">{user.name || 'Профиль'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span>Войти</span>
          </button>
        )}

        {/* Hamburger Menu */}
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="p-2 text-slate-900 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          aria-label="Меню"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile / Slide Menu Drawer */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-extrabold text-2xl text-[#1652f0]">Островок!</span>
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenRegisterObject();
                  }}
                  className="w-full text-left py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm"
                >
                  Зарегистрировать объект
                </button>
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenFavorites();
                  }}
                  className="w-full text-left py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm flex items-center justify-between"
                >
                  <span>Моё избранное</span>
                  {favoritesCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenSupport();
                  }}
                  className="w-full text-left py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm"
                >
                  Служба поддержки 24/7
                </button>
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm"
                >
                  {user ? 'Личный кабинет' : 'Вход в аккаунт'}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
              <p>Островок! — сервис онлайн-бронирования отелей и апартаментов.</p>
              <p className="mt-1">Круглосуточная горячая линия: 8 800 775-65-85</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
