// ESLint 9 flat config for Next.js
// Prevents `next lint` from prompting interactively for configuration
// Lint rules come from @next/eslint-plugin-next via the next lint CLI
import nextPlugin from '@next/eslint-plugin-next';

const eslintConfig = [
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
    plugins: {
      '@next/next': nextPlugin,
    },
  },
];

export default eslintConfig;