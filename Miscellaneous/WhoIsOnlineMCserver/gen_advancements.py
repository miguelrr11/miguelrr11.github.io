"""Genera advancements.json y advancements.png para la sección de logros de index.html.

Uso: python gen_advancements.py 26.3 [client.jar]   (la versión del server; solo hace falta al actualizar Minecraft)
Necesita Pillow (pip install pillow). Del .jar del cliente salen los logros (árbol, pestaña y marco),
sus textos oficiales en inglés y las texturas con las que se dibuja cada icono como en el inventario.
Si no se le pasa el .jar, lo descarga de Mojang.
"""
import io
import json
import math
import re
import sys
import urllib.request
import zipfile

from PIL import Image

MANIFEST = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
TABS = ["story", "nether", "end", "adventure", "husbandry"]  # en el orden del juego
SIZE = 64      # px por icono (4 por píxel de textura de 16)
COLS = 16      # iconos por fila en advancements.png
FRAMES = ["task", "goal", "challenge"]

# Iconos extra para los premios de la web: id de objeto, o "sprite:" + sprite de la interfaz
EXTRA = [
    "diamond_pickaxe", "diamond", "bow", "iron_sword", "tnt", "totem_of_undying", "compass",
    "rabbit_foot", "sprite:hud/heart/full", "red_bed", "crafting_table", "knowledge_book",
    "clock", "phantom_membrane", "bone",
]

# Colores de tinte de los tintes del juego (para el estandarte)
DYES = {"white": 0xF9FFFE, "light_gray": 0x9D9D97, "gray": 0x474F52, "black": 0x1D1D21, "cyan": 0x169C9C}


def get(url):
    with urllib.request.urlopen(url, timeout=300) as r:
        return r.read()


# ---------- Matrices 4x4 ----------

def mul(*ms):
    out = ms[0]
    for m in ms[1:]:
        out = [[sum(out[i][k] * m[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    return out


def translate(x, y, z):
    return [[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]]


def scale(x, y, z):
    return [[x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]]


def rot(axis, deg):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    if axis == "x":
        return [[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]]
    if axis == "y":
        return [[c, 0, s, 0], [0, 1, 0, 0], [-s, 0, c, 0], [0, 0, 0, 1]]
    return [[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]


def quat(x, y, z, w):
    return [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 0],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 0],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), 0],
            [0, 0, 0, 1]]


def apply(m, p):
    return tuple(m[i][0] * p[0] + m[i][1] * p[1] + m[i][2] * p[2] + m[i][3] for i in range(3))


def det3(m):
    return (m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
            - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
            + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]))


def transformation(t):
    """El campo "transformation" de los modelos de objeto (en bloques)."""
    if not t:
        return translate(0, 0, 0)
    return mul(translate(*t.get("translation", [0, 0, 0])), quat(*t.get("left_rotation", [0, 0, 0, 1])),
               scale(*t.get("scale", [1, 1, 1])), quat(*t.get("right_rotation", [0, 0, 0, 1])))


def gui_transform(display):
    """Transformación "gui" de un modelo: traslación (en 1/16), rotación XYZ y escala."""
    g = display or {}
    rx, ry, rz = g.get("rotation", [0, 0, 0])
    return mul(translate(*(v / 16 for v in g.get("translation", [0, 0, 0]))),
               rot("x", rx), rot("y", ry), rot("z", rz), scale(*g.get("scale", [1, 1, 1])))


# ---------- Recursos del .jar ----------

