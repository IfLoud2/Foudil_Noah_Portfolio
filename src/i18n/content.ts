/**
 * Contenu du site en trois langues. Une seule source par langue : le typage force
 * chaque langue à fournir exactement les mêmes champs.
 * Ton : factuel, première personne.
 */
export const LANGS = ['en', 'fr', 'nl'] as const;
export type Lang = (typeof LANGS)[number];

export type FigureKey =
  | 'uavTelemetry'
  | 'uavFlight'
  | 'uavHardware'
  | 'lcrLayout'
  | 'lcr3d'
  | 'lcrPrototype'
  | 'robotAssembly'
  | 'robotStack';

export type ProjectId = 'uav' | 'lcr' | 'robot' | 'hvdc';

export interface Figure {
  key: FigureKey;
  alt: string;
  caption: string;
}

export interface Project {
  id: ProjectId;
  /** Nom court, utilisé dans les filtres et les preuves. */
  short: string;
  title: string;
  period: string;
  place: string;
  role: string;
  summary: string;
  points: string[];
  tags: string[];
  figures: Figure[];
}

export interface Capability {
  title: string;
  statement: string;
  /** Preuves : ce que j'ai fait, rattaché au projet où je l'ai fait. */
  evidence: { project: ProjectId; text: string }[];
  tools: string[];
}

type Six = [string, string, string, string, string, string];

export interface BenchContent {
  heading: string;
  rail: string;
  intro: string;
  note: string;
  /** Description du modèle 3D (lecteurs d'écran) et indication de manipulation. */
  canvasLabel: string;
  hint: string;
  /** Les six arrêts du point rouge, dans l'ordre. */
  stops: Six;
  /** Légende de l'écran à chaque arrêt ; {placeholders} remplis par bench.ts. */
  captions: Six;
  pathLabel: string;
  scopeLabel: string;
  controls: { component: string; frequency: string; play: string; pause: string };
  dut: { R: string; C: string; L: string };
  readout: {
    caption: string;
    impedance: string;
    phase: string;
    repeat: string;
    value: { R: string; C: string; L: string };
  };
  real: { caption: string; alt: string };
}

export interface Content {
  htmlLang: string;
  localeName: string;
  meta: { title: string; description: string };
  skip: string;
  nav: { label: string; skills: string; bench: string; projects: string; contact: string; language: string };
  hero: {
    role: string;
    intro: string;
    cta: string;
    demoCaption: string;
    hint: string;
    canvasLabel: string;
    hud: { altitude: string; heading: string; points: string };
  };
  skills: {
    heading: string;
    rail: string;
    filterLabel: string;
    filterAll: string;
    capabilities: Capability[];
    toolboxTitle: string;
    groups: { title: string; items: string[] }[];
    educationTitle: string;
    education: { title: string; place: string; year: string }[];
    languagesTitle: string;
    languages: string;
  };
  projects: {
    heading: string;
    rail: string;
    labels: { period: string; place: string; role: string };
    items: Project[];
  };
  bench: BenchContent;
  contact: { heading: string; text: string; email: string; github: string; linkedin: string; source: string };
  /** Libellé du bouton de téléchargement du CV. */
  cv: string;
  footer: string;
}

