import type { FormStyle } from "./types";

/** Full list of free Google Fonts available in the form editor. */
export const GOOGLE_FONTS = [
  // Modernas / clean
  "Inter",
  "DM Sans",
  "Space Grotesk",
  "Outfit",
  "Sora",
  "Nunito",
  "Quicksand",
  "Raleway",
  // Humanistas
  "Poppins",
  "Montserrat",
  "Lato",
  "Roboto",
  "Open Sans",
  "Ubuntu",
  "Source Sans 3",
  // Display / condensadas
  "Bebas Neue",
  "Oswald",
  "Exo 2",
  // Serif
  "Playfair Display",
  "Merriweather",
  "Lora",
];

// Fonts bundled locally or as system fonts — no CDN link needed.
const SYSTEM_FONTS = new Set(["Inter"]);

export function getGoogleFontUrl(font: string): string | null {
  if (!font || SYSTEM_FONTS.has(font)) return null;
  const encoded = font.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700;800;900&display=swap`;
}

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  style: Partial<FormStyle>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Padrão",
    emoji: "✨",
    description: "Limpo e profissional",
    style: {
      backgroundColor: "#ffffff",
      questionColor: "#263238",
      answerColor: "#2979FF",
      buttonColor: "#4F46E5",
      font: "Inter",
      textAnimation: "none",
      buttonAnimation: "none",
    },
  },
  {
    id: "black-friday",
    name: "Black Friday",
    emoji: "🖤",
    description: "Preto e amarelo explosivo",
    style: {
      backgroundColor: "#0a0a0a",
      questionColor: "#ffffff",
      answerColor: "#FACC15",
      buttonColor: "#FACC15",
      font: "Bebas Neue",
      fontSizeScale: "lg",
      textAnimation: "slide-up",
      buttonAnimation: "pulse",
    },
  },
  {
    id: "natal",
    name: "Natal",
    emoji: "🎄",
    description: "Verde e vermelho festivo",
    style: {
      backgroundColor: "#0f3d2e",
      questionColor: "#ffffff",
      answerColor: "#4ade80",
      buttonColor: "#ef4444",
      font: "Nunito",
      textAnimation: "fade",
      buttonAnimation: "none",
    },
  },
  {
    id: "verao",
    name: "Verão",
    emoji: "🌊",
    description: "Tons vibrantes de praia",
    style: {
      backgroundColor: "#fff7ed",
      questionColor: "#1e3a5f",
      answerColor: "#0ea5e9",
      buttonColor: "#f97316",
      font: "Poppins",
      textAnimation: "fade",
      buttonAnimation: "none",
    },
  },
  {
    id: "halloween",
    name: "Halloween",
    emoji: "🎃",
    description: "Laranja e preto assustador",
    style: {
      backgroundColor: "#1a0a00",
      questionColor: "#f97316",
      answerColor: "#fb923c",
      buttonColor: "#f97316",
      font: "Oswald",
      textAnimation: "zoom",
      buttonAnimation: "shake",
    },
  },
  {
    id: "cyber",
    name: "Cyber Monday",
    emoji: "💻",
    description: "Azul neon tecnológico",
    style: {
      backgroundColor: "#0f172a",
      questionColor: "#38bdf8",
      answerColor: "#67e8f9",
      buttonColor: "#0ea5e9",
      font: "Space Grotesk",
      textAnimation: "slide-left",
      buttonAnimation: "glow",
    },
  },
  {
    id: "rosa",
    name: "Rosa Candy",
    emoji: "🌸",
    description: "Estética suave e feminina",
    style: {
      backgroundColor: "#fff0f6",
      questionColor: "#be185d",
      answerColor: "#ec4899",
      buttonColor: "#f43f5e",
      font: "Quicksand",
      textAnimation: "fade",
      buttonAnimation: "none",
    },
  },
  {
    id: "minimal",
    name: "Minimalista",
    emoji: "⬜",
    description: "Preto, branco, sofisticado",
    style: {
      backgroundColor: "#fafafa",
      questionColor: "#0f172a",
      answerColor: "#334155",
      buttonColor: "#0f172a",
      font: "DM Sans",
      textAnimation: "none",
      buttonAnimation: "none",
    },
  },
  {
    id: "urgencia",
    name: "Urgência",
    emoji: "🔥",
    description: "Vermelho que converte",
    style: {
      backgroundColor: "#fff5f5",
      questionColor: "#7f1d1d",
      answerColor: "#dc2626",
      buttonColor: "#dc2626",
      font: "Montserrat",
      textAnimation: "slide-up",
      buttonAnimation: "pulse",
    },
  },
  {
    id: "ano-novo",
    name: "Ano Novo",
    emoji: "🎆",
    description: "Dourado e celebrativo",
    style: {
      backgroundColor: "#0c0900",
      questionColor: "#fde68a",
      answerColor: "#f59e0b",
      buttonColor: "#d97706",
      font: "Raleway",
      textAnimation: "zoom",
      buttonAnimation: "bounce",
    },
  },
];

export const TEXT_ANIMATIONS = [
  { id: "none", label: "Sem animação" },
  { id: "fade", label: "Fade in" },
  { id: "slide-up", label: "Deslizar para cima" },
  { id: "slide-left", label: "Entrar pela direita" },
  { id: "zoom", label: "Zoom in" },
];

export const BUTTON_ANIMATIONS = [
  { id: "none", label: "Sem animação" },
  { id: "pulse", label: "Pulsar" },
  { id: "bounce", label: "Pular" },
  { id: "glow", label: "Brilhar" },
  { id: "shake", label: "Vibrar" },
];

export const FONT_SIZE_SCALES = [
  { id: "sm", label: "Pequeno", desc: "Compacto" },
  { id: "md", label: "Normal", desc: "Padrão" },
  { id: "lg", label: "Grande", desc: "Arejado" },
  { id: "xl", label: "Gigante", desc: "TV / tela ampla" },
];

export type FontSizes = { title: string; desc: string; btn: string };

const FS: Record<string, FontSizes> = {
  sm: { title: "clamp(16px, 3.5vw, 20px)", desc: "clamp(12px, 2vw, 14px)", btn: "14px" },
  md: { title: "clamp(20px, 4.5vw, 30px)", desc: "clamp(14px, 2.5vw, 18px)", btn: "16px" },
  lg: { title: "clamp(26px, 6vw, 38px)", desc: "clamp(16px, 3vw, 22px)", btn: "18px" },
  xl: { title: "clamp(34px, 8vw, 52px)", desc: "clamp(18px, 4vw, 28px)", btn: "20px" },
};

export function getFontSizes(scale?: string): FontSizes {
  return FS[scale ?? "md"] ?? FS.md;
}

export function getTextAnimClass(anim?: string): string {
  switch (anim) {
    case "fade": return "animate-text-fade";
    case "slide-up": return "animate-text-slide-up";
    case "slide-left": return "animate-text-slide-left";
    case "zoom": return "animate-text-zoom";
    default: return "";
  }
}

export function getBtnAnimClass(anim?: string): string {
  switch (anim) {
    case "pulse": return "animate-btn-pulse";
    case "bounce": return "animate-btn-bounce";
    case "glow": return "animate-btn-glow";
    case "shake": return "animate-btn-shake";
    default: return "";
  }
}
