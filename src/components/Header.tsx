import React from 'react';
import { ChefHat, Video, Bookmark, Sparkles, RotateCcw, Smartphone } from 'lucide-react';
import { playChime } from '../utils/speech';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenLiveChef: () => void;
  onOpenExpoModal: () => void;
  onQuickSample: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  onOpenLiveChef,
  onOpenExpoModal,
  onQuickSample,
  onResetAll,
}) => {
  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E2E8F0] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Hackathon Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E4572E] to-[#C8431C] text-white flex items-center justify-center shadow-md shadow-[#E4572E]/20 rotate-[-1deg] transition-transform hover:rotate-0">
            <ChefHat className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] font-heading flex items-center gap-1">
                Готово<span className="text-[#E4572E]">.</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-mono-val">
                <Sparkles className="w-3 h-3" /> Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium hidden sm:block">
              Хакатон Ilmhona × MLH • Тема «AI for Everyday Life»
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Badges */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              playChime('click');
              onOpenExpoModal();
            }}
            title="Открыть на телефоне через Expo Go или QR-код"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FFF5F2] text-[#E4572E] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#E4572E]" />
            <span>Expo / Телефон</span>
          </button>

          <button
            onClick={() => {
              playChime('click');
              onQuickSample();
            }}
            title="Заполнить случайным набором продуктов для быстрого теста"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E4572E]" />
            <span className="hidden sm:inline">Случайный набор</span>
            <span className="sm:hidden">Пример</span>
          </button>

          <button
            onClick={() => {
              playChime('click');
              onResetAll();
            }}
            title="Очистить все параметры и результаты"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#FEE2E2] hover:text-[#B91C1C] hover:border-[#FECACA] transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сбросить</span>
          </button>

          <button
            onClick={() => {
              playChime('click');
              onOpenSaved();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#F8FAFC] text-[#334155] border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all shadow-2xs relative"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Избранное</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E4572E] text-white">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playChime('success');
              onOpenLiveChef();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#E4572E] text-white hover:bg-[#C8431C] transition-all shadow-md shadow-[#E4572E]/25 hover:shadow-lg hover:shadow-[#E4572E]/35 active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Video className="w-3.5 h-3.5" />
            <span>Live-Шеф</span>
          </button>
        </div>
      </div>
    </header>
  );
};
