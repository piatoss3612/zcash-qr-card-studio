#!/usr/bin/env python3
"""Vizorcat asset pipeline for Zcash QR Card Studio.

Subcommands (run with -h for details):
  generate   draw an option sheet with the Codex CLI image tool, then isolate its figures
  crop       isolate one figure from a side-by-side sheet
  normalize  deterministic alpha normalization (alpha < 24 -> 0, >= 240 -> 255, trim, 24 px pad)
  qa         composite over light, dark and magenta backgrounds
  stats      PNG size, alpha bounds, silhouette and card render heights
  holes      count fully transparent pixels enclosed by the silhouette
  check      full view plus a zoomed head-and-paws view for a human check
  review     structural review by a separate Codex call (paw sheet attached as a style example)
  register   register a chosen figure: PNG, record, alpha QA, manifest, catalog
  verify     repository gate: manifest, records, catalog paths and style pairs

Only `generate` and `review` need the Codex CLI; every other step works on any sheet.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: python3 -m pip install pillow")

REPO = Path(__file__).resolve().parents[2]
CHARS = REPO / "assets/characters"
SOURCE = CHARS / "source"
QA_DIR = SOURCE / "qa"
PAW_SHEET = QA_DIR / "vizorcat-paw-reference.png"
PROPORTION_SHEET = QA_DIR / "vizorcat-proportion-reference.png"
CARD_DATA = REPO / "src/online/card-data.js"
MANIFEST = CHARS / "asset-manifest.json"
ARCHIVE = REPO / "archive/qr-card-studio-rejected"
SCHEMA = Path(__file__).with_name("review-schema.json")
MODEL = os.environ.get("VIZORCAT_IMAGE_MODEL", "gpt-6-sol")
REVIEW_MODEL = os.environ.get("VIZORCAT_REVIEW_MODEL", MODEL)
GENERATED = Path(os.environ.get("CODEX_GENERATED_IMAGES", Path.home() / ".codex/generated_images"))


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def rel(path, base=REPO):
    return os.path.relpath(Path(path).resolve(), base)


def codex_version():
    try:
        return subprocess.run(["codex", "--version"], capture_output=True, text=True).stdout.strip()
    except FileNotFoundError:
        return "codex (not installed)"


# --------------------------------------------------------------------------- isolation

def crop(sheet, index, count, out, attach=12):
    """Isolate figure `index` (1-based) of `count` side-by-side figures.

    Only transparent or chroma-green pixels connected to the sheet border are cleared, so green
    inside a figure (eyes, gems, cloth) survives. The `count` largest 8-connected opaque blobs are
    the figures, ordered left to right; each small detached piece (floating stars, a prop on the
    ground) is kept only by its nearest figure, and only within `attach` pixels.
    """
    im = Image.open(sheet).convert("RGBA")
    W, H = im.size
    px = im.load()

    def bg_like(p):
        r, g, b, a = p
        return a < 24 or (g > 150 and r < 120 and b < 120 and g - max(r, b) > 60)

    seen = bytearray(W * H)
    stack = [(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)]
    while stack:
        x, y = stack.pop()
        i = y * W + x
        if seen[i] or not bg_like(px[x, y]):
            continue
        seen[i] = 1
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and not seen[ny * W + nx]:
                stack.append((nx, ny))
    for y in range(H):
        for x in range(W):
            if px[x, y][3] < 24:
                px[x, y] = (0, 0, 0, 0)

    lab = [0] * (W * H)
    blobs = []
    for sy in range(H):
        for sx in range(W):
            i = sy * W + sx
            if lab[i] or px[sx, sy][3] == 0:
                continue
            n = len(blobs) + 1
            lab[i] = n
            stack = [(sx, sy)]
            pts = []
            while stack:
                x, y = stack.pop()
                pts.append((x, y))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < W and 0 <= ny < H:
                            j = ny * W + nx
                            if not lab[j] and px[nx, ny][3] > 0:
                                lab[j] = n
                                stack.append((nx, ny))
            blobs.append(pts)
    if len(blobs) < count:
        sys.exit(f"{sheet}: found {len(blobs)} figures, expected {count}")
    order = sorted(range(len(blobs)), key=lambda k: -len(blobs[k]))[:count]
    order.sort(key=lambda k: sum(p[0] for p in blobs[k]) / len(blobs[k]))
    target = order[index - 1] + 1

    mask = Image.new("L", (W, H), 0)
    m = mask.load()
    for x, y in blobs[target - 1]:
        m[x, y] = 255

    def edge(pts):
        s = set(pts)
        e = [(x, y) for x, y in pts if (x + 1, y) not in s or (x - 1, y) not in s or (x, y + 1) not in s or (x, y - 1) not in s]
        return e[:: max(1, len(e) // 3000)]

    edges = {k + 1: edge(blobs[k]) for k in order}
    for k, pts in enumerate(blobs, 1):
        if k in edges or len(pts) < 20:
            continue
        sample = pts[:: max(1, len(pts) // 60)]
        dist = {f: min((x - ex) ** 2 + (y - ey) ** 2 for x, y in sample for ex, ey in e) for f, e in edges.items()}
        best = min(dist, key=dist.get)
        if best == target and dist[best] <= attach * attach:
            for x, y in pts:
                m[x, y] = 255
    fig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fig.paste(im, (0, 0), mask)
    fig = fig.crop(mask.getbbox())
    fig.save(out)
    return out


def normalize(src, dst):
    im = Image.open(src).convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 24:
                px[x, y] = (0, 0, 0, 0)
            elif a >= 240:
                px[x, y] = (r, g, b, 255)
    im = im.crop(im.getchannel("A").getbbox())
    out = Image.new("RGBA", (im.width + 48, im.height + 48), (0, 0, 0, 0))
    out.paste(im, (24, 24))
    out.save(dst, optimize=True)
    return dst


def stats(path):
    im = Image.open(path)
    x0, y0, x1, y1 = im.getchannel("A").getbbox()
    w, h = im.size
    ah = y1 - y0
    centred = min(500 / w, 650 / h) * ah
    signature = min(130 / w, 162 / h) * ah
    return (f"PNG {w} x {h}; alpha bounds ({x0},{y0})-({x1 - 1},{y1 - 1}); silhouette {x1 - x0} x {ah}; "
            f"Centered 500x650 @1.0: min(500/{w}, 650/{h}) x {ah} = {centred:.1f}px; "
            f"Signature 130x162 @100%: alpha height {signature:.1f}px; SHA-256 {sha(path)}")


def qa(src, dst, height=360):
    im = Image.open(src).convert("RGBA")
    im.thumbnail((10_000, height))
    pad = 16
    sheet = Image.new("RGB", ((im.width + pad * 2) * 3, im.height + pad * 2))
    for i, colour in enumerate(["#fbf8f1", "#0f1124", "#ff00ff"]):
        tile = Image.new("RGB", (im.width + pad * 2, im.height + pad * 2), colour)
        tile.paste(im, (pad, pad), im)
        sheet.paste(tile, (i * tile.width, 0))
    sheet.save(dst, quality=78)
    return dst


def holes(path):
    a = Image.open(path).convert("RGBA").getchannel("A")
    w, h = a.size
    px = a.load()
    seen = bytearray(w * h)
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        i = y * w + x
        if seen[i] or px[x, y] >= 24:
            continue
        seen[i] = 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                stack.append((nx, ny))
    pts = [(x, y) for y in range(h) for x in range(w) if px[x, y] < 24 and not seen[y * w + x]]
    box = (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)) if pts else None
    return len(pts), box


def check(path, out):
    im = Image.open(path).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    w, h = im.size
    full = im.resize((round(w * 620 / h), 620), Image.LANCZOS)
    top = im.crop((0, 0, w, int(h * 0.55)))
    top = top.resize((round(top.width * 620 / top.height), 620), Image.LANCZOS)
    sheet = Image.new("RGB", (full.width + top.width + 60, 640), "#f8f6ed")
    sheet.paste(full, (20, 10), full)
    sheet.paste(top, (full.width + 40, 10), top)
    sheet.thumbnail((1100, 640))
    sheet.save(out, quality=85)
    return out


def view(sheet, out, background=(251, 248, 241)):
    im = Image.open(sheet).convert("RGBA")
    bg = Image.new("RGBA", im.size, background + (255,))
    bg.alpha_composite(im)
    bg = bg.convert("RGB")
    bg.thumbnail((1000, 700))
    bg.save(out, quality=86)
    return out


# --------------------------------------------------------------------------- Codex steps

GENERATE_WRAPPER = ("Generate exactly one image with your built-in image generation tool, using the attached "
                    "reference images in the order given. Do not read, create or modify any files. When done, "
                    "reply with only the absolute path of the generated image file.\n\n")


def generate(prompt_file, out_dir, name, refs, count, attach):
    prompt = Path(prompt_file).read_text(encoding="utf-8").strip()
    if not prompt:
        sys.exit(f"empty prompt: {prompt_file}")
    for r in refs:
        if not Path(r).exists():
            sys.exit(f"missing reference: {r}")
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    start = time.time()
    args = ["codex", "exec", "-m", MODEL, "-s", "read-only", "--skip-git-repo-check", GENERATE_WRAPPER + prompt]
    for r in refs:
        args += ["-i", str(r)]
    log = out_dir / f"{name}.log"
    with open(log, "w") as fh, open(os.devnull) as devnull:
        code = subprocess.run(args, stdin=devnull, stdout=fh, stderr=subprocess.STDOUT).returncode
    made = sorted((p for p in GENERATED.rglob("*.png") if p.stat().st_mtime >= start), key=lambda p: p.stat().st_mtime)
    if code != 0 or not made:
        sys.exit(f"generation failed (exit {code}); see {log}")
    src = made[-1]
    sheet = out_dir / f"{name}.png"
    shutil.copy(src, sheet)
    shutil.copy(prompt_file, out_dir / f"{name}.prompt.txt")
    meta = {"model": MODEL, "codex": codex_version(), "source_image": str(src), "prompt": f"{name}.prompt.txt",
            "references": [str(Path(r).resolve()) for r in refs], "count": count,
            "created": datetime.datetime.now().isoformat(timespec="seconds")}
    (out_dir / f"{name}.meta.json").write_text(json.dumps(meta, indent=2) + "\n")
    for i in range(1, count + 1):
        crop(sheet, i, count, out_dir / f"{name}-{i}-fig.png", attach)
        normalize(out_dir / f"{name}-{i}-fig.png", out_dir / f"{name}-{i}-norm.png")
    view(sheet, out_dir / f"{name}-view.jpg")
    print(f"sheet {sheet}\nview  {out_dir / f'{name}-view.jpg'}")


REVIEW_PROMPT = """You are a strict art QA reviewer for a mascot character library. Do not generate or edit images and do not touch files. Inspect image 1 closely (zoom into every paw, foot, ear and eye). Image 2 shows how approved Vizorcat paws are drawn — A open paw pad side, B inviting paw palm up, C mitten around a handle, D paw holding a flat card — as examples of the drawing style, not as the only allowed paw states.

