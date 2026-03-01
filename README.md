# 🪐 Planet Wars Arena

Upload a Python bot, pick a fight, and take the crown.

**Website:** https://web-eta-liart-14.vercel.app

---

## Setup

**Requirements:** Python 3.8+, Java JRE 8+

```bash
git clone https://github.com/adamthe1/planet-wars-for-us.git
cd planet-wars-for-us/local_runner
pip install -r requirements.txt
python server.py
```

Works best with [uv](https://github.com/astral-sh/uv):

```bash
uv venv && uv pip install -r requirements.txt
.venv/bin/python server.py
```

Then open the website, upload your bot, and start a game.

> **Chrome users:** when the site asks for permission to access your local network, click Allow.

---

## Writing a Bot

Copy `starterbots/python_starterbot/MyBot.py` to the repo root and edit the `DoTurn` function:

```python
from PlanetWars import PlanetWars

def DoTurn(pw):
    my_planets = pw.MyPlanets()
    enemy_planets = pw.EnemyPlanets()
    # Your strategy here — issue orders with pw.IssueOrder(src, dst, ships)

def main():
    map_data = ''
    while True:
        current_line = input()
        if current_line.startswith('go'):
            pw = PlanetWars(map_data)
            DoTurn(pw)
            pw.FinishTurn()
            map_data = ''
        else:
            map_data += current_line + '\n'

if __name__ == '__main__':
    main()
```

See [`SPECIFICATION.md`](SPECIFICATION.md) for full game rules and the `PlanetWars` API.

### Test locally without the website

```bash
python play.py MyBot.py AdamBot.py
```

---

## Project Structure

```
planet-wars-starterpackage/
├── web/                    # Next.js website (deployed to Vercel)
│   ├── pages/              # Routes: /, /upload, /setup, /api/bots
│   ├── components/         # BotList, GameVisualizer
│   └── public/visualizer/  # Static game visualizer assets
├── local_runner/           # Flask server (run on your machine)
│   └── server.py           # Listens on :3737, runs games
├── tools/                  # Game engine (PlayGame-1.2.jar, map generator)
├── starterbots/            # Starter bot templates
├── visualizer/             # HTML5 game visualizer
├── PlanetWars.py           # Game state library for bots
├── play.py                 # Run a game locally (CLI)
└── play_multiple.py        # Run a tournament locally (CLI)
```

---

## Licensing

- `example_bots/`, `maps/`, `starterbots/`, `tools/`, `SPECIFICATION.md` — Apache License (Planet Wars Challenge)
- `visualizer/` — Apache License (edited)
- `visualizer/css/Hyades.jpg` — CC Attribution-ShareAlike 2.5
- Everything else — GNU GPL v3 (see `LICENSE.md`)
