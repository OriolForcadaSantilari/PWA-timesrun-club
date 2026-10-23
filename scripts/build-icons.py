"""Build favicon, apple-touch, and maskable PWA icons from the brand mark."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SRC = PUBLIC / "icon-512x512.png"
BLACK = (0, 0, 0, 255)


def load_mark() -> Image.Image:
    return Image.open(SRC).convert("RGBA")


def save_png(im: Image.Image, name: str) -> None:
    path = PUBLIC / name
    im.save(path, format="PNG")
    print(f"wrote {path.name} {im.size}")


def inset_on_black(mark: Image.Image, size: int, scale: float = 0.72) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BLACK)
    inner = int(size * scale)
    placed = mark.resize((inner, inner), Image.Resampling.LANCZOS)
    offset = (size - inner) // 2
    canvas.paste(placed, (offset, offset), placed)
    return canvas


def black_on_transparent(mark: Image.Image, size: int) -> Image.Image:
    src = mark.resize((size, size), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    src_px = src.load()
    out_px = out.load()
    for y in range(size):
        for x in range(size):
            r, g, b, a = src_px[x, y]
            if a < 20:
                continue
            lum = (r + g + b) / 3
            if lum > 140:
                out_px[x, y] = (17, 17, 17, 255)
    return out


def main() -> None:
    mark = load_mark()
    save_png(inset_on_black(mark, 192), "icon-maskable-192.png")
    save_png(inset_on_black(mark, 512), "icon-maskable-512.png")
    save_png(inset_on_black(mark, 180, 0.86), "apple-touch-icon.png")
    save_png(black_on_transparent(mark, 32), "favicon-32x32.png")
    save_png(black_on_transparent(mark, 48), "favicon-48x48.png")


if __name__ == "__main__":
    main()
