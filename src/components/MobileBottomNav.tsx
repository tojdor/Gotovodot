import React from 'react';
import { Camera, Tag, Utensils, Video, Smartphone, Bookmark } from 'lucide-react';
import { playChime } from '../utils/speech';

interface MobileBottomNavProps {
  onOpenLiveChef: () => void;
  onOpenExpoModal: () => void;
  onOpenSaved: () => void;
  savedCount: number;
  onScrollToSection: (sectionId: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenLiveChef,
  onOpenExpoModal,
  onOpenSaved,
  savedCount,
  onScrollToSection,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex items-center justify-around">
      {/* 1. Camera / Photo */}
      <button
        onClick={() => {
          playChime('click');
          onScrollToSection('photo-recognition-section');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] active:scale-95 transition-all"
      >
        <Camera className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Фото</span>
      </button>

      {/* 2. Ingredients */}
      <button
        onClick={() => {
          playChime('click');
          onScrollToSection('ingredients-section');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] active:scale-95 transition-all"
      >
        <Tag className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Продукты</span>
      </button>

      {/* 3. Recipes Main Action */}
      <button
        onClick={() => {
          playChime('click');
          onScrollToSection('recipes-results-section');
        }}
        className="flex flex-col items-center justify-center -mt-4 bg-[#E4572E] text-white p-3 rounded-2xl shadow-lg shadow-[#E4572E]/40 active:scale-95 transition-all"
      >
        <Utensils className="w-5 h-5" />
        <span className="text-[10px] font-extrabold mt-0.5">Рецепты</span>
      </button>

      {/* 4. Live-Chef Video */}
      <button
        onClick={() => {
          playChime('success');
          onOpenLiveChef();
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#0369A1] hover:text-[#0284C7] active:scale-95 transition-all relative"
      >
        <Video className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Live-Шеф</span>
        <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#E4572E] animate-pulse" />
      </button>

      {/* 5. Expo Mobile App Hub */}
      <button
        onClick={() => {
          playChime('click');
          onOpenExpoModal();
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] active:scale-95 transition-all"
      >
        <Smartphone className="w-5 h-5 text-[#E4572E]" />
        <span className="text-[10px] font-bold text-[#E4572E] mt-0.5">Expo</span>
      </button>
    </nav>
  );
};
