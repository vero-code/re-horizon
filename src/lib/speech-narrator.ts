import { HorizonNarrative } from "@/types/horizon";

const PREFERRED_MALE_VOICES = [
  "guy",
  "christopher",
  "eric",
  "roger",
  "steffan",
  "david",
  "mark",
  "daniel",
  "george",
  "ryan",
  "male",
];

export class SpeechNarrator {
  private isSpeaking = false;
  private volume = 0.85;
  private lastNarrative: HorizonNarrative | null = null;
  private onStateChange?: (speaking: boolean) => void;

  constructor(onStateChange?: (speaking: boolean) => void) {
    this.onStateChange = onStateChange;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public setVolume(nextVolume: number): void {
    this.volume = Math.max(0.05, Math.min(1.0, nextVolume));
  }

  public speakNarrative(narrative: HorizonNarrative): void {
    if (!this.isSupported()) {
      throw new Error("Speech synthesis is not supported in this browser.");
    }

    this.stop();
    this.lastNarrative = narrative;

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

    const selectedVoice = this.pickCalmMaleVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
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

  private pickCalmMaleVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith("en")
    );

    for (const keyword of PREFERRED_MALE_VOICES) {
      const match = englishVoices.find((v) => {
        const lower = v.name.toLowerCase();
        return lower.includes(keyword) && !lower.includes("female");
      });
      if (match) return match;
    }

    return englishVoices[0];
  }
}