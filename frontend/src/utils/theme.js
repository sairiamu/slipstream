const themes = {
  ocean: {
    '--bg-base': '#0A1628',
    '--bg-mid': '#112240',
    '--bg-light': '#1D3461',
    '--glow-1': 'rgba(74,157,255,0.13)',
    '--glow-2': 'rgba(200,205,216,0.07)',
    '--accent': '#4A9DFF',
    '--accent-glow': 'rgba(74,157,255,0.25)',
    '--glass-bg': 'rgba(255,255,255,0.07)',
    '--glass-border': 'rgba(255,255,255,0.15)',
  },
  sunset: {
    '--bg-base': '#1A0A0F',
    '--bg-mid': '#2D1020',
    '--bg-light': '#4A1830',
    '--glow-1': 'rgba(255,100,80,0.13)',
    '--glow-2': 'rgba(255,180,80,0.08)',
    '--accent': '#FF6B6B',
    '--accent-glow': 'rgba(255,107,107,0.28)',
    '--glass-bg': 'rgba(255,180,150,0.06)',
    '--glass-border': 'rgba(255,160,120,0.18)',
  },
  cosmic: {
    '--bg-base': '#0D0A1A',
    '--bg-mid': '#160F2E',
    '--bg-light': '#221545',
    '--glow-1': 'rgba(160,80,255,0.14)',
    '--glow-2': 'rgba(80,200,255,0.07)',
    '--accent': '#A855F7',
    '--accent-glow': 'rgba(168,85,247,0.28)',
    '--glass-bg': 'rgba(200,150,255,0.06)',
    '--glass-border': 'rgba(180,120,255,0.18)',
  },
  forest: {
    '--bg-base': '#071410',
    '--bg-mid': '#0D2218',
    '--bg-light': '#133322',
    '--glow-1': 'rgba(52,211,153,0.12)',
    '--glow-2': 'rgba(100,200,120,0.07)',
    '--accent': '#34D399',
    '--accent-glow': 'rgba(52,211,153,0.25)',
    '--glass-bg': 'rgba(100,255,180,0.05)',
    '--glass-border': 'rgba(80,220,150,0.16)',
  },
  gold: {
    '--bg-base': '#140E00',
    '--bg-mid': '#231800',
    '--bg-light': '#352400',
    '--glow-1': 'rgba(251,191,36,0.13)',
    '--glow-2': 'rgba(255,140,0,0.07)',
    '--accent': '#FBBF24',
    '--accent-glow': 'rgba(251,191,36,0.25)',
    '--glass-bg': 'rgba(255,220,100,0.05)',
    '--glass-border': 'rgba(255,200,60,0.16)',
  }
};

export function applyRandomTheme() {
  let themeName = sessionStorage.getItem('slipstream-theme');

  if (!themeName || !themes[themeName]) {
    const themeKeys = Object.keys(themes);
    themeName = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    sessionStorage.setItem('slipstream-theme', themeName);
  }

  const theme = themes[themeName];
  const root = document.documentElement;

  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}
