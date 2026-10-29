import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1b2533] text-slate-300 pt-12 pb-16 px-4 sm:px-8 text-xs border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-700/60">
          <div>
            <h4 className="font-bold text-white text-sm mb-3">О компании</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Пресс-центр</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Вакансии</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Блог путешественников</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Путешественникам</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Программа лояльности ГУРУ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Помощь и поддержка 24/7</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Условия бронирования</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Партнерам</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Зарегистрировать отель</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Для корпоративных клиентов</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Партнерская программа</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Экстранет отельера</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Приложение Островок!</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Бронируйте отели со скидками до 40% прямо в приложении на iOS и Android.
            </p>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Доступно в</div>
                  <div className="text-xs font-bold text-white">App Store & Google Play</div>
                </div>
                <span className="text-lg">📱</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            <span className="font-black text-white text-base mr-2 text-[#4680fe]">Островок!</span>
            © 2026 ООО «Бронирование гостиниц». Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span>Безопасная оплата: МИР · СБП · Visa · Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
