import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// Default backend endpoint (can be adjusted in settings)
const DEFAULT_BACKEND_URL = 'http://172.31.10.52:3000';

interface RecognizedProduct {
  name: string;
  category?: string;
  weightGrams?: number;
  confidence: number;
  isConfirmed: boolean;
}

interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationMin?: number;
  tip?: string;
}

interface RecipeItem {
  id: string;
  title: string;
  category: string;
  timeMinutes: number;
  caloriesKcal: number;
  difficulty: 'Легко' | 'Средне' | 'Шеф-уровень';
  servings: number;
  description: string;
  ingredients: { name: string; amount: string; inKitchen: boolean; isOptional?: boolean }[];
  missingIngredients?: string[];
  steps: RecipeStep[];
  chefTip?: string;
  nutrition?: {
    protein?: string;
    fats?: string;
    carbs?: string;
  };
  tags?: string[];
}

const CATEGORIES = [
  { id: 'Завтраки', label: '🍳 Завтраки', emoji: '🍳' },
  { id: 'Супы', label: '🍲 Супы', emoji: '🍲' },
  { id: 'Салаты', label: '🥗 Салаты', emoji: '🥗' },
  { id: 'Основные блюда', label: '🥩 Основные', emoji: '🥩' },
  { id: 'Десерты', label: '🍰 Десерты', emoji: '🍰' },
  { id: 'Выпечка', label: '🥐 Выпечка', emoji: '🥐' },
];

