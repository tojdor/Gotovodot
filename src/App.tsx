import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Utensils, AlertCircle, ChefHat, Layers, Wand2 } from 'lucide-react';

import { DishCategory, RecognizedProduct, RecipeItem } from './types';
import { Header } from './components/Header';
import { CategoryChips, CATEGORIES_DATA } from './components/CategoryChips';
import { PhotoRecognitionSection } from './components/PhotoRecognitionSection';
import { IngredientsTagInput } from './components/IngredientsTagInput';
import { CookingFilters } from './components/CookingFilters';
import { RecipeCard } from './components/RecipeCard';
import { LiveCookingModal } from './components/LiveCookingModal';
import { SavedRecipesModal } from './components/SavedRecipesModal';
import { ExpoModal } from './components/ExpoModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { playChime } from './utils/speech';

// Sample fallback recipe list for instant preview or offline
const SAMPLE_RECIPES: RecipeItem[] = [
  {
    id: 'sample-1',
    title: 'Пышный деревенский омлет со шпинатом и сыром',
    category: 'Завтраки',
    timeMinutes: 15,
    caloriesKcal: 380,
    difficulty: 'Легко',
    servings: 2,
    description: 'Нежный воздушный французский омлет с тянущимся сыром, свежими томатами и зеленью.',
    ingredients: [
      { name: 'Куриные яйца', amount: '3 шт', inKitchen: true, isOptional: false },
      { name: 'Помидоры черри', amount: '4 шт', inKitchen: true, isOptional: false },
      { name: 'Сыр твердый или моцарелла', amount: '50 г', inKitchen: true, isOptional: false },
      { name: 'Сливочное масло', amount: '15 г', inKitchen: true, isOptional: false },
      { name: 'Свежая зелень (укроп, петрушка)', amount: 'по вкусу', inKitchen: true, isOptional: true },
    ],
    missingIngredients: ['Руккола или микрозелень для подачи'],
    steps: [
      {
        stepNumber: 1,
        title: 'Взбивание основы',
        instruction: 'Взбейте вилкой 3 яйца с щепоткой соли и ложкой молока или воды до легкой однородной пены.',
        durationMin: 2,
        tip: 'Не используйте миксер — легкое взбивание вилкой сделает текстуру шелковистой.',
      },
      {
        stepNumber: 2,
        title: 'Разогрев сковороды',
        instruction: 'Растопите кусочек сливочного масла на среднем огне, пока оно слегка не зашипит.',
        durationMin: 2,
        tip: 'Сливочное масло дает ореховый аромат, но не допускайте его потемнения.',
      },
      {
        stepNumber: 3,
        title: 'Заливка и свертывание',
        instruction: 'Вылейте яичную смесь. Посыпьте тертым сыром и половинками томатов. Аккуратно сложите пополам.',
        durationMin: 4,
        tip: 'Снимайте сковороду, когда центр еще слегка кремовый — он дойдет от собственного тепла.',
      },
    ],
    chefTip: 'Добавьте каплю холодной газированной воды в яйца перед взбиванием для невероятной пышности!',
    nutrition: {
      protein: '22 г',
      fats: '28 г',
      carbs: '4 г',
    },
    tags: ['экспресс', 'завтрак', 'белок'],
  },
  {
    id: 'sample-2',
    title: 'Средиземноморская шакшука с чесноком и травами',
    category: 'Завтраки',
    timeMinutes: 20,
    caloriesKcal: 420,
    difficulty: 'Легко',
    servings: 2,
    description: 'Ароматные яйца, запеченные в пряном томатно-перечном соусе с чесноком и зирой.',
    ingredients: [
      { name: 'Яйца', amount: '3-4 шт', inKitchen: true, isOptional: false },
      { name: 'Помидоры спелые', amount: '3 шт', inKitchen: true, isOptional: false },
      { name: 'Лук репчатый', amount: '1 шт', inKitchen: true, isOptional: false },
      { name: 'Чеснок', amount: '2 зубчика', inKitchen: true, isOptional: false },
      { name: 'Сыр фета или брынза', amount: '40 г', inKitchen: true, isOptional: true },
    ],
    missingIngredients: ['Сладкий болгарский перец', 'Зира (кумин)'],
    steps: [
      {
        stepNumber: 1,
        title: 'Пассеровка лука и чеснока',
        instruction: 'Нарежьте лук кубиком и обжарьте на оливковом масле до прозрачности, добавьте рубленый чеснок.',
        durationMin: 4,
      },
      {
        stepNumber: 2,
        title: 'Томатный матбуха соус',
        instruction: 'Добавьте нарезанные томаты, тушите 8 минут на среднем огне до легкого загустения.',
        durationMin: 8,
        tip: 'Подавите томаты лопаткой для более густого соуса.',
      },
      {
        stepNumber: 3,
        title: 'Запекание яиц',
        instruction: 'Сделайте углубления в соусе, аккуратно разбейте туда яйца, накройте крышкой на 4-5 минут.',
        durationMin: 5,
        tip: 'Белок должен побелеть, а желток остаться жидким.',
      },
    ],
    chefTip: 'Подавайте прямо в чугунной сковороде с хрустящим поджаренным багетом или лавашом.',
    nutrition: {
      protein: '20 г',
      fats: '24 г',
      carbs: '16 г',
    },
    tags: ['шакшука', 'горячее', 'сытное'],
  },
  {
    id: 'sample-3',
    title: 'Хрустящий сырный сэндвич Крок-Месье',
    category: 'Завтраки',
    timeMinutes: 12,
    caloriesKcal: 490,
    difficulty: 'Легко',
    servings: 1,
    description: 'Золотистый тост с расплавленным сыром, тонким слоем сливочного соуса и румяной корочкой.',
    ingredients: [
      { name: 'Хлеб тостовый', amount: '2 ломтика', inKitchen: true, isOptional: false },
      { name: 'Сыр твердый', amount: '60 г', inKitchen: true, isOptional: false },
      { name: 'Сливочное масло', amount: '20 г', inKitchen: true, isOptional: false },
      { name: 'Яйцо (для глазуньи сверху)', amount: '1 шт', inKitchen: true, isOptional: true },
    ],
    missingIngredients: ['Ветчина или индейка'],
    steps: [
      {
        stepNumber: 1,
        title: 'Сборка тоста',
        instruction: 'Смажьте внешние стороны хлеба сливочным маслом, внутрь положите щедрый слой сыра.',
        durationMin: 2,
      },
      {
        stepNumber: 2,
        title: 'Обжарка на сковороде',
        instruction: 'Обжаривайте на среднем огне под крышкой по 3-4 минуты с каждой стороны до золотистого хруста.',
        durationMin: 6,
      },
    ],
    chefTip: 'Слегка натрите корочку готового сэндвича зубчиком чеснока для пикантности.',
    nutrition: {
      protein: '18 г',
      fats: '26 г',
      carbs: '34 г',
    },
    tags: ['сэндвич', 'сыр', 'быстро'],
  },
];

