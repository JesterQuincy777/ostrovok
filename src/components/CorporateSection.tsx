import React from 'react';
import { Briefcase, FileText, CheckCircle, Percent, ArrowRight } from 'lucide-react';

export const CorporateSection: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 max-w-4xl mx-auto my-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Островок! Командировки для бизнеса
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Удобный сервис бронирования отелей, билетов и апартаментов для юридических лиц с закрывающими документами
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <FileText className="w-6 h-6 text-[#1652f0] mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">НДС 20% и ЭДО</h4>
          <p className="text-xs text-slate-500 mt-1">
            Автоматическая выгрузка УПД и актов в СБИС и Диадок. Возврат до 20% НДС.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <Percent className="w-6 h-6 text-emerald-600 mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Корпоративные скидки</h4>
          <p className="text-xs text-slate-500 mt-1">
            Специальные цены B2B на более чем 2 000 000 отелей по России и всему миру.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <CheckCircle className="w-6 h-6 text-indigo-600 mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Тревел-политики</h4>
          <p className="text-xs text-slate-500 mt-1">
            Лимиты по городам и сотрудникам, согласование поездок в один клик.
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-extrabold text-slate-900 text-sm">
            Подключите компанию за 5 минут
          </div>
          <div className="text-xs text-slate-600">
            Бесплатное обслуживание и персональный куратор для вашего бизнеса
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert('Заявка на корпоративное подключение принята! Наш менеджер свяжется с вами по указанным реквизитам.')}
          className="px-6 py-2.5 bg-[#1652f0] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Зарегистрировать компанию</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
