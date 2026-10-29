import React from 'react';
import { X, Sparkles, Check, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMethod, setAuthMethod] = React.useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = React.useState('+7 ');
  const [email, setEmail] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const [code, setCode] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      setCodeSent(true);
    } else {
      onLoginSuccess({
        name: authMethod === 'phone' ? 'Путешественник' : email.split('@')[0],
        email: authMethod === 'phone' ? 'user@ostrovok.ru' : email,
      });
      onClose();
    }
  };

  const handleQuickDemo = () => {
    onLoginSuccess({
      name: 'Александр Б.',
      email: 'alex.traveler@ostrovok.ru',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Promo Hero for GURU */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-200 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Программа лояльности ГУРУ
          </div>
          <h3 className="font-extrabold text-lg leading-tight">
            Скидки до 40% на отели и квартиры
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Закрытые клубные тарифы активируются сразу после входа.
          </p>
        </div>

        {/* Method Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setCodeSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMethod === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            По телефону
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setCodeSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMethod === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            По почте
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!codeSent ? (
            authMethod === 'phone' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1652f0] focus:ring-1 focus:ring-[#1652f0] text-sm font-semibold"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1652f0] focus:ring-1 focus:ring-[#1652f0] text-sm font-semibold"
                />
              </div>
            )
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Код подтверждения из SMS (введите 1234)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="1234"
                className="w-full text-center tracking-widest text-xl font-bold px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1652f0]"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#1652f0] hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            {!codeSent ? 'Получить код' : 'Войти в профиль'}
          </button>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Быстрый вход для демо
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Безопасная авторизация Ostrovok.ru</span>
        </div>
      </div>
    </div>
  );
};
