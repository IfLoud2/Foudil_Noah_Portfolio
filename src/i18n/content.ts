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
  | 'robotStack'
  | 'hvdcCabinet';

export type RoleId = 'emb' | 'hw' | 'test' | 'uav' | 'int';
export type ProjectId = 'uav' | 'lcr' | 'robot' | 'hvdc' | 'fpga';

export interface HalfCopy {
  tag: string;
  title: string;
  subject: string;
  text: string;
  cta: string;
  alt?: string;
}

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
  /** Une ligne : résultat mesuré ou objectif de conception, sans chiffre inventé. */
  result: string;
  points: string[];
  tags: string[];
  figures: Figure[];
}

export interface Capability {
  title: string;
  statement: string;
  /** Preuves : ce que j'ai fait, rattaché au projet où je l'ai fait. */
  evidence: { project: ProjectId; text: string }[];
  /** Postes pour lesquels cette compétence compte. */
  roles: RoleId[];
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
  nav: { label: string; skills: string; bench: string; projects: string; path: string; contact: string; language: string; theme: string };
  hero: {
    role: string;
    intro: string;
    cta: string;
    scroll: string;
    road: string;
    hw: HalfCopy;
    sw: HalfCopy;
    hint: string;
    canvasLabel: string;
    hud: { altitude: string; heading: string; points: string };
    demoNote: string;
    stepsLabel: string;
    steps: string[];
  };
  skills: {
    heading: string;
    rail: string;
    filterLabel: string;
    filterAll: string;
    roleList: { id: RoleId; label: string }[];
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
    labels: { period: string; place: string; role: string; result: string };
    items: Project[];
  };
  path: {
    heading: string;
    rail: string;
    seeProject: string;
    groups: { work: string; study: string };
    items: { kind: 'work' | 'study'; period: string; title: string; place: string; project?: ProjectId }[];
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
    path: 'Background',
    contact: 'Contact',
    language: 'Language',
    theme: 'Switch light or dark theme',
  },
  hero: {
    role: 'Industrial electronics engineer · embedded systems, PCB design, instrumentation, UAVs',
    intro:
      'Design and validation of embedded electronic systems, from schematic to firmware: multilayer PCBs (KiCad), STM32, ESP32, data-acquisition chains.',
    cta: 'Technical skills',
    scroll: 'Space or scroll',
    road: '2020 → 2026',
    hw: { tag: 'HW', title: 'Hardware', subject: 'LCR-meter · PCB v3', text: 'Mixed-signal board with a DDS source, a 12-bit ADC and an analog chain qualified stage by stage on the bench.', cta: 'See the LCR-meter project', alt: 'KiCad 3D view of the LCR-meter mainboard' },
    sw: { tag: 'SW', title: 'Software', subject: 'Indoor UAV · LiDAR mapping', text: 'asyncio acquisition on a Raspberry Pi, EKF3 attitude from the flight controller, pseudo-3D map in the browser. Live simulation.', cta: 'See the UAV project' },
    hint: 'Drag to rotate',
    canvasLabel: 'Interactive point cloud. Drag, or use the arrow keys, to rotate the view.',
    hud: { altitude: 'Altitude', heading: 'Heading', points: 'Points' },
    demoNote: 'Stylised board and simplified signal path. Signals come from a DSP model of the measurement (12-bit ADC, about 70 dB SNR), not from measurements: the firmware is not written yet.',
    stepsLabel: 'Story steps',
    steps: ['Intro', 'HW | SW', 'Hardware', 'Path', 'Software'],
  },
  projects: {
    heading: 'Projects',
    rail: 'Five projects, with the scope of my contribution in each.',
    labels: { period: 'Period', place: 'Where', role: 'Role', result: 'Outcome' },
    items: [
      {
        id: 'uav',
        short: 'UAV',
        title: 'Indoor UAV: LiDAR mapping and telemetry',
        period: 'Dec 2025 – Mar 2026',
        place: 'National Yunlin University of Science and Technology, Taiwan (bioVLSI laboratory)',
        role: 'R&D intern, embedded electronics and UAV',
        summary:
          'A low-cost distributed architecture for an indoor quadcopter: LiDAR and ToF acquisition on a Raspberry Pi Zero 2W, EKF3 attitude estimation on the flight controller, a pseudo-3D reconstruction in a web client, and a connected-glove proof of concept.',
        result: '4 of 5 criteria met: ≈ €269 hardware budget in Taiwan (≈ €551 in Europe, against €500), 910 g all-up mass, ≈ 7 min flight (single trial), 0.11 % of LiDAR frames rejected by CRC8. LD19 accuracy of 10–35 mm against a 55 mm target; the full in-flight chain was not compared.',
        points: [
          'Wrote the Python companion application on the Raspberry Pi: a single asyncio process with four cooperating tasks (LD19 LiDAR over UART at 230400 baud, MAVLink from the flight controller, VL53L1X ToF altitude over I²C, WebSocket broadcast).',
          'Wrote the LD19 frame parser with header resynchronisation and a table-driven CRC8 check; corrupted frames are rejected, never used.',
          'Moved LiDAR parsing from the first XIAO prototype to the Pi after synchronisation and CRC errors, which freed the XIAO for the glove.',
          'Built the pseudo-3D reconstruction by combining 2D scans with MAVLink attitude (EKF3 runs on the flight controller) and ToF altitude; projection and voxel filtering run in a Three.js web client.',
          'Designed the PCB of a connected-glove proof of concept in KiCad (Seeed XIAO nRF52840 Sense with built-in IMU, flex sensors). The board was not assembled; the concept was tested on a breadboard.',
          'Measured throughput of 2,245 pts/s against the 4,500 pts/s nominal rate, attributed to periodic parser desynchronisation under cooperative scheduling.',
        ],
        tags: ['KiCad', 'Python', 'asyncio', 'Raspberry Pi', 'LiDAR', 'ArduPilot', 'MAVLink', 'Three.js', 'WebSocket'],
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
        place: 'HELHA, Mons (Master’s project, team of two with Logan Re)',
        role: 'Hardware and embedded design (PCB v3)',
        summary:
          'Rework, as a team of two, of an existing LCR-meter built around an auto-balanced bridge: new PCB v3 with a DDS excitation source, an external 12-bit ADC and an ESP32, with a 0.5 % accuracy target.',
        result: 'PCB v3 assembled and the analog chain qualified stage by stage up to the multiplying DAC. Firmware not written and no end-to-end measurement yet, so the 0.5 % target is not demonstrated.',
        points: [
          'Reworked the design from an 8051 board with an internal 16-bit ADC to an ESP32 with an external 12-bit AD7450 ADC; the ESP32’s internal ADC lacks the linearity required.',
          'Designed PCB v3 in KiCad: AD9850 DDS excitation, AD7450 ADC, ESP32 and power circuits added to the inherited topology.',
          'Kept the analog chain: MAX4582 and MAX4052 multiplexers, INA128 instrumentation amplifier, PGA103 programmable-gain amplifier and DAC8811 multiplying DAC; voltage and current are routed through the same converter in sequence.',
          'Planned DFT-based amplitude and phase extraction with coherent sampling (integer number of samples over an integer number of periods).',
          'Found and worked around two routing defects on PCB v3 (a 12 V to ±5 V supply footprint error and a DDS placement error, with excitation from an external BNC).',
          'The measurement-chain demo above reproduces the principle on synthetic signals.',
        ],
        tags: ['KiCad', 'ESP32', 'C/C++', 'DSP', 'AD7450', 'AD9850', 'INA128', 'PGA103'],
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
        place: 'HELHA, Mons (Bachelor’s project, team of three)',
        role: 'Hardware and embedded design',
        summary:
          'A remote-controlled tracked robot with a 6-axis arm, live video and environmental telemetry; motors and battery were supplied, the electronics, enclosure and software were built by the team.',
        result: 'Working robot built for €260 against a €300 budget. Runtime is limited to about 15 minutes by overheating of the DC/DC converter.',
        points: [
          'Distributed architecture: a Raspberry Pi as master, ATmega and ESP32-CAM slaves over SPI, I2C and UART.',
          'Three custom PCBs in KiCad (power, master control, interface and telemetry) with H-bridge motor drivers, a 12 V to 5 V DC/DC converter, battery cut-off at 9 V, fuse and reverse-polarity protection.',
          'Web control interface (HTTP, WebSockets, UDP) for video streaming, telemetry and arm control.',
          'Computed the centre of gravity and the maximum arm payload before tilting, and 3D-printed the enclosure and parts.',
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
        title: 'HVDC leakage-current test module',
        period: 'Sep 2023 – Oct 2023',
        place: 'Hitachi Energy, Jumet (Belgium), 6-week placement',
        role: 'R&D intern, Technology Center',
        summary:
          'Two linked tasks on the leakage-current test of high-voltage DC capacitors (about 5 kV): automating the processing of the data-logger measurements, then designing a portable module measuring 10 capacitors in parallel.',
        result: 'Excel/VBA automation delivered to the engineers. The portable module (safety design, automatic discharge, RC filter) was designed but not completed: 3 days remained when parts arrived.',
        points: [
          'Automated the processing of Fluke data-logger measurements with an Excel/VBA tool built for use by engineers and operators.',
          'Modelled and sized an RC filter in LTspice to reduce the ripple of the supply and the spread of the leakage current.',
          'Designed the safety circuit: ON/OFF and emergency-stop buttons driving contactors, with an automatic discharge of the capacitors when the test stops.',
          'Sized the contactors with a safety margin on the arc distance at 5 kV (two contacts in series per capacitor), then ran out of time to finish the build.',
        ],
        tags: ['LTspice', 'VBA', 'Excel', 'HVDC', 'Safety'],
        figures: [],
      },
      {
        id: 'fpga',
        short: 'FPGA game',
        title: 'FPGA game engine on Intel Cyclone V (VHDL)',
        period: 'Oct 2025',
        place: 'HELHA, Mons (coursework, team of three)',
        role: 'Digital design in VHDL',
        summary:
          'A simplified Flappy Bird on a DE0-CV board (Cyclone V): walls scroll across six seven-segment displays, the bird sits on the rightmost one, two buttons move it, switches select one of three difficulties and the LEDs show the game state.',
        result: 'Synthesised in Quartus Prime Lite: 201 logic elements out of 18,480 (about 1 %), no RAM or DSP blocks. Worst-case setup slack of +13.6 ns at 50 MHz (equivalent Fmax about 155 MHz), hold slack positive.',
        points: [
          'Game flow as a four-state FSM (OFF, MENU, RUNNING, GAME OVER): SW3 powers the game, SW0 to SW2 select the difficulty (the hardest wins if several are set), a button starts the game, and a collision freezes the display and lights the Game Over LED.',
          'Walls come from one 60-bit circular shift register per difficulty (2 bits per step, four vertical positions); difficulty changes the scroll speed, the gap sizes and the number of top/bottom transitions.',
          'Debounced button inputs that produce one-clock-cycle pulses (up, down, start, reset), and a clock-enable generator that sets the scroll rate for each difficulty.',
          'Collision detection reuses the display signals: bird and wall segments active together, filtered by a consecutive-cycle counter and a cooldown to avoid repeated detections.',
          'Eight independent VHDL modules, each simulated with its own test bench (waveform checks and assertions).',
          'Static timing analysis in TimeQuest at the slow 85 °C and fast 0 °C corners; the critical paths sit in the clock divider, the FSM and the wall comparators.',
          'Improvements identified: a score display, an extra difficulty level and a best-score register.',
        ],
        tags: ['VHDL', 'Quartus Prime', 'Cyclone V', 'DE0-CV', 'FSM', 'Test benches', 'Timing analysis'],
        figures: [],
      },
    ],
  },
  path: {
    heading: 'Background',
    rail: 'Industry placements and education.',
    seeProject: 'See project',
    groups: { work: 'Experience', study: 'Education' },
    items: [
      { kind: 'work', period: 'Dec 2025 – Mar 2026', title: 'R&D intern, embedded electronics and UAV', place: 'National Yunlin University of Science and Technology, Taiwan', project: 'uav' },
      { kind: 'study', period: '2024 – 2026', title: 'Master’s in Industrial Engineering, Electronics specialisation', place: 'HELHA, Mons' },
      { kind: 'work', period: 'Sep – Oct 2023', title: 'R&D and test-bench intern', place: 'Hitachi Energy, Jumet', project: 'hvdc' },
      { kind: 'study', period: '2020 – 2024', title: 'Bachelor’s in Industrial Engineering', place: 'HELHA, Mons' },
    ],
  },
  skills: {
    heading: 'Technical skills',
    rail: 'Seven domains and the associated work, filterable by the role they support.',
    filterLabel: 'Target roles',
    filterAll: 'All roles',
    roleList: [
      { id: 'emb', label: 'Embedded systems engineer' },
      { id: 'hw', label: 'Hardware / PCB design engineer' },
      { id: 'test', label: 'Test and validation engineer' },
      { id: 'uav', label: 'UAV / avionics engineer' },
      { id: 'int', label: 'Systems integration engineer' },
    ],
    capabilities: [
      {
        title: 'Mixed-signal PCB design',
        roles: ['hw', 'int'],
        statement: 'Multilayer boards with analog, digital and power sections on a shared stack-up.',
        evidence: [
          { project: 'lcr', text: 'Continuous ground plane, strict analog/digital separation and a low-noise symmetrical ±5 V supply.' },
          { project: 'robot', text: 'Mainboard with H-bridge motor drivers, DC/DC converters, Hall-effect current sensing and battery monitoring.' },
          { project: 'uav', text: 'Connected-glove proof-of-concept board around a Seeed XIAO nRF52840 Sense (designed, not assembled).' },
        ],
        tools: ['KiCad', 'Altium', 'IPC standards', 'EMI/EMC mitigation'],
      },
      {
        title: 'Analog front-ends and measurement',
        roles: ['hw', 'test'],
        statement: 'Signal conditioning, ranging and stage-by-stage validation on the bench.',
        evidence: [
          { project: 'lcr', text: 'MAX4582 and MAX4052 multiplexers, INA128 instrumentation amplifier, PGA103 programmable-gain amplifier and a DAC8811 multiplying DAC, qualified stage by stage on the oscilloscope.' },
          { project: 'hvdc', text: 'RC filter simulated and sized in LTspice; capacitor leakage currents recorded with a Fluke data logger.' },
        ],
        tools: ['INA128', 'PGA103', 'LTspice', 'QSPICE', 'Oscilloscope', 'Fluke'],
      },
      {
        title: 'Firmware close to the hardware',
        roles: ['emb', 'uav', 'int'],
        statement: 'C/C++ firmware on microcontrollers interfacing with ADCs, sensors and peer boards.',
        evidence: [
          { project: 'lcr', text: 'ESP32 with an external 12-bit AD7450 ADC chosen for its linearity; firmware still to be written.' },
          { project: 'robot', text: 'ATmega and ESP32-CAM slaves under a Raspberry Pi master, over SPI, I2C and UART.' },
        ],
        tools: ['C/C++', 'FreeRTOS', 'STM32 (CubeIDE)', 'ESP32', 'I2C', 'SPI', 'UART', 'CAN', 'BLE'],
      },
      {
        title: 'Signal processing and estimation',
        roles: ['emb', 'uav', 'test'],
        statement: 'Amplitude, phase and attitude estimation from sampled data.',
        evidence: [
          { project: 'lcr', text: 'Amplitude and phase extraction by DFT with coherent sampling; the hardware chain has not yet been measured end to end.' },
          { project: 'uav', text: 'Attitude from the EKF3 running on the flight controller; LiDAR scans combined with attitude and ToF altitude into a pseudo-3D map.' },
        ],
        tools: ['DSP / DFT', 'Kalman filter', 'MATLAB/Simulink'],
      },
      {
        title: 'Embedded Linux, data links and dashboards',
        roles: ['emb', 'uav', 'int'],
        statement: 'Data acquisition under embedded Linux, network transport and real-time visualisation.',
        evidence: [
          { project: 'uav', text: 'asyncio Python on a Raspberry Pi Zero 2W parsing an LD19 LiDAR stream at 230400 baud (CRC8) and broadcasting it over WebSocket.' },
          { project: 'uav', text: 'Pseudo-3D point-cloud view in a Three.js web client (projection and voxel filtering).' },
          { project: 'robot', text: 'Web control interface (HTTP, WebSockets, UDP) for video streaming, telemetry and arm control.' },
        ],
        tools: ['Embedded Linux', 'Python', 'Bash', 'JavaScript', 'Three.js', 'WebSockets', 'UDP'],
      },
      {
        title: 'Autonomous systems and sensing',
        roles: ['uav', 'emb', 'int'],
        statement: 'GPS-denied indoor flight and mechanical sizing.',
        evidence: [
          { project: 'uav', text: 'Indoor flight without GPS: LiDAR and ToF altitude combined with MAVLink attitude.' },
          { project: 'robot', text: 'Centre of gravity and maximum arm payload before tilting computed.' },
        ],
        tools: ['ArduPilot', 'Mission Planner', 'LiDAR', 'Sensor fusion', 'PID tuning'],
      },
      {
        title: 'Test, validation and safety',
        roles: ['test', 'uav', 'int'],
        statement: 'Design verification and high-voltage safety.',
        evidence: [
          { project: 'hvdc', text: 'Safety circuit designed for a 5 kV test: emergency stop, contactors and automatic discharge (design stage, not completed).' },
          { project: 'hvdc', text: 'Excel/VBA tool that turns raw data-logger measurements into an analysis sheet.' },
          { project: 'lcr', text: 'Analog chain qualified stage by stage, including op-amp compatibility problems.' },
        ],
        tools: ['Hardware-in-the-loop', 'VBA', 'Git/GitHub'],
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
          'FPGA and VHDL (Intel Quartus Prime, Cyclone V), timing analysis',
        ],
      },
      {
        title: 'Embedded',
        items: ['C/C++, FreeRTOS, STM32 (CubeIDE), ESP32', 'Embedded Linux on Raspberry Pi', 'I2C, SPI, UART, CAN, BLE'],
      },
      {
        title: 'Autonomous systems',
        items: ['ArduPilot, Mission Planner', 'LiDAR and sensor integration', 'Sensor fusion, PID tuning'],
      },
      {
        title: 'Signal and simulation',
        items: ['DSP and DFT', 'MATLAB/Simulink, LTspice, QSPICE, MicroCAP', 'Hardware-in-the-loop validation'],
      },
      {
        title: 'Software and methods',
        items: [
          'Python, Bash, VBA, JavaScript',
          'Git/GitHub, oscilloscope and test-bench validation',
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
    heading: 'LCR‑meter: measurement chain',
    rail: 'Signal path, from the BNC port to the result.',
    intro:
      'From the BNC port to the result: analog front end, 12-bit ADC, ESP32 and DSP. The screen shows the signal at each stage.',
    note: 'Stylised board and simplified signal path; the actual board is shown beside it. Signals come from a DSP model of the measurement principle (12-bit ADC, about 70 dB SNR, known V/I offset compensated), not from measurements or instrument firmware: the firmware is not written yet.',
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
    text: 'I am seeking a first engineering position in embedded systems and electronic integration. Preferred contact: email.',
    email: 'Email',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    source: 'Source code of this site',
  },
  cv: 'Download my CV (PDF)',
  footer: 'Built with Astro and Three.js. Anonymous visit statistics (GoatCounter), no cookies.',
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
    path: 'Parcours',
    contact: 'Contact',
    language: 'Langue',
    theme: 'Basculer entre thème clair et sombre',
  },
  hero: {
    role: 'Ingénieur industriel en électronique · systèmes embarqués, conception de PCB, instrumentation, drones',
    intro:
      'Conception et validation de systèmes électroniques embarqués, du schéma au firmware : PCB multicouches (KiCad), STM32, ESP32, chaînes d’acquisition.',
    cta: 'Compétences techniques',
    scroll: 'Espace ou défiler',
    road: '2020 → 2026',
    hw: { tag: 'HW', title: 'Hardware', subject: 'LCR-mètre · PCB v3', text: 'Carte mixte avec source DDS, CAN 12 bits et chaîne analogique qualifiée étage par étage au banc.', cta: 'Voir le projet LCR-mètre', alt: 'Vue 3D KiCad de la carte principale du LCR-mètre' },
    sw: { tag: 'SW', title: 'Software', subject: 'Drone d’intérieur · cartographie LiDAR', text: 'Acquisition asyncio sur Raspberry Pi, attitude EKF3 du contrôleur de vol, carte pseudo-3D dans le navigateur. Simulation en direct.', cta: 'Voir le projet drone' },
    hint: 'Glisser pour tourner',
    canvasLabel: 'Nuage de points interactif. Glisser, ou utiliser les flèches du clavier, pour tourner la vue.',
    hud: { altitude: 'Altitude', heading: 'Cap', points: 'Points' },
    demoNote: 'Carte stylisée et chemin simplifié. Les signaux viennent d’un modèle DSP de la mesure (CAN 12 bits, SNR d’environ 70 dB), pas de mesures : le firmware n’est pas encore écrit.',
    stepsLabel: 'Étapes du récit',
    steps: ['Intro', 'HW | SW', 'Hardware', 'Parcours', 'Software'],
  },
  projects: {
    heading: 'Projets',
    rail: 'Cinq projets, avec le périmètre de ma contribution pour chacun.',
    labels: { period: 'Période', place: 'Lieu', role: 'Rôle', result: 'Résultat' },
    items: [
      {
        id: 'uav',
        short: 'Drone',
        title: 'Drone d’intérieur : cartographie LiDAR et télémétrie',
        period: 'déc. 2025 – mars 2026',
        place: 'National Yunlin University of Science and Technology, Taïwan (laboratoire bioVLSI)',
        role: 'Stagiaire R&D, électronique embarquée et drones',
        summary:
          'Une architecture distribuée à bas coût pour un quadricoptère d’intérieur : acquisition LiDAR et ToF sur Raspberry Pi Zero 2W, estimation d’attitude EKF3 sur le contrôleur de vol, reconstruction pseudo-3D dans un client web et preuve de concept de gant connecté.',
        result: '4 critères sur 5 atteints : budget matériel ≈ 269 € à Taïwan (≈ 551 € en Europe, pour 500 €), masse totale de 910 g, ≈ 7 min de vol (essai unique), 0,11 % des trames LiDAR rejetées par CRC8. Précision du LD19 de 10 à 35 mm pour une cible de 55 mm ; la chaîne complète en vol n’a pas été comparée.',
        points: [
          'Application Python embarquée sur Raspberry Pi : un seul processus asyncio avec quatre tâches coopératives (LiDAR LD19 en UART à 230400 bauds, MAVLink du contrôleur de vol, altitude ToF VL53L1X en I²C, diffusion WebSocket).',
          'Écriture du parseur de trames LD19 avec resynchronisation sur l’en-tête et contrôle CRC8 par table ; les trames corrompues sont rejetées, jamais utilisées.',
          'Parsing du LiDAR déplacé du premier prototype XIAO vers la Pi après des erreurs de synchronisation et de CRC, ce qui a libéré le XIAO pour le gant.',
          'Reconstruction pseudo-3D en combinant les scans 2D, l’attitude MAVLink (EKF3 exécuté sur le contrôleur de vol) et l’altitude ToF ; projection et filtrage par voxels dans un client web Three.js.',
          'Conception sous KiCad du PCB d’une preuve de concept de gant connecté (Seeed XIAO nRF52840 Sense avec IMU intégrée, capteurs flex). La carte n’a pas été assemblée ; le concept a été testé sur breadboard.',
          'Débit mesuré de 2 245 pts/s pour un nominal de 4 500 pts/s, attribué à des désynchronisations périodiques du parseur sous ordonnancement coopératif.',
        ],
        tags: ['KiCad', 'Python', 'asyncio', 'Raspberry Pi', 'LiDAR', 'ArduPilot', 'MAVLink', 'Three.js', 'WebSocket'],
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
        place: 'HELHA, Mons (projet de master, en binôme avec Logan Re)',
        role: 'Conception hardware et embarquée (PCB v3)',
        summary:
          'Évolution, à deux, d’un LCR-mètre existant à pont auto-équilibré : nouveau PCB v3 avec source d’excitation DDS, CAN externe 12 bits et ESP32, pour un objectif d’exactitude de 0,5 %.',
        result: 'PCB v3 assemblé et chaîne analogique qualifiée étage par étage jusqu’au CNA multiplicateur. Firmware non écrit et pas encore de mesure de bout en bout : l’objectif de 0,5 % n’est donc pas démontré.',
        points: [
          'Conception reprise d’une carte 8051 à CAN interne 16 bits vers un ESP32 avec CAN externe AD7450 12 bits ; le CAN interne de l’ESP32 n’a pas la linéarité requise.',
          'Conception du PCB v3 sous KiCad : DDS AD9850, CAN AD7450, ESP32 et circuits d’alimentation ajoutés à la topologie héritée.',
          'Chaîne analogique conservée : multiplexeurs MAX4582 et MAX4052, amplificateur d’instrumentation INA128, amplificateur à gain programmable PGA103 et CNA multiplicateur DAC8811 ; tension et courant passent tour à tour par le même convertisseur.',
          'Extraction prévue de l’amplitude et de la phase par DFT avec échantillonnage cohérent (nombre entier d’échantillons sur un nombre entier de périodes).',
          'Deux défauts de routage du PCB v3 identifiés et contournés (erreur d’empreinte de l’alimentation 12 V vers ±5 V, erreur de placement du DDS avec excitation par BNC externe).',
          'La démo de la chaîne de mesure, plus haut, reproduit le principe sur des signaux synthétiques.',
        ],
        tags: ['KiCad', 'ESP32', 'C/C++', 'DSP', 'AD7450', 'AD9850', 'INA128', 'PGA103'],
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
        place: 'HELHA, Mons (projet de bachelier, équipe de trois)',
        role: 'Conception hardware et embarquée',
        summary:
          'Un robot à chenilles télécommandé avec bras 6 axes, vidéo en direct et télémétrie environnementale ; moteurs et batterie fournis, électronique, boîtier et logiciel réalisés par l’équipe.',
        result: 'Robot fonctionnel pour 260 € sur un budget de 300 €. Autonomie limitée à environ 15 minutes par la surchauffe du convertisseur DC/DC.',
        points: [
          'Architecture distribuée : Raspberry Pi maître, esclaves ATmega et ESP32-CAM en SPI, I2C et UART.',
          'Trois PCB conçus sous KiCad (puissance, commande maître, interface et télémétrie) : ponts en H, convertisseur DC/DC 12 V vers 5 V, coupure batterie à 9 V, fusible et protection contre l’inversion de polarité.',
          'Interface web de pilotage (HTTP, WebSockets, UDP) pour le streaming vidéo, la télémétrie et la commande du bras.',
          'Calcul du centre de gravité et de la charge maximale du bras avant basculement ; boîtier et pièces imprimés en 3D.',
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
        title: 'Module de test de courant de fuite HVDC',
        period: 'sept. 2023 – oct. 2023',
        place: 'Hitachi Energy, Jumet (Belgique), stage de 6 semaines',
        role: 'Stagiaire R&D, Technology Center',
        summary:
          'Deux tâches liées sur le test de courant de fuite de condensateurs haute tension DC (environ 5 kV) : automatiser le traitement des mesures du data logger, puis concevoir un module portable mesurant 10 condensateurs en parallèle.',
        result: 'Automatisation Excel/VBA livrée aux ingénieurs. Le module portable (conception de sécurité, décharge automatique, filtre RC) a été conçu mais pas terminé : il restait 3 jours à l’arrivée des pièces.',
        points: [
          'Automatisation du traitement des mesures du data logger Fluke avec un outil Excel/VBA conçu pour les ingénieurs et opérateurs.',
          'Modélisation et dimensionnement d’un filtre RC sous LTspice pour réduire l’ondulation de l’alimentation et la dispersion du courant de fuite.',
          'Conception du circuit de sécurité : boutons ON/OFF et arrêt d’urgence pilotant des contacteurs, avec décharge automatique des condensateurs à l’arrêt du test.',
          'Dimensionnement des contacteurs avec marge sur la distance d’arc à 5 kV (deux contacts en série par condensateur) ; temps insuffisant pour terminer la réalisation.',
        ],
        tags: ['LTspice', 'VBA', 'Excel', 'HVDC', 'Sécurité'],
        figures: [],
      },
      {
        id: 'fpga',
        short: 'Jeu FPGA',
        title: 'Moteur de jeu sur FPGA Intel Cyclone V (VHDL)',
        period: 'oct. 2025',
        place: 'HELHA, Mons (cours, équipe de trois)',
        role: 'Conception numérique en VHDL',
        summary:
          'Un Flappy Bird simplifié sur carte DE0-CV (Cyclone V) : les murs défilent sur six afficheurs sept segments, l’oiseau occupe celui de droite, deux boutons le déplacent, des switchs choisissent l’une des trois difficultés et les LEDs indiquent l’état du jeu.',
        result: 'Synthèse sous Quartus Prime Lite : 201 éléments logiques sur 18 480 (environ 1 %), ni RAM ni blocs DSP. Marge de setup au pire cas de +13,6 ns à 50 MHz (Fmax équivalente d’environ 155 MHz), marge de hold positive.',
        points: [
          'Déroulement du jeu en FSM à quatre états (OFF, MENU, RUNNING, GAME OVER) : SW3 allume le jeu, SW0 à SW2 choisissent la difficulté (la plus haute l’emporte si plusieurs sont actifs), un bouton lance la partie, une collision fige l’affichage et allume la LED Game Over.',
          'Murs produits par un registre à décalage circulaire de 60 bits par difficulté (2 bits par pas, quatre positions verticales) ; la difficulté modifie la vitesse de défilement, la taille des ouvertures et le nombre de transitions haut/bas.',
          'Entrées boutons avec anti-rebond produisant des impulsions d’un cycle d’horloge (haut, bas, start, reset), et générateur de clock enable qui fixe la cadence de défilement selon la difficulté.',
          'Détection de collision qui réutilise les signaux d’affichage : segments de l’oiseau et d’un mur actifs ensemble, filtrés par un compteur de cycles consécutifs et un cooldown pour éviter les détections multiples.',
          'Huit modules VHDL indépendants, chacun simulé avec son propre testbench (vérification des chronogrammes et assertions).',
          'Analyse de timing statique sous TimeQuest aux coins lent 85 °C et rapide 0 °C ; les chemins critiques se trouvent dans le diviseur d’horloge, la FSM et les comparateurs de murs.',
          'Améliorations identifiées : affichage du score, niveau de difficulté supplémentaire et registre du meilleur score.',
        ],
        tags: ['VHDL', 'Quartus Prime', 'Cyclone V', 'DE0-CV', 'FSM', 'Testbenchs', 'Analyse de timing'],
        figures: [],
      },
    ],
  },
  path: {
    heading: 'Parcours',
    rail: 'Stages en entreprise et formation.',
    seeProject: 'Voir le projet',
    groups: { work: 'Expérience', study: 'Formation' },
    items: [
      { kind: 'work', period: 'déc. 2025 – mars 2026', title: 'Stagiaire R&D, électronique embarquée et drone', place: 'National Yunlin University of Science and Technology, Taïwan', project: 'uav' },
      { kind: 'study', period: '2024 – 2026', title: 'Master en sciences de l’ingénieur industriel, orientation électronique', place: 'HELHA, Mons' },
      { kind: 'work', period: 'sept. – oct. 2023', title: 'Stagiaire R&D et banc de test', place: 'Hitachi Energy, Jumet', project: 'hvdc' },
      { kind: 'study', period: '2020 – 2024', title: 'Bachelier en sciences de l’ingénieur industriel', place: 'HELHA, Mons' },
    ],
  },
  skills: {
    heading: 'Compétences techniques',
    rail: 'Sept domaines et les réalisations associées, filtrables selon le poste visé.',
    filterLabel: 'Postes visés',
    filterAll: 'Tous les postes',
    roleList: [
      { id: 'emb', label: 'Ingénieur systèmes embarqués' },
      { id: 'hw', label: 'Ingénieur hardware · conception PCB' },
      { id: 'test', label: 'Ingénieur test et validation' },
      { id: 'uav', label: 'Ingénieur drones · avionique' },
      { id: 'int', label: 'Ingénieur intégration système' },
    ],
    capabilities: [
      {
        title: 'Conception de PCB mixtes',
        roles: ['hw', 'int'],
        statement: 'Cartes multicouches avec sections analogique, numérique et puissance sur un même empilement.',
        evidence: [
          { project: 'lcr', text: 'Plan de masse continu, séparation stricte analogique/numérique et alimentation symétrique ±5 V à faible bruit.' },
          { project: 'robot', text: 'Carte principale avec pilotes de moteurs en pont en H, convertisseurs DC/DC, mesure de courant à effet Hall et surveillance de la batterie.' },
          { project: 'uav', text: 'Carte de preuve de concept du gant connecté autour d’un Seeed XIAO nRF52840 Sense (conçue, non assemblée).' },
        ],
        tools: ['KiCad', 'Altium', 'Normes IPC', 'Réduction EMI/EMC'],
      },
      {
        title: 'Étages d’entrée analogiques et mesure',
        roles: ['hw', 'test'],
        statement: 'Conditionnement du signal, gestion des gammes et validation étage par étage sur banc.',
        evidence: [
          { project: 'lcr', text: 'Multiplexeurs MAX4582 et MAX4052, amplificateur d’instrumentation INA128, amplificateur à gain programmable PGA103 et CNA multiplicateur DAC8811, qualifiés étage par étage à l’oscilloscope.' },
          { project: 'hvdc', text: 'Filtre RC simulé et dimensionné sous LTspice ; courants de fuite des condensateurs enregistrés avec un data logger Fluke.' },
        ],
        tools: ['INA128', 'PGA103', 'LTspice', 'QSPICE', 'Oscilloscope', 'Fluke'],
      },
      {
        title: 'Firmware au plus près du matériel',
        roles: ['emb', 'uav', 'int'],
        statement: 'Firmware C/C++ sur microcontrôleurs : interfaçage avec des CAN, des capteurs et des cartes tierces.',
        evidence: [
          { project: 'lcr', text: 'ESP32 avec CAN externe AD7450 12 bits choisi pour sa linéarité ; firmware encore à écrire.' },
          { project: 'robot', text: 'Esclaves ATmega et ESP32-CAM sous un Raspberry Pi maître, en SPI, I2C et UART.' },
        ],
        tools: ['C/C++', 'FreeRTOS', 'STM32 (CubeIDE)', 'ESP32', 'I2C', 'SPI', 'UART', 'CAN', 'BLE'],
      },
      {
        title: 'Traitement du signal et estimation',
        roles: ['emb', 'uav', 'test'],
        statement: 'Estimation d’amplitude, de phase et d’attitude à partir de données échantillonnées.',
        evidence: [
          { project: 'lcr', text: 'Extraction de l’amplitude et de la phase par DFT avec échantillonnage cohérent ; la chaîne matérielle n’a pas encore été mesurée de bout en bout.' },
          { project: 'uav', text: 'Attitude fournie par l’EKF3 du contrôleur de vol ; scans LiDAR combinés à l’attitude et à l’altitude ToF en carte pseudo-3D.' },
        ],
        tools: ['DSP / DFT', 'Filtre de Kalman', 'MATLAB/Simulink'],
      },
      {
        title: 'Linux embarqué, liaisons de données et tableaux de bord',
        roles: ['emb', 'uav', 'int'],
        statement: 'Acquisition de données sous Linux embarqué, transport réseau et visualisation temps réel.',
        evidence: [
          { project: 'uav', text: 'Python asyncio sur Raspberry Pi Zero 2W pour lire un flux LiDAR LD19 à 230400 bauds (CRC8) et le diffuser en WebSocket.' },
          { project: 'uav', text: 'Vue du nuage de points pseudo-3D dans un client web Three.js (projection et filtrage par voxels).' },
          { project: 'robot', text: 'Interface web de pilotage (HTTP, WebSockets, UDP) pour le flux vidéo, la télémétrie et la commande du bras.' },
        ],
        tools: ['Linux embarqué', 'Python', 'Bash', 'JavaScript', 'Three.js', 'WebSockets', 'UDP'],
      },
      {
        title: 'Systèmes autonomes et perception',
        roles: ['uav', 'emb', 'int'],
        statement: 'Vol en intérieur sans GPS et dimensionnement mécanique.',
        evidence: [
          { project: 'uav', text: 'Vol en intérieur sans GPS : LiDAR et altitude ToF combinés à l’attitude MAVLink.' },
          { project: 'robot', text: 'Calcul du centre de gravité et de la charge maximale du bras avant basculement.' },
        ],
        tools: ['ArduPilot', 'Mission Planner', 'LiDAR', 'Fusion de capteurs', 'Réglage de PID'],
      },
      {
        title: 'Test, validation et sécurité',
        roles: ['test', 'uav', 'int'],
        statement: 'Vérification de conception et sécurité haute tension.',
        evidence: [
          { project: 'hvdc', text: 'Circuit de sécurité conçu pour un test à 5 kV : arrêt d’urgence, contacteurs et décharge automatique (stade conception, non terminé).' },
          { project: 'hvdc', text: 'Outil Excel/VBA qui transforme les mesures brutes du data logger en feuille d’analyse.' },
          { project: 'lcr', text: 'Chaîne analogique qualifiée étage par étage, y compris des problèmes de compatibilité d’amplificateurs opérationnels.' },
        ],
        tools: ['Hardware-in-the-loop', 'VBA', 'Git/GitHub'],
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
          'FPGA et VHDL (Intel Quartus Prime, Cyclone V), analyse de timing',
        ],
      },
      {
        title: 'Embarqué',
        items: ['C/C++, FreeRTOS, STM32 (CubeIDE), ESP32', 'Linux embarqué sur Raspberry Pi', 'I2C, SPI, UART, CAN, BLE'],
      },
      {
        title: 'Systèmes autonomes',
        items: ['ArduPilot, Mission Planner', 'Intégration de LiDAR et de capteurs', 'Fusion de capteurs, réglage de PID'],
      },
      {
        title: 'Signal et simulation',
        items: ['DSP et DFT', 'MATLAB/Simulink, LTspice, QSPICE, MicroCAP', 'Validation en hardware-in-the-loop'],
      },
      {
        title: 'Logiciel et méthodes',
        items: [
          'Python, Bash, VBA, JavaScript',
          'Git/GitHub, validation à l’oscilloscope et sur banc de test',
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
    heading: 'LCR‑mètre : chaîne de mesure',
    rail: 'Chemin du signal, de la prise BNC au résultat.',
    intro:
      'De la prise BNC au résultat : étage analogique, CAN 12 bits, ESP32 et DSP. L’écran affiche le signal à chaque étape.',
    note: 'Carte stylisée et chemin du signal simplifié ; la carte réelle est affichée à côté. Les signaux proviennent d’un modèle DSP du principe de mesure (CAN 12 bits, SNR d’environ 70 dB, décalage V/I connu et compensé), et non de mesures ou du firmware de l’instrument : celui-ci n’est pas encore écrit.',
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
    text: 'Je recherche un premier poste d’ingénieur en systèmes embarqués et intégration électronique. Contact de préférence par e-mail.',
    email: 'E-mail',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    source: 'Code source de ce site',
  },
  cv: 'Télécharger mon CV (PDF)',
  footer: 'Réalisé avec Astro et Three.js. Statistiques de visite anonymes (GoatCounter), aucun cookie.',
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
    path: 'Loopbaan',
    contact: 'Contact',
    language: 'Taal',
    theme: 'Wisselen tussen licht en donker thema',
  },
  hero: {
    role: 'Industrieel ingenieur elektronica · embedded systemen, PCB-ontwerp, instrumentatie, drones',
    intro:
      'Ontwerp en validatie van embedded elektronische systemen, van schema tot firmware: meerlaagse PCB’s (KiCad), STM32, ESP32, meetketens.',
    cta: 'Technische vaardigheden',
    scroll: 'Spatie of scroll',
    road: '2020 → 2026',
    hw: { tag: 'HW', title: 'Hardware', subject: 'LCR-meter · PCB v3', text: 'Mixed-signal-print met DDS-bron, 12-bit-ADC en een analoge keten die trap voor trap op de testbank is gekwalificeerd.', cta: 'Bekijk het LCR-meterproject', alt: 'KiCad 3D-weergave van de hoofdprint van de LCR-meter' },
    sw: { tag: 'SW', title: 'Software', subject: 'Indoor-drone · LiDAR-kartering', text: 'asyncio-acquisitie op een Raspberry Pi, EKF3-stand van de flight controller, pseudo-3D-kaart in de browser. Live simulatie.', cta: 'Bekijk het dronproject' },
    hint: 'Sleep om te draaien',
    canvasLabel: 'Interactieve puntenwolk. Sleep, of gebruik de pijltjestoetsen, om de weergave te draaien.',
    hud: { altitude: 'Hoogte', heading: 'Koers', points: 'Punten' },
    demoNote: 'Gestileerde print en vereenvoudigd pad. De signalen komen uit een DSP-model van de meting (12-bit-ADC, SNR van ongeveer 70 dB), niet uit metingen: de firmware is nog niet geschreven.',
    stepsLabel: 'Stappen van het verhaal',
    steps: ['Intro', 'HW | SW', 'Hardware', 'Traject', 'Software'],
  },
  projects: {
    heading: 'Projecten',
    rail: 'Vijf projecten, met de omvang van mijn bijdrage per project.',
    labels: { period: 'Periode', place: 'Waar', role: 'Rol', result: 'Resultaat' },
    items: [
      {
        id: 'uav',
        short: 'Drone',
        title: 'Indoor-drone: LiDAR-kartering en telemetrie',
        period: 'dec. 2025 – mrt. 2026',
        place: 'National Yunlin University of Science and Technology, Taiwan (bioVLSI-laboratorium)',
        role: 'Stagiair R&D, embedded elektronica en drones',
        summary:
          'Een goedkope gedistribueerde architectuur voor een indoor-quadcopter: LiDAR- en ToF-acquisitie op een Raspberry Pi Zero 2W, EKF3-standschatting op de flight controller, pseudo-3D-reconstructie in een webclient en een proof of concept van een verbonden handschoen.',
        result: '4 van de 5 criteria gehaald: hardwarebudget ≈ €269 in Taiwan (≈ €551 in Europa, bij een doel van €500), 910 g totale massa, ≈ 7 min vlucht (één test), 0,11 % van de LiDAR-frames afgewezen door CRC8. Nauwkeurigheid van de LD19 van 10–35 mm bij een doel van 55 mm; de volledige keten in vlucht is niet vergeleken.',
        points: [
          'Python-companiontoepassing op de Raspberry Pi: één asyncio-proces met vier samenwerkende taken (LD19-LiDAR via UART op 230400 baud, MAVLink van de flight controller, VL53L1X-ToF-hoogte via I²C, WebSocket-broadcast).',
          'LD19-frameparser met hersynchronisatie op de header en tabelgestuurde CRC8-controle; beschadigde frames worden afgewezen en nooit gebruikt.',
          'LiDAR-parsing verplaatst van het eerste XIAO-prototype naar de Pi na synchronisatie- en CRC-fouten, waardoor de XIAO vrijkwam voor de handschoen.',
          'Pseudo-3D-reconstructie door 2D-scans te combineren met MAVLink-standsinformatie (EKF3 draait op de flight controller) en ToF-hoogte; projectie en voxelfiltering in een Three.js-webclient.',
          'PCB van een proof of concept van een verbonden handschoen ontworpen in KiCad (Seeed XIAO nRF52840 Sense met ingebouwde IMU, flexsensoren). Het bord is niet gemonteerd; het concept is getest op een breadboard.',
          'Gemeten doorvoer van 2.245 pts/s tegenover een nominale 4.500 pts/s, toegeschreven aan periodieke desynchronisatie van de parser bij coöperatieve planning.',
        ],
        tags: ['KiCad', 'Python', 'asyncio', 'Raspberry Pi', 'LiDAR', 'ArduPilot', 'MAVLink', 'Three.js', 'WebSocket'],
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
        place: 'HELHA, Mons (masterproject, in duo met Logan Re)',
        role: 'Hardware- en embedded ontwerp (PCB v3)',
        summary:
          'Herwerking, in duo, van een bestaande LCR-meter met zelfbalancerende brug: nieuwe PCB v3 met DDS-excitatiebron, externe 12-bit-ADC en ESP32, met een nauwkeurigheidsdoel van 0,5 %.',
        result: 'PCB v3 gemonteerd en de analoge keten trap voor trap gekwalificeerd tot en met de vermenigvuldigende DAC. Firmware niet geschreven en nog geen end-to-end-meting: het doel van 0,5 % is dus niet aangetoond.',
        points: [
          'Ontwerp omgezet van een 8051-bord met interne 16-bit-ADC naar een ESP32 met externe 12-bit AD7450-ADC; de interne ADC van de ESP32 is onvoldoende lineair.',
          'PCB v3 ontworpen in KiCad: AD9850-DDS, AD7450-ADC, ESP32 en voedingscircuits toegevoegd aan de overgenomen topologie.',
          'Analoge keten behouden: MAX4582- en MAX4052-multiplexers, INA128-instrumentatieversterker, PGA103 met programmeerbare versterking en DAC8811 als vermenigvuldigende DAC; spanning en stroom lopen na elkaar via dezelfde omzetter.',
          'Geplande extractie van amplitude en fase met een DFT en coherente bemonstering (geheel aantal samples over een geheel aantal perioden).',
          'Twee routeringsfouten op PCB v3 gevonden en omzeild (footprintfout van de 12 V naar ±5 V-voeding en plaatsingsfout van de DDS, met excitatie via een externe BNC).',
          'De demo van de meetketen hierboven toont het principe op synthetische signalen.',
        ],
        tags: ['KiCad', 'ESP32', 'C/C++', 'DSP', 'AD7450', 'AD9850', 'INA128', 'PGA103'],
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
        place: 'HELHA, Mons (bachelorproject, team van drie)',
        role: 'Hardware- en embedded ontwerp',
        summary:
          'Een afstandsbediende rupsrobot met 6-assige arm, livevideo en omgevingstelemetrie; motoren en batterij werden geleverd, elektronica, behuizing en software zijn door het team gemaakt.',
        result: 'Werkende robot voor €260 bij een budget van €300. De autonomie is beperkt tot ongeveer 15 minuten door oververhitting van de DC/DC-omzetter.',
        points: [
          'Gedistribueerde architectuur: Raspberry Pi als master, ATmega- en ESP32-CAM-slaves via SPI, I2C en UART.',
          'Drie eigen PCB’s in KiCad (vermogen, master, interface en telemetrie) met H-bruggen, een DC/DC-omzetter van 12 V naar 5 V, batterij-uitschakeling bij 9 V, zekering en beveiliging tegen omgekeerde polariteit.',
          'Webinterface voor besturing (HTTP, WebSockets, UDP) voor videostreaming, telemetrie en aansturing van de arm.',
          'Zwaartepunt en maximale armlast voor kantelen berekend; behuizing en onderdelen 3D-geprint.',
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
        title: 'Testmodule voor lekstroom bij HVDC',
        period: 'sept. 2023 – okt. 2023',
        place: 'Hitachi Energy, Jumet (België), stage van 6 weken',
        role: 'Stagiair R&D, Technology Center',
        summary:
          'Twee samenhangende taken rond de lekstroomtest van hoogspannings-gelijkstroomcondensatoren (circa 5 kV): de verwerking van de datalogger-metingen automatiseren en een draagbare module ontwerpen die 10 condensatoren parallel meet.',
        result: 'Excel/VBA-automatisering opgeleverd aan de ingenieurs. De draagbare module (veiligheidsontwerp, automatische ontlading, RC-filter) is ontworpen maar niet afgewerkt: er resteerden 3 dagen toen de onderdelen aankwamen.',
        points: [
          'Verwerking van de Fluke-dataloggermetingen geautomatiseerd met een Excel/VBA-tool voor ingenieurs en operators.',
          'RC-filter gemodelleerd en gedimensioneerd in LTspice om de rimpel van de voeding en de spreiding van de lekstroom te verminderen.',
          'Veiligheidscircuit ontworpen: ON/OFF- en noodstopknop die contactoren aansturen, met automatische ontlading van de condensatoren bij het stoppen van de test.',
          'Contactoren gedimensioneerd met marge op de boogafstand bij 5 kV (twee contacten in serie per condensator); te weinig tijd om de realisatie af te werken.',
        ],
        tags: ['LTspice', 'VBA', 'Excel', 'HVDC', 'Veiligheid'],
        figures: [],
      },
      {
        id: 'fpga',
        short: 'FPGA-spel',
        title: 'Game-engine op Intel Cyclone V FPGA (VHDL)',
        period: 'okt. 2025',
        place: 'HELHA, Mons (opleidingsproject, team van drie)',
        role: 'Digitaal ontwerp in VHDL',
        summary:
          'Een vereenvoudigde Flappy Bird op een DE0-CV-bord (Cyclone V): muren schuiven over zes zevensegmentdisplays, de vogel staat op de meest rechtse, twee knoppen bewegen hem, schakelaars kiezen een van drie moeilijkheidsgraden en de LED’s tonen de spelstatus.',
        result: 'Gesynthetiseerd in Quartus Prime Lite: 201 logische elementen van 18.480 (ongeveer 1 %), geen RAM of DSP-blokken. Setup-marge in het slechtste geval +13,6 ns bij 50 MHz (equivalente Fmax ongeveer 155 MHz), positieve hold-marge.',
        points: [
          'Spelverloop als FSM met vier toestanden (OFF, MENU, RUNNING, GAME OVER): SW3 schakelt het spel in, SW0 tot SW2 kiezen de moeilijkheid (de hoogste wint als er meerdere aanstaan), een knop start het spel en een botsing bevriest het scherm en laat de Game Over-LED branden.',
          'Muren komen uit een cyclisch schuifregister van 60 bits per moeilijkheid (2 bits per stap, vier verticale posities); de moeilijkheid bepaalt de scrollsnelheid, de grootte van de openingen en het aantal wissels boven/onder.',
          'Ontdenderde knopingangen die pulsen van één klokcyclus geven (omhoog, omlaag, start, reset), en een clock-enable-generator die de scrollsnelheid per moeilijkheid instelt.',
          'Botsingsdetectie hergebruikt de displaysignalen: segmenten van vogel en muur tegelijk actief, gefilterd met een teller van opeenvolgende cycli en een cooldown tegen herhaalde detecties.',
          'Acht onafhankelijke VHDL-modules, elk gesimuleerd met een eigen testbench (controle van golfvormen en assertions).',
          'Statische timinganalyse in TimeQuest in de trage 85 °C- en snelle 0 °C-hoek; de kritieke paden zitten in de klokdeler, de FSM en de muurcomparatoren.',
          'Geïdentificeerde verbeteringen: scoreweergave, een extra moeilijkheidsgraad en een register voor de beste score.',
        ],
        tags: ['VHDL', 'Quartus Prime', 'Cyclone V', 'DE0-CV', 'FSM', 'Testbenches', 'Timinganalyse'],
        figures: [],
      },
    ],
  },
  path: {
    heading: 'Loopbaan',
    rail: 'Stages in het bedrijfsleven en opleiding.',
    seeProject: 'Bekijk het project',
    groups: { work: 'Ervaring', study: 'Opleiding' },
    items: [
      { kind: 'work', period: 'dec. 2025 – mrt. 2026', title: 'R&D-stagiair, embedded elektronica en drones', place: 'National Yunlin University of Science and Technology, Taiwan', project: 'uav' },
      { kind: 'study', period: '2024 – 2026', title: 'Master industrieel ingenieur, afstudeerrichting elektronica', place: 'HELHA, Mons' },
      { kind: 'work', period: 'sept. – okt. 2023', title: 'R&D- en testbankstagiair', place: 'Hitachi Energy, Jumet', project: 'hvdc' },
      { kind: 'study', period: '2020 – 2024', title: 'Bachelor industrieel ingenieur', place: 'HELHA, Mons' },
    ],
  },
  skills: {
    heading: 'Technische vaardigheden',
    rail: 'Zeven domeinen met bijbehorend werk, filterbaar per beoogde functie.',
    filterLabel: 'Beoogde functies',
    filterAll: 'Alle functies',
    roleList: [
      { id: 'emb', label: 'Embedded-systemenengineer' },
      { id: 'hw', label: 'Hardware- / PCB-ontwerper' },
      { id: 'test', label: 'Test- en validatie-engineer' },
      { id: 'uav', label: 'Drone- / avionica-engineer' },
      { id: 'int', label: 'Systeemintegratie-engineer' },
    ],
    capabilities: [
      {
        title: 'Ontwerp van mixed-signal PCB’s',
        roles: ['hw', 'int'],
        statement: 'Meerlaagse prints met analoge, digitale en vermogenssecties op dezelfde opbouw.',
        evidence: [
          { project: 'lcr', text: 'Doorlopend massavlak, strikte scheiding van analoog en digitaal en een ruisarme symmetrische ±5 V-voeding.' },
          { project: 'robot', text: 'Hoofdbord met H-brug-motordrivers, DC/DC-omvormers, stroommeting met Hall-sensoren en bewaking van de accu.' },
          { project: 'uav', text: 'Bord van een proof of concept van de verbonden handschoen rond een Seeed XIAO nRF52840 Sense (ontworpen, niet gemonteerd).' },
        ],
        tools: ['KiCad', 'Altium', 'IPC-normen', 'EMI/EMC-beperking'],
      },
      {
        title: 'Analoge ingangstrappen en metingen',
        roles: ['hw', 'test'],
        statement: 'Signaalconditionering, bereikkeuze en validatie per trap op de testbank.',
        evidence: [
          { project: 'lcr', text: 'MAX4582- en MAX4052-multiplexers, INA128-instrumentatieversterker, PGA103 met programmeerbare versterking en een DAC8811 als vermenigvuldigende DAC, trap voor trap gekwalificeerd met de oscilloscoop.' },
          { project: 'hvdc', text: 'RC-filter gesimuleerd en gedimensioneerd in LTspice; lekstromen van de condensatoren geregistreerd met een Fluke-datalogger.' },
        ],
        tools: ['INA128', 'PGA103', 'LTspice', 'QSPICE', 'Oscilloscoop', 'Fluke'],
      },
      {
        title: 'Firmware dicht bij de hardware',
        roles: ['emb', 'uav', 'int'],
        statement: 'C/C++-firmware op microcontrollers met koppeling naar ADC’s, sensoren en andere borden.',
        evidence: [
          { project: 'lcr', text: 'ESP32 met een externe 12-bit AD7450-ADC, gekozen om zijn lineariteit; firmware nog te schrijven.' },
          { project: 'robot', text: 'ATmega- en ESP32-CAM-slaves onder een Raspberry Pi als master, via SPI, I2C en UART.' },
        ],
        tools: ['C/C++', 'FreeRTOS', 'STM32 (CubeIDE)', 'ESP32', 'I2C', 'SPI', 'UART', 'CAN', 'BLE'],
      },
      {
        title: 'Signaalverwerking en schatting',
        roles: ['emb', 'uav', 'test'],
        statement: 'Schatting van amplitude, fase en stand uit bemonsterde data.',
        evidence: [
          { project: 'lcr', text: 'Extractie van amplitude en fase met een DFT en coherente bemonstering; de hardwareketen is nog niet end-to-end gemeten.' },
          { project: 'uav', text: 'Standsbepaling door de EKF3 van de flight controller; LiDAR-scans gecombineerd met stand en ToF-hoogte tot een pseudo-3D-kaart.' },
        ],
        tools: ['DSP / DFT', 'Kalman-filter', 'MATLAB/Simulink'],
      },
      {
        title: 'Embedded Linux, datalinks en dashboards',
        roles: ['emb', 'uav', 'int'],
        statement: 'Dataverwerving onder embedded Linux, netwerktransport en realtime visualisatie.',
        evidence: [
          { project: 'uav', text: 'asyncio-Python op een Raspberry Pi Zero 2W die een LD19-LiDAR-stroom van 230400 baud (CRC8) leest en via WebSocket doorstuurt.' },
          { project: 'uav', text: 'Pseudo-3D-puntenwolk in een Three.js-webclient (projectie en voxelfiltering).' },
          { project: 'robot', text: 'Webinterface voor bediening (HTTP, WebSockets, UDP) voor videostreaming, telemetrie en besturing van de arm.' },
        ],
        tools: ['Embedded Linux', 'Python', 'Bash', 'JavaScript', 'Three.js', 'WebSockets', 'UDP'],
      },
      {
        title: 'Autonome systemen en waarneming',
        roles: ['uav', 'emb', 'int'],
        statement: 'Indoor vliegen zonder GPS en mechanische dimensionering.',
        evidence: [
          { project: 'uav', text: 'Vlucht binnen zonder GPS: LiDAR en ToF-hoogte gecombineerd met de MAVLink-stand.' },
          { project: 'robot', text: 'Zwaartepunt en maximale armlast voor het kantelen berekend.' },
        ],
        tools: ['ArduPilot', 'Mission Planner', 'LiDAR', 'Sensorfusie', 'PID-afstelling'],
      },
      {
        title: 'Testen, valideren en veiligheid',
        roles: ['test', 'uav', 'int'],
        statement: 'Ontwerpverificatie en hoogspanningsveiligheid.',
        evidence: [
          { project: 'hvdc', text: 'Veiligheidscircuit ontworpen voor een test op 5 kV: noodstop, contactoren en automatische ontlading (ontwerpfase, niet afgewerkt).' },
          { project: 'hvdc', text: 'Excel/VBA-tool die ruwe datalogger-metingen omzet in een analyseblad.' },
          { project: 'lcr', text: 'Analoge keten trap voor trap gekwalificeerd, inclusief compatibiliteitsproblemen met operationele versterkers.' },
        ],
        tools: ['Hardware-in-the-loop', 'VBA', 'Git/GitHub'],
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
          'FPGA en VHDL (Intel Quartus Prime, Cyclone V), timinganalyse',
        ],
      },
      {
        title: 'Embedded',
        items: ['C/C++, FreeRTOS, STM32 (CubeIDE), ESP32', 'Embedded Linux op Raspberry Pi', 'I2C, SPI, UART, CAN, BLE'],
      },
      {
        title: 'Autonome systemen',
        items: ['ArduPilot, Mission Planner', 'Integratie van LiDAR en sensoren', 'Sensorfusie, PID-afstelling'],
      },
      {
        title: 'Signaal en simulatie',
        items: ['DSP en DFT', 'MATLAB/Simulink, LTspice, QSPICE, MicroCAP', 'Validatie met hardware-in-the-loop'],
      },
      {
        title: 'Software en methodes',
        items: [
          'Python, Bash, VBA, JavaScript',
          'Git/GitHub, validatie met oscilloscoop en testbank',
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
    heading: 'LCR‑meter: meetketen',
    rail: 'Signaalpad, van de BNC-poort tot het resultaat.',
    intro:
      'Van de BNC-poort tot het resultaat: analoge ingangstrap, 12-bit-ADC, ESP32 en DSP. Het scherm toont het signaal in elke trap.',
    note: 'Gestileerde print en vereenvoudigd signaalpad; de echte print staat ernaast. De signalen komen uit een DSP-model van het meetprincipe (12-bit-ADC, SNR van ongeveer 70 dB, bekend V/I-verschil gecompenseerd), niet uit metingen of firmware van het instrument: die firmware is nog niet geschreven.',
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
    text: 'Ik zoek een eerste ingenieursfunctie in embedded systemen en elektronische integratie. Contact bij voorkeur via e-mail.',
    email: 'E-mail',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    source: 'Broncode van deze site',
  },
  cv: 'Mijn cv downloaden (PDF)',
  footer: 'Gebouwd met Astro en Three.js. Anonieme bezoekstatistieken (GoatCounter), geen cookies.',
};

export const content: Record<Lang, Content> = { en, fr, nl };
