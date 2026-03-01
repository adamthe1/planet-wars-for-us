# 🪐 Planet Wars Arena

A multiplayer bot competition platform for the classic [Planet Wars](https://planetwars.aichallenge.org/) strategy game. Upload Python bots on the website, then battle them against each other — all games run locally on your machine.

---

## Quick Start — Playing Games

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/planet-wars-starterpackage.git
cd planet-wars-starterpackage
```

### 2. Start the local runner

```bash
cd local_runner
pip install -r requirements.txt
python server.py
```

Keep this terminal open. The local runner listens on `http://localhost:3737` and executes games when triggered from the website.

**Requirements:** Python 3.8+, Java JRE 8+

### 3. Go to the website

Open [your-app.vercel.app](https://your-app.vercel.app) (or `http://localhost:3000` for local dev), upload your bot, select two bots, and click **Start Game**.

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

## Website Setup (for contributors/self-hosting)

### Prerequisites

- [Vercel account](https://vercel.com) — free tier works
- GitHub repo connected to Vercel

### 1. Create a Vercel Blob store

In the Vercel dashboard: **Storage → Create → Blob store**. Copy the `BLOB_READ_WRITE_TOKEN`.

### 2. Configure environment variables

Copy `web/.env.local.example` to `web/.env.local` and fill in:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### 3. Connect GitHub to Vercel

In Vercel: **New Project → Import Git Repository → your repo**. Set:
- Root directory: `web`
- Add the `BLOB_READ_WRITE_TOKEN` environment variable

### 4. Add GitHub Actions secrets

For automatic deployments on push, add these secrets to your GitHub repo (**Settings → Secrets → Actions**):

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Vercel project `.vercel/project.json` → `projectId` |

### 5. Run locally

```bash
cd web
npm install
npm run dev  # opens at http://localhost:3000
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
