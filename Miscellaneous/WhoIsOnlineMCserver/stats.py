"""Lee las estadísticas del server de Minecraft por SFTP y genera stats.json.

Uso: python stats.py anterior/stats.json salida/stats.json
Variables de entorno: SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASSWORD.
Lo ejecuta .github/workflows/mc-stats.yml cada 10 minutos. Del stats.json anterior solo se
reutiliza el historial de sesiones, para no perder las de logs que ya no se descargan.
"""
import gzip
import json
import os
import re
import sys
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import paramiko

NAMES = json.loads((Path(__file__).parent / "names_es.json").read_text(encoding="utf-8"))
LOG_FILES = 20  # logs .gz más recientes que se leen cada vez; lo anterior sale del historial

# Distancias (cm) agrupadas por medio. El resto de *_one_cm (caballo, cerdo, strider...) cuenta
# como montura, y fall_one_cm (caída) no es distancia recorrida.
DISTANCE = {
    "walk_one_cm": "foot", "sprint_one_cm": "foot", "crouch_one_cm": "foot", "climb_one_cm": "foot",
    "walk_on_water_one_cm": "foot", "walk_under_water_one_cm": "foot",
    "swim_one_cm": "swim",
    "boat_one_cm": "vehicle", "minecart_one_cm": "vehicle",
    "aviate_one_cm": "fly", "fly_one_cm": "fly",
}

# Líneas del log (en UTC): "[18:12:01] [Server thread/INFO]: System chat: Melkitt joined the game"
LINE = re.compile(r"\[(\d\d):(\d\d):(\d\d)\] \[[^\]]+\]: (?:System chat: )?(.*)")
UUID_OF = re.compile(r"UUID of player (\w+) is ([0-9a-f-]{36})")
JOINED = re.compile(r"(\w+)(?: \(formerly known as \w+\))? joined the game")
LEFT = re.compile(r"(\w+) left the game")
ROTATED = re.compile(r"(\d{4}-\d\d-\d\d)-(\d+)\.log\.gz")


class Server:
    def __init__(self):
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(
            os.environ["SFTP_HOST"],
            port=int(os.environ.get("SFTP_PORT") or 22),
            username=os.environ["SFTP_USER"],
            password=os.environ["SFTP_PASSWORD"],
            look_for_keys=False,
            allow_agent=False,
        )
        self.sftp = self.client.open_sftp()

    def read(self, path):
        with self.sftp.open(path) as f:
            return f.read()

    def list(self, path):
        """{nombre: fecha de modificación} de los archivos de una carpeta."""
        return {a.filename: a.st_mtime for a in self.sftp.listdir_attr(path)}

    def close(self):
        self.client.close()


# ---------- Estadísticas y logros ----------

def level_name(properties):
    """Carpeta del mundo según server.properties (normalmente "world")."""
    for line in properties.splitlines():
        key, sep, value = line.partition("=")
        if sep and key.strip() == "level-name":
            return value.strip() or "world"
    return "world"


def find_stats(server, world):
    # Las versiones nuevas guardan las stats en players/stats; las antiguas, directamente en stats
    for players in (f"{world}/players", world):
        try:
            return players, server.list(players + "/stats")
        except OSError:
            pass
    raise FileNotFoundError(f"No hay carpeta de estadísticas en {world}/")


def mojang_name(uuid):
    url = "https://sessionserver.mojang.com/session/minecraft/profile/" + uuid.replace("-", "")
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return json.load(r)["name"]
    except Exception:
        return None


def pretty(key):
    return key.removeprefix("minecraft:").replace("_", " ").capitalize()


def top(counts, names):
    """Lo más repetido de un contador, con su nombre en español."""
    if not counts:
        return None
    key, count = max(counts.items(), key=lambda kv: kv[1])
    return {"name": names.get(key) or pretty(key), "count": count}


def done_advancements(advancements):
    """{id: momento en que se completó} de los logros terminados (sin contar recetas)."""
    done = {}
    for key, value in advancements.items():
        if isinstance(value, dict) and value.get("done") and not key.startswith("minecraft:recipes/"):
            times = [datetime.strptime(t, "%Y-%m-%d %H:%M:%S %z") for t in value["criteria"].values()]
            done[key] = int(max(times).timestamp())
    return done


