"""Generate original moon icons with Python's standard library; no image dependencies."""
import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'extension' / 'icons'
ROOT.mkdir(parents=True, exist_ok=True)

def color(x, y):
    # Coordinates are normalized to 128 x 128. Rounded dark tile + crescent + status dot.
    dx, dy = max(18 - x, 0, x - 110), max(18 - y, 0, y - 110)
    if dx * dx + dy * dy > 18 * 18:
        return (0, 0, 0, 0)
    base = (26, 29, 35, 255)
    if (x - 59) ** 2 + (y - 62) ** 2 < 35 ** 2 and (x - 75) ** 2 + (y - 47) ** 2 >= 34 ** 2:
        return (245, 247, 248, 255)
    if (x - 94) ** 2 + (y - 91) ** 2 < 9 ** 2:
        return (168, 239, 208, 255)
    return base

def chunk(kind, data):
    return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)

for size in (16, 48, 128):
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            samples = [color((x + (sx + .5) / 4) * 128 / size, (y + (sy + .5) / 4) * 128 / size) for sx in range(4) for sy in range(4)]
            row.extend(round(sum(c[channel] for c in samples) / len(samples)) for channel in range(4))
        rows.append(bytes(row))
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', size, size, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b'')
    (ROOT / f'icon-{size}.png').write_bytes(png)
print('Generated 16, 48, 128 px icons')