Character expectations:
{spec}

Checklist — fail the image if any item is violated:
1. forepaws: paws are round cat paws drawn in the same style as the rest of the figure. They may hold or grip props, curl, tuck into sleeves or pockets, rest on things or show the pad side, whatever the pose needs; a closed or curled paw is fine, and toe beans are not counted. FAIL only when a paw reads as a human hand at the size a card shows the figure (about 150 px tall): long separated fingers, a pointing index finger, nails, or a human-hand silhouette. A small crease or a thumb-like bump that only shows when zoomed in is not a failure. Say briefly how each forepaw is drawn.
2. hind_legs: very short legs with round feet, both feet on the ground under the body (unless the expectations say it floats), no stride, no crossed legs, no visible foot soles, no long humanoid legs.
3. ears: exactly two cat ears, each drawn once, normal length; nothing ear-like under a hat brim or hood.
4. eyes: exactly two eyes matching the expectations (colors and sides), same size, no extra eyes.
5. props: every prop named in the expectations is present once and complete, and there is no extra object, weapon or duplicated prop. Decorative trims — bows, lace, ribbons, embroidery, buttons, small charms on clothing — are part of the outfit and are NOT extra props; never fail for them.
6. facing: head, gaze and main gesture turned toward screen-left.
7. extra_anatomy: no extra limbs, tails, heads or duplicated parts; nothing cut off by the frame.
8. text_or_symbols: no text, letters, numbers, runes, religious or occult symbols.
9. expression: matches the expectations.

