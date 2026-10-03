"""Bereitet ein Album für vidiverify.de/music auf.

Aufruf (aus dem Website-Ordner):

    python tools/music/aufbereiten.py <Albumordner> vol-001 --ffmpeg <Ordner mit ffmpeg.exe>

Der Albumordner enthält die fertigen MP3s ("01 - VidiVerify - Titel.mp3" ...)
und Cover.png - also der entpackte Inhalt der Release-ZIP.

Was entsteht:

- public/music/<vol>/NN.mp3    Tonspur und Tags UNVERÄNDERT aus dem Original
                               (-c:a copy), nur das Cover als 600er-JPEG statt
                               des grossen PNG. Nicht neu kodieren: Das war ein
                               zweiter verlustbehafteter Durchgang ohne Nutzen.
- public/music/<vol>/cover.jpg, cover.webp   900 px, für die Seite
- public/music/<vol>/og.jpg    1200x630, Vorschau für Facebook
- src/pages/music/<vol ohne Strich>.json     Titel, Länge, Genre, Wellenform

ffmpeg liegt auch der Website bei: public/plugins-fallback/ffmpeg/*.zip.
Achtung: Der Pfad zu ffmpeg darf nicht zu lang sein (Win32-Grenze), also
etwa nach %TEMP%\\ff entpacken.
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

WEB = Path(__file__).resolve().parents[2]
BALKEN = 160


def ffprobe(bin_dir: Path, f: Path) -> dict:
    r = subprocess.run([str(bin_dir / "ffprobe"), "-v", "error", "-show_entries",
                        "format=duration:format_tags=genre", "-of", "json", str(f)],
                       capture_output=True, text=True, encoding="utf-8", check=True)
    return json.loads(r.stdout)["format"]


def wellenform(bin_dir: Path, f: Path) -> list[float]:
    """RMS je Abschnitt, normiert auf 1 - die Balken der Seite."""
    r = subprocess.run([str(bin_dir / "ffmpeg"), "-v", "error", "-i", str(f), "-ac", "1",
                        "-ar", "11025", "-f", "f32le", "-"], capture_output=True, check=True)
    x = np.abs(np.frombuffer(r.stdout, dtype=np.float32))
    v = np.array([np.sqrt(np.mean(c.astype(np.float64) ** 2))
                  for c in np.array_split(x, BALKEN)])
    v = v / (v.max() or 1)
    return [round(float(a), 3) for a in np.clip(v, 0.04, 1)]


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("album", type=Path)
    p.add_argument("vol", help="z. B. vol-002")
    p.add_argument("--ffmpeg", type=Path, default=Path(""),
                   help="Ordner mit ffmpeg/ffprobe (leer = aus PATH)")
    a = p.parse_args()

    ziel = WEB / "public" / "music" / a.vol
    ziel.mkdir(parents=True, exist_ok=True)
    cover = Image.open(a.album / "Cover.png").convert("RGB")

    with tempfile.TemporaryDirectory() as tmp:
        klein = Path(tmp) / "cover600.jpg"
        cover.resize((600, 600), Image.LANCZOS).save(klein, quality=88, optimize=True)

        tracks = []
        for i, f in enumerate(sorted(a.album.glob("*.mp3")), 1):
            nr = f"{i:02d}"
            subprocess.run([str(a.ffmpeg / "ffmpeg"), "-v", "error", "-y",
                            "-i", str(f), "-i", str(klein),
                            "-map", "0:a", "-map", "1:v", "-c", "copy",
                            "-map_metadata", "0", "-id3v2_version", "3",
                            "-fflags", "+bitexact", "-flags:a", "+bitexact",
                            "-metadata:s:v", "title=Album cover",
                            "-metadata:s:v", "comment=Cover (front)",
                            "-disposition:v", "attached_pic",
                            str(ziel / f"{nr}.mp3")], check=True)
            meta = ffprobe(a.ffmpeg, f)
            tracks.append({
                "nr": nr,
                "titel": re.sub(r"^\d+ - VidiVerify - ", "", f.stem),
                "dauer": round(float(meta["duration"]), 2),
                "genre": meta.get("tags", {}).get("genre", ""),
                "datei": f"/music/{a.vol}/{nr}.mp3",
                "wellen": wellenform(a.ffmpeg, f),
            })
            print(nr, tracks[-1]["titel"], tracks[-1]["dauer"])

    json_ziel = WEB / "src" / "pages" / "music" / (a.vol.replace("-", "") + ".json")
    json_ziel.write_text(json.dumps(tracks, ensure_ascii=False, separators=(",", ":")),
                         encoding="utf-8")

    seite = cover.resize((900, 900), Image.LANCZOS)
    seite.save(ziel / "cover.jpg", quality=86, optimize=True, progressive=True)
    seite.save(ziel / "cover.webp", quality=82, method=6)
    og = cover.resize((1200, 1200), Image.LANCZOS).crop((0, 285, 1200, 915))
    og = ImageEnhance.Brightness(og.filter(ImageFilter.GaussianBlur(28))).enhance(0.45)
    og.paste(cover.resize((570, 570), Image.LANCZOS), (315, 30))
    og.save(ziel / "og.jpg", quality=86, optimize=True)
    print("fertig:", ziel, json_ziel.name)


if __name__ == "__main__":
    main()
