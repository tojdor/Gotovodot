// Speech Synthesis and Audio Utilities for Gotovo Assistant

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle pleasant sound effects using Web Audio synth
export function playChime(type: 'success' | 'timer' | 'click' | 'alert' = 'click') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'timer') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Ignore audio context errors if not permitted
  }
}

// Speak text using Web Speech API with fallback
export function speakText(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    rate?: number;
    pitch?: number;
  }
): { stop: () => void } {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    options?.onEnd?.();
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = options?.rate || 1.05;
  utterance.pitch = options?.pitch || 1.0;

  // Try to pick the best natural Russian voice
  const voices = window.speechSynthesis.getVoices();
  //const ruVoice = voices.find(v => v.lang.startsWith('ru') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Yuri') || v.name.includes('Milena'))) ||
  //  voices.find(v => v.lang.startsWith('ru'));
  const ruVoice = voices.find(v => v.lang.startsWith('ru') && v.name.includes('Milena'))
  || voices.find(v => v.lang.startsWith('ru') && /female/i.test(v.name));
  if (ruVoice) {
    utterance.voice = ruVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech error:', e);
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
    },
  };
}

// Speech Recognition helper
export function createSpeechRecognizer(
  onResult: (text: string, isFinal: boolean) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: () => {
        onError?.('Голосовой ввод не поддерживается браузером. Используйте Chrome, Safari или Edge.');
      },
      stop: () => {},
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError?.(event.error === 'not-allowed' ? 'Разрешите доступ к микрофону для голосового ввода.' : event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  return {
    isSupported: true,
    start: () => {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition already started or error:', e);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    },
  };
}
