import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F9A800',   // brand yellow
        secondary: '#5D6B77', // slate
        accent: '#E76F51',    // coral
        muted: '#B2B8B2',     // gray
        dark: '#3A3D42',      // near-black
      },
    },
  },
}


