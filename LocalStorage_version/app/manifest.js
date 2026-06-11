export default function manifest() {
  return {
    name: 'Copa 26 Tracker',
    short_name: 'Copa 26',
    description: 'Acompanhe sua jornada na Copa do Mundo 2026',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF7F2',
    theme_color: '#009739',
    icons: [
      { src: '/favicon.png', sizes: 'any', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}
