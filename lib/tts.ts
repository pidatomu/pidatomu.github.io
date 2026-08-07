// ─── Text-to-Speech Utility (Web Speech API) ────────────────────────────────

export interface TTSSpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: string;
}

type BoundaryCallback = (event: SpeechSynthesisEvent) => void;

let boundaryCallback: BoundaryCallback | null = null;

function onBoundaryEvent(event: SpeechSynthesisEvent) {
  boundaryCallback?.(event);
}

export function speak(text: string, options?: TTSSpeakOptions): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  if (options?.rate !== undefined) utterance.rate = options.rate;
  if (options?.pitch !== undefined) utterance.pitch = options.pitch;

  if (options?.voice) {
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.name === options.voice || v.voiceURI === options.voice);
    if (match) utterance.voice = match;
  }

  utterance.onboundary = onBoundaryEvent;
  window.speechSynthesis.speak(utterance);
}

export function stop(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function pause(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.pause();
}

export function resume(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.resume();
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang === "id-ID" || v.lang.startsWith("id"));
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

export function onBoundary(callback: BoundaryCallback | null): void {
  boundaryCallback = callback;
}
