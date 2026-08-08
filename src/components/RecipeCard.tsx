import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  Volume2,
  VolumeX,
  Video,
  Copy,
  Bookmark,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { RecipeItem, RecipeStep } from '../types';
import { playChime, speakText } from '../utils/speech';

interface RecipeCardProps {
  recipe: RecipeItem;
  isBookmarked: boolean;
  onToggleBookmark: (recipe: RecipeItem) => void;
  onStartLiveCooking: (recipe: RecipeItem) => void;
  index: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isBookmarked,
  onToggleBookmark,
  onStartLiveCooking,
  index,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'ingredients' | 'nutrition'>('steps');

  // Step Timer
  const [timerStepIndex, setTimerStepIndex] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playChime('timer');
            speakText(`Время шага ${recipe.steps[timerStepIndex || 0]?.title || ''} вышло! Пора проверить блюдо.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, timerStepIndex, recipe.steps]);

  // Read aloud recipe steps
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setCurrentStepIndex(null);
      return;
    }

    playChime('click');
    setIsSpeaking(true);

    const fullSpeechText = `Рецепт: ${recipe.title}. Категория: ${recipe.category}. Время приготовления: ${recipe.timeMinutes} минут. ${recipe.description}. Лайфхак от шефа: ${recipe.chefTip}. Шаги приготовления: ` +
      recipe.steps.map((s, idx) => `Шаг ${idx + 1}: ${s.title}. ${s.instruction}`).join('. ');

    speakText(fullSpeechText, {
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentStepIndex(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentStepIndex(null);
      },
    });
  };

  // Start step timer
  const startStepTimer = (stepIdx: number, durationMin: number) => {
    playChime('click');
    setTimerStepIndex(stepIdx);
    setTimerSecondsLeft((durationMin || 5) * 60);
    setIsTimerRunning(true);
  };

  const copyToClipboard = () => {
    playChime('click');
    const text = `🍽 ${recipe.title} (${recipe.category})\n⏱ Время: ${recipe.timeMinutes} мин | 🔥 Калории: ${recipe.caloriesKcal} ккал\n\nИнгредиенты:\n${recipe.ingredients.map(i => `- ${i.name} ${i.amount || ''} ${i.inKitchen ? '✓' : '(докупить)'}`).join('\n')}\n\nПошаговый рецепт:\n${recipe.steps.map((s, idx) => `${idx + 1}. ${s.title}: ${s.instruction}`).join('\n')}\n\n💡 Лайфхак от шефа: ${recipe.chefTip}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <article className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
      {/* Top Header info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono-val bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] shadow-2xs">
              {recipe.category}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
              {recipe.difficulty}
            </span>
            <span className="text-[11px] font-mono-val text-[#64748B]">
              Вариант #{index + 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyToClipboard}
              title="Скопировать рецепт"
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#64748B]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                playChime('click');
                onToggleBookmark(recipe);
              }}
              title={isBookmarked ? 'Удалить из избранного' : 'Добавить в избранное'}
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked
                  ? 'bg-[#FEF2F2] text-[#E4572E] hover:bg-[#FEE2E2]'
                  : 'text-[#64748B] hover:text-[#E4572E] hover:bg-[#F8FAFC]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#E4572E]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dish Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-heading leading-tight mb-2">
          {recipe.title}
        </h3>

        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-4">
          {recipe.description}
        </p>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[#0284C7] text-xs font-semibold mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Время</span>
            </div>
            <div className="text-sm font-bold font-mono-val text-[#0F172A]">
              {recipe.timeMinutes} мин
            </div>
          </div>

          <div className="border-x border-[#E2E8F0]">
            <div className="flex items-center justify-center gap-1 text-[#E4572E] text-xs font-semibold mb-0.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Калории</span>
            </div>
            <div className="text-sm font-bold font-mono-val text-[#0F172A]">
              {recipe.caloriesKcal} ккал
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-[#16A34A] text-xs font-semibold mb-0.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Порций</span>
            </div>
            <div className="text-sm font-bold font-mono-val text-[#0F172A]">
              {recipe.servings || 2} чел
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-[#F1F5F9] rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'steps' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Шаги ({recipe.steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'ingredients' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Продукты ({recipe.ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'nutrition' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            БЖУ
          </button>
        </div>

        {/* Tab 1: Step-by-Step Instructions */}
        {activeTab === 'steps' && (
          <div className="space-y-3 mb-4">
            {recipe.steps.map((step, sIdx) => (
              <div
                key={step.stepNumber || sIdx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  currentStepIndex === sIdx
                    ? 'bg-[#E0F2FE] border-[#38BDF8] ring-2 ring-[#0284C7]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white text-[11px] font-bold font-mono-val flex items-center justify-center">
                      {step.stepNumber || sIdx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-[#0F172A] font-heading">
                      {step.title}
                    </h4>
                  </div>

                  {step.durationMin && (
                    <button
                      type="button"
                      onClick={() => startStepTimer(sIdx, step.durationMin || 5)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono-val font-semibold bg-white border border-[#CBD5E1] text-[#0284C7] hover:bg-[#F0F9FF] flex items-center gap-1 shadow-2xs"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {step.durationMin} мин
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#334155] leading-relaxed pl-7">
                  {step.instruction}
                </p>

                {step.tip && (
                  <div className="mt-2 text-[11px] text-[#0369A1] bg-[#F0F9FF] p-2 rounded-xl border border-[#BAE6FD] pl-7 flex items-center gap-1.5">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Ingredients Checklist */}
        {activeTab === 'ingredients' && (
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-1 gap-1.5">
              {recipe.ingredients.map((ing, iIdx) => (
                <div
                  key={iIdx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center ${
                        ing.inKitchen
                          ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
                          : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                      }`}
                    >
                      {ing.inKitchen ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                    </div>
                    <span className={`font-medium ${ing.inKitchen ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                      {ing.name}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono-val text-[#64748B]">
                    {ing.amount || 'по вкусу'}
                  </span>
                </div>
              ))}
            </div>

            {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E]">
                <strong>Можно добавить для идеала:</strong> {recipe.missingIngredients.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Nutrition Macros */}
        {activeTab === 'nutrition' && (
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4">
            <h5 className="text-xs font-bold text-[#0F172A] font-heading mb-2">
              Пищевая ценность (на 1 порцию):
            </h5>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-mono-val">Белки</div>
                <div className="font-bold text-[#0284C7] mt-0.5">{recipe.nutrition.protein}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-mono-val">Жиры</div>
                <div className="font-bold text-[#E4572E] mt-0.5">{recipe.nutrition.fats}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] font-mono-val">Углеводы</div>
                <div className="font-bold text-[#16A34A] mt-0.5">{recipe.nutrition.carbs}</div>
              </div>
            </div>
          </div>
        )}

        {/* Chef's Secret Tip */}
        <div className="p-3 rounded-2xl bg-[#FFF5F2] border border-[#FECACA] mb-4 text-xs text-[#9C2C0B] flex items-start gap-2 shadow-2xs">
          <ChefHat className="w-4 h-4 text-[#E4572E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#E4572E]">Секрет от шефа:</strong> {recipe.chefTip}
          </p>
        </div>

        {/* Step Timer Banner (if active) */}
        {isTimerRunning && (
          <div className="p-3 rounded-2xl bg-[#0F172A] text-white mb-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#38BDF8] animate-spin" />
              <div>
                <div className="text-[10px] text-white/70 font-mono-val">Таймер шага #{timerStepIndex! + 1}</div>
                <div className="text-lg font-bold font-mono-val text-white">{formatTimer(timerSecondsLeft)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsTimerRunning(false)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white"
              >
                Стоп
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Voice Readout + Live Cooking Assistant */}
      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#F1F5F9]">
        <button
          type="button"
          onClick={toggleSpeech}
          className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition-all flex items-center justify-center gap-1.5 ${
            isSpeaking
              ? 'bg-[#E0F2FE] text-[#0369A1] border-[#38BDF8] live-pulse'
              : 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[#0284C7]" /> : <Volume2 className="w-3.5 h-3.5 text-[#0284C7]" />}
          <span>{isSpeaking ? 'Остановить голос' : 'Озвучить шаги'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playChime('success');
            onStartLiveCooking(recipe);
          }}
          className="py-2.5 px-3 text-xs font-bold rounded-2xl bg-[#E4572E] hover:bg-[#C8431C] text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#E4572E]/25 active:scale-95"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Live-Шеф режим</span>
        </button>
      </div>
    </article>
  );
};
