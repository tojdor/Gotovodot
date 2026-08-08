import React from 'react';
import { X, Bookmark, Trash2, Video, Volume2, Clock, Flame, ChevronRight } from 'lucide-react';
import { RecipeItem } from '../types';
import { playChime } from '../utils/speech';

interface SavedRecipesModalProps {
  savedRecipes: RecipeItem[];
  onClose: () => void;
  onRemoveBookmark: (id: string) => void;
  onStartLiveCooking: (recipe: RecipeItem) => void;
}

export const SavedRecipesModal: React.FC<SavedRecipesModalProps> = ({
  savedRecipes,
  onClose,
  onRemoveBookmark,
  onStartLiveCooking,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                Избранные рецепты ({savedRecipes.length})
              </h3>
              <p className="text-xs text-[#64748B]">
                Сохраненные варианты для готовки в любое время
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipes List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {savedRecipes.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <Bookmark className="w-10 h-10 mx-auto mb-2 text-[#CBD5E1]" />
              <p className="text-sm font-semibold text-[#64748B]">
                Вы пока не сохранили ни одного рецепта
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Нажмите на иконку закладки в карточке блюда, чтобы сохранить его сюда
              </p>
            </div>
          ) : (
            savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono-val bg-[#E0F2FE] text-[#0369A1]">
                      {recipe.category}
                    </span>
                    <span className="text-xs text-[#64748B] flex items-center gap-1 font-mono-val">
                      <Clock className="w-3 h-3" /> {recipe.timeMinutes} мин
                    </span>
                    <span className="text-xs text-[#64748B] flex items-center gap-1 font-mono-val">
                      <Flame className="w-3 h-3 text-[#E4572E]" /> {recipe.caloriesKcal} ккал
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#0F172A] font-heading">
                    {recipe.title}
                  </h4>
                  <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                    {recipe.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      playChime('click');
                      onRemoveBookmark(recipe.id);
                    }}
                    className="p-2 rounded-xl text-[#94A3B8] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors"
                    title="Удалить из избранного"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playChime('success');
                      onStartLiveCooking(recipe);
                      onClose();
                    }}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#E4572E] text-white hover:bg-[#C8431C] flex items-center gap-1.5 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Готовить</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