export default function App() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Photo & AI recognition state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState<RecognizedProduct[]>([]);

  // Category & ingredients state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Завтраки', 'Основные блюда']);
  const [manualIngredients, setManualIngredients] = useState<string[]>(['Яйца', 'Сыр', 'Помидоры']);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [maxTime, setMaxTime] = useState<number>(30);
  const [maxCalories, setMaxCalories] = useState<number>(600);

  // Recipes & Audio state
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [activeVoiceRecipeId, setActiveVoiceRecipeId] = useState<string | null>(null);
  const [currentVoiceStep, setCurrentVoiceStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Check backend health on start
  useEffect(() => {
    checkServerHealth();
  }, [backendUrl]);

  const triggerHaptic = (type: 'light' | 'medium' | 'success') => {
    try {
      if (Platform.OS !== 'web') {
        if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // ignore
    }
  };

  const checkServerHealth = async () => {
    setServerStatus('checking');
    try {
      const res = await fetch(`${backendUrl}/api/health`, { method: 'GET' });
      if (res.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  };

  // 1. Take Photo via Camera
  const handleTakePhoto = async () => {
    triggerHaptic('medium');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Доступ к камере', 'Пожалуйста, разрешите доступ к камере в настройках для съемки холодильника.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      if (asset.base64) {
        analyzeFridgePhoto(asset.base64, 'image/jpeg');
      }
    }
  };

  // 2. Pick Image from Gallery
  const handlePickGallery = async () => {
    triggerHaptic('light');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Доступ к галерее', 'Разрешите доступ к фото для выбора снимка продуктов.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      if (asset.base64) {
        analyzeFridgePhoto(asset.base64, 'image/jpeg');
      }
    }
  };

  // 3. Send photo to Gemini Multimodal Backend
  const analyzeFridgePhoto = async (base64Data: string, mimeType: string) => {
    setIsAnalyzingPhoto(true);
    triggerHaptic('light');
    try {
      const res = await fetch(`${backendUrl}/api/recognize-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setRecognizedItems(data.products);
        triggerHaptic('success');
        Alert.alert('Продукты распознаны!', `Gemini нашел ${data.products.length} ингредиентов в вашем холодильнике.`);
      }
    } catch (err: any) {
      Alert.alert('Ошибка анализа', err?.message || 'Не удалось распознать фото. Проверьте адрес бэкенда.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // 4. Category toggle
  const toggleCategory = (catId: string) => {
    triggerHaptic('light');
    setSelectedCategories((prev) =>
      prev.includes(catId) ? (prev.length > 1 ? prev.filter((c) => c !== catId) : prev) : [...prev, catId]
    );
  };

  // 5. Add manual ingredient
  const handleAddIngredient = () => {
    if (!newIngredientInput.trim()) return;
    triggerHaptic('light');
    const val = newIngredientInput.trim();
    if (!manualIngredients.includes(val)) {
      setManualIngredients((prev) => [...prev, val]);
    }
    setNewIngredientInput('');
  };

  const handleRemoveIngredient = (ing: string) => {
    triggerHaptic('light');
    setManualIngredients((prev) => prev.filter((i) => i !== ing));
  };

  // 6. Generate 2-4 recipes via Gemini API
  const handleGenerateRecipes = async () => {
    const allIngredients = [
      ...manualIngredients,
      ...recognizedItems.filter((p) => p.isConfirmed).map((p) => p.name),
    ];

    if (allIngredients.length === 0) {
      Alert.alert('Нет продуктов', 'Сделайте фото холодильника или добавьте хотя бы 1 продукт вручную.');
      return;
    }

    setIsGenerating(true);
    triggerHaptic('medium');
    try {
      const res = await fetch(`${backendUrl}/api/generate-recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          manualIngredients,
          photoIngredients: recognizedItems.filter((p) => p.isConfirmed),
          maxTimeMinutes: maxTime,
          maxCalories: maxCalories,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      const data = await res.json();
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        triggerHaptic('success');
        Alert.alert('Готово!', `Gemini составил ${data.recipes.length} сбалансированных вариантов блюд.`);
      }
    } catch (err: any) {
      Alert.alert('Ошибка генерации', err?.message || 'Не удалось сгенерировать рецепты.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 7. Speech-to-Text / Text-to-Speech step reading
  const handleSpeakRecipe = (recipe: RecipeItem) => {
    triggerHaptic('light');
    if (isSpeaking && activeVoiceRecipeId === recipe.id) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    Speech.stop();
    setActiveVoiceRecipeId(recipe.id);
    setCurrentVoiceStep(0);
    setIsSpeaking(true);

    const fullSpeechText = `Рецепт: ${recipe.title}. Время: ${recipe.timeMinutes} минут. Калорийность: ${recipe.caloriesKcal} калорий. Ингредиенты: ${recipe.ingredients.map((i) => i.name).join(', ')}. Приступаем к готовке: ` +
      recipe.steps.map((s) => `Шаг ${s.stepNumber}: ${s.title}. ${s.instruction}`).join('. ') +
      (recipe.chefTip ? `. Секрет от шефа: ${recipe.chefTip}` : '');

    Speech.speak(fullSpeechText, {
      language: 'ru-RU',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => {
        setIsSpeaking(false);
        triggerHaptic('success');
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>👨‍🍳</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>
              Готово<Text style={{ color: '#E4572E' }}>.</Text>
            </Text>
            <Text style={styles.brandSubtitle}>AI Кулинар • Expo Mobile</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            triggerHaptic('light');
            setIsSettingsOpen(true);
          }}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: serverStatus === 'online' ? '#10B981' : serverStatus === 'checking' ? '#F59E0B' : '#EF4444' },
            ]}
          />
          <Text style={styles.settingsText}>Настройки</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Multimodal Photo Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardBadge}>ШАГ 1</Text>
            <Text style={styles.cardTitle}>📸 Фото холодильника</Text>
          </View>
          <Text style={styles.cardDesc}>
            Сделайте снимок полок холодильника. Gemini Vision автоматически определит продукты и вес.
          </Text>

          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              {isAnalyzingPhoto && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.loadingOverlayText}>Gemini распознает продукты...</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleTakePhoto}>
              <Text style={styles.primaryButtonText}>📷 Снять на камеру</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePickGallery}>
              <Text style={styles.secondaryButtonText}>🖼️ Из галереи</Text>
            </TouchableOpacity>
          </View>

          {/* Recognized products tags */}
          {recognizedItems.length > 0 && (
            <View style={styles.recognizedBox}>
              <Text style={styles.recognizedTitle}>Распознано в кадре ({recognizedItems.length}):</Text>
              <View style={styles.tagsWrap}>
                {recognizedItems.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      triggerHaptic('light');
                      setRecognizedItems((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, isConfirmed: !p.isConfirmed } : p))
                      );
                    }}
                    style={[
                      styles.productChip,
                      item.isConfirmed ? styles.productChipActive : styles.productChipInactive,
                    ]}
                  >
                    <Text style={item.isConfirmed ? styles.productChipTextActive : styles.productChipTextInactive}>
                      {item.isConfirmed ? '✓ ' : '+ '}
                      {item.name} {item.weightGrams ? `(${item.weightGrams}г)` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Category Magnets */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardBadge}>ШАГ 2</Text>
            <Text style={styles.cardTitle}>🧲 Категории блюд</Text>
          </View>
          <Text style={styles.cardDesc}>Выберите типы блюд, которые хотите приготовить:</Text>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => toggleCategory(cat.id)}
                  style={[styles.categoryCard, isSelected ? styles.categoryCardSelected : null]}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, isSelected ? styles.categoryLabelSelected : null]}>
                    {cat.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Manual Ingredients */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardBadge}>ШАГ 3</Text>
            <Text style={styles.cardTitle}>🏷️ Ваши продукты</Text>
          </View>
          <Text style={styles.cardDesc}>Добавьте специи, крупы или продукты вручную:</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Например: лук, чеснок, масло..."
              placeholderTextColor="#94A3B8"
              value={newIngredientInput}
              onChangeText={setNewIngredientInput}
              onSubmitEditing={handleAddIngredient}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
              <Text style={styles.addButtonText}>Добавить</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsWrap}>
            {manualIngredients.map((ing) => (
              <View key={ing} style={styles.manualTag}>
                <Text style={styles.manualTagText}>{ing}</Text>
                <TouchableOpacity onPress={() => handleRemoveIngredient(ing)}>
                  <Text style={styles.manualTagRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Big Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating ? styles.generateButtonDisabled : null]}
          onPress={handleGenerateRecipes}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <View style={styles.generateLoadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Gemini составляет 2–4 рецепта...</Text>
            </View>
          ) : (
            <Text style={styles.generateButtonText}>✨ Составить меню «Готово.»</Text>
          )}
        </TouchableOpacity>

        {/* Generated Recipes List */}
        {recipes.length > 0 && (
          <View style={styles.recipesSection}>
            <Text style={styles.recipesSectionTitle}>Варианты рецептов ({recipes.length}):</Text>

            {recipes.map((recipe, index) => (
              <View key={recipe.id || index} style={styles.recipeCard}>
                <View style={styles.recipeHeader}>
                  <View style={styles.recipeMetaRow}>
                    <Text style={styles.recipeCategoryTag}>{recipe.category}</Text>
                    <Text style={styles.recipeTimeTag}>⏱️ {recipe.timeMinutes} мин</Text>
                    <Text style={styles.recipeCaloriesTag}>🔥 {recipe.caloriesKcal} ккал</Text>
                  </View>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeDesc}>{recipe.description}</Text>
                </View>

                {/* Nutrition BJU */}
                {recipe.nutrition && (
                  <View style={styles.nutritionRow}>
                    <Text style={styles.nutritionText}>Белки: {recipe.nutrition.protein || '—'}</Text>
                    <Text style={styles.nutritionText}>Жиры: {recipe.nutrition.fats || '—'}</Text>
                    <Text style={styles.nutritionText}>Углеводы: {recipe.nutrition.carbs || '—'}</Text>
                  </View>
                )}

                {/* Ingredients list */}
                <View style={styles.ingredientsBox}>
                  <Text style={styles.ingredientsTitle}>Ингредиенты:</Text>
                  {recipe.ingredients.map((ing, i) => (
                    <Text key={i} style={styles.ingredientLine}>
                      • {ing.name} — <Text style={{ color: '#0369A1' }}>{ing.amount}</Text>
                    </Text>
                  ))}
                  {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                    <Text style={styles.missingIngredientsText}>
                      💡 Можно докупить: {recipe.missingIngredients.join(', ')}
                    </Text>
                  )}
                </View>

                {/* Steps */}
                <View style={styles.stepsBox}>
                  <Text style={styles.stepsTitle}>Пошаговое приготовление:</Text>
                  {recipe.steps.map((st) => (
                    <View key={st.stepNumber} style={styles.stepItem}>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{st.stepNumber}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stepTitleText}>{st.title}</Text>
                        <Text style={styles.stepInstructionText}>{st.instruction}</Text>
                        {st.tip && <Text style={styles.stepTipText}>💡 Совет: {st.tip}</Text>}
                      </View>
                    </View>
                  ))}
                </View>

                {recipe.chefTip && (
                  <View style={styles.chefTipBox}>
                    <Text style={styles.chefTipTitle}>👨‍🍳 Секрет шефа:</Text>
                    <Text style={styles.chefTipText}>{recipe.chefTip}</Text>
                  </View>
                )}

                {/* Voice Action Button */}
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    isSpeaking && activeVoiceRecipeId === recipe.id ? styles.voiceButtonActive : null,
                  ]}
                  onPress={() => handleSpeakRecipe(recipe)}
                >
                  <Text style={styles.voiceButtonText}>
                    {isSpeaking && activeVoiceRecipeId === recipe.id ? '⏹️ Остановить озвучку' : '🔊 Озвучить шаги вслух'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Settings & Backend URL Modal */}
      <Modal visible={isSettingsOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚙️ Настройки Expo & Бэкенда</Text>
            <Text style={styles.modalDesc}>
              Укажите адрес сервера (Cloud Run или локальный IP компьютера в одной Wi-Fi сети):
            </Text>

            <TextInput
              style={styles.modalInput}
              value={backendUrl}
              onChangeText={setBackendUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Статус подключения:</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: serverStatus === 'online' ? '#10B981' : serverStatus === 'checking' ? '#F59E0B' : '#EF4444' },
                ]}
              >
                {serverStatus === 'online' ? '🟢 Подключено к Gemini' : serverStatus === 'checking' ? '🟡 Проверка...' : '🔴 Нет связи'}
              </Text>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setBackendUrl(DEFAULT_BACKEND_URL);
                  checkServerHealth();
                }}
              >
                <Text style={styles.secondaryButtonText}>Сбросить URL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  triggerHaptic('light');
                  checkServerHealth();
                  setIsSettingsOpen(false);
                }}
              >
                <Text style={styles.primaryButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E4572E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  settingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E4572E',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#E4572E',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  recognizedBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  recognizedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  productChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  productChipInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  productChipTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  productChipTextInactive: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCardSelected: {
    backgroundColor: '#FFF5F2',
    borderColor: '#E4572E',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  categoryLabelSelected: {
    color: '#E4572E',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  manualTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  manualTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  manualTagRemove: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  generateButton: {
    backgroundColor: '#E4572E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E4572E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  recipesSection: {
    gap: 16,
    marginTop: 8,
  },
  recipesSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  recipeHeader: {
    gap: 6,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  recipeCategoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E4572E',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recipeTimeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recipeCaloriesTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  recipeDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nutritionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  ingredientsBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  ingredientsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  ingredientLine: {
    fontSize: 12,
    color: '#334155',
  },
  missingIngredientsText: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 4,
    fontStyle: 'italic',
  },
  stepsBox: {
    gap: 10,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepItem: {
    flexDirection: 'row',
    gap: 10,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E4572E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepInstructionText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  stepTipText: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
  },
  chefTipBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    borderRadius: 10,
    gap: 2,
  },
  chefTipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  chefTipText: {
    fontSize: 12,
    color: '#B45309',
  },
  voiceButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  voiceButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
