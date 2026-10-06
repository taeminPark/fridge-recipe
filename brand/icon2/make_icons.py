# '있잖아' 아이콘 시안을 그린다: python3 make_icons.py
import math
BG, ROSE = '#22182A', '#E9B49A'
P = lambda pts: "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"

def stick(x1, y1, x2, y2, w1, w2):
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
    return P([(x1 + nx * w1 / 2, y1 + ny * w1 / 2), (x2 + nx * w2 / 2, y2 + ny * w2 / 2), (x2 - nx * w2 / 2, y2 - ny * w2 / 2), (x1 - nx * w1 / 2, y1 - ny * w1 / 2)])

def rot(pts, deg, c=(128, 128)):
    a = math.radians(deg); ca, sa = math.cos(a), math.sin(a)
    return [(c[0] + (x - c[0]) * ca - (y - c[1]) * sa, c[1] + (x - c[0]) * sa + (y - c[1]) * ca) for x, y in pts]

def tape(L, R, T, B, n=6, z=9):
    h = (B - T) / n; right, left = [], []
    for k in range(n): right += [(R - z, T + h * (k + .5)), (R, T + h * (k + 1))]
    for k in range(n): left += [(L + z, B - h * (k + .5)), (L, B - h * (k + 1))]
    return [(L, T), (R, T)] + right + [(L, B)] + left[:-1]

def check(pts, w):
    (x0, y0), (x1, y1), (x2, y2) = pts
    def nn(ax, ay, bx, by):
        dx, dy = bx - ax, by - ay; l = math.hypot(dx, dy); return -dy / l * w / 2, dx / l * w / 2
    n1 = nn(x0, y0, x1, y1); n2 = nn(x1, y1, x2, y2)
    def inter(p, d, q, e):
        den = d[0] * e[1] - d[1] * e[0]; t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den; return (p[0] + d[0] * t, p[1] + d[1] * t)
    d1 = (x1 - x0, y1 - y0); d2 = (x2 - x1, y2 - y1)
    A = inter((x0 + n1[0], y0 + n1[1]), d1, (x1 + n2[0], y1 + n2[1]), d2); B = inter((x0 - n1[0], y0 - n1[1]), d1, (x1 - n2[0], y1 - n2[1]), d2)
    return [(x0 + n1[0], y0 + n1[1]), A, (x2 + n2[0], y2 + n2[1]), (x2 - n2[0], y2 - n2[1]), B, (x0 - n1[0], y0 - n1[1])]

def circle(cx, cy, r):  # 중심 (cx, cy). 구멍은 evenodd로 처리
    return f'M{cx:.1f} {cy - r:.1f}a{r:.1f} {r:.1f} 0 1 0 0.01 0Z'

def iss(s, ox, oy, w):
    """'있': ㅇ 그릇(링), ㅣ 젓가락, ㅆ 젓가락 두 벌. s 배율, (ox, oy) 위치, w 굵기"""
    T = lambda x, y: (ox + x * s, oy + y * s)
    cx, cy = T(84, 72)
    ring = circle(cx, cy, 48 * s) + ' ' + circle(cx, cy, (48 - 22 * w) * s)
    bw = 24 * w; (x0, y0), (x1, y1) = T(180 - bw / 2, 18), T(180 + bw / 2, 138)
    bar = P([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])
    def lam(x):
        r = math.radians(30); h = 58; L = h / math.cos(r); y = 160
        return (stick(*T(x - 5, y), *T(x - 5 - math.sin(r) * L, y + h), 7 * w * s, 18 * w * s) + ' ' +
                stick(*T(x + 5, y), *T(x + 5 + math.sin(r) * L, y + h), 7 * w * s, 18 * w * s))
    return ring, bar + ' ' + lam(74) + " " + lam(182)

tile = lambda body: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>있잖아</title><rect width="256" height="256" rx="56" fill="{BG}"/>{body}</svg>\n'

# 1 테이프 말풍선 + 체크
t = tape(34, 222, 62, 166); tail = [(70, 164), (108, 164), (62, 204)]
open('n1-tape-bubble.svg', 'w').write(tile(
    f'<path fill="{ROSE}" d="{P(rot(t, -8))}"/><path fill="{ROSE}" d="{P(rot(tail, -8))}"/>'
    f'<path fill="{BG}" d="{P(rot(check([(92, 116), (116, 140), (164, 92)], 24), -8))}"/>'))

# 2 있 상차림
ring, rest = iss(0.84, 21, 18, 1.25)
open('n2-iss.svg', 'w').write(tile(f'<path fill="{ROSE}" fill-rule="evenodd" d="{ring}"/><path fill="{ROSE}" d="{rest}"/>'))

# 3 테이프 위 '있'
t = tape(26, 230, 40, 216, n=8, z=10)
ring, rest = iss(0.58, 54, 50, 1.35)
open('n3-tape-iss.svg', 'w').write(tile(
    f'<path fill="{ROSE}" d="{P(rot(t, -6))}"/><g transform="rotate(-6 128 128)">'
    f'<path fill="{BG}" fill-rule="evenodd" d="{ring}"/><path fill="{BG}" d="{rest}"/></g>'))

# 4 말풍선 속 '있'
ring, rest = iss(0.52, 62, 56, 1.4)
open('n4-bubble-iss.svg', 'w').write(tile(
    f'<path fill="{ROSE}" d="{circle(128, 120, 96)}"/><path fill="{ROSE}" d="{P([(66, 178), (112, 206), (50, 234)])}"/>'
    f'<path fill="{BG}" fill-rule="evenodd" d="{ring}"/><path fill="{BG}" d="{rest}"/>'))