const en: Content = {
  htmlLang: 'en',
  localeName: 'English',
  meta: {
    title: 'Foudil Noah, electronics engineer',
    description:
      'Portfolio of Foudil Noah: embedded systems, PCB design and sensing for UAVs. Projects with live demos that run in the browser.',
  },
  skip: 'Skip to content',
  nav: {
    label: 'Main',
    skills: 'Skills',
    bench: 'LCR‑meter',
    projects: 'Projects',
    contact: 'Contact',
    language: 'Language',
  },
  hero: {
    role: 'Electronics engineer: embedded systems, PCB design, sensing for UAVs',
    intro:
      'I design and debug electronics from the schematic to the firmware: multilayer PCBs in KiCad, code on STM32 and ESP32, and the sensor chain that goes with them. My recent work covers an indoor UAV with a LiDAR, a precision LCR-meter and a high-voltage test bench.',
    cta: 'See what I can do',
    demoCaption:
      'Generated live in your browser: a synthetic 2D LiDAR scan plus altitude, accumulated into a pseudo-3D map. It is the method I used on the UAV project.',
    hint: 'Drag to rotate',
    canvasLabel: 'Interactive point cloud. Drag, or use the arrow keys, to rotate the view.',
    hud: { altitude: 'Altitude', heading: 'Heading', points: 'Points' },
  },
  projects: {
    heading: 'Projects',
    rail: 'The detail behind the skills above: four projects, with my own part in each.',
    labels: { period: 'Period', place: 'Where', role: 'Role' },
    items: [
      {
        id: 'uav',
        short: 'UAV',
        title: 'Indoor UAV: LiDAR mapping and gesture control',
        period: 'Dec 2025 – Mar 2026',
        place: 'National Yunlin University of Science and Technology, Taiwan (bioVLSI laboratory)',
        role: 'R&D intern, embedded electronics and UAV',
        summary:
          'A low-cost distributed architecture for an indoor quadcopter: sensor acquisition on embedded Linux, a pseudo-3D reconstruction of the environment and a glove for gesture control.',
        points: [
          'Designed the PCB of the command glove in KiCad: Seeed XIAO microcontroller, 6-DoF IMU, magnetometer and extra sensors.',
          'Wrote multi-threaded Python on a Raspberry Pi to parse a 2D LiDAR stream at 230400 baud and bridge it over UDP and Wi-Fi.',
          'Used Kalman and Madgwick filters for attitude estimation, and built the pseudo-3D reconstruction by synchronising LiDAR scans with altitude.',
          'Built a real-time 3D telemetry dashboard for the point cloud (PyQtGraph, WebGL, Three.js).',
          'Moved the critical UART handling to Linux after the first setup hit hardware limits, and iterated from there.',
        ],
        tags: ['KiCad', 'Python', 'Raspberry Pi', 'LiDAR', 'ArduPilot', 'Three.js', 'UDP'],
        figures: [
          {
            key: 'uavTelemetry',
            alt: 'Telemetry dashboard showing the UAV attitude and a pseudo-3D LiDAR point cloud',
            caption: 'Telemetry dashboard: live attitude and pseudo-3D point cloud.',
          },
          {
            key: 'uavFlight',
            alt: 'The custom quadcopter hovering in an indoor hall',
            caption: 'Indoor flight without GPS.',
          },
          {
            key: 'uavHardware',
            alt: 'Two views of the UAV test platform with its flight controller stack and power distribution',
            caption: 'Test platform: flight controller stack and power distribution.',
          },
        ],
      },
      {
        id: 'lcr',
        short: 'LCR‑meter',
        title: 'Precision LCR-meter',
        period: 'Mar 2025 – Jun 2026',
        place: 'HELHA, Mons (Master’s project)',
        role: 'Hardware and embedded design',
        summary:
          'A measuring instrument designed from scratch around an auto-balanced bridge, with a target error below 1 % on passive components.',
        points: [
          'Laid out the PCB in KiCad with a continuous ground plane, strict analog and digital separation and a low-noise symmetrical ±5 V supply.',
          'Moved the core to an ESP32 with two external 16-bit ADCs, so voltage and current are sampled at the same instant and the phase error of multiplexed sampling disappears.',
          'Designed the analog front-end: MAX4582 multiplexers, INA128 instrumentation amplifiers, a PGA103 programmable-gain amplifier and a multiplying DAC.',
          'Extract amplitude and phase with a DFT, and validated the board stage by stage on the oscilloscope, including op-amp compatibility problems.',
          'The measurement-chain demo above reproduces this principle on synthetic signals.',
        ],
        tags: ['KiCad', 'ESP32', 'C/C++', 'DSP', 'INA128', 'PGA103'],
        figures: [
          {
            key: 'lcrLayout',
            alt: 'KiCad PCB layout of the LCR-meter',
            caption: 'KiCad layout: analog and digital sections kept apart.',
          },
          {
            key: 'lcr3d',
            alt: '3D render of the LCR-meter mainboard',
            caption: '3D render of the mainboard.',
          },
          {
            key: 'lcrPrototype',
            alt: 'Prototype board used to validate the analog front-end',
            caption: 'Prototype used to validate the analog front-end.',
          },
        ],
      },
      {
        id: 'robot',
        short: 'Robot',
        title: 'Tracked robot with a 6-axis arm',
        period: 'Feb 2024 – Jun 2024',
        place: 'HELHA, Mons (Bachelor’s project, team of four)',
        role: 'Hardware and embedded design',
        summary:
          'A remote-controlled tracked robot with a 6-axis arm, live video and environmental telemetry, designed and built from end to end.',
        points: [
          'Distributed architecture: a Raspberry Pi as master, ATmega and ESP32-CAM slaves over SPI, I2C and UART.',
          'Routed the mainboard: H-bridge motor drivers, DC/DC converters, Hall-effect current sensing, ultrasonic ranging and battery voltage monitoring.',
          'Built the web control interface (HTTP, WebSockets, UDP) for video streaming, telemetry and arm control.',
          'Computed the centre of gravity and the maximum arm payload before tilting, and shaped the motor acceleration profiles.',
        ],
        tags: ['KiCad', 'Raspberry Pi', 'ESP32', 'ATmega', 'WebSockets', '3D printing'],
        figures: [
          {
            key: 'robotAssembly',
            alt: 'Front and rear views of the assembled tracked robot',
            caption: 'Final assembly with the 3D-printed enclosure.',
          },
          {
            key: 'robotStack',
            alt: 'Three stacked boards: power distribution, Raspberry Pi master and ESP32 interface',
            caption: 'Three-board stack: power, master control, interface and telemetry.',
          },
        ],
      },
      {
        id: 'hvdc',
        short: 'HVDC bench',
        title: 'HVDC capacitor test bench',
        period: 'Sep 2023 – Oct 2023',
        place: 'Hitachi Energy, Jumet (Belgium)',
        role: 'R&D and test-bench intern',
        summary: 'An industrial test bench for the quality control of high-voltage DC capacitors.',
        points: [
          'Designed, integrated and wired the electrical cabinet following high-voltage safety rules.',
          'Added an automated discharge circuit so the capacitors are safe to handle after a test.',
          'Simulated and sized passive RC cascade filters in LTspice to reduce the residual ripple of the DC supplies.',
          'Used precision Fluke multimeters for very low leakage currents, and wrote a VBA macro in Excel that filters raw measurements into a quality-control sheet.',
        ],
        tags: ['LTspice', 'VBA', 'HVDC', 'Metrology'],
        figures: [],
      },
    ],
  },
  skills: {
    heading: 'What I can do',
    rail: 'Seven areas, each backed by something I built. Pick a project to see where it applies.',
    filterLabel: 'Show evidence from',
    filterAll: 'All projects',
    capabilities: [
      {
        title: 'Mixed-signal PCB design',
        statement: 'Multilayer boards where analog, digital and power share the same copper.',
        evidence: [
          { project: 'lcr', text: 'Continuous ground plane, strict analog/digital separation and a low-noise symmetrical ±5 V supply.' },
          { project: 'robot', text: 'Mainboard with H-bridge motor drivers, DC/DC converters, Hall-effect current sensing and battery monitoring.' },
          { project: 'uav', text: 'Command-glove board around a Seeed XIAO microcontroller, a 6-DoF IMU and a magnetometer.' },
        ],
        tools: ['KiCad', 'Altium', 'IPC standards', 'EMI/EMC mitigation'],
      },
      {
        title: 'Analog front-ends and measurement',
        statement: 'Getting a clean, usable voltage out of a component, then checking it on the bench.',
        evidence: [
          { project: 'lcr', text: 'MAX4582 multiplexers, INA128 instrumentation amplifiers, a PGA103 programmable-gain amplifier and a multiplying DAC, validated stage by stage on the oscilloscope.' },
          { project: 'hvdc', text: 'Passive RC cascade filters simulated and sized in LTspice; very low leakage currents measured with Fluke precision multimeters.' },
        ],
        tools: ['INA128', 'PGA103', 'LTspice', 'QSPICE', 'Oscilloscope', 'Fluke'],
      },
      {
        title: 'Firmware close to the hardware',
        statement: 'C/C++ on microcontrollers that talk to converters, sensors and other boards.',
        evidence: [
          { project: 'lcr', text: 'ESP32 core with two external 16-bit ADCs, so voltage and current are sampled at the same instant.' },
          { project: 'robot', text: 'ATmega and ESP32-CAM slaves under a Raspberry Pi master, over SPI, I2C and UART.' },
        ],
        tools: ['C/C++', 'FreeRTOS', 'STM32 (CubeIDE)', 'ESP32', 'I2C', 'SPI', 'UART', 'CAN', 'BLE'],
      },
      {
        title: 'Signal processing and estimation',
        statement: 'Turning sampled data into amplitude, phase and attitude.',
        evidence: [
          { project: 'lcr', text: 'Amplitude and phase extracted with a DFT; the phase error of multiplexed sampling removed by sampling both channels together.' },
          { project: 'uav', text: 'Kalman and Madgwick filters used for attitude; LiDAR scans synchronised with altitude to build a pseudo-3D map.' },
        ],
        tools: ['DSP / DFT', 'Kalman filter', 'Madgwick filter', 'MATLAB/Simulink'],
      },
      {
        title: 'Embedded Linux, data links and dashboards',
        statement: 'Sensor streams on a Raspberry Pi, sent over the network and shown in real time.',
        evidence: [
          { project: 'uav', text: 'Multi-threaded Python on a Raspberry Pi parsing a 2D LiDAR stream at 230400 baud and bridging it over UDP and Wi-Fi.' },
          { project: 'uav', text: 'Real-time 3D telemetry dashboard for the point cloud (PyQtGraph, WebGL, Three.js).' },
          { project: 'robot', text: 'Web control interface (HTTP, WebSockets, UDP) for video streaming, telemetry and arm control.' },
        ],
        tools: ['Embedded Linux', 'Python', 'Bash', 'JavaScript', 'Three.js', 'WebSockets', 'UDP'],
      },
      {
        title: 'Autonomous systems and sensing',
        statement: 'Indoor flight without GPS, and mechanics that hold up.',
        evidence: [
          { project: 'uav', text: 'Indoor flight without GPS, with LiDAR mapping synchronised with altitude.' },
          { project: 'robot', text: 'Centre of gravity and maximum arm payload before tilting computed; motor acceleration profiles shaped.' },
        ],
        tools: ['ArduPilot', 'Mission Planner', 'LiDAR', 'SLAM', 'Sensor fusion', 'PID tuning'],
      },
      {
        title: 'Test, validation and safety',
        statement: 'Showing that a design works, and that it is safe to handle.',
        evidence: [
          { project: 'hvdc', text: 'Electrical cabinet designed, integrated and wired to high-voltage safety rules, with an automatic discharge circuit.' },
          { project: 'hvdc', text: 'VBA macro that turns raw measurements into a quality-control sheet.' },
          { project: 'lcr', text: 'Board validated stage by stage, including op-amp compatibility problems.' },
        ],
        tools: ['Hardware-in-the-loop', 'V-model', 'Agile', 'VBA', 'Git/GitHub'],
      },
    ],
    toolboxTitle: 'Toolbox',
    groups: [
      {
        title: 'Hardware',
        items: [
          'Multilayer PCB design and routing (KiCad, Altium)',
          'Signal integrity, EMI/EMC mitigation, IPC standards',
          'Power electronics, HVDC test benches',
        ],
      },
      {
        title: 'Embedded',
        items: ['C/C++, FreeRTOS, STM32 (CubeIDE), ESP32', 'Embedded Linux on Raspberry Pi', 'I2C, SPI, UART, CAN, BLE'],
      },
      {
        title: 'Autonomous systems',
        items: ['ArduPilot, Mission Planner', 'LiDAR and sensor integration, SLAM', 'Sensor fusion, PID tuning'],
      },
      {
        title: 'Signal and simulation',
        items: ['DSP and DFT', 'MATLAB/Simulink, LTspice, QSPICE, MicroCAP', 'Hardware-in-the-loop validation'],
      },
      {
        title: 'Software and methods',
        items: [
          'Python, Java, Bash, VBA, JavaScript',
          'Git/GitHub, Agile, V-model',
          'Oscilloscopes, Fluke precision multimeters',
        ],
      },
    ],
    educationTitle: 'Education',
    education: [
      { title: 'Master’s in Industrial Electronic Engineering', place: 'HELHA, Mons', year: '2026' },
      { title: 'Bachelor of Science in Engineering', place: 'HELHA, Mons', year: '2024' },
    ],
    languagesTitle: 'Languages',
    languages: 'French (native), English (fluent)',
  },
  bench: {
    heading: 'Inside my LCR‑meter',
    rail: 'The measurement chain on the board, live.',
    intro:
      'A signal travels from the BNC port to the result: analog front end, ADC, ESP32, DSP. The screen shows what it looks like at each point. Everything is computed live in the browser.',
    note: 'The board is a stylised model and the signal path is simplified; the real board is shown beside it. The signals come from a DSP model of the measurement principle running in a Web Worker, not from the instrument’s firmware.',
    canvasLabel:
      '3D model of the LCR-meter board. A red dot follows the signal from the BNC port through the analog front end, the ADC and the ESP32 to the output. Drag or use the arrow keys to rotate.',
    hint: 'Drag to rotate',
    stops: ['BNC port', 'Analog front end', 'ADC', 'ESP32 buffer', 'DSP', 'Result'],
    captions: ['Excitation {f}', 'V and I · Δt {dt}', '{fs} · {bits} bit', '{n} samples / channel', 'DFT · bin k = {k}', '|Z| = {z} ∠ {theta}°'],
    pathLabel: 'Signal path',
    scopeLabel: 'Oscilloscope-style screen showing the signal at the selected point of the chain',
    controls: { component: 'Component under test', frequency: 'Test frequency', play: 'Play', pause: 'Pause' },
    dut: { R: 'Resistor 1 kΩ', C: 'Capacitor 100 nF, ESR 0.5 Ω', L: 'Inductor 10 mH, Rs 5 Ω' },
    readout: {
      caption: 'Measurement result',
      impedance: '|Z|',
      phase: 'Phase θ',
      repeat: 'Repeatability',
      value: { R: 'Resistance', C: 'Capacitance', L: 'Inductance' },
    },
    real: { caption: 'The real board, KiCad 3D view', alt: 'KiCad 3D view of the LCR-meter mainboard, seen from above' },
  },
  contact: {
    heading: 'Contact',
    text: 'I’m looking for my first engineering role in embedded systems and electronic integration. The quickest way to reach me is email.',
    email: 'Email',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    source: 'Source code of this site',
  },
  cv: 'Download my CV (PDF)',
  footer: 'Built with Astro and Three.js. No tracking, no cookies.',
};

