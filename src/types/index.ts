export type DishCategory =
  | 'Завтраки'
  | 'Супы'
  | 'Салаты'
  | 'Основные'
  | 'Десерты'
  | 'Выпечка';

export interface CategoryOption {
  id: DishCategory;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export interface RecognizedProduct {
  id: string;
  name: string;
  category?: string;
  confidence: number;
  estimatedQuantity?: string;
  selected: boolean;
}

export interface RecipeIngredient {
  name: string;
  amount?: string;
  inKitchen: boolean;
  isOptional: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationMin?: number;
  tip?: string;
}

export interface RecipeItem {
  id: string;
  title: string;
  category: string;
  timeMinutes: number;
  caloriesKcal: number;
  difficulty: 'Легко' | 'Средне' | 'Шеф-уровень';
  servings: number;
  description: string;
  ingredients: RecipeIngredient[];
  missingIngredients: string[];
  steps: RecipeStep[];
  chefTip: string;
  nutrition: {
    protein: string;
    fats: string;
    carbs: string;
  };
  tags: string[];
}

export interface DietaryOption {
  id: string;
  label: string;
  emoji: string;
}

export interface LiveGuidanceState {
  isActive: boolean;
  recipe?: RecipeItem | null;
  currentStepIndex: number;
  lastObservation: string;
  lastSpokenAdvice: string;
  isAnalyzing: boolean;
  safetyWarning?: string;
  nextSuggestedAction?: string;
}
