import { AvatarShapeStyle } from '../../types';

export interface AvatarStyleDefinition {
  id: AvatarShapeStyle;
  name: string;
  swahiliTitle: string;
  tagline: string;
  description: string;
  badge: string;
  badgeColor: string;
  iconType: string;
  // Specific style configurations
  outerRadiusClass: string;
  innerRadiusClass: string;
  customStyle?: React.CSSProperties;
  customInnerStyle?: React.CSSProperties;
  backdropLayerStyle?: React.CSSProperties;
  backdropLayerClass?: string;
  clipPath?: string;
  hasSpecialFrame?: boolean;
}

export const AVATAR_STYLES_LIST: AvatarStyleDefinition[] = [
  {
    id: 'organic-blob',
    name: 'Organic Blob Avatar',
    swahiliTitle: 'Umbo Asilia (Organic Blob)',
    tagline: 'Kipekee ya Zenia • Asymmetrical Soft Edges',
    description:
      'Umbo laini la kipekee lenye kona zilizopinda bila ulinganifu mkali (organic squircle). Huhifadhi picha kamili ya uso na kutoa mwonekano wa kipekee wa kisasa wa Kiafrika.',
    badge: 'Inayopendekezwa ⭐',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white',
    iconType: 'blob',
    outerRadiusClass: 'rounded-[30px]',
    innerRadiusClass: 'rounded-[26px]',
    customStyle: {
      borderRadius: '44% 56% 68% 32% / 42% 46% 54% 58%',
    },
    customInnerStyle: {
      borderRadius: '42% 58% 66% 34% / 44% 48% 52% 56%',
    },
    backdropLayerClass: 'bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-purple-600/40',
    backdropLayerStyle: {
      borderRadius: '56% 44% 34% 66% / 54% 58% 42% 46%',
      transform: 'rotate(-7deg) scale(1.04) translate(-2px, -1px)',
    },
  },
  {
    id: 'squircle',
    name: 'Squircle Avatar',
    swahiliTitle: 'Squircle (Superellipse)',
    tagline: 'Kona Laini za Kisasa za Superellipse',
    description:
      'Kona laini za kisasa zilizopinda kwa hisabati ya superellipse (kama ikoni za iOS). Inaleta unadhifu wa hali ya juu na utulivu wa macho.',
    badge: 'Kisasa 🔥',
    badgeColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    iconType: 'squircle',
    outerRadiusClass: 'rounded-[24px]',
    innerRadiusClass: 'rounded-[20px]',
    customStyle: {
      borderRadius: '24px',
    },
    customInnerStyle: {
      borderRadius: '20px',
    },
    backdropLayerClass: 'bg-gradient-to-br from-indigo-500/30 to-cyan-500/30',
    backdropLayerStyle: {
      borderRadius: '22px',
      transform: 'rotate(-5deg) scale(1.02) translate(-2px, -2px)',
    },
  },
  {
    id: 'rounded-rectangle',
    name: 'Rounded Rectangle Avatar',
    swahiliTitle: 'Mstatili Laini (Rounded Rectangle)',
    tagline: 'Uwiano wa 1:1 wenye Kona Zilizozungushwa Sana',
    description:
      'Umbo la mstatili/mraba wa 1:1 wenye kona zilizozungushwa sana (deep rounded corners). Huonyesha picha nzima bila kukata pembe za nyuso.',
    badge: 'Kifahari 📐',
    badgeColor: 'bg-indigo-600 text-white',
    iconType: 'rectangle',
    outerRadiusClass: 'rounded-[20px]',
    innerRadiusClass: 'rounded-[17px]',
    backdropLayerClass: 'bg-slate-700/60 border border-white/10',
    backdropLayerStyle: {
      borderRadius: '18px',
      transform: 'rotate(4deg) translate(2px, 1px)',
    },
  },
  {
    id: 'rounded-square',
    name: 'Rounded Square Avatar',
    swahiliTitle: 'Mraba wa Kona Laini (Rounded Square)',
    tagline: 'Muundo Imara na Uwiano Sawa',
    description:
      'Umbo la mraba wenye uwiano sawa na kona laini zenye utulivu. Unaoana vizuri na maudhui ya biashara na kurasa za maduka.',
    badge: 'Imara 🔲',
    badgeColor: 'bg-emerald-600 text-white',
    iconType: 'square',
    outerRadiusClass: 'rounded-[16px]',
    innerRadiusClass: 'rounded-[14px]',
    backdropLayerClass: 'bg-emerald-900/40 border border-emerald-500/30',
    backdropLayerStyle: {
      borderRadius: '15px',
      transform: 'rotate(-4deg) translate(-2px, -1px)',
    },
  },
  {
    id: 'circle',
    name: 'Circle Avatar',
    swahiliTitle: 'Duara Kamili (Classic Circle)',
    tagline: 'Muundo wa Asili wa Mitandao',
    description:
      'Duara safi na ya asili (360 degrees). Inafaa kwa watumiaji wanaopenda muundo wa kitamaduni usiopitwa na wakati.',
    badge: 'Klasiki ⚪',
    badgeColor: 'bg-slate-700 text-white',
    iconType: 'circle',
    outerRadiusClass: 'rounded-full',
    innerRadiusClass: 'rounded-full',
    backdropLayerClass: 'bg-white/10 ring-1 ring-white/20',
    backdropLayerStyle: {
      borderRadius: '9999px',
      transform: 'scale(1.06)',
    },
  },
  {
    id: 'shield',
    name: 'Shield Avatar',
    swahiliTitle: 'Ngao ya Kiafrika (Shield Avatar)',
    tagline: 'Ujasiri na Utamaduni wa Kiafrika',
    description:
      'Umbo la ngao ya kitamaduni ya Kiafrika lenye ncha laini ya chini. Hutoa hisia ya mamlaka, heshima, na uasili.',
    badge: 'Ngao 🛡️',
    badgeColor: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold',
    iconType: 'shield',
    outerRadiusClass: 'rounded-[18px]',
    innerRadiusClass: 'rounded-[16px]',
    clipPath: 'polygon(50% 0%, 100% 10%, 100% 74%, 50% 100%, 0% 74%, 0% 10%)',
    backdropLayerClass: 'bg-amber-500/30',
    backdropLayerStyle: {
      clipPath: 'polygon(50% 0%, 100% 10%, 100% 74%, 50% 100%, 0% 74%, 0% 10%)',
      transform: 'rotate(-4deg) scale(1.03)',
    },
  },
  {
    id: 'gradient-ring',
    name: 'Gradient Ring Avatar',
    swahiliTitle: 'Pete ya Gradient (Neon Sunset Glow)',
    tagline: 'Mng’ao Unaong’aa wa Jua la Afrika',
    description:
      'Picha imezungukwa na pete nene yenye mng’ao unaowaka wa rangi za jua la Afrika (Amber, Rose na Neon Cyan). Huonekana wazi hata gizani.',
    badge: 'Mng’ao ✨',
    badgeColor: 'bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 text-slate-950 font-bold',
    iconType: 'gradient-ring',
    outerRadiusClass: 'rounded-[22px]',
    innerRadiusClass: 'rounded-[18px]',
    backdropLayerClass: 'bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 opacity-50 blur-[2px]',
    backdropLayerStyle: {
      borderRadius: '20px',
      transform: 'rotate(5deg) scale(1.05)',
    },
  },
  {
    id: 'double-ring',
    name: 'Double-Ring Avatar',
    swahiliTitle: 'Pete Mbili (Double-Ring Neon)',
    tagline: 'Pete Mbili Zinazotenganishwa na Nafasi',
    description:
      'Pete mbili zenye nafasi safi katikati. Pete ya ndani hushika picha na pete ya nje huonyesha hali ya Story kwa ufasaha mkubwa.',
    badge: 'Pete Mbili 💫',
    badgeColor: 'bg-cyan-600 text-white',
    iconType: 'double-ring',
    outerRadiusClass: 'rounded-[24px]',
    innerRadiusClass: 'rounded-[19px]',
    backdropLayerClass: 'bg-cyan-500/20 border border-cyan-400/30',
    backdropLayerStyle: {
      borderRadius: '22px',
      transform: 'rotate(-3deg) scale(1.04)',
    },
  },
  {
    id: '3d-glass',
    name: '3D Glass Avatar',
    swahiliTitle: 'Kioo cha 3D (3D Glassmorphism)',
    tagline: 'Kioo cha Kifahari chenye Kivuli na Mwangaza',
    description:
      'Fremu ya kioo kilichogandishwa (frosted glass) yenye mng’ao wa ukingoni (specular rim light) na kina cha 3D kinachotokeza.',
    badge: 'Kioo cha 3D 💎',
    badgeColor: 'bg-slate-200 text-slate-900 font-bold',
    iconType: 'glass',
    outerRadiusClass: 'rounded-[24px]',
    innerRadiusClass: 'rounded-[20px]',
    backdropLayerClass: 'bg-white/10 backdrop-blur-md border border-white/30 shadow-xl',
    backdropLayerStyle: {
      borderRadius: '22px',
      transform: 'rotate(4deg) translate(2px, 2px)',
    },
  },
  {
    id: 'polaroid',
    name: 'Polaroid Avatar',
    swahiliTitle: 'Fremu ya Polaroid (Modern Polaroid)',
    tagline: 'Picha ya Mtindo wa Chapa ya Kisasa',
    description:
      'Fremu maridadi ya picha ya polaroid yenye nafasi nyeupe ya chini na kivuli laini cha kikazi. Inavutia sana kwa wasanii na wapiga picha.',
    badge: 'Polaroid 📸',
    badgeColor: 'bg-white text-slate-900 border border-slate-300 font-bold',
    iconType: 'polaroid',
    hasSpecialFrame: true,
    outerRadiusClass: 'rounded-[14px]',
    innerRadiusClass: 'rounded-[10px]',
    backdropLayerClass: 'bg-slate-200/40 dark:bg-slate-800/60 border border-white/20',
    backdropLayerStyle: {
      borderRadius: '12px',
      transform: 'rotate(6deg) translate(2px, 3px)',
    },
  },
];

const LOCAL_STORAGE_KEY = 'zenia_avatar_style';
const EVENT_NAME = 'zenia_avatar_style_changed';

/**
 * Get active avatar style from local storage or default to 'organic-blob'
 */
export function getStoredAvatarStyle(): AvatarShapeStyle {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (val && AVATAR_STYLES_LIST.some((s) => s.id === val)) {
      return val as AvatarShapeStyle;
    }
  } catch (err) {
    console.error('Failed to read avatar style from storage:', err);
  }
  return 'organic-blob';
}

/**
 * Save selected avatar style to local storage and dispatch update event
 */
export function setStoredAvatarStyle(style: AvatarShapeStyle): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, style);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { style },
        })
      );
    }
  } catch (err) {
    console.error('Failed to save avatar style:', err);
  }
}

/**
 * Helper hook or listener function
 */
export function getAvatarStyleDef(styleId?: AvatarShapeStyle): AvatarStyleDefinition {
  const targetId = styleId || getStoredAvatarStyle();
  return AVATAR_STYLES_LIST.find((s) => s.id === targetId) || AVATAR_STYLES_LIST[0];
}
