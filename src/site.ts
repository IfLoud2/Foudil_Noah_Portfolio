/**
 * Réglages personnels du site.
 * `email` et `linkedin` : à renseigner avant publication (laissés vides = lien masqué).
 */
export const SITE: { name: string; email: string; linkedin: string } = {
  name: 'Foudil Noah',
  email: '',
  linkedin: '',
};

if (!SITE.email) {
  console.warn('[site] SITE.email est vide : aucun lien e-mail ne sera affiché (src/site.ts).');
}

/** Chemin absolu sous le `base` du site (ex. url('fr/') -> /Foudil_Noah_Portfolio/fr/). */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

/** Déduit l'identifiant GitHub du `site` Astro (https://<owner>.github.io). */
export function githubOwner(site: URL | undefined): string | null {
  if (!site) return null;
  const owner = site.hostname.split('.')[0] ?? '';
  return owner === '' || owner === 'github_username' ? null : owner;
}