class Assets:
    def __init__(self, jar):
        self.jar = jar
        self.names = set(jar.namelist())
        self.textures = {}

    def json(self, path):
        return json.loads(self.jar.read(path))

    def texture(self, ref):
        path = "assets/minecraft/textures/" + ref.removeprefix("minecraft:") + ".png"
        if path not in self.textures:
            img = Image.open(io.BytesIO(self.jar.read(path))).convert("RGBA")
            if path + ".mcmeta" in self.names and "animation" in self.json(path + ".mcmeta"):
                img = img.crop((0, 0, img.width, img.width))  # primer fotograma
            self.textures[path] = img
        return self.textures[path]

    def first(self, *refs):
        """La primera textura que exista (algunas cambian de carpeta entre versiones)."""
        return next(r for r in refs if f"assets/minecraft/textures/{r}.png" in self.names)

    def model(self, ref):
        """Modelo con su cadena de padres resuelta: texturas, elementos, display gui y si es plano."""
        textures, elements, gui, light, flat = {}, None, None, None, False
        while ref:
            ref = ref.removeprefix("minecraft:")
            if ref == "builtin/generated":
                flat = True
                break
            m = self.json(f"assets/minecraft/models/{ref}.json")
            for k, v in m.get("textures", {}).items():
                textures.setdefault(k, v)
            if elements is None and "elements" in m:
                elements = m["elements"]
            if gui is None and "gui" in m.get("display", {}):
                gui = m["display"]["gui"]
            light = light or m.get("gui_light")
            ref = m.get("parent")

        def resolve(t):
            for _ in range(10):
                if not t.startswith("#"):
                    return t
                t = textures.get(t[1:], "")
            return t

        return {"textures": {k: resolve(v) for k, v in textures.items()}, "elements": elements or [],
                "gui": gui, "light": light or "side", "flat": flat}


def color(v):
    v &= 0xFFFFFFFF
    return ((v >> 16) & 255, (v >> 8) & 255, v & 255)


def tint_color(assets, tint):
    kind = tint["type"].removeprefix("minecraft:")
    if kind == "grass":
        cmap = assets.texture("colormap/grass")
        t = min(1, max(0, tint["temperature"]))
        d = min(1, max(0, tint["downfall"])) * t
        return cmap.getpixel((int((1 - t) * 255), int((1 - d) * 255)))[:3]
    return color(tint.get("value", tint.get("default", -1)))


def leaves(node, m=None):
    """Los modelos que se dibujan para un objeto en el inventario, cada uno con su transformación."""
    m = mul(m or translate(0, 0, 0), transformation(node.get("transformation")))
    kind = node["type"].removeprefix("minecraft:")
    if kind in ("model", "special"):
        return [(node, m)]
    if kind == "composite":
        return [leaf for child in node["models"] for leaf in leaves(child, m)]
    if kind == "select":
        if node["property"].removeprefix("minecraft:") == "display_context":
            case = next((c for c in node["cases"] if "gui" in c["when"]), None)
            if case:
                return leaves(case["model"], m)
        return leaves(node.get("fallback") or node["cases"][0]["model"], m)
    if kind == "condition":
        return leaves(node["on_false"], m)
    if kind == "range_dispatch":
        return leaves(node.get("fallback") or node["entries"][0]["model"], m)
    raise ValueError(kind)


# ---------- Geometría: caras como cuadriláteros [(vértices, uvs, textura, tinte)] ----------

# Esquinas de cada cara (0 = mín, 1 = máx) en el orden en que Minecraft les asigna la UV
FACE = {
    "down": [(0, 0, 1), (0, 0, 0), (1, 0, 0), (1, 0, 1)],
    "up": [(0, 1, 0), (0, 1, 1), (1, 1, 1), (1, 1, 0)],
    "north": [(1, 1, 0), (1, 0, 0), (0, 0, 0), (0, 1, 0)],
    "south": [(0, 1, 1), (0, 0, 1), (1, 0, 1), (1, 1, 1)],
    "west": [(0, 1, 0), (0, 0, 0), (0, 0, 1), (0, 1, 1)],
    "east": [(1, 1, 1), (1, 0, 1), (1, 0, 0), (1, 1, 0)],
}


def default_uv(face, f, t):
    return {
        "down": [f[0], 16 - t[2], t[0], 16 - f[2]], "up": [f[0], f[2], t[0], t[2]],
        "north": [16 - t[0], 16 - t[1], 16 - f[0], 16 - f[1]], "south": [f[0], 16 - t[1], t[0], 16 - f[1]],
        "west": [f[2], 16 - t[1], t[2], 16 - f[1]], "east": [16 - t[2], 16 - t[1], 16 - f[2], 16 - f[1]],
    }[face]


def element_matrix(r):
    """Rotación propia de un elemento de modelo de bloque, en coordenadas 0..16."""
    if not r:
        return translate(0, 0, 0)
    o = r["origin"]
    if "axis" in r:
        m = rot(r["axis"], r["angle"])
        if r.get("rescale"):
            k = 1 / math.cos(math.radians(r["angle"]))
            m = mul(m, scale(*(1 if a == r["axis"] else k for a in "xyz")))
    else:
        m = mul(rot("x", r.get("x", 0)), rot("y", r.get("y", 0)), rot("z", r.get("z", 0)))
    return mul(translate(*o), m, translate(-o[0], -o[1], -o[2]))


