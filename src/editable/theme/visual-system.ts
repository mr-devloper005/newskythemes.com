import { slot4BrandConfig } from './brand.config'

export type Slot4VisualPreset =
  | 'editorial-paper'
  | 'luxury-atelier'
  | 'brutalist-index'
  | 'organic-journal'
  | 'tech-directory'
  | 'retro-bulletin'
  | 'visual-gallery'

export const visualPresets = {
  'editorial-paper': {
    label: 'Editorial Paper',
    mood: 'calm magazine authority',
    fontDirection: 'serif headlines with quiet sans body',
    colors: {
      background: '#f7efe3',
      foreground: '#201711',
      muted: '#7b6253',
      primary: '#261811',
      accent: '#b76e45',
      surface: '#fffaf2',
    },
    shape: 'soft editorial cards with fine borders',
  },
  'luxury-atelier': {
    label: 'Luxury Atelier',
    mood: 'premium, restrained, polished',
    fontDirection: 'Cormorant Garamond headlines with Outfit body',
    colors: {
      background: '#0c0e14',
      foreground: '#f2efe8',
      muted: '#97a0b3',
      primary: '#d4a853',
      accent: '#7f1d1d',
      surface: '#1a2130',
    },
    shape: 'dark panels, gold hairlines, editorial spacing',
  },
  'brutalist-index': {
    label: 'Brutalist Index',
    mood: 'bold, raw, memorable',
    fontDirection: 'condensed headings, mono labels, hard rhythm',
    colors: {
      background: '#f2f0e8',
      foreground: '#111111',
      muted: '#55524a',
      primary: '#111111',
      accent: '#ff4d00',
      surface: '#ffffff',
    },
    shape: 'sharp edges, thick borders, offset blocks',
  },
  'organic-journal': {
    label: 'Organic Journal',
    mood: 'warm, natural, trustworthy',
    fontDirection: 'rounded serif or humanist sans with soft captions',
    colors: {
      background: '#f4efe5',
      foreground: '#263021',
      muted: '#68705a',
      primary: '#415b32',
      accent: '#c47c51',
      surface: '#fffaf0',
    },
    shape: 'rounded cards, natural spacing, calm texture',
  },
  'tech-directory': {
    label: 'Tech Directory',
    mood: 'clean, fast, useful',
    fontDirection: 'modern sans with crisp mono data accents',
    colors: {
      background: '#f7f9fc',
      foreground: '#0f172a',
      muted: '#56607a',
      primary: '#4f46e5',
      accent: '#4f46e5',
      surface: '#ffffff',
    },
    shape: 'clean grids, pill filters, sharp information hierarchy',
  },
  'retro-bulletin': {
    label: 'Retro Bulletin',
    mood: 'playful, local, energetic',
    fontDirection: 'chunky headings with friendly body type',
    colors: {
      background: '#fff3c4',
      foreground: '#2b1d12',
      muted: '#7b5736',
      primary: '#2b1d12',
      accent: '#e85d2a',
      surface: '#fff8da',
    },
    shape: 'stickers, tabs, framed modules, playful dividers',
  },
  'visual-gallery': {
    label: 'Visual Gallery',
    mood: 'cinematic, image-led, immersive',
    fontDirection: 'minimal sans with oversized display moments',
    colors: {
      background: '#07101f',
      foreground: '#f8fbff',
      muted: '#a9b6c8',
      primary: '#8df0c8',
      accent: '#f2a0ff',
      surface: '#101b2d',
    },
    shape: 'dark cards, large media, glass overlays',
  },
} as const

export const visualSystem = {
  productKind: slot4BrandConfig.productKind,
  recommendedPreset: 'tech-directory',
  radius: {
    sm: '4px',
    md: '4px',
    lg: '8px',
    xl: '120px',
  },
  motion: {
    pageLoad: 'animate-in fade-in slide-in-from-bottom-4 duration-700',
    cardHover: 'transition duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(27,25,23,0.1)]',
    softHover: 'transition duration-300 hover:opacity-85',
    reduceMotionSafe: 'motion-reduce:transform-none motion-reduce:transition-none',
  },
  typography: {
    eyebrow: 'text-[13px] font-medium uppercase tracking-[0.18em]',
    heroTitle: 'text-5xl font-medium tracking-[-0.02em] sm:text-6xl lg:text-7xl',
    sectionTitle: 'text-3xl font-medium tracking-[-0.02em] sm:text-4xl',
    body: 'text-base leading-relaxed',
    caption: 'text-[13px] font-medium uppercase tracking-[0.14em]',
  },
  surfaces: {
    glass: 'border border-white/15 bg-white/10 backdrop-blur-xl',
    paper: 'border border-[var(--editable-border)] bg-white shadow-[0_1px_2px_rgba(27,25,23,0.04)]',
    quiet: 'border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]',
    dark: 'border border-white/10 bg-[var(--slot4-dark-bg)] shadow-[0_8px_30px_rgba(27,25,23,0.08)]',
  },
  layout: {
    page: 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10',
    sectionY: 'py-16 sm:py-20 lg:py-28',
    cardGrid: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
  },
} as const

export function getVisualPreset(name: Slot4VisualPreset = visualSystem.recommendedPreset as Slot4VisualPreset) {
  return visualPresets[name]
}
