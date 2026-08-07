"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";

interface VoicePreviewProps {
  text: string;
}

const INDONESIAN_VOICES = [
  { id: "id-ID-ArdiNeural", name: "Ardi (Laki-laki)" },
  { id: "id-ID-GadisNeural", name: "Gadis (Perempuan)" },
];

export default function VoicePreview({ text }: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voiceId, setVoiceId] = useState(INDONESIAN_VOICES[0].id);
  const [progress, setProgress] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) setIsSupported(false);
  }, []);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const words = text.split(/\s+/);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const speak = () => {
    const synth = synthRef.current;
    if (!synth || !text) return;

    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    utter.rate = speed;

    const allVoices = synth.getVoices();
    const selectedVoice = allVoices.find((v) => v.name.includes(voiceId.split("-").pop() || "Ardi"));
    if (selectedVoice) utter.voice = selectedVoice;

    utter.onboundary = (event) => {
      if (event.name === "word") {
        const charIndex = event.charIndex;
        let count = 0;
        for (let i = 0; i < words.length; i++) {
          count += words[i].length + 1;
          if (charIndex < count) {
            setHighlightedWord(i);
            break;
          }
        }
        setProgress((charIndex / text.length) * 100);
      }
    };

    utter.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setHighlightedWord(words.length - 1);
    };

    utteranceRef.current = utter;
    synth.speak(utter);
    setIsPlaying(true);
  };

  const pause = () => {
    synthRef.current?.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    synthRef.current?.resume();
    setIsPlaying(true);
  };

  const stop = () => {
    synthRef.current?.cancel();
    setIsPlaying(false);
    setProgress(0);
    setHighlightedWord(-1);
  };

  const togglePlay = () => {
    if (!isSupported) return;
    if (isPlaying) {
      pause();
    } else if (progress > 0 && progress < 100) {
      resume();
    } else {
      speak();
    }
  };

  if (!text) {
    return (
      <div className="brutal-card p-4">
        <p className="text-sm opacity-60">Masukkan teks untuk mendengarkan preview.</p>
      </div>
    );
  }

  return (
    <div className="brutal-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          disabled={!isSupported}
          className="brutal-btn p-2"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={stop} className="brutal-btn p-2" title="Stop">
          <Square size={18} />
        </button>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs font-mono">{speed}x</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 accent-black"
          />
        </div>

        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="brutal-select text-xs ml-auto"
        >
          {INDONESIAN_VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full bg-gray-200 border-2 border-black h-3 rounded-sm overflow-hidden">
        <div
          className="bg-yellow-400 h-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-sm leading-relaxed font-mono">
        {words.map((word, i) => (
          <span
            key={i}
            className={`transition-colors duration-100 ${
              i === highlightedWord
                ? "bg-yellow-300 font-bold"
                : i < highlightedWord
                ? "text-green-600"
                : ""
            }`}
          >
            {word}{" "}
          </span>
        ))}
      </div>

      {!isSupported && (
        <p className="text-xs text-red-600 font-bold">
          Browser Anda tidak mendukung Text-to-Speech.
        </p>
      )}
    </div>
  );
}
