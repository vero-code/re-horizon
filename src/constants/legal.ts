export interface LegalSection {
  heading: string;
  body: string;
}

export const LEGAL_META = {
  COPYRIGHT: "2026 Re:Horizon.",
  AUTHOR_HANDLE: "Veronika Kashtanova",
  REPO_URL: "https://github.com/vero-code/re-horizon",
} as const;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "1. No Personal Data Collection",
    body: "Re:Horizon does not require user registration, accounts, cookies, or persistent personal profiles. We do not collect or store names, email addresses, IP logs, or device identifiers.",
  },
  {
    heading: "2. How Input Is Processed",
    body: "When you submit a description or select a preset, the text and selected energy level are processed in memory by our server route (/api/horizon) using Google Gemini to extract non-personal aesthetic keywords and public creator or work names.",
  },
  {
    heading: "3. Qloo API Safe Use Compliance",
    body: "Only abstract cultural tags (via /v2/tags) and public entity queries (via /search and /v2/insights) are transmitted to the Qloo API. No personal, medical, or identifying information is ever sent to Qloo.",
  },
  {
    heading: "4. Local Browser Audio and Speech",
    body: "Procedural soundscapes (Web Audio API), voice narration (Web Speech Synthesis), and microphone dictation (Web Speech Recognition) execute directly in your browser session and are not recorded or stored by Re:Horizon.",
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. Open Source License",
    body: "Re:Horizon is open-source software released under the Apache License 2.0. The full source code is publicly available on GitHub.",
  },
  {
    heading: "2. Non-Medical Disclaimer",
    body: "Re:Horizon is a cultural discovery and sensory decompression tool. It is not a medical device and does not provide medical, psychological, or clinical diagnosis, treatment, or advice.",
  },
  {
    heading: "3. Aggregate Cultural Data",
    body: "All recommendations returned by the Qloo Taste Graph represent aggregate cultural correlations across public media domains and do not establish causal claims or individual profiles.",
  },
  {
    heading: "4. Acceptable Use",
    body: "Users agree not to submit personally identifiable or sensitive health information into the prompt field and not to use automated scripts to scrape or abuse the public demo endpoint.",
  },
];