import React from 'react';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-xl w-full sm:w-auto bg-[#313c4e]/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4">
        <div className="text-slate-200 text-center sm:text-left">
          Мы используем{' '}
          <button
            type="button"
            onClick={() => alert('Политика использования файлов cookie Ostrovok: файлы cookie используются для сохранения ваших предпочтений поиска, авторизации и аналитики сервиса.')}
            className="underline hover:text-white font-medium cursor-pointer"
          >
            куки
          </button>{' '}
          для аналитики и правильной работы сайта
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 px-5 py-1.5 bg-[#1652f0] hover:bg-blue-600 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
        >
          Хорошо
        </button>
      </div>
    </div>
  );
};