def block_quads(assets, model, tints):
    quads = []
    for el in model["elements"]:
        f, t = el["from"], el["to"]
        m = element_matrix(el.get("rotation"))
        for face, info in el["faces"].items():
            ref = model["textures"].get(info["texture"].lstrip("#"), info["texture"].lstrip("#"))
            tex = assets.texture(ref)
            u1, v1, u2, v2 = info.get("uv") or default_uv(face, f, t)
            corners = [(u1, v1), (u1, v2), (u2, v2), (u2, v1)]
            shift = info.get("rotation", 0) // 90
            verts = [apply(m, tuple((t if c else f)[i] for i, c in enumerate(flags))) for flags in FACE[face]]
            uvs = [tuple(x / 16 for x in corners[(i + shift) % 4]) for i in range(4)]
            tint = tints[info["tintindex"]] if "tintindex" in info and info["tintindex"] < len(tints) else None
            quads.append(([tuple(x / 16 for x in v) for v in verts], uvs, tex, tint))
    return quads


def cube(tex, u, v, x, y, z, w, h, d, mirror=False):
    """Caja de un modelo de entidad (en píxeles, y hacia abajo) con su mapeado UV estándar."""
    x0, x1 = (x + w, x) if mirror else (x, x + w)
    p = [(x0, y, z), (x1, y, z), (x1, y + h, z), (x0, y + h, z),
         (x0, y, z + d), (x1, y, z + d), (x1, y + h, z + d), (x0, y + h, z + d)]
    us = [u, u + d, u + d + w, u + d + w + w, u + d + w + d, u + d + w + d + w]
    vs = [v, v + d, v + d + h]
    polys = [([5, 4, 0, 1], us[1], vs[0], us[2], vs[1]), ([2, 3, 7, 6], us[2], vs[1], us[3], vs[0]),
             ([0, 4, 7, 3], us[0], vs[1], us[1], vs[2]), ([1, 0, 3, 2], us[1], vs[1], us[2], vs[2]),
             ([5, 1, 2, 6], us[2], vs[1], us[4], vs[2]), ([4, 5, 6, 7], us[4], vs[1], us[5], vs[2])]
    quads = []
    for idx, a1, b1, a2, b2 in polys:
        uv = [(a2, b1), (a1, b1), (a1, b2), (a2, b2)]
        verts = [p[i] for i in idx]
        if mirror:
            verts, uv = verts[::-1], uv[::-1]
        quads.append(([tuple(c / 16 for c in vt) for vt in verts],
                      [(a / tex.width, b / tex.height) for a, b in uv], tex, None))
    return quads


def moved(quads, m):
    return [([apply(m, v) for v in vs], uv, tex, tint) for vs, uv, tex, tint in quads]