def player_stats(stats, done):
    custom = stats.get("minecraft:custom", {})
    mined = stats.get("minecraft:mined", {})
    crafted = stats.get("minecraft:crafted", {})

    def get(key):
        return custom.get("minecraft:" + key, 0)

    distance = Counter()
    for key, cm in custom.items():
        stat = key.removeprefix("minecraft:")
        if stat.endswith("_one_cm") and stat != "fall_one_cm":
            distance[DISTANCE.get(stat, "ride")] += cm

    # Los "root" son la cabecera de cada pestaña de logros ("Minecraft", "El Nether"...)
    recent = sorted(((k, t) for k, t in done.items() if not k.endswith("/root")), key=lambda kv: kv[1], reverse=True)[:3]
    return {
        # Todo lo que es tiempo va en ticks (20 por segundo); antes de la 1.17 play_time era play_one_minute
        "playtime": (get("play_time") or get("play_one_minute")) // 20,
        "sinceDeath": get("time_since_death") // 20,
        "deaths": get("deaths"),
        "mobKills": get("mob_kills"),
        "playerKills": get("player_kills"),
        "jumps": get("jump"),
        "sleeps": get("sleep_in_bed"),
        "damageTaken": round(get("damage_taken") / 20),  # en décimas de punto de vida; 2 puntos = 1 corazón
        "distance": {group: cm // 100 for group, cm in distance.items()},
        "mined": sum(mined.values()),
        "crafted": sum(crafted.values()),
        "diamonds": mined.get("minecraft:diamond_ore", 0) + mined.get("minecraft:deepslate_diamond_ore", 0),
        "topMined": top(mined, NAMES["items"]),
        "topCrafted": top(crafted, NAMES["items"]),
        "topKilled": top(stats.get("minecraft:killed", {}), NAMES["entities"]),
        "topKilledBy": top(stats.get("minecraft:killed_by", {}), NAMES["entities"]),
        "advancements": len(done),
        "recentAdvancements": [
            {"title": NAMES["advancements"].get(key) or pretty(key.split("/")[-1]), "time": time}
            for key, time in recent
        ],
    }


# ---------- Sesiones (a partir de los logs) ----------

def read_logs(server):
    """Los logs más recientes en orden, como [(medianoche UTC de su día, texto)]."""
    try:
        files = server.list("logs")
    except OSError:
        return []

    rotated = sorted(
        (m[1], int(m[2]), m[0]) for m in map(ROTATED.fullmatch, files) if m
    )[-LOG_FILES:]
    logs = []
    for day, _, name in rotated:
        midnight = int(datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())
        logs.append((midnight, gzip.decompress(server.read("logs/" + name)).decode("utf-8", "replace")))

    if "latest.log" in files:
        text = server.read("logs/latest.log").decode("utf-8", "replace")
        # Cada log tiene líneas de un solo día (se cambia de archivo a medianoche); el de
        # latest.log es el de su última modificación, salvo si se escribió justo tras las 00:00
        mtime = int(files["latest.log"])
        midnight = mtime - mtime % 86400
        lines = [m for m in map(LINE.fullmatch, text.splitlines()) if m]
        if lines and midnight + seconds_of_day(lines[-1]) > mtime + 3600:
            midnight -= 86400
        logs.append((midnight, text))
    return logs


def seconds_of_day(m):
    return int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])


