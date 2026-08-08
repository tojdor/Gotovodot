# 👨‍🍳 «Готово.» — Умный кулинарный AI-ассистент

> Проект разработан для хакатона **Ilmhona × MLH** (Трек: *AI for Everyday Life*).
> «Готово.» помогает пользователю решить, что приготовить из продуктов, имеющихся дома, с помощью мультимодального искусственного интеллекта Gemini.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-black.svg)](https://expo.dev)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.6_Flash_%26_Live-orange.svg)](https://ai.google.dev)

---

## 🌟 5 Ключевых возможностей

1. **📸 Мультимодальное распознавание продуктов (Gemini Vision):**
   - Загрузка фото или снимок камеры холодильника.
   - Автоматическое извлечение названий продуктов, ориентировочного веса и уверенности.
2. **🧲 Умная фильтрация по категориям (Магнитики холодильника):**
   - Выбор категорий: Завтраки, Супы, Салаты, Основные блюда, Десерты, Выпечка.
   - Сгенерированные блюда строго соответствуют выбранным категориям.
3. **✨ Генерация 2–4 разнообразных вариантов блюд:**
   - Несколько сбалансированных опций с временем, калорийностью, БЖУ, списком недостающих продуктов и секретами шефа.
4. **🔊 Голосовое управление и чтение шагов (Text-to-Speech):**
   - Озвучивание пошагового рецепта вслух через Web Speech API и Gemini Audio.
5. **📹 Live-Шеф видео-сопровождение (Gemini Live Vision):**
   - Режим прямого наблюдения за сковородой/доской через камеру.
   - Голосовые подсказки в реальном времени, таймеры шагов и советы по безопасности.

---

## 📱 Мобильная версия (Expo Go / React Native)
В директории `/mobile` находится готовый проект на **React Native & Expo SDK 52**:
- Поддержка съемки холодильника через камеру телефона (`expo-image-picker`);
- Озвучивание шагов вслух (`expo-speech`);
- Тактильные вибрации при завершении таймеров (`expo-haptics`).

---

## 🔒 Безопасность и API-ключи

> **ВАЖНО:** API-ключ Gemini (`GEMINI_API_KEY`) **никогда не передается на клиент** и хранится исключительно на сервере в переменных окружения.

1. Файл `.env` **добавлен в `.gitignore`** и не попадает в публичный репозиторий.
2. В репозитории хранится только шаблон `.env.example`.

---

## 🚀 Быстрый запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/ВАШ_ЛОГИН/gotovo-ai-chef.git
cd gotovo-ai-chef
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта на основе `.env.example`:
```bash
cp .env.example .env
```
Укажите ваш API-ключ Gemini из [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Запуск веб-приложения и сервера
```bash
npm install
npm run dev
```
Откройте в браузере: `http://localhost:3000`

---

### 4. Запуск мобильного приложения на телефоне (Expo Go)
```bash
cd mobile
npm install
npx expo start
```
Отсканируйте появившийся QR-код в приложении **Expo Go** на телефоне (Android / iOS).

---

## 🛠️ Стек технологий
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, Canvas-Confetti, QRCode.
- **Backend:** Node.js, Express, WebSocket (Live streaming), `@google/genai` (Gemini 2.5/3.6 Flash & Live Vision).
- **Mobile:** Expo SDK 52, React Native, `expo-image-picker`, `expo-speech`, `expo-haptics`.
- **Fonts & Design:** Space Grotesk, Inter, IBM Plex Mono, палитра `#F0F4F8`, `#0F172A`, `#E4572E`.

---

## 👥 Команда и Хакатон
Проект создан для участия в **Ilmhona × MLH Hackathon**.
Лицензия: MIT.
