import React from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';

interface RegisterObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterObjectModal: React.FC<RegisterObjectModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = React.useState(false);
  const [objectType, setObjectType] = React.useState<'hotel' | 'apartment' | 'hostel'>('apartment');
  const [objectName, setObjectName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [phone, setPhone] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2.5 rounded-2xl bg-lime-100 text-lime-800">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  Зарегистрировать объект на Островке
                </h3>
                <p className="text-xs text-slate-500">Привлекайте миллионы гостей со всей России и мира</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Тип объекта размещения
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'apartment', label: 'Апартаменты / Квартира' },
                    { id: 'hotel', label: 'Отель / Гостиница' },
                    { id: 'hostel', label: 'Гостевой дом / Хостел' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setObjectType(t.id as any)}
                      className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        objectType === t.id
                          ? 'border-[#1652f0] bg-blue-50/50 text-[#1652f0]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Название объекта *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Уютная студия на Невском"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Город или населенный пункт *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Санкт-Петербург"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Контактный телефон *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1652f0] hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                Отправить заявку на подключение
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black text-slate-900">Заявка успешно принята!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Менеджер отдела партнерств свяжется с вами по номеру <strong>{phone}</strong> в течение 1 рабочего дня для верификации объекта.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
