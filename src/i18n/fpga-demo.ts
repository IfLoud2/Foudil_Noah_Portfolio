import type { Lang } from './content';

export interface FpgaDemoCopy {
  title: string;
  note: string;
  power: string;
  difficulty: string;
  levels: [string, string, string];
  start: string;
  up: string;
  down: string;
  reset: string;
  keys: string;
  hint: string;
  display: string;
  leds: string;
}

export const fpgaDemo: Record<Lang, FpgaDemoCopy> = {
  en: {
    title: 'Try the game',
    note: 'TypeScript simulation of the VHDL logic (state machine, wall shift register, collision). Wall patterns and speeds are illustrative, not the ones on the board.',
    power: 'SW3 power',
    difficulty: 'Difficulty',
    levels: ['SW0 easy', 'SW1 medium', 'SW2 hard'],
    start: 'Start',
    up: 'Up',
    down: 'Down',
    reset: 'Reset',
    keys: 'Keys: Space start, ↑ ↓ move, R reset',
    hint: 'Switch SW3 on, pick a difficulty, press Start.',
    display: 'Six seven-segment displays',
    leds: 'Red LEDs LEDR9 to LEDR0',
  },
  fr: {
    title: 'Essayer le jeu',
    note: 'Simulation en TypeScript de la logique VHDL (machine d’états, registre à décalage des murs, collision). Les motifs de murs et les vitesses sont indicatifs, pas ceux de la carte.',
    power: 'SW3 alimentation',
    difficulty: 'Difficulté',
    levels: ['SW0 facile', 'SW1 moyen', 'SW2 difficile'],
    start: 'Start',
    up: 'Haut',
    down: 'Bas',
    reset: 'Reset',
    keys: 'Clavier : Espace start, ↑ ↓ déplacer, R reset',
    hint: 'Active SW3, choisis une difficulté, appuie sur Start.',
    display: 'Six afficheurs sept segments',
    leds: 'LED rouges LEDR9 à LEDR0',
  },
  nl: {
    title: 'Probeer het spel',
    note: 'TypeScript-simulatie van de VHDL-logica (toestandsmachine, schuifregister voor muren, botsing). Muurpatronen en snelheden zijn illustratief, niet die van het bord.',
    power: 'SW3 voeding',
    difficulty: 'Moeilijkheid',
    levels: ['SW0 makkelijk', 'SW1 gemiddeld', 'SW2 moeilijk'],
    start: 'Start',
    up: 'Omhoog',
    down: 'Omlaag',
    reset: 'Reset',
    keys: 'Toetsen: spatie start, ↑ ↓ bewegen, R reset',
    hint: 'Zet SW3 aan, kies een moeilijkheid, druk op Start.',
    display: 'Zes zevensegmentdisplays',
    leds: 'Rode LED’s LEDR9 tot LEDR0',
  },
};
