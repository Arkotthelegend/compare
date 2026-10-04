const PERSON = {
  meters: 1.8,
  axis: "height",
  viewBox: "0 0 64 176",
  color: "#ef5b2a",
  shape: `
    <circle cx="32" cy="14" r="14"/>
    <rect x="20" y="26" width="24" height="58" rx="10"/>
    <rect x="4" y="34" width="56" height="12" rx="6"/>
    <rect x="20" y="78" width="11" height="98" rx="5"/>
    <rect x="33" y="78" width="11" height="98" rx="5"/>
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
    color: "#4a3428",
    viewBox: "0 0 180 64",
    shape: `
      <ellipse cx="128" cy="30" rx="42" ry="20"/>
      <ellipse cx="74" cy="28" rx="18" ry="13"/>
      <circle cx="38" cy="26" r="16"/>
      <path d="M28 16 C16 4 6 0 0 6 C10 8 18 14 26 22 Z"/>
      <path d="M34 14 C24 0 14 0 6 4 C16 6 26 12 36 20 Z"/>
      <path d="M60 36 L34 64 L46 64 L70 40 Z"/>
      <path d="M72 38 L66 64 L80 64 L86 42 Z"/>
      <path d="M88 38 L104 64 L118 64 L100 40 Z"/>
      <path d="M58 34 L22 54 L30 62 L68 40 Z"/>
      <path d="M96 36 L124 60 L134 54 L106 34 Z"/>
      <path d="M112 40 L148 64 L160 58 L122 36 Z"/>
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
    color: "#e36b00",
    viewBox: "0 0 170 78",
    shape: `
      <ellipse cx="62" cy="18" rx="28" ry="14"/>
      <ellipse cx="96" cy="14" rx="22" ry="12"/>
      <path fill-rule="evenodd" d="
        M34 46
        a40 20 0 1 0 80 0
        a40 20 0 1 0 -80 0
        M58 30 h10 v32 h-10 z
        M78 28 h10 v36 h-10 z
        M98 32 h8 v26 h-8 z
      "/>
      <circle cx="128" cy="44" r="16"/>
      <path d="M136 32 L158 8 L166 16 L142 40 Z"/>
      <path d="M142 36 L168 16 L174 24 L148 42 Z"/>
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
    color: "#24343f",
    viewBox: "0 0 70 140",
    shape: `
      <path fill-rule="evenodd" d="
        M12 0
        h46
        a12 12 0 0 1 12 12
        v116
        a12 12 0 0 1 -12 12
        h-46
        a12 12 0 0 1 -12 -12
        v-116
        a12 12 0 0 1 12 -12
        z
        M22 8 h26 a3 3 0 0 1 3 3 v3 a3 3 0 0 1 -3 3 h-26 a3 3 0 0 1 -3 -3 v-3 a3 3 0 0 1 3 -3 z
        M35 124
        m-6 0
        a6 6 0 1 0 12 0
        a6 6 0 1 0 -12 0
        z
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
    color: "#d00000",
    viewBox: "0 0 70 120",
    shape: `
      <path fill-rule="evenodd" d="
        M16 12 h38 v96 h-38 z
        M24 46 h22 v18 h-22 z
      "/>
      <ellipse cx="35" cy="12" rx="22" ry="12"/>
      <ellipse cx="35" cy="108" rx="20" ry="12"/>
    `,
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
    color: "#c46a12",
    viewBox: "0 0 200 100",
    shape: `
      <circle cx="18" cy="58" r="16"/>
      <path d="M6 48 L16 18 L28 46 Z"/>
      <path d="M20 44 L34 12 L42 46 Z"/>
      <ellipse cx="92" cy="64" rx="58" ry="20"/>
      <path d="M140 56 C162 54 184 28 200 14 C188 26 172 48 154 58 Z"/>
      <rect x="50" y="74" width="12" height="26" rx="5"/>
      <rect x="72" y="76" width="12" height="24" rx="5"/>
      <rect x="112" y="74" width="12" height="26" rx="5"/>
      <rect x="134" y="70" width="12" height="30" rx="5"/>
      <circle cx="12" cy="56" r="2" fill="#102033"/>
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
    color: "#8c4a2f",
    viewBox: "0 0 80 220",
    shape: `
      <path d="M18 0 H62 V14 L48 22 H32 L18 14 Z"/>
      <rect x="6" y="3" width="14" height="5" rx="2"/>
      <rect x="60" y="3" width="14" height="5" rx="2"/>
      <rect x="36" y="16" width="8" height="102"/>
      <path fill-rule="evenodd" d="
        M40 112
        C16 116 8 138 16 158
        C24 174 34 182 40 184
        C24 190 8 204 18 216
        C26 222 54 222 62 216
        C72 204 56 190 40 184
        C46 182 56 174 64 158
        C72 138 64 116 40 112
        Z
        M40 170
        m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0
      "/>
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
    color: "#1d4e89",
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
    color: "#7a5230",
    viewBox: "0 0 90 200",
    shape: `
      <path fill-rule="evenodd" d="
        M4 0
        h82
        v200
        h-82
        z
        M16 16 h26 v74 h-26 z
        M48 16 h26 v74 h-26 z
        M16 104 h26 v76 h-26 z
        M48 104 h26 v76 h-26 z
      "/>
      <circle cx="78" cy="102" r="4"/>
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
    color: "#c1121f",
    viewBox: "0 12 240 66",
    shape: `
      <path fill-rule="evenodd" d="
        M0 52
        C18 52 30 38 50 30
        C74 18 104 14 142 14
        C172 14 198 24 216 38
        C228 48 236 52 240 52
        V60
        H206
        C206 48 188 42 172 50
        H78
        C62 42 44 48 44 60
        H0
        Z
        M72 24 H150 L168 46 H60 Z
      "/>
      <path fill-rule="evenodd" d="
        M62 62 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0
        M62 62 m-6 0 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0
        M186 62 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0
        M186 62 m-6 0 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0
      "/>
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
    color: "#d08900",
    viewBox: "0 0 150 240",
    shape: `
      <path d="M88 0 h7 v14 h-7 z"/>
      <path d="M104 2 h7 v16 h-7 z"/>
      <path d="
        M76 16
        h46
        c8 0 16 8 14 18
        l-8 10
        h-16
        l-6 8
        h-18
        l-2 -12
        c-6 -2 -12 -8 -10 -16
        z
      "/>
      <path d="M84 50 h20 l8 92 h-30 z"/>
      <path d="M36 140 h86 c8 10 8 22 2 32 H34 c-4 -10 -2 -22 2 -32 z"/>
      <path d="M40 168 h12 v72 h-12 z"/>
      <path d="M58 168 h12 v72 h-12 z"/>
      <path d="M90 168 h12 v72 h-12 z"/>
      <path d="M108 168 h12 v72 h-12 z"/>
      <path d="M34 146 l-18 12 8 8 18 -10 z"/>
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
    color: "#e2a100",
    viewBox: "0 0 280 84",
    shape: `
      <path fill-rule="evenodd" d="
        M0 12
        Q0 0 14 0
        H266
        Q280 0 280 14
        V58
        H246
        V50
        H198
        V58
        H96
        V50
        H48
        V58
        H0
        Z
        M18 12 h36 v22 h-36 z
        M62 12 h36 v22 h-36 z
        M106 12 h36 v22 h-36 z
        M150 12 h36 v22 h-36 z
        M194 12 h40 v22 h-40 z
        M242 12 h24 v22 h-24 z
      "/>
      <circle cx="72" cy="66" r="16"/>
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
    color: "#1f7a63",
    viewBox: "0 44 260 96",
    shape: `
      <path d="M0 78 L96 62 L100 90 L6 98 Z"/>
      <ellipse cx="118" cy="82" rx="46" ry="26"/>
      <path d="M150 74 L198 52 L236 46 L260 54 L244 64 L228 62 L214 78 L176 90 Z"/>
      <path d="M96 100 L88 140 H114 L122 104 Z"/>
      <path d="M132 102 L138 140 H164 L156 100 Z"/>
      <path d="M140 86 L186 100 L180 110 L134 94 Z"/>
      <circle cx="232" cy="54" r="3" fill="#102033"/>
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
    color: "#1b6ca8",
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
      <path d="M168 30 c10 2 14 10 6 14 c-8 -2 -12 -8 -6 -14 z"/>
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
    color: "#6d7278",
    viewBox: "0 0 220 150",
    shape: `
      <ellipse cx="124" cy="46" rx="70" ry="46"/>
      <circle cx="62" cy="66" r="30"/>
      <ellipse cx="48" cy="74" rx="28" ry="34"/>
      <path d="M44 90 C24 104 20 128 34 148 L50 148 C42 126 46 108 58 96 Z"/>
      <rect x="78" y="78" width="18" height="72" rx="8"/>
      <rect x="104" y="82" width="18" height="68" rx="8"/>
      <rect x="140" y="80" width="18" height="70" rx="8"/>
      <rect x="166" y="76" width="18" height="74" rx="8"/>
      <path d="M186 34 L214 18 L218 28 L190 44 Z"/>
      <circle cx="48" cy="62" r="3" fill="#102033"/>
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
    color: "#3d4c5c",
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
    color: "#2f6f4e",
    viewBox: "0 0 110 220",
    shape: `
      <polygon points="78,36 86,8 94,0 104,12 94,40 82,34"/>
      <polygon points="46,100 74,42 90,50 58,108"/>
      <polygon points="24,58 28,40 36,58"/>
      <polygon points="34,56 42,34 50,56"/>
      <polygon points="48,58 56,42 62,60"/>
      <circle cx="42" cy="70" r="14"/>
      <path d="M20 86 H64 L72 146 L58 220 H26 L14 146 Z"/>
      <rect x="2" y="118" width="28" height="14" rx="2" transform="rotate(-18 16 125)"/>
    `,
  },
];
