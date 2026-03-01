import os
import sys
import shutil
import subprocess
import tempfile
import platform

from flask import Flask, request, jsonify

# Add repo root to path so we can import tools
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO_ROOT)

import tools.map_generator_v2 as map_generator

app = Flask(__name__)

JAR_PATH = os.path.join(REPO_ROOT, "tools", "PlayGame-1.2.jar")
PLANET_WARS_PY = os.path.join(REPO_ROOT, "PlanetWars.py")
PYTHON = "python" if platform.system() == "Windows" else "python3"

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]


def _cors_headers(origin):
    headers = {}
    if origin and (
        origin.endswith(".vercel.app")
        or "localhost" in origin
    ):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Headers"] = "Content-Type"
        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return headers


@app.after_request
def add_cors(response):
    origin = request.headers.get("Origin", "")
    for k, v in _cors_headers(origin).items():
        response.headers[k] = v
    return response


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
        cmd = [
            "java", "-jar", JAR_PATH,
            map_path,
            str(max_turn_time),
            str(max_num_turns),
            "",  # empty log filename
            f"{PYTHON} {bot1_path}",
            f"{PYTHON} {bot2_path}",
        ]

        result = subprocess.run(
            cmd,
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

        # Parse winner/player names from the structured output
        parsed = {}
        for line in playback_string.split("\n"):
            if "=" in line:
                key, _, value = line.partition("=")
                parsed[key.strip()] = value.strip()

        return jsonify({
            "success": True,
            "playback_string": playback_string,
            "player_one": parsed.get("player_one", bot1_name),
            "player_two": parsed.get("player_two", bot2_name),
            "winner": parsed.get("winner", "unknown"),
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
