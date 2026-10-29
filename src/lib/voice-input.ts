interface BrowserSpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export class VoiceInputRecognizer {
  private recognition: BrowserSpeechRecognition | null = null;
  private isListening = false;
  private onTranscript: (text: string) => void;
  private onStateChange: (listening: boolean) => void;
  private onError: (message: string) => void;

  constructor(options: {
    onTranscript: (text: string) => void;
    onStateChange: (listening: boolean) => void;
    onError: (message: string) => void;
  }) {
    this.onTranscript = options.onTranscript;
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
  }

  public isSupported(): boolean {
    return getSpeechRecognitionCtor() !== null;
  }

  public start(): void {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      this.onError(
        "Voice recognition is not supported in this browser. Use Chrome or Edge, or type manually."
      );
      return;
    }

    this.stop();

    const instance = new Ctor();
    instance.lang = "en-US";
    instance.interimResults = true;
    instance.continuous = true;

    instance.onstart = () => {
      this.isListening = true;
      this.onStateChange(true);
    };

    instance.onresult = (event: BrowserSpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        this.onTranscript(transcript.trim());
      }
    };

    instance.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
      this.isListening = false;
      this.onStateChange(false);
      this.onError(`Microphone error: ${event.error}`);
    };

    instance.onend = () => {
      this.isListening = false;
      this.onStateChange(false);
    };

    this.recognition = instance;
    instance.start();
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    this.onStateChange(false);
  }
}