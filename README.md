# Portfolio de Foudil Noah

Site statique trilingue (EN / FR / NL), hébergé sur GitHub Pages.
Astro + TypeScript strict, Three.js, aucun framework UI, aucun cookie, aucun script tiers.

Deux démos tournent dans le navigateur :

- **Hero** : un LiDAR 2D synthétique, embarqué sur un drone dont l'altitude varie, accumule ses retours en carte pseudo-3D (même principe que le projet UAV). Simulation dans `src/scripts/lidar-sim.ts`, rendu Three.js dans `src/scripts/lidar.ts`. La vue se déplace en glissant (ou aux flèches du clavier) ; la constante `DRIFT` de `lidar.ts` règle la lente dérive d'avant la première interaction (0 pour la supprimer).
- **LCR-mètre** : modèle 3D filaire de la carte (Three.js) avec un point rouge qui suit le signal BNC → étage analogique → CAN → ESP32 → DSP → sortie, et un écran de type oscilloscope qui montre le signal à chaque arrêt. Les signaux viennent d'un modèle DSP dans un Web Worker (`dsp.ts`, `bench.worker.ts`) ; géométrie de la carte : `pcb-layout.ts` (testée) ; scène et écran : `bench.ts`. La carte est stylisée, pas le routage réel.
- **CV** : dépose `cv-fr.pdf`, `cv-en.pdf`, `cv-nl.pdf` (ou `cv.pdf`) dans `src/assets/cv/` ; le bouton n'apparaît que si un fichier existe.

Les deux démos sont des **modèles sur données synthétiques**, annoncés comme tels sur la page : ce n'est pas le firmware ni les données réelles des projets.

## Avant la première publication

1. `src/site.ts` : renseigner `email` (et `linkedin` si tu veux). Vides, les liens sont masqués.
2. Générer le fichier de verrouillage des dépendances, **indispensable pour le workflow GitHub** :
   ```bash
   npm install
   git add package-lock.json
   ```
3. Vérifier en local :
   ```bash
   npm run dev      # http://localhost:4321/Foudil_Noah_Portfolio/
   npm test         # DSP du LCR-mètre + simulation LiDAR (Node, sans dépendance)
   npm run build    # astro check + build
   ```

## Déploiement (GitHub Pages)

```bash
git init -b main && git add . && git commit -m "Initial portfolio"
gh repo create Foudil_Noah_Portfolio --public --source=. --push
```

Puis sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
Le workflow `.github/workflows/deploy.yml` construit et publie à chaque push sur `main`.
L'URL est `https://<ton-user>.github.io/Foudil_Noah_Portfolio/` ; l'identifiant GitHub est lu automatiquement en CI (`GITHUB_REPOSITORY_OWNER`).
Pour servir à la racine (`https://<user>.github.io/`), nomme le dépôt `<user>.github.io` et mets `base: '/'` dans `astro.config.mjs`.

## Structure

```
src/
  i18n/content.ts        textes EN/FR/NL (un seul fichier, typé : mêmes champs dans les trois langues)
  components/            Header, Hero, Skills (compétences + preuves par projet), Bench (chaîne de mesure), Projects, Contact
  scripts/               lidar-sim, lidar (Three.js), dsp, bench (Three.js), pcb-layout, bench.worker, rng
  pages/                 index (aiguillage selon la langue du navigateur), [lang]/index
  assets/                figures extraites du PDF (optimisées par Astro au build)
tests/                   tests Node des modules purs
```

## À vérifier avant de publier

- **Textes NL** : rédigés à partir du CV, à faire relire par un néerlandophone.
- **Diplôme** : le site indique « 2026 » ; ajuste si besoin.
- **Palette** : tous les jetons de couleur sont en tête de `src/styles/global.css` (`:root`).
- **Compétences** : les domaines et leurs preuves sont dans `src/i18n/content.ts` (`skills.capabilities`).
- **Hitachi Energy** : la photo de l'armoire n'est volontairement pas incluse. Ajoute-la seulement si tu as l'accord de l'entreprise (il faudra aussi l'ajouter dans `Projects.astro` et `content.ts`).
- **Vidéos** (télémétrie LiDAR, vol d'essai) : les liens du PDF n'étaient pas lisibles. Fournis les URL pour les intégrer.
- **Images** : les figures viennent du PDF (basse définition). Les originaux (photos, exports KiCad SVG/3D) donneront un meilleur rendu : remplace les fichiers de `src/assets/` en gardant les noms.
- **Non publié, volontairement** : téléphones des références, date de naissance, situation familiale, nationalité. Le dépôt est public et indexé.
