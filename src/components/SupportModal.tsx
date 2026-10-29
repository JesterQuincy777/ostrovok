import React from 'react';
import { X, Phone, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Как бесплатно отменить бронирование?',
      a: 'Отменить бронирование без штрафа можно в разделе «Мои бронирования» до даты, указанной в условиях тарифа конкретного отеля.',
    },
    {
      q: 'Где найти ваучер после бронирования?',
      a: 'Ваучер отправляется на указанную электронную почту сразу после оформления, а также доступен в профиле.',
    },
    {
      q: 'Как работает скидка по программе лояльности ГУРУ?',
      a: 'Авторизованные пользователи получают скидки от 10% до 40% на выделенные объекты с отметкой ГУРУ автоматически при поиске.',
    },
    {
      q: 'Возможна ли оплата на месте в отеле?',
      a: 'Да! Многие отели на Островке поддерживают тариф «Оплата в объекте размещения». Вы можете отфильтровать такие предложения в поиске.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1652f0]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">Служба заботы о клиентах</h3>
            <p className="text-xs text-slate-500">Помощь 24 часа в сутки, 7 дней в неделю</p>
          </div>
        </div>

        {/* Hotlines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> По России (бесплатно)
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              8 (800) 775-65-85
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Онлайн-чат
            </div>
            <div className="text-sm font-bold text-[#1652f0] mt-1 hover:underline cursor-pointer">
              Начать диалог с оператором
            </div>
          </div>
        </div>

        {/* FAQ list */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Часто задаваемые вопросы
          </h4>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, i) => (
              <div key={i} className="py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-[#1652f0] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === i ? 'rotate-90 text-[#1652f0]' : ''
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
