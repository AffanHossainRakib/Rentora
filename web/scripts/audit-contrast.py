"""Audit every ink/ground token pair in both themes against WCAG 2.2."""

import math
import re
import sys


def oklch_to_srgb(L, C, H):
    h = math.radians(H)
    a, b = C * math.cos(h), C * math.sin(h)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_**3, m_**3, s_**3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def gamma(c):
        c = max(0.0, min(1.0, c))
        return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055

    return tuple(gamma(c) for c in (r, g, bl))


def luminance(rgb):
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def hexof(rgb):
    return "#" + "".join(f"{round(c * 255):02X}" for c in rgb)


TOKEN = re.compile(r"^\s*--([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)")


def parse_block(text):
    out = {}
    for line in text.splitlines():
        m = TOKEN.match(line)
        if m:
            out[m.group(1)] = tuple(float(m.group(i)) for i in (2, 3, 4))
    return out



PAIRS = [
    ("ink", "paper", 4.5, "body text on page"),
    ("ink", "surface", 4.5, "body text on panel"),
    ("ink-muted", "paper", 4.5, "secondary text on page"),
    ("ink-muted", "surface", 4.5, "secondary text on panel"),
    ("ink-faint", "paper", 4.5, "micro labels on page"),
    ("ink-faint", "surface", 4.5, "micro labels on panel"),
    ("rule-strong", "paper", 3.0, "control boundary on page"),
    ("rule-strong", "surface", 3.0, "control boundary on panel"),
    ("signal", "paper", 4.5, "accent text on page"),
    ("signal", "surface", 4.5, "accent text on panel"),
    ("signal-ink", "signal", 4.5, "text on accent fill"),
    ("positive", "paper", 4.5, "status text/dot on page"),
    ("positive", "surface", 4.5, "status text/dot on panel"),
    ("warning", "paper", 4.5, "status text/dot on page"),
    ("warning", "surface", 4.5, "status text/dot on panel"),
    ("critical", "paper", 4.5, "error text on page"),
    ("critical", "surface", 4.5, "error text on panel"),
    ("focus", "paper", 3.0, "focus ring on page"),
    ("focus", "surface", 3.0, "focus ring on panel"),
    ("paper", "ink", 4.5, "inverted text on ink panel"),
]

def _run():
    css = open(sys.argv[1]).read()
    light = parse_block(css[css.index(":root {") : css.index(':root:not([data-theme="light"])')])
    dark = parse_block(css[css.index('[data-theme="dark"] {') :])
    fails = 0
    for theme_name, tokens in (("LIGHT", light), ("DARK", dark)):
        print(f"\n=== {theme_name} ===")
        for fg, bg, need, label in PAIRS:
            if fg not in tokens or bg not in tokens:
                print(f"  ?? missing token {fg} or {bg}")
                continue
            c = contrast(oklch_to_srgb(*tokens[fg]), oklch_to_srgb(*tokens[bg]))
            ok = c >= need
            if not ok:
                fails += 1
            print(f"  {'PASS' if ok else 'FAIL'}  {c:5.2f}:1 (need {need})  {fg} on {bg}  [{hexof(oklch_to_srgb(*tokens[fg]))}] — {label}")
    print(f"\n{fails} failure(s)")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    _run()