const fr: Content = {
  htmlLang: 'fr',
  localeName: 'Français',
  meta: {
    title: 'Foudil Noah, ingénieur électronicien',
    description:
      'Portfolio de Foudil Noah : systèmes embarqués, conception de PCB et capteurs pour drones. Projets avec démos en direct dans le navigateur.',
  },
  skip: 'Aller au contenu',
  nav: {
    label: 'Principale',
    skills: 'Compétences',
    bench: 'LCR‑mètre',
    projects: 'Projets',
    contact: 'Contact',
    language: 'Langue',
  },
  hero: {
    role: 'Ingénieur électronicien : systèmes embarqués, conception de PCB, capteurs pour drones',
    intro:
      'Je conçois et débogue l’électronique du schéma au firmware : PCB multicouches sous KiCad, code sur STM32 et ESP32, et la chaîne de capteurs qui va avec. Mes travaux récents portent sur un drone d’intérieur équipé d’un LiDAR, un LCR-mètre de précision et un banc de test haute tension.',
    cta: 'Voir ce que je sais faire',
    demoCaption:
      'Généré en direct dans votre navigateur : un scan LiDAR 2D synthétique plus l’altitude, accumulés en carte pseudo-3D. C’est la méthode que j’ai utilisée sur le projet drone.',
    hint: 'Glisser pour tourner',
    canvasLabel: 'Nuage de points interactif. Faites glisser, ou utilisez les flèches du clavier, pour tourner la vue.',
    hud: { altitude: 'Altitude', heading: 'Cap', points: 'Points' },
  },
  projects: {
    heading: 'Projets',
    rail: 'Le détail derrière ces compétences : quatre projets, avec ma part dans chacun.',
    labels: { period: 'Période', place: 'Lieu', role: 'Rôle' },
    items: [
      {
        id: 'uav',
        short: 'Drone',
        title: 'Drone d’intérieur : cartographie LiDAR et commande gestuelle',
        period: 'déc. 2025 – mars 2026',
        place: 'National Yunlin University of Science and Technology, Taïwan (laboratoire bioVLSI)',
        role: 'Stagiaire R&D, électronique embarquée et drones',
        summary:
          'Une architecture distribuée à bas coût pour un quadricoptère d’intérieur : acquisition des capteurs sous Linux embarqué, reconstruction pseudo-3D de l’environnement et gant de commande gestuelle.',
        points: [
          'Conception du PCB du gant de commande sous KiCad : microcontrôleur Seeed XIAO, IMU 6 axes, magnétomètre et capteurs supplémentaires.',
          'Scripts Python multi-threads sur Raspberry Pi pour lire un flux LiDAR 2D à 230400 bauds et le relayer en UDP et Wi-Fi.',
          'Utilisation de filtres de Kalman et de Madgwick pour l’attitude, et reconstruction pseudo-3D en synchronisant les scans LiDAR avec l’altitude.',
          'Tableau de bord de télémétrie 3D temps réel pour le nuage de points (PyQtGraph, WebGL, Three.js).',
          'Gestion critique de l’UART déplacée sous Linux après avoir atteint les limites matérielles du premier montage, puis itérations successives.',
        ],
        tags: ['KiCad', 'Python', 'Raspberry Pi', 'LiDAR', 'ArduPilot', 'Three.js', 'UDP'],
        figures: [
          {
            key: 'uavTelemetry',
            alt: 'Tableau de bord de télémétrie : attitude du drone et nuage de points LiDAR pseudo-3D',
            caption: 'Tableau de bord de télémétrie : attitude en direct et nuage de points pseudo-3D.',
          },
          {
            key: 'uavFlight',
            alt: 'Le quadricoptère en vol stationnaire dans un hall',
            caption: 'Vol en intérieur, sans GPS.',
          },
          {
            key: 'uavHardware',
            alt: 'Deux vues de la plateforme de test du drone, avec le contrôleur de vol et la distribution de puissance',
            caption: 'Plateforme de test : contrôleur de vol et distribution de puissance.',
          },
        ],
      },
      {
        id: 'lcr',
        short: 'LCR‑mètre',
        title: 'LCR-mètre de précision',
        period: 'mars 2025 – juin 2026',
        place: 'HELHA, Mons (projet de master)',
        role: 'Conception hardware et embarquée',
        summary:
          'Un instrument de mesure conçu de zéro autour d’un pont auto-équilibré, avec un objectif d’erreur inférieur à 1 % sur les composants passifs.',
        points: [
          'Routage du PCB sous KiCad : plan de masse continu, séparation stricte analogique/numérique et alimentation symétrique ±5 V à faible bruit.',
          'Cœur du système migré vers un ESP32 avec deux CAN 16 bits externes : tension et courant sont échantillonnés au même instant, ce qui supprime l’erreur de phase de l’échantillonnage multiplexé.',
          'Conception de l’étage d’entrée analogique : multiplexeurs MAX4582, amplificateurs d’instrumentation INA128, amplificateur à gain programmable PGA103 et CNA multiplicateur.',
          'Extraction de l’amplitude et de la phase par DFT, et validation de la carte étage par étage à l’oscilloscope, y compris des problèmes de compatibilité d’amplificateurs opérationnels.',
          'La démo de la chaîne de mesure, plus haut, reproduit ce principe sur des signaux synthétiques.',
        ],
        tags: ['KiCad', 'ESP32', 'C/C++', 'DSP', 'INA128', 'PGA103'],
        figures: [
          {
            key: 'lcrLayout',
            alt: 'Routage KiCad du PCB du LCR-mètre',
            caption: 'Routage KiCad : sections analogique et numérique séparées.',
          },
          {
            key: 'lcr3d',
            alt: 'Rendu 3D de la carte principale du LCR-mètre',
            caption: 'Rendu 3D de la carte principale.',
          },
          {
            key: 'lcrPrototype',
            alt: 'Carte prototype utilisée pour valider l’étage d’entrée analogique',
            caption: 'Prototype de validation de l’étage d’entrée analogique.',
          },
        ],
      },
      {
        id: 'robot',
        short: 'Robot',
        title: 'Robot à chenilles avec bras 6 axes',
        period: 'févr. 2024 – juin 2024',
        place: 'HELHA, Mons (projet de bachelier, équipe de quatre)',
        role: 'Conception hardware et embarquée',
        summary:
          'Un robot à chenilles télécommandé, avec bras 6 axes, vidéo en direct et télémétrie environnementale, conçu et réalisé de bout en bout.',
        points: [
          'Architecture distribuée : Raspberry Pi maître, esclaves ATmega et ESP32-CAM en SPI, I2C et UART.',
          'Routage de la carte principale : pilotes de moteurs en pont en H, convertisseurs DC/DC, mesure de courant à effet Hall, télémétrie ultrasonique et surveillance de la tension de batterie.',
          'Interface web de pilotage (HTTP, WebSockets, UDP) pour le flux vidéo, la télémétrie et la commande du bras.',
          'Calcul du centre de gravité et de la charge maximale du bras avant basculement, et profils d’accélération des moteurs.',
        ],
        tags: ['KiCad', 'Raspberry Pi', 'ESP32', 'ATmega', 'WebSockets', 'Impression 3D'],
        figures: [
          {
            key: 'robotAssembly',
            alt: 'Vues avant et arrière du robot à chenilles assemblé',
            caption: 'Assemblage final avec le boîtier imprimé en 3D.',
          },
          {
            key: 'robotStack',
            alt: 'Trois cartes empilées : distribution de puissance, Raspberry Pi maître et interface ESP32',
            caption: 'Empilement de trois cartes : puissance, commande maître, interface et télémétrie.',
          },
        ],
      },
      {
        id: 'hvdc',
        short: 'Banc HVDC',
        title: 'Banc de test de condensateurs HVDC',
        period: 'sept. 2023 – oct. 2023',
        place: 'Hitachi Energy, Jumet (Belgique)',
        role: 'Stagiaire R&D et bancs de test',
        summary: 'Un banc de test industriel pour le contrôle qualité de condensateurs haute tension continue.',
        points: [
          'Conception, intégration et câblage de l’armoire électrique en respectant les règles de sécurité haute tension.',
          'Circuit de décharge automatique pour que les condensateurs soient sûrs à manipuler après un test.',
          'Simulation et dimensionnement de filtres RC passifs en cascade sous LTspice pour réduire l’ondulation résiduelle des alimentations DC.',
          'Multimètres de précision Fluke pour les très faibles courants de fuite, et macro VBA sous Excel qui filtre les mesures brutes vers une feuille de contrôle qualité.',
        ],
        tags: ['LTspice', 'VBA', 'HVDC', 'Métrologie'],
        figures: [],
      },
    ],
  },
  skills: {
    heading: 'Ce que je sais faire',
    rail: 'Sept domaines, chacun appuyé sur quelque chose que j’ai construit. Choisis un projet pour voir où il s’applique.',
    filterLabel: 'Afficher les preuves de',
    filterAll: 'Tous les projets',
    capabilities: [
      {
        title: 'Conception de PCB mixtes',
        statement: 'Des cartes multicouches où analogique, numérique et puissance partagent le même cuivre.',
        evidence: [
          { project: 'lcr', text: 'Plan de masse continu, séparation stricte analogique/numérique et alimentation symétrique ±5 V à faible bruit.' },
          { project: 'robot', text: 'Carte principale avec pilotes de moteurs en pont en H, convertisseurs DC/DC, mesure de courant à effet Hall et surveillance de la batterie.' },
          { project: 'uav', text: 'Carte du gant de commande autour d’un microcontrôleur Seeed XIAO, d’une IMU 6 axes et d’un magnétomètre.' },
        ],
        tools: ['KiCad', 'Altium', 'Normes IPC', 'Réduction EMI/EMC'],
      },
      {
        title: 'Étages d’entrée analogiques et mesure',
        statement: 'Obtenir une tension propre et exploitable à partir d’un composant, puis la vérifier sur le banc.',
        evidence: [
          { project: 'lcr', text: 'Multiplexeurs MAX4582, amplificateurs d’instrumentation INA128, amplificateur à gain programmable PGA103 et CNA multiplicateur, validés étage par étage à l’oscilloscope.' },
          { project: 'hvdc', text: 'Filtres RC passifs en cascade simulés et dimensionnés sous LTspice ; très faibles courants de fuite mesurés avec des multimètres de précision Fluke.' },
        ],
        tools: ['INA128', 'PGA103', 'LTspice', 'QSPICE', 'Oscilloscope', 'Fluke'],
      },
      {
        title: 'Firmware au plus près du matériel',
        statement: 'Du C/C++ sur des microcontrôleurs qui dialoguent avec des convertisseurs, des capteurs et d’autres cartes.',
        evidence: [
          { project: 'lcr', text: 'Cœur ESP32 avec deux CAN 16 bits externes : tension et courant sont échantillonnés au même instant.' },
          { project: 'robot', text: 'Esclaves ATmega et ESP32-CAM sous un Raspberry Pi maître, en SPI, I2C et UART.' },
        ],
        tools: ['C/C++', 'FreeRTOS', 'STM32 (CubeIDE)', 'ESP32', 'I2C', 'SPI', 'UART', 'CAN', 'BLE'],
      },
      {
        title: 'Traitement du signal et estimation',
        statement: 'Transformer des échantillons en amplitude, en phase et en attitude.',
        evidence: [
          { project: 'lcr', text: 'Amplitude et phase extraites par DFT ; erreur de phase de l’échantillonnage multiplexé supprimée en échantillonnant les deux voies ensemble.' },
          { project: 'uav', text: 'Filtres de Kalman et de Madgwick utilisés pour l’attitude ; scans LiDAR synchronisés avec l’altitude pour construire une carte pseudo-3D.' },
        ],
        tools: ['DSP / DFT', 'Filtre de Kalman', 'Filtre de Madgwick', 'MATLAB/Simulink'],
      },
      {
        title: 'Linux embarqué, liaisons de données et tableaux de bord',
        statement: 'Des flux de capteurs sur Raspberry Pi, envoyés sur le réseau et affichés en temps réel.',
        evidence: [
          { project: 'uav', text: 'Python multi-threads sur Raspberry Pi pour lire un flux LiDAR 2D à 230400 bauds et le relayer en UDP et Wi-Fi.' },
          { project: 'uav', text: 'Tableau de bord de télémétrie 3D temps réel pour le nuage de points (PyQtGraph, WebGL, Three.js).' },
          { project: 'robot', text: 'Interface web de pilotage (HTTP, WebSockets, UDP) pour le flux vidéo, la télémétrie et la commande du bras.' },
        ],
        tools: ['Linux embarqué', 'Python', 'Bash', 'JavaScript', 'Three.js', 'WebSockets', 'UDP'],
      },
      {
        title: 'Systèmes autonomes et perception',
        statement: 'Du vol en intérieur sans GPS, et une mécanique qui tient.',
        evidence: [
          { project: 'uav', text: 'Vol en intérieur sans GPS, avec cartographie LiDAR synchronisée avec l’altitude.' },
          { project: 'robot', text: 'Calcul du centre de gravité et de la charge maximale du bras avant basculement ; profils d’accélération des moteurs.' },
        ],
        tools: ['ArduPilot', 'Mission Planner', 'LiDAR', 'SLAM', 'Fusion de capteurs', 'Réglage de PID'],
      },
      {
        title: 'Test, validation et sécurité',
        statement: 'Montrer qu’une conception fonctionne, et qu’elle se manipule en sécurité.',
        evidence: [
          { project: 'hvdc', text: 'Armoire électrique conçue, intégrée et câblée selon les règles de sécurité haute tension, avec un circuit de décharge automatique.' },
          { project: 'hvdc', text: 'Macro VBA qui transforme les mesures brutes en feuille de contrôle qualité.' },
          { project: 'lcr', text: 'Carte validée étage par étage, y compris des problèmes de compatibilité d’amplificateurs opérationnels.' },
        ],
        tools: ['Hardware-in-the-loop', 'Cycle en V', 'Agile', 'VBA', 'Git/GitHub'],
      },
    ],
    toolboxTitle: 'Boîte à outils',
    groups: [
      {
        title: 'Hardware',
        items: [
          'Conception et routage de PCB multicouches (KiCad, Altium)',
          'Intégrité du signal, réduction des perturbations EMI/EMC, normes IPC',
          'Électronique de puissance, bancs de test HVDC',
        ],
      },
      {
        title: 'Embarqué',
        items: ['C/C++, FreeRTOS, STM32 (CubeIDE), ESP32', 'Linux embarqué sur Raspberry Pi', 'I2C, SPI, UART, CAN, BLE'],
      },
      {
        title: 'Systèmes autonomes',
        items: ['ArduPilot, Mission Planner', 'Intégration de LiDAR et de capteurs, SLAM', 'Fusion de capteurs, réglage de PID'],
      },
      {
        title: 'Signal et simulation',
        items: ['DSP et DFT', 'MATLAB/Simulink, LTspice, QSPICE, MicroCAP', 'Validation en hardware-in-the-loop'],
      },
      {
        title: 'Logiciel et méthodes',
        items: [
          'Python, Java, Bash, VBA, JavaScript',
          'Git/GitHub, Agile, cycle en V',
          'Oscilloscopes, multimètres de précision Fluke',
        ],
      },
    ],
    educationTitle: 'Formation',
    education: [
      { title: 'Master en ingénieur industriel, électronique', place: 'HELHA, Mons', year: '2026' },
      { title: 'Bachelier en sciences de l’ingénieur', place: 'HELHA, Mons', year: '2024' },
    ],
    languagesTitle: 'Langues',
    languages: 'Français (langue maternelle), anglais (courant)',
  },
  bench: {
    heading: 'Dans mon LCR‑mètre',
    rail: 'La chaîne de mesure sur la carte, en direct.',
    intro:
      'Un signal part du port BNC et va jusqu’au résultat : étage analogique, CAN, ESP32, DSP. L’écran montre à quoi il ressemble en chaque point. Tout est calculé en direct dans le navigateur.',
    note: 'La carte est un modèle stylisé et le chemin du signal est simplifié ; la vraie carte est affichée à côté. Les signaux viennent d’un modèle DSP du principe de mesure, exécuté dans un Web Worker, pas du firmware de l’instrument.',
    canvasLabel:
      'Modèle 3D de la carte du LCR-mètre. Un point rouge suit le signal depuis le port BNC, à travers l’étage analogique, le CAN et l’ESP32, jusqu’à la sortie. Glisser ou utiliser les flèches pour tourner.',
    hint: 'Glisser pour tourner',
    stops: ['Port BNC', 'Étage analogique', 'CAN', 'Tampon ESP32', 'DSP', 'Résultat'],
    captions: ['Excitation {f}', 'V et I · Δt {dt}', '{fs} · {bits} bits', '{n} échantillons / voie', 'DFT · bin k = {k}', '|Z| = {z} ∠ {theta} °'],
    pathLabel: 'Chemin du signal',
    scopeLabel: 'Écran de type oscilloscope montrant le signal au point choisi de la chaîne',
    controls: { component: 'Composant testé', frequency: 'Fréquence de test', play: 'Lecture', pause: 'Pause' },
    dut: { R: 'Résistance 1 kΩ', C: 'Condensateur 100 nF, ESR 0,5 Ω', L: 'Inductance 10 mH, Rs 5 Ω' },
    readout: {
      caption: 'Résultat de la mesure',
      impedance: '|Z|',
      phase: 'Phase θ',
      repeat: 'Répétabilité',
      value: { R: 'Résistance', C: 'Capacité', L: 'Inductance' },
    },
    real: { caption: 'La vraie carte, vue 3D KiCad', alt: 'Vue 3D KiCad de la carte principale du LCR-mètre, vue de dessus' },
  },
  contact: {
    heading: 'Contact',
    text: 'Je cherche mon premier poste d’ingénieur en systèmes embarqués et intégration électronique. Le plus simple pour me joindre : l’e-mail.',
    email: 'E-mail',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    source: 'Code source de ce site',
  },
  cv: 'Télécharger mon CV (PDF)',
  footer: 'Réalisé avec Astro et Three.js. Aucun suivi, aucun cookie.',
};

