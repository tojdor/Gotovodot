import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  Terminal,
  Copy,
  Check,
  X,
  ExternalLink,
  Wifi,
  Radio,
  Sparkles,
  Camera,
  Volume2,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { playChime } from '../utils/speech';

interface ExpoModalProps {
  onClose: () => void;
  onOpenLiveChef: () => void;
}

export const ExpoModal: React.FC<ExpoModalProps> = ({ onClose, onOpenLiveChef }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'cli' | 'features' | 'config'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [backendPing, setBackendPing] = useState<{ status: 'ok' | 'checking' | 'error'; latencyMs?: number }>({
    status: 'checking',
  });

  // Current web app URL
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-4npn4pzrkwipxw4htcm7bp-347375501272.asia-southeast1.run.app';

  useEffect(() => {
    // Generate QR code for the current URL so phone can scan directly
    QRCode.toDataURL(currentAppUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));

    // Test health check
    const start = performance.now();
    fetch('/api/health')
      .then((r) => r.json())
      .then(() => {
        const latency = Math.round(performance.now() - start);
        setBackendPing({ status: 'ok', latencyMs: latency });
      })
      .catch(() => {
        setBackendPing({ status: 'error' });
      });
  }, [currentAppUrl]);

  const copyToClipboard = (text: string, label: string) => {
    playChime('click');
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E4572E] text-white flex items-center justify-center shadow-md shadow-[#E4572E]/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading">
                  Expo & Мобильное приложение «Готово.»
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4572E] text-white font-mono-val">
                  v1.0 Expo Go
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Запуск на смартфонах Android и iOS через Expo Go или браузер
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-[#E4572E] text-[#E4572E] bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR-код и сканирование</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'cli'
                ? 'border-[#E4572E] text-[#E4572E] bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Команды Expo CLI</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-[#E4572E] text-[#E4572E] bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Возможности на телефоне</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-[#E4572E] text-[#E4572E] bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Файлы проекта /mobile</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Tab 1: QR & Instant Phone Access */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                {/* QR Display */}
                <div className="bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Expo & Web QR Code"
                      className="w-48 h-48 rounded-xl shadow-md bg-white p-2"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#E4572E] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <p className="text-[11px] text-[#64748B] mt-2.5 font-medium">
                    Наведите камеру смартфона или сканер <strong>Expo Go</strong>
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <div className="bg-[#FFF5F2] border border-[#FECACA] rounded-xl p-3">
                    <h4 className="font-bold text-[#991B1B] text-xs flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#E4572E]" />
                      Способ 1: Прямое открытие через браузер/PWA
                    </h4>
                    <p className="text-[11px] text-[#7F1D1D] mt-1 leading-relaxed">
                      Отсканируйте QR-код обычной камерой телефона. Сайт автоматически адаптируется под экран смартфона, предоставит доступ к мобильной камере и микрофону!
                    </p>
                  </div>

                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3">
                    <h4 className="font-bold text-[#166534] text-xs flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#16A34A]" />
                      Способ 2: Нативное приложение Expo Go (React Native)
                    </h4>
                    <p className="text-[11px] text-[#14532D] mt-1 leading-relaxed">
                      В папке <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/mobile</code> создан полноценный React Native проект с <code className="bg-white/80 px-1 py-0.5 rounded font-mono">expo-image-picker</code>, <code className="bg-white/80 px-1 py-0.5 rounded font-mono">expo-speech</code> и <code className="bg-white/80 px-1 py-0.5 rounded font-mono">expo-haptics</code>.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-[#0369A1]" />
                      <span className="text-xs font-semibold text-[#0F172A]">Статус Gemini API:</span>
                    </div>
                    <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full font-mono-val">
                      {backendPing.status === 'ok' ? `🟢 Онлайн (${backendPing.latencyMs} мс)` : '🟡 Проверка...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Copyable Web URL */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="truncate w-full text-left">
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">Прямая ссылка для телефона:</p>
                  <code className="text-xs font-mono text-[#0369A1] font-semibold truncate block">
                    {currentAppUrl}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(currentAppUrl, 'url')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
                >
                  {copiedText === 'url' ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'url' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: CLI Commands */}
          {activeTab === 'cli' && (
            <div className="space-y-3">
              <p className="text-xs text-[#64748B]">
                Вы можете запустить мобильное приложение на своем компьютере или в терминале и открыть его в приложении <strong>Expo Go</strong>:
              </p>

              {/* Command 1: Tunnel Run */}
              <div className="bg-[#0F172A] rounded-2xl p-3.5 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <Terminal className="w-3.5 h-3.5 text-[#E4572E]" />
                    1. Запуск с туннелем (для любых сетей и мобильного интернета):
                  </span>
                  <button
                    onClick={() => copyToClipboard('cd mobile && npx expo start --tunnel', 'cmd1')}
                    className="text-[11px] font-semibold text-[#38BDF8] hover:underline flex items-center gap-1"
                  >
                    {copiedText === 'cmd1' ? <Check className="w-3 h-3 text-[#4ADE80]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'cmd1' ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-[#38BDF8] bg-black/40 p-2.5 rounded-xl overflow-x-auto">
                  cd mobile && npx expo start --tunnel
                </pre>
              </div>

              {/* Command 2: Standard Start */}
              <div className="bg-[#0F172A] rounded-2xl p-3.5 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                    2. Стандартный запуск в локальной Wi-Fi сети:
                  </span>
                  <button
                    onClick={() => copyToClipboard('cd mobile && npm install && npx expo start', 'cmd2')}
                    className="text-[11px] font-semibold text-[#38BDF8] hover:underline flex items-center gap-1"
                  >
                    {copiedText === 'cmd2' ? <Check className="w-3 h-3 text-[#4ADE80]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'cmd2' ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-[#4ADE80] bg-black/40 p-2.5 rounded-xl overflow-x-auto">
                  cd mobile && npm install && npx expo start
                </pre>
              </div>

              {/* Command 3: Android Direct */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 space-y-1.5">
                <h5 className="font-bold text-xs text-[#0F172A]">📱 Скачивание Expo Go на телефон:</h5>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://play.google.com/store/apps/details?id=host.exp.exponent"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] shadow-2xs"
                  >
                    <span>🤖 Скачать для Android (Google Play)</span>
                    <ExternalLink className="w-3 h-3 text-[#64748B]" />
                  </a>

                  <a
                    href="https://apps.apple.com/app/expo-go/id982107779"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] shadow-2xs"
                  >
                    <span>🍎 Скачать для iOS (App Store)</span>
                    <ExternalLink className="w-3 h-3 text-[#64748B]" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Mobile Features */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FECACA] space-y-1.5">
                <div className="flex items-center gap-2 text-[#E4572E] font-bold text-xs">
                  <Camera className="w-4 h-4" />
                  <span>Фото полок холодильника</span>
                </div>
                <p className="text-[11px] text-[#7F1D1D] leading-relaxed">
                  Использует нативную камеру смартфона через <code className="font-mono bg-white/70 px-1 py-0.5 rounded">expo-image-picker</code> и отправляет снимок на Gemini Vision для авто-распознавания.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5">
                <div className="flex items-center gap-2 text-[#16A34A] font-bold text-xs">
                  <Volume2 className="w-4 h-4" />
                  <span>Голосовая пошаговая озвучка</span>
                </div>
                <p className="text-[11px] text-[#14532D] leading-relaxed">
                  Озвучивает рецепты вслух на русском языке через <code className="font-mono bg-white/70 px-1 py-0.5 rounded">expo-speech</code> — удобно, когда руки в муке или масле!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1.5">
                <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>Тактильные вибрации (Haptics)</span>
                </div>
                <p className="text-[11px] text-[#1E3A8A] leading-relaxed">
                  Приятный отклик при переключении категорий и уведомление вибрацией, когда таймер шага подошел к концу (<code className="font-mono bg-white/70 px-1 py-0.5 rounded">expo-haptics</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] space-y-1.5">
                <div className="flex items-center gap-2 text-[#9333EA] font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Синхронизация с Gemini</span>
                </div>
                <p className="text-[11px] text-[#581C87] leading-relaxed">
                  Генерирует 2–4 сбалансированных блюда с учетом времени, калорий, БЖУ и имеющихся продуктов.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Project Structure */}
          {activeTab === 'config' && (
            <div className="space-y-3">
              <p className="text-xs text-[#64748B]">
                Вся кодовая база мобильного клиента готова к запуску в папке <code>/mobile</code>:
              </p>

              <div className="bg-[#0F172A] text-white rounded-2xl p-3.5 font-mono text-xs space-y-1.5">
                <div className="text-[#38BDF8]">📁 mobile/</div>
                <div className="pl-4 text-[#F8FAFC]">├── 📄 App.tsx <span className="text-[#94A3B8]">(полный React Native код с камерой и озвучкой)</span></div>
                <div className="pl-4 text-[#F8FAFC]">├── 📄 package.json <span className="text-[#94A3B8]">(Expo SDK 52, expo-speech, expo-image-picker)</span></div>
                <div className="pl-4 text-[#F8FAFC]">├── 📄 app.json <span className="text-[#94A3B8]">(манифест, разрешения камеры и микрофона)</span></div>
                <div className="pl-4 text-[#F8FAFC]">├── 📄 babel.config.js <span className="text-[#94A3B8]">(пресет Babel)</span></div>
                <div className="pl-4 text-[#F8FAFC]">└── 📄 README.md <span className="text-[#94A3B8]">(пошаговая инструкция на русском)</span></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    playChime('success');
                    onClose();
                    onOpenLiveChef();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E4572E] text-white text-xs font-bold hover:bg-[#C8431C] transition-all flex items-center gap-1.5 shadow-md shadow-[#E4572E]/30"
                >
                  <span>Открыть Live-Шефа в браузере</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Готово к подключению через Wi-Fi или Tunnel</span>
          </div>

          <button
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