For each check write a short finding. List every problem in issues with the area, what is wrong, and a concrete fix instruction an image editor can follow. Set pass to true only if there are no issues."""


def review(image, spec_file, out):
    spec = Path(spec_file).read_text(encoding="utf-8").strip()
    if not spec:
        sys.exit(f"empty spec: {spec_file}")
    args = ["codex", "exec", "-m", REVIEW_MODEL, "-s", "read-only", "--skip-git-repo-check",
            "--output-schema", str(SCHEMA), "-o", str(out), REVIEW_PROMPT.format(spec=spec),
            "-i", str(image), "-i", str(PAW_SHEET)]
    with open(f"{out}.log", "w") as fh, open(os.devnull) as devnull:
        code = subprocess.run(args, stdin=devnull, stdout=fh, stderr=subprocess.STDOUT).returncode
    if code != 0 or not Path(out).exists():
        sys.exit(f"review failed (exit {code}); see {out}.log")
    result = json.loads(Path(out).read_text())
    print(f"{Path(image).name}: pass={result['pass']} issues={len(result['issues'])}")
    for issue in result["issues"]:
        print(f"  - {issue['area']}: {issue['problem']}")
    return result["pass"]


# --------------------------------------------------------------------------- registration

def register(a):
    sheet_dir = Path(a.sheet_dir)
    meta = json.loads((sheet_dir / f"{a.name}.meta.json").read_text())
    fig = sheet_dir / f"{a.name}-{a.index}-fig.png"
    norm = sheet_dir / f"{a.name}-{a.index}-norm.png"
    review_json = Path(a.review) if a.review else sheet_dir / f"{a.name}-{a.index}.review.json"
    result = json.loads(review_json.read_text())
    if not result["pass"] or result["issues"]:
        sys.exit(f"{review_json} did not pass; register only figures that passed review")
    new = a.file
    stem = new[:-4]
    if (CHARS / new).exists():
        sys.exit(f"assets/characters/{new} already exists; choose the next version number")
    cdir = SOURCE / "concepts" / a.concept_dir
    cdir.mkdir(parents=True, exist_ok=True)
    tag = a.tag
    shutil.copy(sheet_dir / f"{a.name}.png", cdir / f"{tag}-sheet.png")
    shutil.copy(sheet_dir / meta["prompt"], cdir / f"{tag}-sheet-prompt.txt")
    shutil.copy(fig, cdir / f"{tag}-sheet-{a.index}-figure.png")
    shutil.copy(review_json, cdir / f"{tag}-sheet-{a.index}-review.json")

    previous = "- New character; no previous file."
    if a.replace:
        old = a.replace
        old_stem = old[:-4]
        arch = ARCHIVE / f"{old_stem}-superseded"
        arch.mkdir(parents=True, exist_ok=True)
        old_sha = sha(CHARS / old)
        for f in [CHARS / old, QA_DIR / f"{old_stem}-alpha-qa.jpg", SOURCE / f"{old_stem}.md"]:
            if f.exists():
                shutil.move(str(f), arch / f.name)
        previous = (f"- Previous file `{old}` (SHA-256 `{old_sha}`) and its record are archived at "
                    f"`archive/qr-card-studio-rejected/{old_stem}-superseded/` (git-ignored).")

    shutil.copy(norm, CHARS / new)
    qa(CHARS / new, QA_DIR / f"{stem}-alpha-qa.jpg")
    final = sha(CHARS / new)
    manifest = json.loads(MANIFEST.read_text())
    entry = {"id": a.id, "file": new, "sha256": final,
             "source": "generated for QR Card Studio with local alpha normalization",
             "sourceRecord": f"source/{stem}.md", "variant": a.variant, "usage": a.usage}
    manifest["assets"] = [x for x in manifest["assets"] if x["id"] != a.id] + [entry]
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")

    refs = []
    notes = dict(x.split("|", 1) for x in a.ref_note)
    for r in meta["references"]:
        r = Path(r)
        desc = notes.get(r.name, "")
        if not r.exists():
            refs.append(f"`{r.name}` (missing at registration)" + (f" ({desc})" if desc else ""))
            continue
        if REPO.resolve() not in r.resolve().parents:
            # References made for this job (crops, swatches) are kept beside the sheet so the record stays reproducible.
            kept = cdir / f"{tag}-reference-{r.name}"
            shutil.copy(r, kept)
            r = kept
        refs.append(f"`{rel(r, SOURCE)}`" + (f" ({desc})" if desc else "") + f", SHA-256 `{sha(r)}`")
    today = datetime.date.today().isoformat()
    md = f"""# {a.label} — {stem} (chosen sample, used as generated)