const nl: Content = {
  htmlLang: 'nl',
  localeName: 'Nederlands',
  meta: {
    title: 'Foudil Noah, elektronica-ingenieur',
    description:
      'Portfolio van Foudil Noah: embedded systemen, PCB-ontwerp en sensoren voor drones. Projecten met live demo’s in de browser.',
  },
  skip: 'Naar de inhoud',
  nav: {
    label: 'Hoofdmenu',
    skills: 'Vaardigheden',
    bench: 'LCR‑meter',
    projects: 'Projecten',
    contact: 'Contact',
    language: 'Taal',
  },
  hero: {
    role: 'Elektronica-ingenieur: embedded systemen, PCB-ontwerp, sensoren voor drones',
    intro:
      'Ik ontwerp en debug elektronica van schema tot firmware: meerlaagse PCB’s in KiCad, code op STM32 en ESP32 en de bijbehorende sensorketen. Recent werk: een indoor-drone met LiDAR, een precisie-LCR-meter en een hoogspanningstestbank.',
    cta: 'Bekijk wat ik kan',
    demoCaption:
      'Live gegenereerd in je browser: een synthetische 2D-LiDAR-scan plus hoogte, opgebouwd tot een pseudo-3D-kaart. Dat is de methode die ik in het dronesproject gebruikte.',
    hint: 'Sleep om te draaien',
    canvasLabel: 'Interactieve puntenwolk. Sleep, of gebruik de pijltjestoetsen, om de weergave te draaien.',
    hud: { altitude: 'Hoogte', heading: 'Koers', points: 'Punten' },
  },
  projects: {
    heading: 'Projecten',
    rail: 'De details achter deze vaardigheden: vier projecten, met mijn eigen aandeel in elk.',
    labels: { period: 'Periode', place: 'Waar', role: 'Rol' },
    items: [
      {
        id: 'uav',
        short: 'Drone',
        title: 'Indoor-drone: LiDAR-kartering en gebarenbesturing',
        period: 'dec. 2025 – mrt. 2026',
        place: 'National Yunlin University of Science and Technology, Taiwan (bioVLSI-labo)',
        role: 'Stagiair R&D, embedded elektronica en drones',
        summary:
          'Een goedkope gedistribueerde architectuur voor een quadcopter voor binnen: sensoracquisitie onder embedded Linux, een pseudo-3D-reconstructie van de omgeving en een handschoen voor gebarenbesturing.',
        points: [
          'Het PCB van de besturingshandschoen ontworpen in KiCad: Seeed XIAO-microcontroller, 6-assige IMU, magnetometer en extra sensoren.',
          'Multithreaded Python op een Raspberry Pi geschreven om een 2D-LiDAR-stroom van 230400 baud te lezen en via UDP en Wi-Fi door te sturen.',
          'Kalman- en Madgwick-filters gebruikt voor de standbepaling, en de pseudo-3D-reconstructie gebouwd door LiDAR-scans met de hoogte te synchroniseren.',
          'Een realtime 3D-telemetriedashboard voor de puntenwolk gebouwd (PyQtGraph, WebGL, Three.js).',
          'De kritieke UART-afhandeling naar Linux verplaatst nadat de eerste opstelling tegen hardwarelimieten aanliep, en van daaruit stapsgewijs verbeterd.',
        ],
        tags: ['KiCad', 'Python', 'Raspberry Pi', 'LiDAR', 'ArduPilot', 'Three.js', 'UDP'],
        figures: [
          {
            key: 'uavTelemetry',
            alt: 'Telemetriedashboard met de stand van de drone en een pseudo-3D-LiDAR-puntenwolk',
            caption: 'Telemetriedashboard: live stand en pseudo-3D-puntenwolk.',
          },
          {
            key: 'uavFlight',
            alt: 'De quadcopter zweeft in een hal',
            caption: 'Vlucht binnen, zonder GPS.',
          },
          {
            key: 'uavHardware',
            alt: 'Twee beelden van het testplatform van de drone met flight controller en stroomverdeling',
            caption: 'Testplatform: flight controller en stroomverdeling.',
          },
        ],
      },
      {
        id: 'lcr',
        short: 'LCR‑meter',
        title: 'Precisie-LCR-meter',
        period: 'mrt. 2025 – jun. 2026',
        place: 'HELHA, Bergen (masterproject)',
        role: 'Hardware- en embedded ontwerp',
        summary:
          'Een meetinstrument dat van nul is ontworpen rond een auto-gebalanceerde brug, met als doel een fout onder 1 % op passieve componenten.',
        points: [
          'Het PCB in KiCad geroute met een doorlopend massavlak, strikte scheiding van analoog en digitaal en een ruisarme symmetrische ±5 V-voeding.',
          'De kern naar een ESP32 verplaatst met twee externe 16-bit-ADC’s: spanning en stroom worden op hetzelfde moment bemonsterd, waardoor de fasefout van gemultiplexte bemonstering verdwijnt.',
          'De analoge ingangstrap ontworpen: MAX4582-multiplexers, INA128-instrumentatieversterkers, een PGA103 met programmeerbare versterking en een multiplying DAC.',
          'Amplitude en fase gehaald uit een DFT, en de print trap voor trap gevalideerd met de oscilloscoop, inclusief compatibiliteitsproblemen met operationele versterkers.',
          'De demo van de meetketen hierboven toont dit principe op synthetische signalen.',
        ],
        tags: ['KiCad', 'ESP32', 'C/C++', 'DSP', 'INA128', 'PGA103'],
        figures: [
          {
            key: 'lcrLayout',
            alt: 'KiCad-layout van het PCB van de LCR-meter',
            caption: 'KiCad-layout: analoge en digitale delen gescheiden.',
          },
          {
            key: 'lcr3d',
            alt: '3D-render van het hoofdbord van de LCR-meter',
            caption: '3D-render van het hoofdbord.',
          },
          {
            key: 'lcrPrototype',
            alt: 'Prototypebord om de analoge ingangstrap te valideren',
            caption: 'Prototype om de analoge ingangstrap te valideren.',
          },
        ],
      },
      {
        id: 'robot',
        short: 'Robot',
        title: 'Rupsrobot met 6-assige arm',
        period: 'feb. 2024 – jun. 2024',
        place: 'HELHA, Bergen (bachelorproject, team van vier)',
        role: 'Hardware- en embedded ontwerp',
        summary:
          'Een op afstand bestuurde rupsrobot met 6-assige arm, livebeeld en omgevingstelemetrie, van begin tot eind ontworpen en gebouwd.',
        points: [
          'Gedistribueerde architectuur: een Raspberry Pi als master, ATmega- en ESP32-CAM-slaves via SPI, I2C en UART.',
          'Het hoofdbord geroute: H-brug-motordrivers, DC/DC-omvormers, stroommeting met Hall-sensoren, ultrasone afstandsmeting en bewaking van de accuspanning.',
          'De webinterface voor bediening gebouwd (HTTP, WebSockets, UDP) voor videostreaming, telemetrie en besturing van de arm.',
          'Het zwaartepunt en de maximale armlast voor het kantelen berekend, en de acceleratieprofielen van de motoren afgestemd.',
        ],
        tags: ['KiCad', 'Raspberry Pi', 'ESP32', 'ATmega', 'WebSockets', '3D-printen'],
        figures: [
          {
            key: 'robotAssembly',
            alt: 'Voor- en achteraanzicht van de gemonteerde rupsrobot',
            caption: 'Eindmontage met de 3D-geprinte behuizing.',
          },
          {
            key: 'robotStack',
            alt: 'Drie gestapelde borden: stroomverdeling, Raspberry Pi als master en ESP32-interface',
            caption: 'Stapel van drie borden: voeding, hoofdbesturing, interface en telemetrie.',
          },
        ],
      },
      {
        id: 'hvdc',
        short: 'HVDC-bank',
        title: 'Testbank voor HVDC-condensatoren',
        period: 'sept. 2023 – okt. 2023',
        place: 'Hitachi Energy, Jumet (België)',
        role: 'Stagiair R&D en testbanken',
        summary: 'Een industriële testbank voor de kwaliteitscontrole van hoogspannings-gelijkstroomcondensatoren.',
        points: [
          'De elektrische kast ontworpen, geïntegreerd en bedraad volgens de veiligheidsregels voor hoogspanning.',
          'Een automatische ontlaadschakeling toegevoegd zodat de condensatoren na een test veilig te hanteren zijn.',
          'Passieve RC-trapfilters in LTspice gesimuleerd en gedimensioneerd om de restrimpel van de gelijkspanningsvoedingen te verminderen.',
          'Fluke-precisiemultimeters gebruikt voor zeer lage lekstromen, en een VBA-macro in Excel geschreven die ruwe metingen filtert naar een kwaliteitscontroleblad.',
        ],
        tags: ['LTspice', 'VBA', 'HVDC', 'Metrologie'],
        figures: [],
      },
    ],
  },
  skills: {
    heading: 'Wat ik kan',
    rail: 'Zeven domeinen, elk onderbouwd met iets wat ik heb gebouwd. Kies een project om te zien waar het van toepassing is.',
    filterLabel: 'Toon bewijs uit',
    filterAll: 'Alle projecten',
    capabilities: [
      {
        title: 'Ontwerp van mixed-signal PCB’s',
        statement: 'Meerlaagse borden waar analoog, digitaal en vermogen hetzelfde koper delen.',
        evidence: [
          { project: 'lcr', text: 'Doorlopend massavlak, strikte scheiding van analoog en digitaal en een ruisarme symmetrische ±5 V-voeding.' },
          { project: 'robot', text: 'Hoofdbord met H-brug-motordrivers, DC/DC-omvormers, stroommeting met Hall-sensoren en bewaking van de accu.' },
          { project: 'uav', text: 'Bord van de besturingshandschoen rond een Seeed XIAO-microcontroller, een 6-assige IMU en een magnetometer.' },
        ],
        tools: ['KiCad', 'Altium', 'IPC-normen', 'EMI/EMC-beperking'],
      },
      {
        title: 'Analoge ingangstrappen en metingen',
        statement: 'Een zuivere, bruikbare spanning uit een component halen en die daarna op de testbank controleren.',
        evidence: [
          { project: 'lcr', text: 'MAX4582-multiplexers, INA128-instrumentatieversterkers, een PGA103 met programmeerbare versterking en een multiplying DAC, trap voor trap gevalideerd met de oscilloscoop.' },
          { project: 'hvdc', text: 'Passieve RC-trapfilters gesimuleerd en gedimensioneerd in LTspice; zeer lage lekstromen gemeten met Fluke-precisiemultimeters.' },
        ],
        tools: ['INA128', 'PGA103', 'LTspice', 'QSPICE', 'Oscilloscoop', 'Fluke'],
      },
      {
        title: 'Firmware dicht bij de hardware',
        statement: 'C/C++ op microcontrollers die praten met omzetters, sensoren en andere borden.',
        evidence: [
          { project: 'lcr', text: 'ESP32-kern met twee externe 16-bit-ADC’s: spanning en stroom worden op hetzelfde moment bemonsterd.' },
          { project: 'robot', text: 'ATmega- en ESP32-CAM-slaves onder een Raspberry Pi als master, via SPI, I2C en UART.' },
        ],
        tools: ['C/C++', 'FreeRTOS', 'STM32 (CubeIDE)', 'ESP32', 'I2C', 'SPI', 'UART', 'CAN', 'BLE'],
      },
      {
        title: 'Signaalverwerking en schatting',
        statement: 'Bemonsterde data omzetten in amplitude, fase en standbepaling.',
        evidence: [
          { project: 'lcr', text: 'Amplitude en fase gehaald uit een DFT; de fasefout van gemultiplexte bemonstering weggewerkt door beide kanalen samen te bemonsteren.' },
          { project: 'uav', text: 'Kalman- en Madgwick-filters gebruikt voor de standbepaling; LiDAR-scans gesynchroniseerd met de hoogte voor een pseudo-3D-kaart.' },
        ],
        tools: ['DSP / DFT', 'Kalman-filter', 'Madgwick-filter', 'MATLAB/Simulink'],
      },
      {
        title: 'Embedded Linux, datalinks en dashboards',
        statement: 'Sensorstromen op een Raspberry Pi, over het netwerk verstuurd en in realtime getoond.',
        evidence: [
          { project: 'uav', text: 'Multithreaded Python op een Raspberry Pi om een 2D-LiDAR-stroom van 230400 baud te lezen en via UDP en Wi-Fi door te sturen.' },
          { project: 'uav', text: 'Realtime 3D-telemetriedashboard voor de puntenwolk (PyQtGraph, WebGL, Three.js).' },
          { project: 'robot', text: 'Webinterface voor bediening (HTTP, WebSockets, UDP) voor videostreaming, telemetrie en besturing van de arm.' },
        ],
        tools: ['Embedded Linux', 'Python', 'Bash', 'JavaScript', 'Three.js', 'WebSockets', 'UDP'],
      },
      {
        title: 'Autonome systemen en waarneming',
        statement: 'Vliegen binnen zonder GPS, en mechanica die standhoudt.',
        evidence: [
          { project: 'uav', text: 'Vlucht binnen zonder GPS, met LiDAR-kartering gesynchroniseerd met de hoogte.' },
          { project: 'robot', text: 'Zwaartepunt en maximale armlast voor het kantelen berekend; acceleratieprofielen van de motoren afgestemd.' },
        ],
        tools: ['ArduPilot', 'Mission Planner', 'LiDAR', 'SLAM', 'Sensorfusie', 'PID-afstelling'],
      },
      {
        title: 'Testen, valideren en veiligheid',
        statement: 'Aantonen dat een ontwerp werkt en dat het veilig te hanteren is.',
        evidence: [
          { project: 'hvdc', text: 'Elektrische kast ontworpen, geïntegreerd en bedraad volgens de veiligheidsregels voor hoogspanning, met een automatische ontlaadschakeling.' },
          { project: 'hvdc', text: 'VBA-macro die ruwe metingen omzet in een kwaliteitscontroleblad.' },
          { project: 'lcr', text: 'Print trap voor trap gevalideerd, inclusief compatibiliteitsproblemen met operationele versterkers.' },
        ],
        tools: ['Hardware-in-the-loop', 'V-model', 'Agile', 'VBA', 'Git/GitHub'],
      },
    ],
    toolboxTitle: 'Gereedschapskist',
    groups: [
      {
        title: 'Hardware',
        items: [
          'Ontwerp en routing van meerlaagse PCB’s (KiCad, Altium)',
          'Signaalintegriteit, EMI/EMC-beperking, IPC-normen',
          'Vermogenselektronica, HVDC-testbanken',
        ],
      },
      {
        title: 'Embedded',
        items: ['C/C++, FreeRTOS, STM32 (CubeIDE), ESP32', 'Embedded Linux op Raspberry Pi', 'I2C, SPI, UART, CAN, BLE'],
      },
      {
        title: 'Autonome systemen',
        items: ['ArduPilot, Mission Planner', 'Integratie van LiDAR en sensoren, SLAM', 'Sensorfusie, PID-afstelling'],
      },
      {
        title: 'Signaal en simulatie',
        items: ['DSP en DFT', 'MATLAB/Simulink, LTspice, QSPICE, MicroCAP', 'Validatie met hardware-in-the-loop'],
      },
      {
        title: 'Software en methodes',
        items: [
          'Python, Java, Bash, VBA, JavaScript',
          'Git/GitHub, Agile, V-model',
          'Oscilloscopen, Fluke-precisiemultimeters',
        ],
      },
    ],
    educationTitle: 'Opleiding',
    education: [
      { title: 'Master industrieel ingenieur, elektronica', place: 'HELHA, Bergen', year: '2026' },
      { title: 'Bachelor ingenieurswetenschappen', place: 'HELHA, Bergen', year: '2024' },
    ],
    languagesTitle: 'Talen',
    languages: 'Frans (moedertaal), Engels (vloeiend)',
  },
  bench: {
    heading: 'In mijn LCR‑meter',
    rail: 'De meetketen op de print, live.',
    intro:
      'Een signaal gaat van de BNC-poort naar het resultaat: analoge ingangstrap, ADC, ESP32, DSP. Het scherm toont hoe het er op elk punt uitziet. Alles wordt live berekend in de browser.',
    note: 'De print is een gestileerd model en het signaalpad is vereenvoudigd; het echte bord staat ernaast. De signalen komen uit een DSP-model van het meetprincipe in een Web Worker, niet uit de firmware van het instrument.',
    canvasLabel:
      '3D-model van de print van de LCR-meter. Een rode stip volgt het signaal van de BNC-poort via de analoge ingangstrap, de ADC en de ESP32 naar de uitgang. Sleep of gebruik de pijltjestoetsen om te draaien.',
    hint: 'Sleep om te draaien',
    stops: ['BNC-poort', 'Analoge ingangstrap', 'ADC', 'ESP32-buffer', 'DSP', 'Resultaat'],
    captions: ['Aandrijving {f}', 'V en I · Δt {dt}', '{fs} · {bits} bit', '{n} samples / kanaal', 'DFT · bin k = {k}', '|Z| = {z} ∠ {theta}°'],
    pathLabel: 'Signaalpad',
    scopeLabel: 'Oscilloscoopachtig scherm dat het signaal toont op het gekozen punt van de keten',
    controls: { component: 'Te meten component', frequency: 'Testfrequentie', play: 'Afspelen', pause: 'Pauze' },
    dut: { R: 'Weerstand 1 kΩ', C: 'Condensator 100 nF, ESR 0,5 Ω', L: 'Spoel 10 mH, Rs 5 Ω' },
    readout: {
      caption: 'Meetresultaat',
      impedance: '|Z|',
      phase: 'Fase θ',
      repeat: 'Herhaalbaarheid',
      value: { R: 'Weerstand', C: 'Capaciteit', L: 'Zelfinductie' },
    },
    real: { caption: 'Het echte bord, 3D-weergave in KiCad', alt: '3D-weergave in KiCad van het hoofdbord van de LCR-meter, bovenaanzicht' },
  },
  contact: {
    heading: 'Contact',
    text: 'Ik zoek mijn eerste ingenieursfunctie in embedded systemen en elektronische integratie. Het snelst bereik je me via e-mail.',
    email: 'E-mail',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    source: 'Broncode van deze site',
  },
  cv: 'Mijn cv downloaden (PDF)',
  footer: 'Gebouwd met Astro en Three.js. Geen tracking, geen cookies.',
};

export const content: Record<Lang, Content> = { en, fr, nl };
