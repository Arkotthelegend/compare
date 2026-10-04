# Size Compare

Guess the real size of an object by scaling it next to a person. A closer scale scores more points.

## Play

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## How it works

Each game is 8 rounds. A person on the stage is always 1.8 m tall. Drag the handle on the shape to scale it, or nudge it with the arrow keys, then lock in your guess.

The score uses the ratio of your scale to the real size:

`100 × 0.5 ^ |log2(guess / actual)|`

An exact match is 100. Twice as big or half as big is 50. Four times off is 25. Your best total out of 800 is saved in this browser.
