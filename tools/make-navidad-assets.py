"""Genera los assets de la temporada Navidad (no se usan en runtime; solo para regenerarlos).

  python3 tools/make-navidad-assets.py

- hero-navidad.webp / community-navidad.webp: las fotos del sitio en tritono verde → rojo → oro (horneado,
  sin filtros ni blend en el navegador, igual que las de Halloween).
- navidad-overlay.webp: ilustración RGBA 1983×793 (luna, estrellas, pinos nevados, colinas, luces y nieve).
"""
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

IMG = "public/img/"
rng = random.Random(24)


# ───────────── fotos en tritono ─────────────
def tritone(src, dst, size, stops):
    im = Image.open(IMG + src).convert("RGB")
    im = im.resize(size, Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])
    lum = np.clip((lum - 0.05) / 0.85, 0, 1) ** 0.95
    xs = [s[0] for s in stops]
    out = np.stack([np.interp(lum, xs, [s[1][c] for s in stops]) for c in range(3)], axis=-1)
    Image.fromarray(out.astype(np.uint8)).save(IMG + dst, quality=80, method=6)


STOPS = [(0.0, (6, 12, 24)), (0.4, (26, 62, 60)), (0.7, (150, 68, 68)), (1.0, (255, 234, 196))]
tritone("header.webp", "hero-navidad.webp", (1920, 1280), STOPS)
tritone("home.webp", "community-navidad.webp", (1280, 854), STOPS)

# ───────────── overlay RGBA ─────────────
W, H = 1983, 793
S = 2  # supersampling para bordes limpios
w, h = W * S, H * S
canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))


def layer():
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def blur(im, r):
    return im.filter(ImageFilter.GaussianBlur(r * S))


# 1) viñeta azul noche: el centro-derecha queda transparente para que se vea la foto
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
dx = (xx / w - 0.66) / 0.62
dy = (yy / h - 0.52) / 0.78
d = np.clip(np.sqrt(dx * dx + dy * dy), 0, 1.4)
alpha = np.clip(d ** 2.1 * 0.92, 0, 0.95)
top = np.clip(1 - yy / (h * 0.5), 0, 1) ** 1.6 * 0.55
alpha = np.clip(alpha + top, 0, 0.96)
vig = np.zeros((h, w, 4), np.uint8)
vig[..., 0], vig[..., 1], vig[..., 2] = 4, 10, 26
vig[..., 3] = (alpha * 255).astype(np.uint8)
canvas = Image.alpha_composite(canvas, Image.fromarray(vig, "RGBA"))

# 2) estrellas
st = layer()
sd = ImageDraw.Draw(st)
for _ in range(260):
    x, y = rng.random() * w, rng.random() ** 1.5 * h * 0.62
    r = rng.choice([1, 1, 1.5, 2]) * S
    a = int(120 + rng.random() * 135)
    sd.ellipse([x - r, y - r, x + r, y + r], fill=(235, 242, 255, a))
for _ in range(14):  # destellos en cruz
    x, y = rng.random() * w, rng.random() * h * 0.4
    L = rng.uniform(9, 20) * S
    sd.line([x - L, y, x + L, y], fill=(255, 245, 220, 150), width=S)
    sd.line([x, y - L, x, y + L], fill=(255, 245, 220, 150), width=S)
canvas = Image.alpha_composite(canvas, st)

# 3) luna con halo
mx, my, mr = int(w * 0.665), int(h * 0.2), int(98 * S)
halo = layer()
hd = ImageDraw.Draw(halo)
hd.ellipse([mx - mr * 2.6, my - mr * 2.6, mx + mr * 2.6, my + mr * 2.6], fill=(190, 215, 255, 70))
canvas = Image.alpha_composite(canvas, blur(halo, 70))
moon = layer()
md = ImageDraw.Draw(moon)
md.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(238, 244, 255, 255))
for _ in range(16):  # cráteres
    cx = mx + rng.uniform(-0.65, 0.65) * mr
    cy = my + rng.uniform(-0.65, 0.65) * mr
    cr = rng.uniform(0.06, 0.16) * mr
    md.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(205, 218, 240, 255))
canvas = Image.alpha_composite(canvas, blur(moon, 1.1))

# 4) auroras suaves (verde y rojo) detrás de la luna
au = layer()
ad = ImageDraw.Draw(au)
for i, col in enumerate([(30, 190, 120, 46), (210, 60, 80, 34)]):
    pts = [(x, h * (0.17 + 0.05 * i) + math.sin(x / (210 * S) + i * 2) * 55 * S) for x in range(int(w * 0.28), int(w * 0.98), 24)]
    ad.line(pts, fill=col, width=int(90 * S))
canvas = Image.alpha_composite(canvas, blur(au, 55))


