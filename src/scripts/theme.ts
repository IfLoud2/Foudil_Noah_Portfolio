/** Thème courant (attribut data-theme posé sur <html>) et abonnement à ses changements. */
import type { LineBasicMaterial, PointsMaterial } from 'three';

export const isLight = (): boolean => document.documentElement.dataset['theme'] === 'light';

export function onThemeChange(callback: () => void): void {
  new MutationObserver(callback).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

type Themed = LineBasicMaterial | PointsMaterial;

/** Matériaux à deux teintes (sombre / clair) : `apply()` les réaligne sur le thème courant. */
export function themedMaterials(): {
  add: <T extends Themed>(material: T, dark: number, light: number) => T;
  apply: () => void;
} {
  const list: { m: Themed; dark: number; light: number }[] = [];
  return {
    add: (material, dark, light) => {
      list.push({ m: material, dark, light });
      material.color.setHex(isLight() ? light : dark);
      return material;
    },
    apply: () => {
      const light = isLight();
      for (const t of list) t.m.color.setHex(light ? t.light : t.dark);
    },
  };
}
