import React from 'react';
import { DishCategory, CategoryOption } from '../types';
import { playChime } from '../utils/speech';
import { Check, Sparkles } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategories: DishCategory[];
  onToggleCategory: (category: DishCategory) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const CATEGORIES_DATA: CategoryOption[] = [
  {
    id: 'Завтраки',
    label: 'Завтраки',
    emoji: '🍳',
    description: 'Омлеты, сырники, тосты, каши',
    color: '#FEF3C7',
  },
  {
    id: 'Супы',
    label: 'Супы',
    emoji: '🍲',
    description: 'Крем-супы, бульоны, рамены',
    color: '#FFEDD5',
  },
  {
    id: 'Салаты',
    label: 'Салаты',
    emoji: '🥗',
    description: 'Свежие, теплые, с заправками',
    color: '#DCFCE7',
  },
  {
    id: 'Основные',
    label: 'Основные блюда',
    emoji: '🍝',
    description: 'Паста, мясо, рыба, рагу, гарниры',
    color: '#E0E7FF',
  },
  {
    id: 'Десерты',
    label: 'Десерты',
    emoji: '🍰',
    description: 'Суфле, муссы, блинчики, кремы',
    color: '#FCE7F3',
  },
  {
    id: 'Выпечка',
    label: 'Выпечка',
    emoji: '🥐',
    description: 'Пироги, кексы, лепешки, хачапури',
    color: '#FEE2E2',
  },
];

// Magnet rotation angles for realistic fridge look
const ROTATIONS = ['rotate-[-1.5deg]', 'rotate-[1.2deg]', 'rotate-[-0.8deg]', 'rotate-[1.8deg]', 'rotate-[-1.2deg]', 'rotate-[0.9deg]'];

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <div className="bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
      {/* Decorative fridge handle & magnet texture subtle cues */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#38BDF8]/10 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E4572E] shadow-xs" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] font-heading">
            Категории блюд
          </h2>
          <span className="text-xs font-mono-val text-[#64748B] px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
            магниты холодильника ({selectedCategories.length}/{CATEGORIES_DATA.length})
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              playChime('click');
              onSelectAll();
            }}
            className="text-[#0284C7] hover:text-[#0369A1] font-semibold underline-offset-2 hover:underline transition-colors"
          >
            Выбрать все
          </button>
          <span className="text-[#CBD5E1]">•</span>
          <button
            type="button"
            onClick={() => {
              playChime('click');
              onClearAll();
            }}
            className="text-[#64748B] hover:text-[#0F172A] font-semibold underline-offset-2 hover:underline transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#64748B] mb-4">
        Выберите желаемые типы блюд. Gemini отфильтрует рецепты строго по выбранным магнитикам:
      </p>

      {/* Magnet Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES_DATA.map((cat, index) => {
          const isSelected = selectedCategories.includes(cat.id);
          const rotClass = ROTATIONS[index % ROTATIONS.length];

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playChime('click');
                onToggleCategory(cat.id);
              }}
              className={`magnet-chip p-3.5 rounded-2xl flex flex-col items-center text-center justify-between gap-2 border transition-all duration-200 cursor-pointer select-none ${rotClass} ${
                isSelected
                  ? 'bg-gradient-to-b from-[#E4572E] to-[#C8431C] text-white border-[#9C2C0B] shadow-md shadow-[#E4572E]/30 scale-[1.03] active'
                  : 'bg-[#FFFFFF] text-[#1E293B] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              {/* Magnet top tactile dot */}
              <div
                className={`w-3 h-3 rounded-full border mb-0.5 flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#9C2C0B] text-[#E4572E]'
                    : 'bg-[#E2E8F0] border-[#CBD5E1]'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>

              <div className="text-2xl sm:text-3xl filter drop-shadow-xs transition-transform group-hover:scale-110">
                {cat.emoji}
              </div>

              <div>
                <div
                  className={`text-xs sm:text-sm font-bold font-heading leading-tight ${
                    isSelected ? 'text-white' : 'text-[#0F172A]'
                  }`}
                >
                  {cat.label}
                </div>
                <div
                  className={`text-[10px] line-clamp-1 mt-0.5 ${
                    isSelected ? 'text-white/80' : 'text-[#64748B]'
                  }`}
                >
                  {cat.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