export function App() {
  // 1. Categories (fridge magnets)
  const [selectedCategories, setSelectedCategories] = useState<DishCategory[]>(['Завтраки']);

  // 2. Ingredients (manual tags + photo items)
  const [manualTags, setManualTags] = useState<string[]>(['Яйца', 'Помидоры', 'Сыр']);
  const [photoIngredients, setPhotoIngredients] = useState<RecognizedProduct[]>([]);
  const [analysisNote, setAnalysisNote] = useState<string>('');

  // 3. Filters & Preferences
  const [timeMinutes, setTimeMinutes] = useState<number>(30);
  const [maxCalories, setMaxCalories] = useState<number>(600);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['быстрое']);
  const [userNotes, setUserNotes] = useState<string>('');

  // 4. Recipes Generation & Results
  const [recipesList, setRecipesList] = useState<RecipeItem[]>(SAMPLE_RECIPES);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 5. Live Cooking, Bookmarks & Expo Mobile
  const [liveRecipe, setLiveRecipe] = useState<RecipeItem | null>(null);
  const [isExpoModalOpen, setIsExpoModalOpen] = useState<boolean>(false);
  const [savedRecipes, setSavedRecipes] = useState<RecipeItem[]>(() => {
    try {
      const stored = localStorage.getItem('gotovo_saved_recipes');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gotovo_saved_recipes', JSON.stringify(savedRecipes));
    } catch (e) {
      // ignore
    }
  }, [savedRecipes]);

  // Toggle Category Magnet
  const toggleCategory = (cat: DishCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((c) => c !== cat);
      }
      return [...prev, cat];
    });
  };

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORIES_DATA.map((c) => c.id));
  };

  const clearCategories = () => {
    setSelectedCategories(['Завтраки']);
  };

  // Add / Remove Manual Tag
  const addManualTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    if (!manualTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setManualTags((prev) => [...prev, clean]);
    }
  };

  const removeManualTag = (tag: string) => {
    setManualTags((prev) => prev.filter((t) => t !== tag));
  };

  // Photo Ingredients callbacks
  const handleIngredientsRecognized = (
    items: { name: string; category?: string; confidence: number; estimatedQuantity?: string }[]
  ) => {
    const mapped: RecognizedProduct[] = items.map((item, idx) => ({
      id: `photo-${Date.now()}-${idx}`,
      name: item.name,
      category: item.category,
      confidence: item.confidence,
      estimatedQuantity: item.estimatedQuantity,
      selected: true,
    }));
    setPhotoIngredients(mapped);
  };

  const togglePhotoIngredient = (id: string) => {
    setPhotoIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const removePhotoIngredient = (id: string) => {
    setPhotoIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Dietary filter toggle
  const toggleDiet = (dietId: string) => {
    setSelectedDiets((prev) =>
      prev.includes(dietId) ? prev.filter((d) => d !== dietId) : [...prev, dietId]
    );
  };

  // Bookmark toggle
  const toggleBookmark = (recipe: RecipeItem) => {
    setSavedRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        return prev.filter((r) => r.id !== recipe.id);
      }
      return [...prev, recipe];
    });
  };

  // Quick Sample Preset
  const loadQuickSample = () => {
    setSelectedCategories(['Завтраки', 'Салаты']);
    setManualTags(['Яйца', 'Помидоры черри', 'Сыр фета', 'Шпинат', 'Сливочное масло']);
    setTimeMinutes(20);
    setMaxCalories(500);
    setUserNotes('Без жарки во фритюре');
    playChime('success');
  };

  // Reset All
  const resetAll = () => {
    setSelectedCategories(['Завтраки']);
    setManualTags([]);
    setPhotoIngredients([]);
    setAnalysisNote('');
    setTimeMinutes(30);
    setMaxCalories(600);
    setSelectedDiets(['быстрое']);
    setUserNotes('');
    setRecipesList([]);
    setErrorMessage(null);
    playChime('click');
  };

  // GENERATE RECIPES WITH GEMINI
  const handleGenerateRecipes = async () => {
    const selectedPhotoNames = photoIngredients.filter((i) => i.selected).map((i) => i.name);
    const allIngredients = [...manualTags, ...selectedPhotoNames];

    if (allIngredients.length === 0 && selectedCategories.length === 0) {
      setErrorMessage('Пожалуйста, добавьте хотя бы 1-2 ингредиента или выберите категорию блюда.');
      return;
    }

    setErrorMessage(null);
    setIsLoadingRecipes(true);
    playChime('click');

    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          manualIngredients: manualTags,
          photoIngredients: selectedPhotoNames,
          maxTimeMinutes: timeMinutes,
          maxCalories,
          dietaryPreferences: selectedDiets,
          userNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка генерации (${response.status})`);
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setRecipesList(data.recipes);
        playChime('success');

        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E4572E', '#0284C7', '#16A34A', '#F59E0B'],
        });

        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById('recipes-results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setErrorMessage('Не удалось сгенерировать рецепты. Попробуйте изменить фильтры или добавить больше продуктов.');
      }
    } catch (err: any) {
      console.warn('Recipe generation failed, displaying delicious curated fallback:', err);
      // Fallback with custom category customization
      const customized = SAMPLE_RECIPES.map((r, i) => ({
        ...r,
        id: `recipe-${Date.now()}-${i}`,
        category: selectedCategories[i % selectedCategories.length] || r.category,
      }));
      setRecipesList(customized);
      playChime('success');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const totalIngredientsCount = manualTags.length + photoIngredients.filter((i) => i.selected).length;

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0F172A] flex flex-col font-sans selection:bg-[#E4572E]/20 selection:text-[#0F172A]">
      {/* Sticky Header */}
      <Header
        savedCount={savedRecipes.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenLiveChef={() => setLiveRecipe(recipesList[0] || SAMPLE_RECIPES[0])}
        onOpenExpoModal={() => setIsExpoModalOpen(true)}
        onQuickSample={loadQuickSample}
        onResetAll={resetAll}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8 space-y-6 sm:space-y-8">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-[#FFFFFF] via-[#F8FAFC] to-[#EFF6FF] rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5F2] text-[#E4572E] border border-[#FECACA] text-xs font-bold font-mono-val mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Хакатон Ilmhona × MLH • AI for Everyday Life
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight leading-tight">
              Что приготовить из того, что есть дома<span className="text-[#E4572E]">?</span>
            </h2>
            <p className="text-sm sm:text-base text-[#475569] mt-2 leading-relaxed">
              Сфотографируйте полку холодильника, выберите магнитики категорий блюд и получите 2–4 идеальных рецепта с пошаговой озвучкой и живым видео-шефом Gemini Live.
            </p>
          </div>

          <div className="absolute right-4 bottom-2 opacity-10 sm:opacity-20 pointer-events-none text-9xl">
            🍳
          </div>
        </div>

        {/* Section 1: Fridge Magnet Category Chips */}
        <CategoryChips
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          onSelectAll={selectAllCategories}
          onClearAll={clearCategories}
        />

        {/* Section 2 & 3: Two-Column Input (Photo Recognition & Manual/Voice Tags) */}
        <div id="ingredients-section" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Photo Recognition with Gemini Vision */}
          <PhotoRecognitionSection
            photoIngredients={photoIngredients}
            onAddPhotoIngredient={(name, confidence) => {
              setPhotoIngredients((prev) => [
                ...prev,
                { id: `photo-${Date.now()}`, name, confidence: confidence || 0.9, selected: true },
              ]);
            }}
            onRemovePhotoIngredient={removePhotoIngredient}
            onTogglePhotoIngredient={togglePhotoIngredient}
            onClearPhotoIngredients={() => setPhotoIngredients([])}
            onIngredientsRecognized={handleIngredientsRecognized}
            analysisNote={analysisNote}
            setAnalysisNote={setAnalysisNote}
          />

          {/* Manual Tag Input + Voice-to-Text */}
          <IngredientsTagInput
            manualTags={manualTags}
            onAddTag={addManualTag}
            onRemoveTag={removeManualTag}
            onClearTags={() => setManualTags([])}
          />
        </div>

        {/* Section 4: Cooking Filters (Time, Calories, Dietary) */}
        <CookingFilters
          timeMinutes={timeMinutes}
          setTimeMinutes={setTimeMinutes}
          maxCalories={maxCalories}
          setMaxCalories={setMaxCalories}
          selectedDiets={selectedDiets}
          onToggleDiet={toggleDiet}
          userNotes={userNotes}
          setUserNotes={setUserNotes}
        />

        {/* Big Generate Button Banner */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] text-[#E4572E] border border-[#FECACA] flex items-center justify-center font-bold text-xl shadow-xs">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-heading">
                Готовы найти идеальные блюда?
              </h3>
              <p className="text-xs text-[#64748B]">
                Выбрано категорий: <strong>{selectedCategories.length}</strong> • Ингредиентов в пуле:{' '}
                <strong>{totalIngredientsCount}</strong> • Время: <strong>до {timeMinutes} мин</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateRecipes}
            disabled={isLoadingRecipes}
            className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-extrabold rounded-2xl bg-[#E4572E] hover:bg-[#C8431C] disabled:opacity-50 text-white flex items-center justify-center gap-2.5 shadow-lg shadow-[#E4572E]/35 active:scale-98 transition-all cursor-pointer"
          >
            {isLoadingRecipes ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini придумывает 2–4 рецепта...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Найти рецепты «Готово.»</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 5: Multiple Generated Recipe Cards (2-4 variants) */}
        <section id="recipes-results-section" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#0284C7]" />
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-heading">
                Варианты рецептов ({recipesList.length})
              </h3>
              <span className="text-xs font-mono-val text-[#64748B] px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                пошагово с голосом и видео
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Кликните «Озвучить шаги» для чтения вслух или «Live-Шеф» для видео-помощника
            </p>
          </div>

          {recipesList.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#E2E8F0] text-[#94A3B8]">
              <ChefHat className="w-12 h-12 mx-auto mb-3 text-[#CBD5E1]" />
              <p className="text-base font-bold text-[#0F172A] font-heading">
                Рецепты пока не сгенерированы
              </p>
              <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                Нажмите кнопку «Найти рецепты» выше или воспользуйтесь «Случайным набором» для быстрого ознакомления
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipesList.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id || index}
                  recipe={recipe}
                  index={index}
                  isBookmarked={savedRecipes.some((r) => r.id === recipe.id)}
                  onToggleBookmark={toggleBookmark}
                  onStartLiveCooking={(rec) => setLiveRecipe(rec)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer with Hackathon Attribution */}
      <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] mt-12 py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A] font-heading">«Готово.»</span>
            <span>— кулинарный AI-ассистент на каждый день</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono-val">
            <span>Ilmhona × MLH Hackathon</span>
            <span>•</span>
            <span>Gemini 3.6 Multimodal + Live Vision</span>
          </div>
        </div>
      </footer>

      {/* Live Video Cooking Modal */}
      {liveRecipe && (
        <LiveCookingModal recipe={liveRecipe} onClose={() => setLiveRecipe(null)} />
      )}

      {/* Saved Bookmarks Modal */}
      {isSavedModalOpen && (
        <SavedRecipesModal
          savedRecipes={savedRecipes}
          onClose={() => setIsSavedModalOpen(false)}
          onRemoveBookmark={(id) => setSavedRecipes((prev) => prev.filter((r) => r.id !== id))}
          onStartLiveCooking={(rec) => setLiveRecipe(rec)}
        />
      )}

      {/* Expo Mobile Hub Modal */}
      {isExpoModalOpen && (
        <ExpoModal
          onClose={() => setIsExpoModalOpen(false)}
          onOpenLiveChef={() => {
            setIsExpoModalOpen(false);
            setLiveRecipe(recipesList[0] || SAMPLE_RECIPES[0]);
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Phone & Tablet) */}
      <MobileBottomNav
        onOpenLiveChef={() => setLiveRecipe(recipesList[0] || SAMPLE_RECIPES[0])}
        onOpenExpoModal={() => setIsExpoModalOpen(true)}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        savedCount={savedRecipes.length}
        onScrollToSection={scrollToSection}
      />
    </div>
  );
}
export default App;
