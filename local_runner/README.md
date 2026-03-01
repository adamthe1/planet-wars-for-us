# Planet Wars Local Runner

This is a lightweight Flask server that runs Planet Wars games on your local machine. The website (hosted on Vercel) sends bot code to this server, which executes the game using the local Java engine and Python environment.

## Requirements

- Python 3.8+
- Java JRE 8+ (for the game engine)
- The rest of the planet-wars-starterpackage repo (this is already part of it)

## Setup

```bash
# From the local_runner/ directory
pip install -r requirements.txt
```

## Running

```bash
python server.py
```

The server starts at `http://localhost:3737`. Keep this terminal open while playing games on the website.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Check if server is running |
| POST | `/run` | Run a game between two bots |

### POST /run

Request body (JSON):
```json
{
  "bot1_name": "MyBot",
  "bot2_name": "EnemyBot",
  "bot1_code": "# Python bot code...",
  "bot2_code": "# Python bot code...",
  "max_turn_time": 1000,
  "max_num_turns": 500
}
```

Response:
```json
{
  "success": true,
  "playback_string": "...",
  "player_one": "MyBot",
  "player_two": "EnemyBot",
  "winner": "1"
}
```
