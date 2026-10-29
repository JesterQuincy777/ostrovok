import React from 'react';

interface HotelVisualProps {
  theme: string;
  name?: string;
  className?: string;
}

export const HotelVisual: React.FC<HotelVisualProps> = ({ theme, name, className = '' }) => {
  if (theme === 'azimut') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-800 ${className}`}>
        {/* Modern hotel interior with teal blanket and round mirror matching screenshot */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3b434e] via-[#616c7a] to-[#8d97a5]" />
        
        {/* Soft wall paneling */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-black/30" />

        {/* Round mirror on wall */}
        <div className="absolute top-4 right-1/4 w-20 h-20 rounded-full border-4 border-slate-300 shadow-md bg-gradient-to-br from-slate-200 to-slate-400 overflow-hidden opacity-90 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-300/40 blur-xs" />
        </div>

        {/* Headboard */}
        <div className="absolute bottom-10 inset-x-4 h-16 bg-[#2d343f] rounded-t-xl border-t border-slate-500/30 shadow-inner" />

        {/* Bed with crisp white linen and teal runner */}
        <div className="absolute bottom-0 inset-x-6 h-14 bg-white rounded-t-lg shadow-xl flex flex-col justify-end">
          <div className="w-full h-7 bg-gradient-to-r from-[#20758a] via-[#2f9bb6] to-[#20758a] shadow-xs" />
        </div>

        {/* Pillows */}
        <div className="absolute bottom-11 left-8 w-14 h-8 bg-slate-100 rounded-md rotate-[-4deg] shadow-md border border-slate-200" />
        <div className="absolute bottom-11 left-24 w-14 h-8 bg-slate-100 rounded-md rotate-[2deg] shadow-md border border-slate-200" />

        {/* Modern hanging lamp */}
        <div className="absolute top-0 right-12 w-0.5 h-16 bg-slate-400" />
        <div className="absolute top-16 right-10 w-4 h-6 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(255,200,100,0.8)]" />
      </div>
    );
  }

  if (theme === 'safmar') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-900 ${className}`}>
        {/* Classical Grand facade on Tverskaya matching screenshot */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a5270] via-[#5c7391] to-[#8d7c67]" />
        
        {/* Grand neoclassical building with illuminated arched windows */}
        <div className="absolute inset-x-2 bottom-0 top-3 bg-[#e8ded0] rounded-t-xl border-t-2 border-amber-300/60 p-2 shadow-2xl flex flex-col justify-between">
          {/* Top cornice */}
          <div className="w-full h-3 bg-[#c9bba6] border-b border-[#a89880] flex justify-around items-center">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-1 bg-[#85745e]" />
            ))}
          </div>

          {/* Arched windows with warm chandeliers */}
          <div className="grid grid-cols-4 gap-2 flex-1 my-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-t-full bg-gradient-to-b from-amber-200 to-amber-400/80 border border-amber-600/40 shadow-[0_0_6px_rgba(255,200,80,0.5)] flex items-center justify-center">
                <div className="w-0.5 h-full bg-amber-900/30" />
              </div>
            ))}
          </div>

          {/* Hotel Canopy & street presence */}
          <div className="h-6 bg-[#2b3543] rounded-sm flex items-center justify-center text-[10px] font-bold text-amber-300 tracking-widest border border-amber-400/40">
            SAFMAR GRAND
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'krasnoselskaya') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-800 ${className}`}>
        {/* Modern bright hotel bedroom with twin beds and wall art */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3f4347] via-[#5a6068] to-[#9199a4]" />

        {/* 3 Green botanical artworks on wall matching screenshot */}
        <div className="absolute top-4 inset-x-0 flex justify-center gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-10 bg-[#355238] border-2 border-white rounded-xs shadow-md flex items-center justify-center">
              <span className="text-[9px] text-emerald-200">🌿</span>
            </div>
          ))}
        </div>

        {/* Twin beds with crisp white bedding and soft warm table */}
        <div className="absolute bottom-0 inset-x-4 h-16 flex justify-around items-end gap-3">
          <div className="flex-1 h-12 bg-white rounded-t-lg shadow-lg border border-slate-200 relative">
            <div className="absolute top-1 left-2 w-8 h-4 bg-slate-100 rounded-xs shadow-xs" />
          </div>
          <div className="w-6 h-8 bg-amber-100 rounded-t-xs shadow-xs flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_gold]" />
          </div>
          <div className="flex-1 h-12 bg-white rounded-t-lg shadow-lg border border-slate-200 relative">
            <div className="absolute top-1 right-2 w-8 h-4 bg-slate-100 rounded-xs shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'cosmos') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-900 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#18263e] via-[#213554] to-[#121a29]" />
        <div className="absolute inset-x-0 bottom-0 top-4 flex justify-center">
          <div className="w-full max-w-[94%] h-full flex flex-col justify-end">
            <div className="relative flex-1 grid grid-cols-12 gap-1.5 px-3 pt-2 bg-gradient-to-b from-[#1c2c40] via-[#24354a] to-[#131b26]">
              {[...Array(12)].map((_, col) => (
                <div key={col} className="flex flex-col gap-1.5 justify-around items-center">
                  {[...Array(6)].map((_, row) => (
                    <div
                      key={row}
                      className="w-full h-3.5 rounded-xs bg-gradient-to-b from-[#ffdf88] to-[#f4b840] shadow-[0_0_6px_rgba(255,200,80,0.5)]"
                    />
                  ))}
                </div>
              ))}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-1.5 rounded bg-black/60 backdrop-blur-xs border border-white/20 shadow-xl">
                  <span className="text-white font-extrabold tracking-[0.25em] text-xs font-sans">
                    COSMOS
                  </span>
                </div>
              </div>
            </div>
            <div className="h-7 bg-[#101721] border-t-2 border-[#ffbe3b] flex items-center justify-center">
              <span className="text-[9px] font-bold text-amber-200">HOTEL ENTRANCE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'pekin') {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-900 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a6486] via-[#7d8b9e] to-[#c7a988]" />
        <div className="absolute inset-x-0 bottom-0 flex justify-center items-end">
          <div className="relative w-48 flex flex-col items-center">
            <div className="w-1 h-8 bg-amber-300 shadow-[0_0_8px_rgba(255,220,100,0.8)] relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400 rotate-45 shadow-[0_0_10px_gold]" />
            </div>
            <div className="w-10 h-10 bg-[#dfd6c5] border-t-2 border-amber-600/60 shadow-md flex items-center justify-center relative">
              <div className="w-6 h-6 rounded-full bg-[#1b3d54] border-2 border-amber-300 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-amber-300" />
              </div>
            </div>
            <div className="w-36 h-12 bg-[#ebe3d5] border-t border-slate-300 flex justify-around px-2 pt-1 shadow-sm">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-full bg-[#dfd4c0] flex flex-col justify-around">
                  <div className="w-1 h-2 bg-[#2d475d] mx-auto rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Classic default
  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-800 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1e293b] via-[#334155] to-[#64748b]" />
      <div className="absolute inset-x-3 bottom-0 top-4 bg-[#f8fafc]/90 rounded-t-md p-3 shadow-lg flex flex-col justify-between">
        <div className="grid grid-cols-5 gap-2 flex-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-[#1e293b] rounded-t-sm border border-amber-300/40 shadow-inner" />
          ))}
        </div>
        <div className="mt-2 py-1 bg-slate-900 text-white text-center text-[10px] font-bold rounded">
          {name || 'PREMIUM SUITE'}
        </div>
      </div>
    </div>
  );
};
