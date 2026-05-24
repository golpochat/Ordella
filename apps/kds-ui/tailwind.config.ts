import type { Config } from 'tailwindcss';
import sharedPreset from '@ordella/shared-ui/tailwind-preset';

const config: Config = {
  presets: [sharedPreset as unknown as Config],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../shared-ui/src/**/*.{ts,tsx}'],
};

export default config;
