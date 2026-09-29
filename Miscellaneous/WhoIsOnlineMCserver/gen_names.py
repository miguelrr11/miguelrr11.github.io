"""Genera names_es.json con los nombres en español de bloques, objetos, mobs y logros.

Uso: python gen_names.py 26.3   (la versión del server; solo hace falta al actualizar Minecraft)
Descarga de Mojang el .jar del server (para la lista de logros) y el idioma es_es.
"""
import io
import json
import re
import sys
import urllib.request
import zipfile

MANIFEST = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"


def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read()


def main():
    version = sys.argv[1]
    manifest = json.loads(get(MANIFEST))
    meta = json.loads(get(next(v["url"] for v in manifest["versions"] if v["id"] == version)))

    # El .jar del server trae dentro el .jar real, que contiene la definición de cada logro
    bundle = zipfile.ZipFile(io.BytesIO(get(meta["downloads"]["server"]["url"])))
    inner = next(n for n in bundle.namelist() if re.fullmatch(r"META-INF/versions/.+\.jar", n))
    jar = zipfile.ZipFile(io.BytesIO(bundle.read(inner)))
    advancement_keys = {}
    for path in jar.namelist():
        m = re.fullmatch(r"data/minecraft/advancement/(.+)\.json", path)
        if not m or m[1].startswith("recipes/"):
            continue
        display = json.loads(jar.read(path)).get("display")
        if display:
            advancement_keys["minecraft:" + m[1]] = display["title"]["translate"]

    index = json.loads(get(meta["assetIndex"]["url"]))
    h = index["objects"]["minecraft/lang/es_es.json"]["hash"]
    lang = json.loads(get(f"https://resources.download.minecraft.net/{h[:2]}/{h}"))

    def names(*kinds):  # si un id se repite, gana el primer tipo
        out = {}
        for kind in kinds:
            for key, value in lang.items():
                m = re.fullmatch(kind + r"\.minecraft\.([a-z0-9_]+)", key)
                if m:
                    out.setdefault("minecraft:" + m[1], value)
        return out

    out = {
        "version": version,
        "items": names("block", "item"),
        "entities": names("entity"),
        "advancements": {k: lang.get(v, k) for k, v in advancement_keys.items()},
    }
    with open("names_es.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=0, sort_keys=True)
    print(f"{len(out['items'])} bloques/objetos, {len(out['entities'])} mobs, {len(out['advancements'])} logros")


if __name__ == "__main__":
    main()
