import React, { useState, useEffect } from 'react';
import { Plus, Mic, MicOff, X, Sparkles, AlertCircle } from 'lucide-react';
import { playChime, createSpeechRecognizer } from '../utils/speech';

interface IngredientsTagInputProps {
  manualTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearTags: () => void;
  onBulkAddTags?: (tags: string[]) => void;
}

const POPULAR_SUGGESTIONS = [
  'Яйца',
  'Помидоры',
  'Сыр',
  'Куриное филе',
  'Молоко',
  'Лук',
  'Чеснок',
  'Картофель',
  'Макароны',
  'Рис',
  'Зелень',
  'Сливочное масло',
  'Творог',
  'Грибы',
  'Сметана',
  'Яблоки',
];

export const IngredientsTagInput: React.FC<IngredientsTagInputProps> = ({
  manualTags,
  onAddTag,
  onRemoveTag,
  onClearTags,
  onBulkAddTags,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Support comma-separated batch input: "яйца, помидоры, сыр"
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => onAddTag(p));
    } else {
      onAddTag(trimmed);
    }

    setInputValue('');
    playChime('click');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Toggle Voice Input
  const toggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening) {
      setIsListening(false);
      setSpeechTranscript('');
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setSpeechTranscript(transcript);
        if (isFinal) {
          // Parse spoken ingredients (e.g. "у меня есть три яйца помидоры и сыр пармезан")
          const clean = transcript
            .replace(/у меня есть|добавь|ингредиенты|пожалуйста|в холодильнике есть|у нас есть/gi, '')
            .replace(/\bи\b/gi, ',')
            .trim();

          const parts = clean
            .split(/[,.\s]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 2 && !['есть', 'немного', 'штук', 'грамма', 'грамм'].includes(s.toLowerCase()));

          if (parts.length > 0) {
            parts.forEach((p) => onAddTag(p));
            playChime('success');
          }
        }
      },
      (err) => {
        setSpeechError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer.isSupported) {
      setIsListening(true);
      recognizer.start();
      playChime('click');
    } else {
      recognizer.start(); // Will trigger error callback
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              Ингредиенты тегами и голосом
              <span className="text-[11px] font-mono-val px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                {manualTags.length} тегов
              </span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Введите продукты вручную или надиктуйте голосом в микрофон
            </p>
          </div>
        </div>

        {manualTags.length > 0 && (
          <button
            type="button"
            onClick={() => {
              playChime('click');
              onClearTags();
            }}
            className="text-xs font-semibold text-[#64748B] hover:text-[#B91C1C] transition-colors self-start sm:self-center"
          >
            Очистить все теги
          </button>
        )}
      </div>

      {/* Input Field with Voice Button & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Например: яйца, томаты, сыр моцарелла, курица, лук..."
            className="w-full pl-4 pr-11 py-3 text-sm rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#E4572E] focus:ring-3 focus:ring-[#E4572E]/15 outline-none transition-all placeholder:text-[#94A3B8]"
          />

          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Остановить запись' : 'Голосовой ввод ингредиентов'}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-[#E4572E] text-white live-pulse shadow-md shadow-[#E4572E]/40'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="px-5 py-3 text-sm font-bold rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Voice Status indicator */}
      {isListening && (
        <div className="mt-3 p-3 rounded-2xl bg-[#FFF5F2] border border-[#FECACA] flex items-center justify-between gap-3 text-xs text-[#9C2C0B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4572E] animate-ping" />
            <span className="font-semibold">Слушаю вас...</span>
            <span className="italic text-[#64748B]">
              {speechTranscript || 'назовите продукты, например: «У меня есть 3 яйца, сыр и помидоры»'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsListening(false)}
            className="font-bold text-[#E4572E] hover:underline"
          >
            Готово
          </button>
        </div>
      )}

      {speechError && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#B91C1C] bg-[#FEF2F2] p-2 rounded-xl border border-[#FCA5A5]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Current Active Tags */}
      {manualTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-[#F1F5F9]">
          {manualTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] shadow-2xs group"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => {
                  playChime('click');
                  onRemoveTag(tag);
                }}
                className="text-[#166534]/60 hover:text-[#B91C1C] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Suggestions Chips */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#E4572E]" />
          <span>Быстрые подсказки базовых продуктов:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SUGGESTIONS.map((item) => {
            const alreadyHas = manualTags.some(
              (t) => t.toLowerCase() === item.toLowerCase()
            );
            return (
              <button
                key={item}
                type="button"
                disabled={alreadyHas}
                onClick={() => {
                  onAddTag(item);
                  playChime('click');
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                  alreadyHas
                    ? 'bg-[#F1F5F9] text-[#94A3B8] border-transparent cursor-default'
                    : 'bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:border-[#0284C7] hover:text-[#0284C7] hover:bg-[#F0F9FF]'
                }`}
              >
                + {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
