import {
  EXCLUDED_FEMALE_VOICES,
  PREFERRED_MALE_VOICES,
} from "@/constants/horizon";
import { HorizonNarrative } from "@/types/horizon";

export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
}

export class SpeechNarrator {
  private isSpeaking = false;
  private volume = 0.85;
  private onStateChange?: (speaking: boolean) => void;
  private onVoicesLoaded?: (voices: VoiceOption[], defaultUri: string) => void;

  constructor(
    onStateChange?: (speaking: boolean) => void,
    onVoicesLoaded?: (voices: VoiceOption[], defaultUri: string) => void
  ) {
    this.onStateChange = onStateChange;
    this.onVoicesLoaded = onVoicesLoaded;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.emitVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.emitVoices();
      };
    }
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public setVolume(nextVolume: number): void {
    this.volume = Math.max(0.05, Math.min(1.0, nextVolume));
  }

  public speakNarrative(
    narrative: HorizonNarrative,
    selectedVoiceUri?: string
  ): void {
    if (!this.isSupported()) {
      throw new Error("Speech synthesis is not supported in this browser.");
    }

    this.stop();

    const fullText = [
      narrative.title,
      ...narrative.paragraphs,
      narrative.culturalBridge,
    ].join(". ");

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 0.86;
    utterance.volume = this.volume;

    const allVoices = window.speechSynthesis.getVoices();
    const matchedVoice =
      allVoices.find((v) => v.voiceURI === selectedVoiceUri) ||
      this.pickDefaultMaleVoice(allVoices);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChange?.(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  private emitVoices(): void {
    if (!this.isSupported()) return;
    const rawVoices = window.speechSynthesis.getVoices();
    if (rawVoices.length === 0) return;

    const maleEnglishVoices = this.filterMaleEnglishVoices(rawVoices);
    const defaultVoice = this.pickDefaultMaleVoice(rawVoices);

    const options: VoiceOption[] = maleEnglishVoices.map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name.replace(/Microsoft |Google /g, ""),
      lang: v.lang,
    }));

    this.onVoicesLoaded?.(options, defaultVoice?.voiceURI || "");
  }

  private filterMaleEnglishVoices(
    voices: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice[] {
    const english = voices.filter((v) =>
      v.lang.toLowerCase().startsWith("en")
    );

    const filtered = english.filter((v) => {
      const lower = v.name.toLowerCase();
      return !EXCLUDED_FEMALE_VOICES.some((fem) => lower.includes(fem));
    });

    return filtered.length > 0 ? filtered : english;
  }

  private pickDefaultMaleVoice(
    voices: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | undefined {
    const candidates = this.filterMaleEnglishVoices(voices);

    for (const keyword of PREFERRED_MALE_VOICES) {
      const match = candidates.find((v) =>
        v.name.toLowerCase().includes(keyword)
      );
      if (match) return match;
    }

    return candidates[0];
  }
}