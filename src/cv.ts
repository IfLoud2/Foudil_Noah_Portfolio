/**
 * CV téléchargeable. Les PDF sont lus dans src/assets/cv/ au moment du build :
 * s'il n'y en a aucun, aucun bouton n'est affiché. Voir src/assets/cv/README.md.
 */
import type { Lang } from './i18n/content';

const files = import.meta.glob<string>('./assets/cv/*.pdf', { query: '?url', import: 'default', eager: true });

/** URL du CV pour la langue demandée (sinon `cv.pdf`), ou `null` s'il n'y en a pas. */
export function cvUrl(lang: Lang): string | null {
  const find = (name: string): string | null => {
    const key = Object.keys(files).find((k) => k.endsWith(`/${name}`));
    return key ? (files[key] ?? null) : null;
  };
  return find(`cv-${lang}.pdf`) ?? find('cv.pdf');
}