def parse_sessions(logs, uuids, last_save):
    """Sesiones [entrada, salida] por uuid, y el primer instante que cubren los logs."""
    sessions = defaultdict(list)
    online = {}
    first = last = None

    def close_all(t):
        for uuid, start in online.items():
            sessions[uuid].append([start, t])
        online.clear()

    for midnight, text in logs:
        for line in text.splitlines():
            m = LINE.fullmatch(line)
            if not m:
                continue
            t, msg = midnight + seconds_of_day(m), m[4]
            if first is None:
                first = t
            if msg.startswith("Starting minecraft server"):
                close_all(last)  # el server se cayó sin cerrarlas
            elif msg == "Stopping server":
                close_all(t)
            elif found := UUID_OF.fullmatch(msg):
                uuids[found[1]] = found[2]
            elif (found := JOINED.fullmatch(msg)) and found[1] in uuids:
                uuid = uuids[found[1]]
                if uuid in online:
                    sessions[uuid].append([online[uuid], t])
                online[uuid] = t
            elif (found := LEFT.fullmatch(msg)) and uuids.get(found[1]) in online:
                uuid = uuids[found[1]]
                sessions[uuid].append([online.pop(uuid), t])
            last = t

    # Quien sigue conectado: hasta el último guardado de sus stats (cada 5 min mientras juega)
    for uuid, start in online.items():
        sessions[uuid].append([start, max(start, int(last_save.get(uuid, start)))])
    return sessions, first


def merge_sessions(old, new, first):
    """Las sesiones de los logs leídos mandan; del historial solo se guarda lo anterior a ellos."""
    merged = {}
    for uuid in sorted(set(old) | set(new)):
        kept = [s for s in old.get(uuid, []) if first is None or s[0] < first]
        merged[uuid] = sorted(kept + new.get(uuid, []))
    return merged


# ---------- Todo junto ----------

def collect(server, old_sessions):
    world = level_name(server.read("server.properties").decode("utf-8"))
    players_dir, stat_files = find_stats(server, world)
    try:
        cache = json.loads(server.read("usercache.json"))
    except (OSError, ValueError):
        cache = []
    names = {e["uuid"]: e["name"] for e in cache}

    players, all_done, last_save = [], {}, {}
    mined, killed, killed_by = Counter(), Counter(), Counter()
    for file, mtime in stat_files.items():
        if not re.fullmatch(r"[0-9a-f-]{36}\.json", file):
            continue
        uuid = file.removesuffix(".json")
        stats = json.loads(server.read(f"{players_dir}/stats/{file}"))["stats"]
        try:
            done = done_advancements(json.loads(server.read(f"{players_dir}/advancements/{file}")))
        except OSError:
            done = {}
        p = player_stats(stats, done)
        if p["playtime"] == 0:
            continue
        p = {"uuid": uuid, "name": names.get(uuid) or mojang_name(uuid) or uuid[:8], **p}
        players.append(p)
        all_done[p["name"]] = done
        last_save[uuid] = mtime
        mined.update(stats.get("minecraft:mined", {}))
        killed.update(stats.get("minecraft:killed", {}))
        killed_by.update(stats.get("minecraft:killed_by", {}))
    players.sort(key=lambda p: p["playtime"], reverse=True)

    # Quién consiguió antes cada logro
    firsts = {}
    for name, done in all_done.items():
        for key, time in done.items():
            if key not in firsts or time < firsts[key]["time"]:
                firsts[key] = {"name": name, "time": time}

    uuids = {name: uuid for uuid, name in names.items()}
    new_sessions, first = parse_sessions(read_logs(server), uuids, last_save)

    return {
        "advancementsTotal": len(NAMES["advancements"]),
        "players": players,
        "world": {
            "topMined": top(mined, NAMES["items"]),
            "topKilled": top(killed, NAMES["entities"]),
            "topKilledBy": top(killed_by, NAMES["entities"]),
        },
        "firsts": dict(sorted(firsts.items())),
        "sessions": merge_sessions(old_sessions, new_sessions, first),
    }


def main():
    previous, output = sys.argv[1], sys.argv[2]
    try:
        old_sessions = json.loads(Path(previous).read_text(encoding="utf-8"))["sessions"]
    except (OSError, ValueError, KeyError):
        old_sessions = {}

    server = Server()
    try:
        data = collect(server, old_sessions)
    finally:
        server.close()

    with open(output, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    sessions = sum(len(s) for s in data["sessions"].values())
    print(f"{len(data['players'])} jugadores, {sessions} sesiones")


if __name__ == "__main__":
    main()
