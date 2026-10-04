const SILHOUETTE = "#ff2d2d";

const PERSON = {
  meters: 1.8,
  axis: "height",
  viewBox: "0 0 60 200",
  color: "#4da3ff",
  shape: `
    <ellipse cx="32" cy="16" rx="13" ry="16"/>
    <path d="
      M22 28
      C16 36 14 50 18 62
      C12 74 10 98 14 118
      L8 200
      H22
      L28 152
      L32 200
      H46
      L40 144
      C50 128 54 100 48 76
      L42 60
      C46 48 44 34 38 28
      Z
    "/>
  `,
};

const OBJECTS = [
  {
    id: "ant",
    title: "Ant",
    noun: "an ant",
    axis: "width",
    measure: "length",
    hint: "Body length",
    meters: 0.005,
    note: "A typical worker ant is about 5 mm long.",
    color: SILHOUETTE,
    viewBox: "0 0 180 70",
    shape: `
      <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
        <path d="M30 28 C16 16 8 10 0 6"/>
        <path d="M36 24 C32 10 40 4 50 0"/>
      </g>
      <ellipse cx="40" cy="36" rx="16" ry="12"/>
      <ellipse cx="74" cy="38" rx="16" ry="11"/>
      <ellipse cx="134" cy="40" rx="46" ry="16"/>
      <path d="M48 40 L30 64 H42 L62 44 Z M68 42 L60 68 H74 L82 46 Z M90 42 L108 68 H122 L100 44 Z"/>
    `,
  },
  {
    id: "bee",
    title: "Honeybee",
    noun: "a honeybee",
    axis: "width",
    measure: "length",
    hint: "Body length",
    meters: 0.015,
    note: "A honeybee is about 15 mm long.",
    color: SILHOUETTE,
    viewBox: "0 0 168 78",
    shape: `
      <ellipse cx="62" cy="20" rx="26" ry="12"/>
      <ellipse cx="96" cy="14" rx="18" ry="10"/>
      <path d="M36 48 L0 46 L6 40 Z"/>
      <ellipse cx="74" cy="48" rx="40" ry="20"/>
      <circle cx="122" cy="46" r="16"/>
      <path d="M130 34 C146 16 160 14 168 22 C154 22 142 32 134 44 Z"/>
      <path d="M58 58 L46 74 H56 L68 60 Z M78 64 L74 78 H86 L88 64 Z M98 60 L112 76 H122 L104 58 Z"/>
    `,
  },
  {
    id: "phone",
    title: "Smartphone",
    noun: "a smartphone",
    axis: "height",
    measure: "height",
    hint: "Height",
    meters: 0.15,
    note: "A typical smartphone is about 15 cm tall.",
    color: SILHOUETTE,
    viewBox: "0 0 70 140",
    shape: `
      <path fill-rule="evenodd" d="
        M10 0 H60 A10 10 0 0 1 70 10 V130 A10 10 0 0 1 60 140 H10 A10 10 0 0 1 0 130 V10 A10 10 0 0 1 10 0 Z
        M35 124 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z
      "/>
    `,
  },
  {
    id: "can",
    title: "Soda can",
    noun: "a soda can",
    axis: "height",
    measure: "height",
    hint: "Height",
    meters: 0.122,
    note: "A standard soda can is 12.2 cm tall.",
    color: SILHOUETTE,
    viewBox: "0 0 70 120",
    shape: `<rect x="12" y="0" width="46" height="120" rx="18"/>`,
  },
  {
    id: "cat",
    title: "House cat",
    noun: "a house cat",
    axis: "width",
    measure: "length",
    hint: "Nose to tail tip",
    meters: 0.75,
    note: "A house cat is about 75 cm from nose to tail tip.",
    color: SILHOUETTE,
    viewBox: "0 0 220 110",
    shape: `
      <path d="M158 70 C186 58 206 34 220 16 C204 38 180 64 160 74 Z"/>
      <ellipse cx="118" cy="74" rx="52" ry="22"/>
      <ellipse cx="52" cy="70" rx="30" ry="22"/>
      <ellipse cx="16" cy="76" rx="16" ry="11"/>
      <path d="M36 58 C34 40 44 36 52 56 Z"/>
      <path d="M54 56 C60 34 74 32 78 58 Z"/>
      <rect x="62" y="84" width="14" height="26" rx="6"/>
      <rect x="84" y="86" width="14" height="24" rx="6"/>
      <rect x="122" y="84" width="14" height="26" rx="6"/>
      <rect x="146" y="82" width="14" height="28" rx="6"/>
    `,
  },
  {
    id: "guitar",
    title: "Acoustic guitar",
    noun: "an acoustic guitar",
    axis: "height",
    measure: "length",
    hint: "Overall length",
    meters: 1.04,
    note: "A typical acoustic guitar is about 1.04 m long.",
    color: SILHOUETTE,
    viewBox: "0 0 80 220",
    shape: `
      <path d="M22 0 H58 V18 L46 26 H34 L22 18 Z"/>
      <rect x="35" y="18" width="10" height="96"/>
      <ellipse cx="40" cy="132" rx="18" ry="22"/>
      <ellipse cx="40" cy="178" rx="28" ry="42"/>
    `,
  },
  {
    id: "bicycle",
    title: "Bicycle",
    noun: "a bicycle",
    axis: "width",
    measure: "length",
    hint: "Front wheel to back wheel",
    meters: 1.7,
    note: "An adult bicycle is about 1.7 m from wheel to wheel.",
    color: SILHOUETTE,
    viewBox: "0 18 200 102",
    shape: `
      <g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="36" cy="84" r="32"/>
        <circle cx="164" cy="84" r="32"/>
        <path d="M36 84 L96 84 L62 36 Z"/>
        <path d="M96 84 L164 84"/>
        <path d="M96 84 L124 30"/>
        <path d="M62 36 L112 24"/>
        <path d="M124 30 H154"/>
        <path d="M154 30 L164 84"/>
      </g>
    `,
  },
  {
    id: "door",
    title: "Door",
    noun: "a door",
    axis: "height",
    measure: "height",
    hint: "A typical interior door",
    meters: 2.03,
    note: "A typical interior door is 2.03 m tall.",
    color: SILHOUETTE,
    viewBox: "0 0 90 200",
    shape: `
      <path fill-rule="evenodd" d="
        M0 0 H90 V200 H0 Z
        M14 16 H40 V92 H14 Z
        M50 16 H76 V92 H50 Z
        M14 104 H40 V184 H14 Z
        M50 104 H76 V184 H50 Z
      "/>
    `,
  },
  {
    id: "car",
    title: "Car",
    noun: "a car",
    axis: "width",
    measure: "length",
    hint: "Length of a midsize sedan",
    meters: 4.6,
    note: "A midsize sedan is about 4.6 m long.",
    color: SILHOUETTE,
    viewBox: "0 12 240 66",
    shape: `
      <path fill-rule="evenodd" d="
        M0 50
        C20 50 34 34 56 26
        C78 16 108 12 146 12
        C176 12 202 22 220 36
        L240 48
        V62
        H210
        C206 48 186 42 168 52
        H76
        C58 42 38 48 34 62
        H0
        Z
        M78 24 H152 L170 44 H66 Z
      "/>
      <circle cx="64" cy="62" r="16"/>
      <circle cx="186" cy="62" r="16"/>
    `,
  },
  {
    id: "giraffe",
    title: "Giraffe",
    noun: "a giraffe",
    axis: "height",
    measure: "height",
    hint: "Height of a tall adult",
    meters: 5.2,
    note: "A tall adult giraffe is about 5.2 m.",
    color: SILHOUETTE,
    viewBox: "0 0 160 240",
    shape: `
      <rect x="104" y="0" width="8" height="22" rx="4"/>
      <rect x="124" y="0" width="8" height="24" rx="4"/>
      <ellipse cx="122" cy="36" rx="28" ry="14"/>
      <path d="M106 28 h20 l14 112 h-36 z"/>
      <ellipse cx="88" cy="156" rx="50" ry="28"/>
      <rect x="42" y="164" width="14" height="76" rx="6"/>
      <rect x="64" y="166" width="14" height="74" rx="6"/>
      <rect x="100" y="162" width="14" height="78" rx="6"/>
      <rect x="122" y="160" width="14" height="80" rx="6"/>
      <path d="M42 148 L24 172 l10 6 16-18 z"/>
    `,
  },
  {
    id: "bus",
    title: "School bus",
    noun: "a school bus",
    axis: "width",
    measure: "length",
    hint: "Length",
    meters: 10.7,
    note: "A common full-size school bus is about 10.7 m long.",
    color: SILHOUETTE,
    viewBox: "0 0 280 84",
    shape: `
      <path fill-rule="evenodd" d="
        M8 8
        H272
        A8 8 0 0 1 280 16
        V58
        H250 V48 H200 V58
        H90 V48 H40 V58
        H0 V16
        A8 8 0 0 1 8 8
        Z
        M20 16 h34 v20 H20 Z
        M62 16 h34 v20 H62 Z
        M104 16 h34 v20 H104 Z
        M146 16 h34 v20 H146 Z
        M188 16 h36 v20 h-36 Z
        M232 16 h32 v20 h-32 Z
      "/>
      <circle cx="70" cy="66" r="16"/>
      <circle cx="222" cy="66" r="16"/>
    `,
  },
  {
    id: "trex",
    title: "T. rex",
    noun: "a T. rex",
    axis: "width",
    measure: "length",
    hint: "Nose to tail",
    meters: 12.3,
    note: "A large T. rex was about 12.3 m from nose to tail.",
    color: SILHOUETTE,
    viewBox: "0 40 280 100",
    shape: `
      <path d="M0 92 C40 78 80 70 118 74 L124 98 C70 108 28 112 0 104 Z"/>
      <ellipse cx="138" cy="90" rx="42" ry="26"/>
      <path d="M168 78 C196 62 228 48 268 42 L280 54 L250 66 L210 78 L186 98 Z"/>
      <path d="M246 48 L268 40 L276 50 L254 58 Z"/>
      <path d="M112 108 L100 140 H126 L132 110 Z"/>
      <path d="M150 110 L156 140 H182 L172 108 Z"/>
      <path d="M170 92 L198 108 L190 116 L164 98 Z"/>
    `,
  },
  {
    id: "whale",
    title: "Blue whale",
    noun: "a blue whale",
    axis: "width",
    measure: "length",
    hint: "Adult length",
    meters: 24,
    note: "A typical adult blue whale is about 24 m long.",
    color: SILHOUETTE,
    viewBox: "0 0 300 72",
    shape: `
      <path d="
        M0 36
        C16 36 28 20 42 18
        C34 8 22 0 12 4
        C26 12 36 18 44 24
        C96 8 160 6 214 18
        C250 26 278 20 300 34
        C274 38 252 50 228 44
        C176 58 112 64 64 50
        C36 42 14 46 0 36
        Z
      "/>
      <path d="M168 28 c12 2 16 12 6 16 -10-2-14-8-6-16z"/>
    `,
  },
  {
    id: "elephant",
    title: "Elephant",
    noun: "an elephant",
    axis: "height",
    measure: "height",
    hint: "Shoulder height of a large bull",
    meters: 3.3,
    note: "A large bull elephant is about 3.3 m at the shoulder.",
    color: SILHOUETTE,
    viewBox: "0 0 220 150",
    shape: `
      <ellipse cx="128" cy="46" rx="66" ry="46"/>
      <ellipse cx="52" cy="78" rx="28" ry="32"/>
      <circle cx="70" cy="68" r="28"/>
      <path d="M42 90 C22 108 24 142 42 150 H56 C48 126 50 106 62 92 Z"/>
      <rect x="84" y="78" width="16" height="72" rx="7"/>
      <rect x="108" y="82" width="16" height="68" rx="7"/>
      <rect x="144" y="80" width="16" height="70" rx="7"/>
      <rect x="170" y="76" width="16" height="74" rx="7"/>
    `,
  },
  {
    id: "plane",
    title: "Boeing 737",
    noun: "a Boeing 737",
    axis: "width",
    measure: "length",
    hint: "Length of a 737-800",
    meters: 39.5,
    note: "A Boeing 737-800 is 39.5 m long.",
    color: SILHOUETTE,
    viewBox: "0 4 320 92",
    shape: `
      <path d="
        M0 52
        C48 42 90 44 250 48
        L320 54
        L312 64
        L250 60
        C110 72 40 68 0 58
        Z
      "/>
      <path d="M236 50 L286 8 L304 14 L258 54 Z"/>
      <path d="M118 52 L214 58 L176 96 L92 74 Z"/>
      <path d="M156 66 l36 6 -6 10 -32 -4 z"/>
    `,
  },
  {
    id: "liberty",
    title: "Statue of Liberty",
    noun: "the Statue of Liberty",
    axis: "height",
    measure: "height",
    hint: "Heel to torch, statue only",
    meters: 46,
    note: "The statue itself is 46 m from heel to torch, not counting the pedestal.",
    color: SILHOUETTE,
    viewBox: "0 0 110 220",
    shape: `
      <path d="
        M78 40
        L88 10
        L96 0
        L106 14
        L96 42
        L84 36
        L78 48
        L92 54
        L62 112
        L48 104
        L58 86
        C52 70 40 62 36 52
        L30 36 H38 L34 52
        L42 30 H50 L46 54
        L54 40 H62 L56 58
        C66 70 70 84 66 98
        L74 150
        L58 220
        H26
        L14 150
        L22 98
        L8 124
        L4 116
        L24 100
        Z
      "/>
    `,
  },
];
