# SHADOW

Estimate the height of a 3D object from its light and shadow.

The glowing orb is a real point light. The shadow is rendered from the same geometry the game measures. Grid squares and the slim post are 1 meter. Orbit the camera to look around — the object does not change size.

## Play

```bash
npm install
npm start
```

Open `http://localhost:4173`.

`npm install` refreshes the Three.js package used to build `vendor/`. The page itself loads the vendored files, so after that folder exists a static server is enough.

## Modes

- **Practice** — unlimited rounds, elapsed time only.
- **5-Round Challenge** — five scenes, 90 seconds each, score out of 5,000.
- **Daily Challenge** — the same five scenes for a UTC date. One official result is stored in this browser.
- **Training** — eight rounds that move from simple shapes to harder light and silhouettes.

Shadow Duel is not playable yet. `js/duel.js` can rebuild one shared scene from a seed and compare two scores when a second player exists.

## Score

Guesses are converted to meters. If `A` is the actual height and `G` is the guess:

`score = round(1000 × exp(−4 × |ln(G / A)|))`

An exact guess scores 1000. Being proportionally high or low by the same ratio scores the same. Results, a side-view diagram, and your averages stay on this device.
