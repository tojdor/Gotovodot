import React from 'react';
import { Clock, Flame, Sparkles, Filter } from 'lucide-react';
import { DietaryOption } from '../types';
import { playChime } from '../utils/speech';

interface CookingFiltersProps {
  timeMinutes: number;
  setTimeMinutes: (val: number) => void;
  maxCalories: number;
  setMaxCalories: (val: number) => void;
  selectedDiets: string[];
  onToggleDiet: (dietId: string) => void;
  userNotes: string;
  setUserNotes: (notes: string) => void;
}

const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'вегетарианское', label: 'Вегетарианское', emoji: '🌱' },
  { id: 'быстрое', label: 'Экспресс (< 20 мин)', emoji: '⚡' },
  { id: 'пп', label: 'ПП / Фитнес', emoji: '🥗' },
  { id: 'без глютена', label: 'Без глютена', emoji: '🌾' },
  { id: 'без лактозы', label: 'Без лактозы', emoji: '🥛' },
  { id: 'эконом', label: 'Эконом / Студент', emoji: '💰' },
];

export const CookingFilters: React.FC<CookingFiltersProps> = ({
  timeMinutes,
  setTimeMinutes,
  maxCalories,
  setMaxCalories,
  selectedDiets,
  onToggleDiet,
  userNotes,
  setUserNotes,
}) => {
  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
          3
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] font-heading">
            Параметры и ограничения
          </h2>
          <p className="text-xs text-[#64748B]">
            Настройте ползунки времени, калорийности и диетические предпочтения
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        {/* Time Slider */}
        <div className="bg-[#F8FAFC] p-4.5 rounded-2xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#0F172A] font-heading flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0284C7]" />
              Время приготовления
            </span>
            <span className="text-sm font-bold font-mono-val text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-lg border border-[#BAE6FD]">
              до {timeMinutes} мин
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(Number(e.target.value))}
            className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
          />

          <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono-val mt-2">
            <span onClick={() => setTimeMinutes(15)} className="cursor-pointer hover:text-[#0284C7]">
              15 мин (перекус)
            </span>
            <span onClick={() => setTimeMinutes(30)} className="cursor-pointer hover:text-[#0284C7]">
              30 мин (обед)
            </span>
            <span onClick={() => setTimeMinutes(60)} className="cursor-pointer hover:text-[#0284C7]">
              60+ мин (шеф)
            </span>
          </div>
        </div>

        {/* Calories Slider */}
        <div className="bg-[#F8FAFC] p-4.5 rounded-2xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#0F172A] font-heading flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#E4572E]" />
              Калорийность на порцию
            </span>
            <span className="text-sm font-bold font-mono-val text-[#E4572E] bg-[#FFF5F2] px-2.5 py-0.5 rounded-lg border border-[#FECACA]">
              до {maxCalories} ккал
            </span>
          </div>

          <input
            type="range"
            min="200"
            max="1200"
            step="50"
            value={maxCalories}
            onChange={(e) => setMaxCalories(Number(e.target.value))}
            className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#E4572E]"
          />

          <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono-val mt-2">
            <span onClick={() => setMaxCalories(350)} className="cursor-pointer hover:text-[#E4572E]">
              350 ккал (лёгкое)
            </span>
            <span onClick={() => setMaxCalories(600)} className="cursor-pointer hover:text-[#E4572E]">
              600 ккал (баланс)
            </span>
            <span onClick={() => setMaxCalories(1000)} className="cursor-pointer hover:text-[#E4572E]">
              1000+ ккал (сытное)
            </span>
          </div>
        </div>
      </div>

      {/* Dietary Chips */}
      <div className="mb-4">
        <label className="text-xs font-bold text-[#0F172A] font-heading mb-2 block">
          Особые режимы и диета:
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = selectedDiets.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playChime('click');
                  onToggleDiet(opt.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all select-none flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                    : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F1F5F9]'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Дополнительные пожелания: например, «без жарки в масле», «для детей», «в мультиварке»..."
          className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#0284C7] outline-none text-[#1E293B] placeholder:text-[#94A3B8]"
        />
      </div>
    </div>
  );
};