def tinted(img, rgb):
    r, g, b, a = img.split()
    r, g, b = (ch.point(lambda v, k=k: v * k // 255) for ch, k in zip((r, g, b), rgb))
    return Image.merge("RGBA", (r, g, b, a))


def banner_flag(assets, node):
    """Textura de la tela del estandarte: la base y cada diseño (máscaras blancas) teñidos de su color."""
    layers = [("base", node["model"]["color"])] + [
        (p["pattern"].removeprefix("minecraft:"), p["color"])
        for p in node.get("components", {}).get("minecraft:banner_patterns", [])]
    out = Image.new("RGBA", (64, 64))
    for pattern, dye in layers:
        out.alpha_composite(tinted(assets.texture("entity/banner/" + pattern), color(DYES[dye])))
    return out


def special_quads(assets, node):
    """Geometría de los objetos que el juego dibuja con código (cabezas, cofre, escudo...)."""
    model = node["model"]
    kind = model["type"].removeprefix("minecraft:")
    if kind == "head" and model["kind"] == "dragon":
        tex = assets.texture("entity/enderdragon/dragon")
        head = (cube(tex, 176, 44, -6, -1, -24, 12, 5, 16) + cube(tex, 112, 30, -8, -8, -10, 16, 16, 16)
                + cube(tex, 0, 0, -5, -12, -4, 2, 4, 6, True) + cube(tex, 112, 0, -5, -3, -22, 2, 2, 4, True)
                + cube(tex, 0, 0, 3, -12, -4, 2, 4, 6) + cube(tex, 112, 0, 3, -3, -22, 2, 2, 4)
                + moved(cube(tex, 176, 65, -6, 0, -16, 12, 4, 16), translate(0, 4 / 16, -8 / 16)))
        return moved(head, mul(translate(0, -7.986666 / 16, 0), scale(.75, .75, .75)))
    if kind == "head":
        return cube(assets.texture("entity/skeleton/" + model["kind"]), 0, 0, -4, -8, -4, 8, 8, 8)
    if kind == "chest":
        tex = assets.texture("entity/chest/" + model.get("texture", "normal").removeprefix("minecraft:"))
        lid = translate(0, 9 / 16, 1 / 16)
        return (cube(tex, 0, 19, 1, 0, 1, 14, 10, 14) + moved(cube(tex, 0, 0, 1, 0, 0, 14, 5, 14), lid)
                + moved(cube(tex, 0, 0, 7, -2, 14, 2, 4, 1), lid))
    if kind == "shield":
        tex = assets.texture(assets.first("entity/shield/shield_base_nopattern", "entity/shield_base_nopattern"))
        return cube(tex, 0, 0, -6, -11, -2, 12, 22, 1) + cube(tex, 26, 0, -1, -3, -1, 2, 6, 6)
    if kind == "banner":
        flag = banner_flag(assets, node)
        wood = assets.texture(assets.first("entity/banner/banner_base", "entity/banner_base"))
        return (moved(cube(flag, 0, 0, -10, 0, -2, 20, 40, 1), translate(0, -44 / 16, 0))
                + cube(wood, 44, 0, -1, -42, -1, 2, 42, 2) + cube(wood, 0, 42, -10, -44, -1, 20, 2, 2))
    if kind == "decorated_pot":
        decor = node.get("components", {}).get("minecraft:pot_decorations", {})

        def side(name):
            sherd = decor.get(name, {}).get("id", "").removeprefix("minecraft:")
            return assets.texture("entity/decorated_pot/" + (sherd.replace("_sherd", "_pattern")
                                                              if sherd else "decorated_pot_side"))

        base = assets.texture("entity/decorated_pot/decorated_pot_base")
        tex = {"front": side("front"), "left": side("left"), "right": side("right"), "back": side("back"), "base": base}
        el = [
            {"from": [1, 0, 1], "to": [15, 16, 15], "faces": {
                "south": {"texture": "front", "uv": [1, 0, 15, 16]}, "west": {"texture": "left", "uv": [1, 0, 15, 16]},
                "east": {"texture": "right", "uv": [1, 0, 15, 16]}, "north": {"texture": "back", "uv": [1, 0, 15, 16]},
                "up": {"texture": "base", "uv": [0, 6.5, 7, 13.5]}, "down": {"texture": "base", "uv": [0, 6.5, 7, 13.5]}}},
            {"from": [4, 16, 4], "to": [12, 19, 12], "faces": {  # el cuello, con el agujero arriba
                d: {"texture": "base", "uv": [4, 0, 8, 4] if d == "up" else [0, 4, 4, 5.5]} for d in FACE}},
        ]
        return block_quads(_TexAssets(tex), {"elements": el, "textures": {}}, [])
    raise ValueError(kind)


class _TexAssets:
    """Texturas sueltas por nombre, para reutilizar block_quads con imágenes propias."""
    def __init__(self, tex):
        self.tex = tex

    def texture(self, ref):
        return self.tex[ref]


# ---------- Dibujo ----------

def shade(n, light):
    """Iluminación aproximada del inventario: arriba claro, izquierda media, derecha oscura."""
    if light == "front":
        return 0.55 + 0.45 * max(0, n[2])
    return min(1, max(0.35, 0.787 - 0.141 * n[0] + 0.246 * n[1]))


def rasterize(quads, light, fit=None):
    """Proyección ortográfica con z-buffer. Las coordenadas llegan ya en espacio de pantalla (bloques)."""
    if fit:  # encuadra la figura (objetos especiales)
        xs = [v[0] for q in quads for v in q[0]]
        ys = [v[1] for q in quads for v in q[0]]
        k = fit / max(max(xs) - min(xs), max(ys) - min(ys))
        cx, cy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
        quads = [([((v[0] - cx) * k, (v[1] - cy) * k, v[2] * k) for v in vs], uv, tex, tint)
                 for vs, uv, tex, tint in quads]

    img = Image.new("RGBA", (SIZE, SIZE))
    px = img.load()
    zbuf = [[-1e9] * SIZE for _ in range(SIZE)]
    solid, glass = [], []
    for q in quads:
        vs = q[0]
        e1 = [vs[1][i] - vs[0][i] for i in range(3)]
        e2 = [vs[2][i] - vs[1][i] for i in range(3)]
        n = (e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0])
        length = math.sqrt(sum(c * c for c in n))
        if length < 1e-9 or n[2] <= 1e-6:
            continue  # de canto o de espaldas
        n = tuple(c / length for c in n)
        translucent = any(q[2].getchannel("A").histogram()[1:255])
        (glass if translucent else solid).append((q, shade(n, light), translucent))
    glass.sort(key=lambda item: sum(v[2] for v in item[0][0]) / 4)  # de atrás adelante

    for (vs, uvs, tex, tint), b, is_glass in solid + glass:
        sx = [(v[0] + 0.5) * SIZE for v in vs]
        sy = [(0.5 - v[1]) * SIZE for v in vs]
        ax, ay = sx[1] - sx[0], sy[1] - sy[0]
        bx, by = sx[3] - sx[0], sy[3] - sy[0]
        det = ax * by - ay * bx
        if abs(det) < 1e-9:
            continue
        tp = tex.load()
        tw, th = tex.size
        for y in range(max(0, int(min(sy))), min(SIZE, int(math.ceil(max(sy))) + 1)):
            for x in range(max(0, int(min(sx))), min(SIZE, int(math.ceil(max(sx))) + 1)):
                dx, dy = x + 0.5 - sx[0], y + 0.5 - sy[0]
                s = (dx * by - dy * bx) / det
                t = (ax * dy - ay * dx) / det
                if not (-1e-6 <= s <= 1 + 1e-6 and -1e-6 <= t <= 1 + 1e-6):
                    continue
                z = vs[0][2] + s * (vs[1][2] - vs[0][2]) + t * (vs[3][2] - vs[0][2])
                if z < zbuf[y][x] - 1e-6:
                    continue
                u = uvs[0][0] + s * (uvs[1][0] - uvs[0][0]) + t * (uvs[3][0] - uvs[0][0])
                v = uvs[0][1] + s * (uvs[1][1] - uvs[0][1]) + t * (uvs[3][1] - uvs[0][1])
                r, g, bl, a = tp[min(tw - 1, max(0, int(u * tw))), min(th - 1, max(0, int(v * th)))]
                if a == 0:
                    continue
                if tint:
                    r, g, bl = r * tint[0] // 255, g * tint[1] // 255, bl * tint[2] // 255
                c = (int(r * b), int(g * b), int(bl * b))
                if is_glass and a < 255:
                    old = px[x, y]
                    k = a / 255
                    oa = old[3] / 255
                    out_a = k + oa * (1 - k)
                    px[x, y] = tuple(int((c[i] * k + old[i] * oa * (1 - k)) / out_a) for i in range(3)) + (int(out_a * 255),)
                else:
                    px[x, y] = c + (255,)
                    zbuf[y][x] = z
    return img


def flat_icon(assets, model, tints):
    out = Image.new("RGBA", (16, 16))
    for i in range(10):
        ref = model["textures"].get(f"layer{i}")
        if not ref:
            break
        layer = assets.texture(ref).resize((16, 16), Image.NEAREST)
        out.alpha_composite(tinted(layer, tints[i]) if i < len(tints) else layer)
    return out.resize((SIZE, SIZE), Image.NEAREST)


def render_icon(assets, icon):
    if isinstance(icon, str) and icon.startswith("frame:"):  # marco de logro: 26 px al doble, centrado (el icono ocupa la mitad central)
        frame = assets.texture("gui/sprites/advancements/" + icon.removeprefix("frame:")).resize((52, 52), Image.NEAREST)
        img = Image.new("RGBA", (SIZE, SIZE))
        img.paste(frame, (6, 6))
        return img
    if isinstance(icon, str) and icon.startswith("sprite:"):
        sprite = assets.texture("gui/sprites/" + icon.removeprefix("sprite:"))
        k = SIZE // max(sprite.size) or 1
        img = Image.new("RGBA", (SIZE, SIZE))
        big = sprite.resize((sprite.width * k, sprite.height * k), Image.NEAREST)
        img.paste(big, ((SIZE - big.width) // 2, (SIZE - big.height) // 2))
        return img

    item_id, components = icon, {}
    if isinstance(icon, tuple):
        item_id, components = icon[0], json.loads(icon[1])
    name = item_id.removeprefix("minecraft:")
    parts = leaves(assets.json(f"assets/minecraft/items/{name}.json")["model"])

    quads, gui, light, fit = [], None, None, None
    for node, m in parts:
        tints = [tint_color(assets, t) for t in node.get("tints", [])]
        if node["type"].removeprefix("minecraft:") == "special":
            base = assets.model(node["base"])
            gui, light, fit = gui or base["gui"], light or base["light"], 0.92
            quads += moved(special_quads(assets, {**node, "components": components}), m)
            continue
        model = assets.model(node["model"])
        if model["flat"]:
            return flat_icon(assets, model, tints)
        gui, light = gui or model["gui"], light or model["light"]
        quads += moved(block_quads(assets, model, tints), m)

    view = mul(gui_transform(gui), translate(-0.5, -0.5, -0.5))
    quads = moved(quads, view)
    if det3(view) < 0:
        quads = [(vs[::-1], uv[::-1], tex, tint) for vs, uv, tex, tint in quads]
    return rasterize(quads, light, fit)


# ---------- Todo junto ----------

def text(lang, component):
    if isinstance(component, str):
        return component
    if "translate" in component:
        return lang.get(component["translate"], component.get("fallback", component["translate"]))
    return component.get("text", "")


def main():
    version = sys.argv[1]
    if len(sys.argv) > 2:
        jar = zipfile.ZipFile(sys.argv[2])
    else:
        manifest = json.loads(get(MANIFEST))
        meta = json.loads(get(next(v["url"] for v in manifest["versions"] if v["id"] == version)))
        jar = zipfile.ZipFile(io.BytesIO(get(meta["downloads"]["client"]["url"])))
    assets = Assets(jar)
    lang = assets.json("assets/minecraft/lang/en_us.json")

    advs = {}
    for path in assets.names:
        m = re.fullmatch(r"data/minecraft/advancement/(.+)\.json", path)
        if not m or m[1].startswith("recipes/"):
            continue
        data = assets.json(path)
        if "display" in data:
            advs[m[1]] = data

    icons = []  # (id de objeto, componentes en JSON) o "sprite:..."

    def icon_index(key):
        if key not in icons:
            icons.append(key)
        return icons.index(key)

    children = {}
    for key, data in advs.items():
        children.setdefault(data.get("parent", "").removeprefix("minecraft:"), []).append(key)

    out = []

    def walk(key, depth):
        data = advs[key]
        d = data["display"]
        comps = d["icon"].get("components")
        icon = (d["icon"]["id"], json.dumps(comps, sort_keys=True)) if comps else d["icon"]["id"].removeprefix("minecraft:")
        out.append({
            "id": key,
            "parent": data.get("parent", "").removeprefix("minecraft:") or None,
            "depth": depth,
            "frame": d.get("frame", "task"),
            "title": text(lang, d["title"]),
            "description": text(lang, d["description"]),
            "icon": icon_index(icon),
            **({"hidden": True} if d.get("hidden") else {}),
        })
        for child in sorted(children.get(key, [])):
            walk(child, depth + 1)

    for tab in TABS:
        walk(f"{tab}/root", 0)
    extra = {name.split("/")[-1]: icon_index(name) for name in EXTRA}
    frames = {f: [icon_index(f"frame:{f}_frame_unobtained"), icon_index(f"frame:{f}_frame_obtained")] for f in FRAMES}

    rows = math.ceil(len(icons) / COLS)
    sheet = Image.new("RGBA", (COLS * SIZE, rows * SIZE))
    for i, icon in enumerate(icons):
        sheet.paste(render_icon(assets, icon), (i % COLS * SIZE, i // COLS * SIZE))
    sheet.save("advancements.png", optimize=True)

    with open("advancements.json", "w", encoding="utf-8") as f:
        json.dump({"version": version, "cols": COLS, "rows": rows, "frames": frames, "extra": extra,
                   "advancements": out}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(out)} logros, {len(icons)} iconos")


if __name__ == "__main__":
    main()