# 5) pinos nevados
def pine(cx, base, ht, wd, shade):
    im = layer()
    d = ImageDraw.Draw(im)
    tiers = 6
    d.rectangle([cx - wd * 0.04, base - ht * 0.1, cx + wd * 0.04, base], fill=(10, 20, 20, 255))
    for t in range(tiers):
        f0 = t / tiers
        top_y = base - ht + ht * 0.88 * f0 * 0.9
        bot_y = base - ht * 0.1 - (tiers - 1 - t) * ht * 0.13
        half = wd * (0.2 + 0.8 * (t + 1) / tiers) / 2
        d.polygon([(cx, top_y), (cx - half, bot_y), (cx + half, bot_y)], fill=shade)
        # nieve en las ramas
        d.polygon([(cx, top_y), (cx - half * 0.78, bot_y - (bot_y - top_y) * 0.28), (cx + half * 0.78, bot_y - (bot_y - top_y) * 0.28)], fill=(228, 238, 252, 255))
        d.polygon([(cx - half * 0.55, bot_y - (bot_y - top_y) * 0.3), (cx, bot_y - (bot_y - top_y) * 0.1), (cx + half * 0.55, bot_y - (bot_y - top_y) * 0.3), (cx + half, bot_y), (cx - half, bot_y)], fill=shade)
    return im


base = int(h * 0.9)
for cx, ht, wd, shade in [
    (0.0, 0.26, 0.09, (7, 36, 34, 255)), (0.045, 0.19, 0.07, (9, 44, 40, 255)), (0.09, 0.13, 0.05, (10, 52, 46, 255)),
    (0.995, 0.66, 0.18, (7, 36, 34, 255)), (0.94, 0.5, 0.14, (9, 44, 40, 255)), (0.885, 0.37, 0.1, (10, 52, 46, 255)), (0.84, 0.25, 0.07, (12, 58, 50, 255)),
]:
    canvas = Image.alpha_composite(canvas, pine(int(cx * w), base, int(ht * h), int(wd * w * 0.8), shade))

# 6) colinas de nieve
for k, (hy, amp, col) in enumerate([(0.86, 0.025, (150, 180, 220, 255)), (0.92, 0.03, (205, 224, 248, 255)), (0.98, 0.02, (240, 247, 255, 255))]):
    hl = layer()
    hd = ImageDraw.Draw(hl)
    pts = [(0, h)]
    for x in range(0, w + 40, 40):
        pts.append((x, h * hy + math.sin(x / (230 * S) + k * 1.7) * amp * h + math.sin(x / (87 * S) + k) * amp * h * 0.35))
    pts.append((w, h))
    hd.polygon(pts, fill=col)
    canvas = Image.alpha_composite(canvas, hl)

# 7) guirnalda de luces (arriba a la izquierda) con brillo
wire = layer()
wd_ = ImageDraw.Draw(wire)
bulbs = []
n = 22
prev = None
for i in range(n + 1):
    t = i / n
    x = t * w * 0.62
    y = h * 0.04 + math.sin(t * math.pi * 3.2) * h * 0.035 + t * h * 0.02
    # catenaria por tramos
    if prev:
        wd_.line([prev, (x, y)], fill=(8, 16, 18, 255), width=2 * S)
    prev = (x, y)
    if i % 1 == 0:
        bulbs.append((x, y + 9 * S, [(255, 70, 70), (255, 205, 90), (90, 220, 130), (110, 170, 255)][i % 4]))
canvas = Image.alpha_composite(canvas, wire)
glow = layer()
gd = ImageDraw.Draw(glow)
for x, y, col in bulbs:
    r = 38 * S
    gd.ellipse([x - r, y - r, x + r, y + r], fill=col + (120,))
canvas = Image.alpha_composite(canvas, blur(glow, 18))
bl = layer()
bd = ImageDraw.Draw(bl)
for x, y, col in bulbs:
    r = 6 * S
    bd.ellipse([x - r * 0.8, y - r, x + r * 0.8, y + r * 1.25], fill=col + (255,))
    bd.ellipse([x - r * 0.3, y - r * 0.6, x + r * 0.1, y - r * 0.1], fill=(255, 255, 255, 190))
canvas = Image.alpha_composite(canvas, bl)

# 8) nieve cayendo (bokeh), más densa en los bordes
sn = layer()
snd = ImageDraw.Draw(sn)
for _ in range(240):
    x = rng.random() * w
    if rng.random() < 0.55:
        x = (rng.random() ** 2) * w * 0.3 if rng.random() < 0.5 else w - (rng.random() ** 2) * w * 0.3
    y = rng.random() * h * 0.95
    r = rng.choice([2, 2, 3, 3, 4, 6]) * S
    a = int(110 + rng.random() * 130)
    snd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, a))
canvas = Image.alpha_composite(canvas, blur(sn, 0.8))

out = canvas.resize((W, H), Image.LANCZOS)
out.save(IMG + "navidad-overlay.webp", quality=88, method=6)
print("ok")
