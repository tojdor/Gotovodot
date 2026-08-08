import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  Clock,
  Play,
  Pause,
} from 'lucide-react';
import { RecipeItem } from '../types';
import { playChime, speakText } from '../utils/speech';

interface LiveCookingModalProps {
  recipe: RecipeItem | null;
  onClose: () => void;
}

export const LiveCookingModal: React.FC<LiveCookingModalProps> = ({ recipe, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(true);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState(false);

  // Live observations and audio
  const [spokenAdvice, setSpokenAdvice] = useState('Привет! Я ваш живой видео-шеф. Направьте камеру на сковороду или доску, и я подскажу каждый шаг!');
  const [observations, setObservations] = useState<string[]>(['Камера активна', 'Ожидаю первый кадр готовки']);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState('Начните с первого шага рецепта');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const autoScanIntervalRef = useRef<any>(null);

  // Start webcam
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (active) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      } catch (err) {
        console.error('Error starting live cooking camera:', err);
        setObservations(['Не удалось включить камеру. Проверьте разрешения браузера.']);
      }
    }

    initCamera();
    speakText(spokenAdvice);

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      clearInterval(autoScanIntervalRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Periodic visual analysis (every 6 seconds if auto-scan is active)
  useEffect(() => {
    if (isAutoAnalyzing) {
      autoScanIntervalRef.current = setInterval(() => {
        analyzeCurrentFrame('Шеф, оцени текущее состояние процесса готовки на видео.');
      }, 7000);
    } else {
      clearInterval(autoScanIntervalRef.current);
    }

    return () => clearInterval(autoScanIntervalRef.current);
  }, [isAutoAnalyzing, currentStepIdx, recipe]);

  // Step Timer
  useEffect(() => {
    let int: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      int = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(int);
            setIsTimerRunning(false);
            playChime('timer');
            speakText('Таймер шага завершен! Проверьте готовность.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(int);
  }, [isTimerRunning, timerSeconds]);

  // Grab snapshot and send to server endpoint
  const analyzeCurrentFrame = async (userQueryText?: string) => {
    if (!videoRef.current || !canvasRef.current || isAnalyzingFrame) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.85);

    setIsAnalyzingFrame(true);

    try {
      const currentStep = recipe?.steps[currentStepIdx];
      const response = await fetch('/api/live-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64,
          userQuery: userQueryText || 'Шеф, оцени степень готовности и правильность шага.',
          currentRecipeTitle: recipe?.title || 'Кулинарное блюдо',
          currentStepIndex: currentStepIdx,
          currentStepInstruction: currentStep?.instruction || 'Подготовка ингредиентов',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioSpokenAdvice) {
          setSpokenAdvice(data.audioSpokenAdvice);
          setObservations(data.visualObservations || ['Процесс под контролем']);
          setSafetyAlert(data.safetyWarning || null);
          setNextAction(data.nextSuggestedAction || 'Продолжайте текущий шаг');

          // Speak advice aloud
          if (isMicActive) {
            setIsSpeaking(true);
            speakText(data.audioSpokenAdvice, {
              onEnd: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false),
            });
          }
        }
      }
    } catch (e) {
      console.warn('Live guidance frame analysis error:', e);
    } finally {
      setIsAnalyzingFrame(false);
    }
  };

  const nextStep = () => {
    if (!recipe) return;
    if (currentStepIdx < recipe.steps.length - 1) {
      playChime('click');
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const step = recipe.steps[nextIdx];
      setTimerSeconds((step.durationMin || 5) * 60);
      setIsTimerRunning(true);
      const prompt = `Переходим к шагу ${nextIdx + 1}: ${step.title}. ${step.instruction}`;
      setSpokenAdvice(prompt);
      speakText(prompt);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      playChime('click');
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentStep = recipe?.steps[currentStepIdx];

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0F172A] text-white w-full max-w-5xl rounded-3xl border border-[#334155] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#1E293B] border-b border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#E4572E] animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                  Live-Шеф: {recipe?.title || 'Готовка в реальном времени'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-val font-semibold bg-[#E4572E]/20 text-[#E4572E] border border-[#E4572E]/40">
                  Gemini Live Vision
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                AI-шеф видит сковороду через камеру и подсказывает голосом
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left: Video Viewfinder & Live Camera */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between bg-black relative">
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-slate-950 flex items-center justify-center border border-white/10 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning visual overlay line */}
              {isAnalyzingFrame && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#E4572E]/10 via-transparent to-[#E4572E]/10 pointer-events-none animate-pulse flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-black/70 text-xs font-mono-val text-[#38BDF8] border border-[#38BDF8]/40">
                    Gemini анализирует кадр...
                  </span>
                </div>
              )}

              {/* Top Viewfinder Overlays */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[11px] font-mono-val text-white/90">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Камера LIVE</span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[11px] font-mono-val text-[#38BDF8]">
                  Шаг {(currentStepIdx || 0) + 1} из {recipe?.steps.length || 1}
                </div>
              </div>

              {/* Safety Alert (if detected) */}
              {safetyAlert && (
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[#B91C1C]/90 text-white text-xs flex items-center gap-2 backdrop-blur-xs border border-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{safetyAlert}</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMicActive(!isMicActive)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isMicActive ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {isMicActive ? <Volume2 className="w-4 h-4 text-[#38BDF8]" /> : <VolumeX className="w-4 h-4" />}
                  <span>{isMicActive ? 'Голос ВКЛ' : 'Голос ВЫКЛ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAutoAnalyzing(!isAutoAnalyzing)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isAutoAnalyzing ? 'bg-[#0284C7]/30 text-[#38BDF8] border border-[#0284C7]/50' : 'bg-white/10 text-white/70'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAutoAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAutoAnalyzing ? 'Авто-скан' : 'Ручной'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  playChime('click');
                  analyzeCurrentFrame('Шеф, посмотри на кадр прямо сейчас!');
                }}
                disabled={isAnalyzingFrame}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#E4572E] hover:bg-[#C8431C] text-white flex items-center gap-2 shadow-lg shadow-[#E4572E]/30 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Оценить кадр</span>
              </button>
            </div>
          </div>

          {/* Right: AI Guidance, Step Controller & Interactive Questions */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-[#1E293B] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#334155]">
            <div>
              {/* Spoken Advice Box */}
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#334155] mb-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E4572E] font-heading">
                    <Sparkles className="w-4 h-4" />
                    <span>Совет живого шефа:</span>
                  </div>
                  {isSpeaking && (
                    <span className="text-[10px] font-mono-val text-[#38BDF8] animate-pulse">
                      Озвучивается...
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-white leading-relaxed">
                  «{spokenAdvice}»
                </p>

                {/* Visual Observations Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {observations.map((obs, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono-val bg-[#334155] text-[#CBD5E1]"
                    >
                      ✓ {obs}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Step Tracker */}
              {currentStep && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold font-mono-val text-[#38BDF8]">
                      Текущий шаг {currentStepIdx + 1} из {recipe?.steps.length}
                    </span>
                    <span className="text-xs font-mono-val text-[#94A3B8]">
                      {currentStep.durationMin || 5} мин
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    {currentStep.title}
                  </h4>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {currentStep.instruction}
                  </p>

                  {/* Step Timer Controller */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#E4572E]" />
                      <span className="text-base font-bold font-mono-val text-white">
                        {formatTimer(timerSeconds)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1"
                      >
                        {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isTimerRunning ? 'Пауза' : 'Старт'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setTimerSeconds((currentStep.durationMin || 5) * 60)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick AI Questions */}
              <div>
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-2 font-heading">
                  Быстрые вопросы шефу:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => analyzeCurrentFrame('Шеф, оцени равномерность нарезки ингредиентов.')}
                    className="p-2 text-left rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-[#E2E8F0] border border-white/10 transition-colors"
                  >
                    🔪 Оцени нарезку
                  </button>
                  <button
                    type="button"
                    onClick={() => analyzeCurrentFrame('Шеф, готова ли сковорода и масло?')}
                    className="p-2 text-left rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-[#E2E8F0] border border-white/10 transition-colors"
                  >
                    🍳 Готово ли масло?
                  </button>
                  <button
                    type="button"
                    onClick={() => analyzeCurrentFrame('Шеф, какая степень прожарки / цвет корочки?')}
                    className="p-2 text-left rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-[#E2E8F0] border border-white/10 transition-colors"
                  >
                    🔥 Проверь корочку
                  </button>
                  <button
                    type="button"
                    onClick={() => analyzeCurrentFrame('Шеф, подскажи лайфхак для этого шага.')}
                    className="p-2 text-left rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-[#E2E8F0] border border-white/10 transition-colors"
                  >
                    💡 Секрет шефа
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation between steps */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#334155] mt-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStepIdx === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </button>

              <button
                type="button"
                onClick={nextStep}
                disabled={!recipe || currentStepIdx >= recipe.steps.length - 1}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E4572E] hover:bg-[#C8431C] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center gap-1.5 shadow-md shadow-[#E4572E]/30"
              >
                <span>Следующий шаг</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
