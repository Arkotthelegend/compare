const PERSON = {
  meters: 1.8,
  axis: "height",
  viewBox: "16 0 78 220",
  color: "#ff6a3d",
  shape: `
    <path fill="#1b2430" d="M22 206h30c6 0 8 6 6 14H24c-4 0-6-6-2-14z"/>
    <path fill="#243044" d="M34 122c-4 22-6 52-2 86h16c2-28 0-58 6-86-8 4-16 4-20 0z"/>
    <path fill="#141a22" d="M50 204h36c7 0 10 7 6 16H52c-6 0-8-7-2-16z"/>
    <path fill="#31445c" d="M54 116c2 24 4 56 0 90h16c2-30 0-62 4-90-8 6-16 6-20 0z"/>
    <path fill="#ff6a3d" d="M36 70c-2 10-2 34 4 52 10 8 30 8 42 2 6-16 8-38 2-54-12-8-36-8-48 0z"/>
    <path fill="#ff6a3d" d="M42 76C26 86 20 108 28 128c5 4 12 2 14-6 2-12 6-24 16-32-4-8-10-12-16-14z"/>
    <ellipse cx="30" cy="130" rx="8" ry="7" fill="#f3c7a8"/>
    <path fill="#f3c7a8" d="M48 58h14c2 8 2 16-1 22H48c-2-6-2-14 0-22z"/>
    <ellipse cx="58" cy="42" rx="18" ry="20" fill="#f3c7a8"/>
    <ellipse cx="40" cy="46" rx="6" ry="7" fill="#e8b48e"/>
    <path fill="#2b221c" d="M44 38C40 18 52 0 66 0C80 0 84 16 76 36C66 22 56 20 48 28C44 32 42 36 44 38Z"/>
    <path fill="#e8b48e" d="M74 38c7 1 9 7 5 11-5-1-8-5-8-10z"/>
    <ellipse class="detail" cx="66" cy="40" rx="2.4" ry="3" fill="#241c16"/>
    <ellipse class="detail" cx="66.6" cy="39" rx="0.8" ry="0.8" fill="#fff"/>
    <path class="detail" fill="#e5542c" d="M50 74h16l-8 10z"/>
    <path class="detail" fill="#d7dde6" d="M26 214h24v4H28c-2 0-3-2-2-4zm28 2h30v4H54c-2-1-2-3 0-4z"/>
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
      <g fill="none" stroke="#3a2a22" stroke-width="3.5" stroke-linecap="round">
        <path d="M58 34 L36 58 M70 36 L62 62 M86 36 L104 62"/>
        <path d="M56 32 L30 16 M72 30 L64 8 M90 32 L112 12"/>
      </g>
      <ellipse cx="132" cy="34" rx="40" ry="18" fill="#5c4033"/>
      <ellipse cx="132" cy="30" rx="28" ry="8" fill="#7a5644"/>
      <ellipse cx="78" cy="32" rx="16" ry="12" fill="#4a3428"/>
      <ellipse cx="40" cy="30" rx="16" ry="13" fill="#4a3428"/>
      <circle cx="22" cy="12" r="4" fill="#4a3428"/>
      <circle cx="12" cy="6" r="3.5" fill="#4a3428"/>
      <path fill="#4a3428" d="M30 20 C18 10 8 8 2 12 C12 12 20 16 28 24 Z"/>
      <path fill="#4a3428" d="M34 18 C22 4 12 2 4 6 C16 6 26 12 36 20 Z"/>
      <circle class="detail" cx="32" cy="28" r="2.2" fill="#1c140f"/>
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
      <ellipse cx="68" cy="22" rx="26" ry="12" fill="#f4f7fb" opacity="0.9"/>
      <ellipse cx="98" cy="16" rx="20" ry="10" fill="#d9e4f0"/>
      <ellipse cx="78" cy="48" rx="42" ry="20" fill="#f0b429"/>
      <rect class="detail" x="58" y="30" width="10" height="36" rx="2" fill="#1c1915"/>
      <rect class="detail" x="78" y="28" width="10" height="40" rx="2" fill="#1c1915"/>
      <rect class="detail" x="98" y="32" width="8" height="28" rx="2" fill="#1c1915"/>
      <circle cx="124" cy="46" r="16" fill="#f0b429"/>
      <circle cx="124" cy="46" r="10" fill="#1c1915"/>
      <circle class="detail" cx="128" cy="44" r="2" fill="#fff"/>
      <path fill="#1c1915" d="M132 36 C144 22 156 16 164 20 C152 24 142 32 136 42 Z"/>
      <path fill="none" stroke="#3a2a22" stroke-width="3" stroke-linecap="round" d="M62 58 L48 72 M78 64 L74 74 M96 62 L108 74"/>
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
      <path fill="#c46a12" d="M148 52 C168 46 188 22 200 10 C190 22 174 44 156 54 Z"/>
      <ellipse cx="104" cy="60" rx="50" ry="22" fill="#e08a2c"/>
      <ellipse cx="40" cy="58" rx="26" ry="20" fill="#e08a2c"/>
      <path fill="#e08a2c" d="M18 48 L26 8 L40 44 Z"/>
      <path fill="#e08a2c" d="M32 44 L46 4 L56 46 Z"/>
      <path class="detail" fill="#f0b4ae" d="M24 40 L28 18 L36 38 Z"/>
      <path class="detail" fill="#f0b4ae" d="M38 40 L46 16 L52 42 Z"/>
      <ellipse cx="52" cy="68" rx="16" ry="12" fill="#f6d7a8"/>
      <rect x="58" y="72" width="14" height="28" rx="6" fill="#e08a2c"/>
      <rect x="80" y="74" width="14" height="26" rx="6" fill="#c46a12"/>
      <rect x="112" y="72" width="14" height="28" rx="6" fill="#e08a2c"/>
      <rect x="132" y="70" width="14" height="30" rx="6" fill="#c46a12"/>
      <path fill="#e08a2c" d="M0 60 h12 l-4 8 H2 Z"/>
      <ellipse class="detail" cx="24" cy="54" rx="5" ry="6" fill="#fff"/>
      <ellipse class="detail" cx="22" cy="54" rx="2.4" ry="3.4" fill="#241c16"/>
      <path class="detail" fill="#c46a12" d="M70 52 h8 l2 16 h-10 z M96 48 h10 l2 18 h-12 z"/>
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
      <path fill="#5c3317" d="M18 0 H62 V16 L46 24 H34 L18 16 Z"/>
      <circle cx="28" cy="8" r="4" fill="#e7d3b0"/>
      <circle cx="52" cy="8" r="4" fill="#e7d3b0"/>
      <rect x="36" y="18" width="8" height="96" fill="#8c4a2f"/>
      <ellipse cx="40" cy="132" rx="20" ry="24" fill="#a85b38"/>
      <ellipse cx="40" cy="178" rx="30" ry="42" fill="#8c4a2f"/>
      <circle cx="40" cy="168" r="9" fill="#3b2415"/>
      <circle cx="40" cy="168" r="3.5" fill="#e7d3b0"/>
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
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="36" cy="84" r="32" stroke="#1c2430" stroke-width="8"/>
        <circle cx="164" cy="84" r="32" stroke="#1c2430" stroke-width="8"/>
        <circle cx="36" cy="84" r="6" fill="#d7dde6" stroke="none"/>
        <circle cx="164" cy="84" r="6" fill="#d7dde6" stroke="none"/>
        <path d="M36 84 L96 84 L62 36 Z" stroke="#1d4e89" stroke-width="7"/>
        <path d="M96 84 L164 82" stroke="#1d4e89" stroke-width="7"/>
        <path d="M96 84 L124 30" stroke="#1d4e89" stroke-width="7"/>
        <path d="M62 36 L112 24" stroke="#1d4e89" stroke-width="6"/>
        <path d="M118 30 H156" stroke="#243044" stroke-width="6"/>
        <path d="M154 30 L164 84" stroke="#243044" stroke-width="6"/>
        <path d="M108 24 h16 l-2 8 h-12z" fill="#c1121f" stroke="none"/>
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
      <path fill="#9fd7ea" d="M76 26 H148 L166 44 H64 Z"/>
      <path fill="#c1121f" fill-rule="evenodd" d="
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
      <path fill="#1c2430" fill-rule="evenodd" d="
        M62 62 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0
        M62 62 m-7 0 a7 7 0 1 1 14 0 a7 7 0 1 1 -14 0
        M186 62 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0
        M186 62 m-7 0 a7 7 0 1 1 14 0 a7 7 0 1 1 -14 0
      "/>
      <circle cx="62" cy="62" r="3" fill="#d7dde6"/>
      <circle cx="186" cy="62" r="3" fill="#d7dde6"/>
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
    viewBox: "0 0 160 240",
    shape: `
      <path fill="#c9842a" d="M36 156 l-18 26 10 6 18-22z"/>
      <circle cx="20" cy="190" r="7" fill="#6b3e1a"/>
      <rect x="40" y="168" width="16" height="72" rx="7" fill="#e6a322"/>
      <rect x="62" y="170" width="16" height="70" rx="7" fill="#f0b429"/>
      <rect x="98" y="166" width="16" height="74" rx="7" fill="#e6a322"/>
      <rect x="120" y="164" width="16" height="76" rx="7" fill="#f0b429"/>
      <rect x="40" y="226" width="16" height="14" rx="4" fill="#5c3a1e"/>
      <rect x="62" y="226" width="16" height="14" rx="4" fill="#5c3a1e"/>
      <rect x="98" y="226" width="16" height="14" rx="4" fill="#5c3a1e"/>
      <rect x="120" y="226" width="16" height="14" rx="4" fill="#5c3a1e"/>
      <ellipse cx="88" cy="160" rx="52" ry="30" fill="#f0b429"/>
      <path fill="#f0b429" d="M100 36 h24 l10 112 h-36 z"/>
      <path fill="#6b3e1a" d="M100 48 l-10 8 8 12-10 12 10 14-8 14 10 16 V48z"/>
      <ellipse cx="124" cy="34" rx="30" ry="16" fill="#f0b429"/>
      <rect x="108" y="0" width="7" height="22" rx="3" fill="#e6a322"/>
      <rect x="126" y="0" width="7" height="24" rx="3" fill="#e6a322"/>
      <circle cx="111.5" cy="6" r="5" fill="#6b3e1a"/>
      <circle cx="129.5" cy="6" r="5" fill="#6b3e1a"/>
      <ellipse class="detail" cx="70" cy="150" rx="8" ry="6" fill="#c9842a"/>
      <ellipse class="detail" cx="96" cy="168" rx="7" ry="5" fill="#c9842a"/>
      <ellipse class="detail" cx="112" cy="146" rx="6" ry="8" fill="#c9842a"/>
      <ellipse class="detail" cx="108" cy="70" rx="5" ry="8" fill="#c9842a"/>
      <ellipse class="detail" cx="116" cy="98" rx="5" ry="7" fill="#c9842a"/>
      <ellipse class="detail" cx="138" cy="32" rx="3" ry="3.4" fill="#241c16"/>
      <ellipse cx="148" cy="36" rx="6" ry="4" fill="#e6a322"/>
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
      <path fill="#f0c14e" fill-rule="evenodd" d="
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
      <circle cx="72" cy="66" r="16" fill="#1c2430"/>
      <circle cx="222" cy="66" r="16" fill="#1c2430"/>
      <circle cx="72" cy="66" r="6" fill="#d7dde6"/>
      <circle cx="222" cy="66" r="6" fill="#d7dde6"/>
      <rect class="detail" x="0" y="40" width="280" height="6" fill="#1c1915"/>
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
      <path fill="#176354" d="M0 78 L98 64 L102 92 L8 100 Z"/>
      <ellipse cx="120" cy="84" rx="48" ry="26" fill="#1f8a70"/>
      <ellipse cx="116" cy="90" rx="34" ry="14" fill="#8fd0b8"/>
      <path fill="#1f8a70" d="M154 76 L200 54 L238 48 L260 56 L242 66 L226 64 L210 80 L174 92 Z"/>
      <path fill="#f4efe4" d="M236 52 l18 2-14 8-6-4z"/>
      <path fill="#176354" d="M98 102 L90 140 h22 l10-34z"/>
      <path fill="#1f8a70" d="M136 104 L142 140 h24 l-6-38z"/>
      <path fill="#f4efe4" d="M96 132 h10 l-2 8 H98z M148 132 h12 l-2 8 h-12z"/>
      <path fill="#145c4c" d="M146 88 L184 102 L178 112 L140 96 Z"/>
      <circle class="detail" cx="230" cy="56" r="3.2" fill="#f4efe4"/>
      <circle class="detail" cx="229" cy="56" r="1.6" fill="#241c16"/>
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
      <path fill="#1b6ca8" d="
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
      <path fill="#7eb6d8" d="M48 40 C90 52 150 56 210 46 C160 62 100 62 52 48 Z"/>
      <path fill="#14588a" d="M168 28 c12 2 16 12 6 16-10-2-14-8-6-16z"/>
      <circle class="detail" cx="236" cy="32" r="2.4" fill="#102033"/>
      <circle class="detail" cx="237" cy="31.4" r="0.8" fill="#fff"/>
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
      <ellipse cx="124" cy="46" rx="70" ry="46" fill="#8d9399"/>
      <ellipse cx="50" cy="74" rx="30" ry="34" fill="#6e757c"/>
      <circle cx="64" cy="66" r="30" fill="#9aa1a8"/>
      <path fill="#7d868e" d="M46 92 C26 106 22 130 36 148 L52 148 C44 126 48 108 60 96 Z"/>
      <path fill="#f4efe4" d="M34 100 c-8 6-6 16 2 16 6-6 8-12 2-16z"/>
      <rect x="78" y="78" width="18" height="72" rx="8" fill="#8d9399"/>
      <rect x="104" y="82" width="18" height="68" rx="8" fill="#9aa1a8"/>
      <rect x="140" y="80" width="18" height="70" rx="8" fill="#8d9399"/>
      <rect x="166" y="76" width="18" height="74" rx="8" fill="#9aa1a8"/>
      <path fill="#f4efe4" d="M82 140 h10 v8 H84z M108 140 h10 v8 h-10z M144 140 h10 v8 h-10z M170 140 h10 v8 h-10z"/>
      <path fill="#6e757c" d="M186 34 L214 18 L218 28 L190 44 Z"/>
      <circle class="detail" cx="50" cy="62" r="3.2" fill="#241c16"/>
      <circle class="detail" cx="51" cy="61" r="1" fill="#fff"/>
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
      <path fill="#5c6b7a" d="
        M0 52
        C48 42 90 44 250 48
        L320 54
        L312 64
        L250 60
        C110 72 40 68 0 58
        Z
      "/>
      <path fill="#3d4c5c" d="M236 50 L286 8 L304 14 L258 54 Z"/>
      <path fill="#7d8b99" d="M118 52 L214 58 L176 96 L92 74 Z"/>
      <path fill="#2c3844" d="M156 66 l36 6 -6 10 -32 -4 z"/>
      <g class="detail" fill="#d7ecf5">
        <circle cx="40" cy="52" r="3"/>
        <circle cx="58" cy="52" r="3"/>
        <circle cx="76" cy="52" r="3"/>
        <circle cx="94" cy="52" r="3"/>
        <circle cx="112" cy="53" r="3"/>
        <circle cx="130" cy="53" r="3"/>
      </g>
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
      <polygon points="78,34 88,8 96,0 106,12 96,40 82,32" fill="#f2c14e"/>
      <polygon points="86,16 92,4 98,16" fill="#ff7a45"/>
      <polygon points="48,102 76,44 92,52 60,110" fill="#3d8f68"/>
      <ellipse cx="84" cy="48" rx="6" ry="5" fill="#f3c7a8"/>
      <polygon points="26,58 30,38 38,58" fill="#2f6f4e"/>
      <polygon points="36,54 44,30 52,54" fill="#2f6f4e"/>
      <polygon points="50,56 58,40 64,58" fill="#2f6f4e"/>
      <circle cx="44" cy="70" r="14" fill="#f3c7a8"/>
      <path fill="#2b221c" d="M32 64c2-10 10-16 16-14 4 8 2 14-2 16-6-2-12-2-14-2z"/>
      <ellipse class="detail" cx="48" cy="70" rx="1.6" ry="2" fill="#241c16"/>
      <path fill="#2f6f4e" d="M22 88 H66 L74 150 L58 220 H28 L14 150 Z"/>
      <path fill="#256348" d="M40 96 h10 l6 124 H36 Z"/>
      <rect x="2" y="118" width="28" height="16" rx="2" fill="#d7c4a3" transform="rotate(-18 16 126)"/>
      <path class="detail" fill="#c4b08a" d="M8 122 h16 v2 H10z" transform="rotate(-18 16 123)"/>
    `,
  },
];
