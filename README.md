# BALANCE

Place weights on a seesaw until the two sides agree.

Torque is weight times distance from the pivot. A 4 kg block 2 m left of the pivot asks for 8 kg·m on the right, which might be 2 kg sitting 4 m out. Heavier blocks are drawn larger. The number on the block is the number the beam uses.

## Play

```bash
npm install
npm start
```

Open `http://localhost:4173`.

## Modes

- **Classic** — levels 1 and 2 show where to put the blocks. The scale runs from −22 m to +22 m, the same on both sides, and a block can sit on any tenth of a metre. Later levels add half kilograms, a locked block, and a split block. Almost does not clear a level.
- **Endless** — the next challenge is harder.
- **Time attack** — 90 seconds.
- **Perfect** — the allowed difference is 0.08 kg·m.
- **Daily challenge** — one seesaw per UTC date, one saved result in this browser.

Stars track a level balance, a precise one, and a fast one. Sound is synthesized in the browser and can be switched off.
