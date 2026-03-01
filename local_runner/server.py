import os
import sys
import shutil
import subprocess
import tempfile
import platform

from flask import Flask, request, jsonify, make_response

# Add repo root to path so we can import tools
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO_ROOT)

import tools.map_generator_v2 as map_generator

app = Flask(__name__)


def _determine_winner(data_string):
    """Parse the last turn of the playback string and count ships per player."""
    try:
        parts = data_string.split('|')
        if len(parts) < 2:
            return 'unknown'

        num_planets = len(parts[0].split(':'))
        turns = [t for t in parts[1].split(':') if t]
        if not turns:
            return 'unknown'

        last_turn = turns[-1]
        cells = last_turn.split(',')

        ships = {1: 0, 2: 0}

        # First num_planets cells are planet states: owner.numShips
        for cell in cells[:num_planets]:
            state = cell.split('.')
            if len(state) >= 2:
                owner, count = int(state[0]), int(state[1])
                if owner in ships:
                    ships[owner] += count

        # Remaining cells are fleets: owner.numShips.src.dst.trip.remaining
        for cell in cells[num_planets:]:
            fleet = cell.split('.')
            if len(fleet) >= 2:
                owner, count = int(fleet[0]), int(fleet[1])
                if owner in ships:
                    ships[owner] += count

        if ships[1] > ships[2]:
            return '1'
        elif ships[2] > ships[1]:
            return '2'
        else:
            return 'draw'
    except Exception:
        return 'unknown'


@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Private-Network'] = 'true'
    return response


@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Private-Network'] = 'true'
        return resp, 200

JAR_PATH = os.path.join(REPO_ROOT, "tools", "PlayGame-1.2.jar")
PLANET_WARS_PY = os.path.join(REPO_ROOT, "PlanetWars.py")
PYTHON = "python" if platform.system() == "Windows" else "python3"


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    return jsonify({"status": "ok"})


@app.route("/run", methods=["POST", "OPTIONS"])
def run_game():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    body = request.get_json()
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    bot1_name = body.get("bot1_name", "Bot1")
    bot2_name = body.get("bot2_name", "Bot2")
    bot1_code = body.get("bot1_code", "")
    bot2_code = body.get("bot2_code", "")
    max_turn_time = int(body.get("max_turn_time", 1000))
    max_num_turns = int(body.get("max_num_turns", 500))

    if not bot1_code or not bot2_code:
        return jsonify({"error": "bot1_code and bot2_code are required"}), 400

    tmpdir = tempfile.mkdtemp(prefix="planetwars_")
    try:
        bot1_path = os.path.join(tmpdir, "bot1.py")
        bot2_path = os.path.join(tmpdir, "bot2.py")
        map_path = os.path.join(tmpdir, "map.txt")

        with open(bot1_path, "w") as f:
            f.write(bot1_code)
        with open(bot2_path, "w") as f:
            f.write(bot2_code)

        # Bots import PlanetWars — copy it into the temp dir
        shutil.copy(PLANET_WARS_PY, os.path.join(tmpdir, "PlanetWars.py"))

        # Generate a map file
        map_generator.save_map(map_path)

        # Run the Java game engine, capturing stdout (the playback string)
        cmd = (
            f'java -jar "{JAR_PATH}" "{map_path}" {max_turn_time} {max_num_turns}'
            f' "" "{PYTHON} {bot1_path}" "{PYTHON} {bot2_path}"'
        )

        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=tmpdir,
        )

        playback_string = result.stdout.strip()

        if not playback_string:
            return jsonify({
                "error": "Game produced no output",
                "detail": result.stderr[:2000],
            }), 500

        # The Java engine outputs raw game data as a single line.
        # Wrap it in the multi-line format the visualizer expects for player names.
        raw_game_data = playback_string
        formatted = (
            f"player_one={bot1_name}\n"
            f"player_two={bot2_name}\n"
            f"playback_string={raw_game_data}"
        )

        winner = _determine_winner(raw_game_data)

        return jsonify({
            "success": True,
            "playback_string": formatted,
            "player_one": bot1_name,
            "player_two": bot2_name,
            "winner": winner,
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Game timed out after 120 seconds"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


if __name__ == "__main__":
    print(f"Planet Wars local runner starting on http://localhost:3737")
    print(f"Repo root : {REPO_ROOT}")
    print(f"JAR path  : {JAR_PATH}")
    print()
    app.run(host="0.0.0.0", port=3737, debug=False)