- Generated: {meta['created'][:10]}; registered {today}. {a.intro}
- Live catalog: `src/online/card-data.js` points at `assets/characters/{new}` (label "{a.label}"). Final SHA-256: `{final}`.
- Variant: `{a.variant}`.
- Tool path: {meta['codex']}, model `{meta['model']}`, `codex exec -s read-only`, built-in image generation, one {meta['count']}-figure sheet. Original `{meta['source_image']}`, copied unchanged to `concepts/{a.concept_dir}/{tag}-sheet.png` (SHA-256 `{sha(cdir / f'{tag}-sheet.png')}`); exact prompt `concepts/{a.concept_dir}/{tag}-sheet-prompt.txt`.
- References (attached in this order): {'; '.join(refs)}.
- Isolation: only transparent or chroma-green pixels connected to the sheet border are cleared (green inside the figure is kept); 8-connected opaque blobs are labelled over the whole sheet, the {meta['count']} largest are the figures (ordered left to right), and each small detached piece is kept only by its nearest figure within {a.attach} px (`concepts/{a.concept_dir}/{tag}-sheet-{a.index}-figure.png`, SHA-256 `{sha(cdir / f'{tag}-sheet-{a.index}-figure.png')}`). Then deterministic alpha normalization (alpha < 24 → 0, ≥ 240 → 255, trim, 24 px padding).
- Codex structural review (`--output-schema`, against the paw sheet `qa/vizorcat-paw-reference.png`, SHA-256 `{sha(PAW_SHEET)}`, and a character spec): passed with no issues (`concepts/{a.concept_dir}/{tag}-sheet-{a.index}-review.json`).
- Attempts and human check: {a.summary}
- Alpha QA `qa/{stem}-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff.
- Scale: {stats(CHARS / new)}
{previous}
"""
    (SOURCE / f"{stem}.md").write_text(md, encoding="utf-8")

    data = CARD_DATA.read_text(encoding="utf-8")
    if a.replace:
        if f"assets/characters/{a.replace}" not in data:
            print(f"note: {a.replace} is not referenced in card-data.js; update the catalog by hand")
        data = data.replace(f"assets/characters/{a.replace}", f"assets/characters/{new}")
    elif a.catalog_id:
        if re.search(rf"^\s*{re.escape(a.catalog_id)}:", data, re.M):
            sys.exit(f"catalog id `{a.catalog_id}` already exists; use --replace to swap its image")
        line = f'  {a.catalog_id}: {{ label: "{a.label}", path: "assets/characters/{new}" }},\n'
        data = data.replace('  none: { label: "No Vizorcat", path: null },', line + '  none: { label: "No Vizorcat", path: null },', 1)
    CARD_DATA.write_text(data, encoding="utf-8")
    print(f"registered assets/characters/{new} ({final})\nrecord  assets/characters/source/{stem}.md\nqa      assets/characters/source/qa/{stem}-alpha-qa.jpg")
    print("next: fill in the QA line in the record after looking at the QA sheet, update docs/online-cards.md "
          "and PRODUCT.md counts if the roster changed, then run `verify` and `npm test`.")


# --------------------------------------------------------------------------- repository gate

def verify():
    problems = []
    manifest = json.loads(MANIFEST.read_text())
    for x in manifest["assets"]:
        f = CHARS / x["file"]
        if not f.exists():
            problems.append(f"manifest file missing: {x['file']}")
            continue
        h = sha(f)
        if h != x["sha256"]:
            problems.append(f"manifest SHA-256 differs from file: {x['file']}")
        record = CHARS / x.get("sourceRecord", "")
        if x.get("sourceRecord") and not record.exists():
            problems.append(f"record missing: {x['sourceRecord']}")
        elif x.get("sourceRecord") and h not in record.read_text(encoding="utf-8"):
            problems.append(f"record does not state the file SHA-256: {x['sourceRecord']}")
    for md in SOURCE.glob("*.md"):
        for ref in re.findall(r"concepts/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+\.[a-z]+", md.read_text(encoding="utf-8")):
            if not (SOURCE / ref).exists():
                problems.append(f"{md.name} cites a missing file: {ref}")
    script = ("import('./src/online/card-data.js').then(m => console.log(JSON.stringify({"
              "companions: m.COMPANIONS, pairs: Object.fromEntries(Object.entries(m.STYLES).map(([k, s]) => [k, s.companion || null]))})))")
    out = subprocess.run(["node", "-e", script], cwd=REPO, capture_output=True, text=True)
    if out.returncode:
        problems.append(f"could not load card-data.js: {out.stderr.strip()}")
    else:
        catalog = json.loads(out.stdout)
        for cid, c in catalog["companions"].items():
            if c["path"] and not (REPO / c["path"]).exists():
                problems.append(f"catalog `{cid}` points at a missing file: {c['path']}")
        for style, cid in catalog["pairs"].items():
            if cid and not (catalog["companions"].get(cid) or {}).get("path"):
                problems.append(f"style `{style}` pairs with an unknown Vizorcat `{cid}`")
    for p in problems:
        print("✗", p)
    print(f"verify: {len(manifest['assets'])} manifest entries, {len(problems)} problem(s)")
    return not problems


# --------------------------------------------------------------------------- CLI

def main():
    p = argparse.ArgumentParser(prog="vizorcat", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generate", help="draw an option sheet with Codex and isolate its figures")
    g.add_argument("--prompt", required=True)
    g.add_argument("--out", required=True, help="working folder, outside the repo or in a git-ignored place")
    g.add_argument("--name", required=True)
    g.add_argument("--count", type=int, default=3)
    g.add_argument("--attach", type=int, default=12, help="px within which detached pieces join their nearest figure")
    g.add_argument("--ref", action="append", default=[], help="reference image, in attachment order")
    c = sub.add_parser("crop")
    c.add_argument("sheet"); c.add_argument("index", type=int); c.add_argument("count", type=int); c.add_argument("out")
    c.add_argument("--attach", type=int, default=12)
    for name in ("normalize", "qa", "check"):
        s = sub.add_parser(name); s.add_argument("src"); s.add_argument("dst")
    sub.add_parser("stats").add_argument("png")
    sub.add_parser("holes").add_argument("png", nargs="+")
    r = sub.add_parser("review")
    r.add_argument("image"); r.add_argument("--spec", required=True); r.add_argument("--out", required=True)
    reg = sub.add_parser("register", help="register a figure that passed review")
    reg.add_argument("--sheet-dir", required=True); reg.add_argument("--name", required=True)
    reg.add_argument("--index", type=int, required=True)
    reg.add_argument("--review", help="review JSON (default <name>-<index>.review.json in the sheet folder)")
    reg.add_argument("--id", required=True, help="manifest id, e.g. snow-surveyor-embed")
    reg.add_argument("--file", required=True, help="new file name, e.g. snow-surveyor-embed-v3.png")
    reg.add_argument("--replace", help="live file this one supersedes (swaps the catalog path)")
    reg.add_argument("--catalog-id", help="new companion id to add before `none` (new characters only)")
    reg.add_argument("--label", required=True); reg.add_argument("--variant", required=True); reg.add_argument("--usage", required=True)
    reg.add_argument("--concept-dir", required=True); reg.add_argument("--tag", required=True)
    reg.add_argument("--intro", required=True, help="why this redraw exists and what the user chose, with their words")
    reg.add_argument("--summary", required=True, help="rounds tried, why others failed, and what the human check saw")
    reg.add_argument("--ref-note", action="append", default=[], help="FILENAME|what this reference was for")
    reg.add_argument("--attach", type=int, default=12)
    sub.add_parser("verify")
    a = p.parse_args()
    if a.cmd == "generate":
        generate(a.prompt, a.out, a.name, a.ref, a.count, a.attach)
    elif a.cmd == "crop":
        print(crop(a.sheet, a.index, a.count, a.out, a.attach))
    elif a.cmd == "normalize":
        normalize(a.src, a.dst); print(stats(a.dst))
    elif a.cmd == "qa":
        print(qa(a.src, a.dst))
    elif a.cmd == "check":
        print(check(a.src, a.dst))
    elif a.cmd == "stats":
        print(stats(a.png))
    elif a.cmd == "holes":
        for f in a.png:
            n, box = holes(f)
            print(f"{f}: {n} enclosed transparent px, bbox {box}")
    elif a.cmd == "review":
        sys.exit(0 if review(a.image, a.spec, a.out) else 1)
    elif a.cmd == "register":
        register(a)
    elif a.cmd == "verify":
        sys.exit(0 if verify() else 1)


if __name__ == "__main__":
    main()
