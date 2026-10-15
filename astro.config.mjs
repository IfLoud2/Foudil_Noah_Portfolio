import { defineConfig } from 'astro/config';

// En CI (GitHub Actions), GITHUB_REPOSITORY_OWNER est défini automatiquement :
// aucune modification manuelle n'est nécessaire au déploiement.
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'GITHUB_USERNAME';

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: '/Foudil_Noah_Portfolio',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
});
