"""Lee las estadísticas del server de Minecraft por SFTP y genera playtime.json.

Uso: python playtime.py salida.json
Variables de entorno: SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASSWORD.
Lo ejecuta .github/workflows/mc-playtime.yml cada 10 minutos.
"""
import json
import os
import sys
import urllib.request

import paramiko


def level_name(properties):
    """Carpeta del mundo según server.properties (normalmente "world")."""
    for line in properties.splitlines():
        key, sep, value = line.partition("=")
        if sep and key.strip() == "level-name":
            return value.strip() or "world"
    return "world"


def play_seconds(stats):
    custom = stats.get("stats", {}).get("minecraft:custom", {})
    # Antes de la 1.17 se llamaba play_one_minute; los dos cuentan ticks (20 por segundo)
    ticks = custom.get("minecraft:play_time", custom.get("minecraft:play_one_minute", 0))
    return ticks // 20


def mojang_name(uuid):
    url = "https://sessionserver.mojang.com/session/minecraft/profile/" + uuid.replace("-", "")
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return json.load(r)["name"]
    except Exception:
        return None


def collect(read, listdir):
    """read(ruta) -> texto, listdir(ruta) -> nombres de archivo. Rutas relativas a la raíz del server."""
    stats_dir = level_name(read("server.properties")) + "/stats"
    try:
        names = {e["uuid"]: e["name"] for e in json.loads(read("usercache.json"))}
    except (OSError, ValueError):
        names = {}

    players = []
    for file in listdir(stats_dir):
        if not file.endswith(".json"):
            continue
        uuid = file.removesuffix(".json")
        seconds = play_seconds(json.loads(read(f"{stats_dir}/{file}")))
        if seconds > 0:
            name = names.get(uuid) or mojang_name(uuid) or uuid[:8]
            players.append({"name": name, "uuid": uuid, "seconds": seconds})

    players.sort(key=lambda p: p["seconds"], reverse=True)
    return {"players": players}


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        os.environ["SFTP_HOST"],
        port=int(os.environ.get("SFTP_PORT") or 22),
        username=os.environ["SFTP_USER"],
        password=os.environ["SFTP_PASSWORD"],
        look_for_keys=False,
        allow_agent=False,
    )
    sftp = client.open_sftp()

    def read(path):
        with sftp.open(path) as f:
            return f.read().decode("utf-8")

    try:
        data = collect(read, sftp.listdir)
    finally:
        client.close()

    with open(sys.argv[1], "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{len(data['players'])} jugadores")


if __name__ == "__main__":
    main()
