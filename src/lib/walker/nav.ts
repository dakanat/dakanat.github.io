import { FH, G, HARD, KNEE, ONEWAY, S, STEP, TEXT, cell, hard, topAt, type World } from "./world";

export type LinkType = "walk" | "jump" | "ladder" | "pipe" | "spring" | "drop";

export interface NavNode {
  i: number;
  x: number;
  y: number;
  seg: number;
  links: Link[];
  jumps: Link[] | null;
  /** standing on a spring: the only way off is the bounce */
  spring?: boolean;
  /** jumps start only from some nodes (surface ends and every few nodes); the rest walk there first */
  launch?: boolean;
}

export interface Link {
  to: NavNode;
  type: LinkType;
  cost: number;
  /** ladder only: x of the ladder's centre line */
  x?: number;
}

export type Special =
  | { kind: "ladder"; x: number; top: [number, number]; bottom: [number, number] }
  | { kind: "pipe"; a: [number, number]; b: [number, number] }
  | { kind: "spring"; top: [number, number] };

/** Launch speed of a spring bounce (px/s, upwards). */
export const SPRING_V = 470;

export interface Nav {
  surf: Int32Array;
  nodes: NavNode[];
  segNodes: Map<number, NavNode[]>;
  buckets: Map<string, NavNode[]>;
}

const NODE_SPACING = 6; // cells between sampled nodes along a surface
const LAUNCH_EVERY = 4; // every 4th node along a surface (about 48px) can start a jump
const MAX_JUMP_TARGETS = 20; // surfaces considered per jump
const BUCKET = 64;
const MAX_JUMP_DX = 320;
/** Sideways speed limit in the air, so long jumps float instead of shooting across. */
const MAX_JUMP_VX = 200;
const MAX_JUMP_UP = 420;
const MAX_JUMP_DOWN = 420;
/** Height a jump can clear without a cost penalty; higher jumps are allowed but discouraged. */
const EASY_JUMP_UP = 80;

function addNode(nav: Nav, x: number, y: number, seg: number): NavNode {
  const nd: NavNode = { i: nav.nodes.length, x, y, seg, links: [], jumps: null };
  nav.nodes.push(nd);
  if (!nav.segNodes.has(seg)) nav.segNodes.set(seg, []);
  nav.segNodes.get(seg)!.push(nd);
  const k = `${Math.floor(x / BUCKET)},${Math.floor(y / BUCKET)}`;
  if (!nav.buckets.has(k)) nav.buckets.set(k, []);
  nav.buckets.get(k)!.push(nd);
  return nd;
}

/**
 * Finds every cell the walker can stand on, joins neighbouring ones into
 * surfaces ("segments"), samples nodes along them and links the nodes by
 * walking, ladders and pipes. Jump links are computed lazily (see jumpsFrom).
 * `avoid` marks spots that are solid but should never be a destination (springs).
 */
export function buildNav(w: World, specials: Special[], avoid: (x: number, y: number) => boolean = () => false): Nav {
  const { MW, MH, mask } = w;
  const nav: Nav = { surf: new Int32Array(MW * MH).fill(-1), nodes: [], segNodes: new Map(), buckets: new Map() };
  const pts: { cx: number; cy: number }[] = [];
  const parent: number[] = [];
  const find = (a: number) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const cols: number[][] = [];
  for (let cx = 0; cx < MW; cx++) {
    const col: number[] = [];
    for (let cy = 1; cy < MH; cy++) {
      if (!mask[cy * MW + cx] || mask[(cy - 1) * MW + cx] || avoid(cx * S + 1, cy * S)) continue;
      let ok = true;
      for (let k = 1; k <= FH / S && cy - k >= 0 && ok; k++) {
        for (const c2 of [cx - 1, cx, cx + 1]) {
          const v = c2 >= 0 && c2 < MW ? mask[(cy - k) * MW + c2] : HARD;
          if (v === HARD || (v === TEXT && k * S <= KNEE)) {
            ok = false;
            break;
          }
        }
      }
      if (!ok) continue;
      const id = pts.length;
      pts.push({ cx, cy });
      parent.push(id);
      col.push(id);
    }
    cols.push(col);
  }
  for (let cx = 1; cx < MW; cx++) {
    for (const id of cols[cx]) {
      for (const back of [1, 2, 3]) {
        if (cx - back < 0) break;
        let best = -1;
        let bd = Infinity;
        for (const q of cols[cx - back]) {
          const dd = Math.abs(pts[q].cy - pts[id].cy);
          if (dd <= STEP / S && dd < bd) {
            bd = dd;
            best = q;
          }
        }
        if (best >= 0) {
          parent[find(id)] = find(best);
          break;
        }
      }
    }
  }
  const segs = new Map<number, { cx: number; cy: number }[]>();
  pts.forEach((p, id) => {
    const r = find(id);
    nav.surf[p.cy * MW + p.cx] = r;
    if (!segs.has(r)) segs.set(r, []);
    segs.get(r)!.push(p);
  });
  for (const [sid, list] of segs) {
    if (list.length < 3) continue;
    list.sort((a, b) => a.cx - b.cx);
    for (let i = 0; i < list.length; i += NODE_SPACING) addNode(nav, list[i].cx * S + 1, list[i].cy * S, sid);
    const last = list[list.length - 1];
    if ((list.length - 1) % NODE_SPACING) addNode(nav, last.cx * S + 1, last.cy * S, sid);
  }
  for (const sp of specials) {
    const at = ([x, y]: [number, number]) => {
      const s = segAt(w, nav, x, y);
      return s < 0 ? null : addNode(nav, x, y, s);
    };
    if (sp.kind === "ladder") {
      const b = at(sp.bottom);
      const t = at(sp.top);
      if (b && t) {
        b.launch = t.launch = true;
        const cost = (b.y - t.y) / 60 + 0.3;
        b.links.push({ to: t, type: "ladder", x: sp.x, cost });
        t.links.push({ to: b, type: "ladder", x: sp.x, cost });
      }
    } else if (sp.kind === "spring") {
      const n = at(sp.top);
      if (n) n.spring = n.launch = true;
    } else {
      const a = at(sp.a);
      const b = at(sp.b);
      if (a && b) {
        a.launch = b.launch = true;
        a.links.push({ to: b, type: "pipe", cost: 1 });
        b.links.push({ to: a, type: "pipe", cost: 1 });
      }
    }
  }
  // rules can be dropped through: link each node on a rule to whatever is right below it
  for (const n of [...nav.nodes]) {
    if (cell(w, n.x, n.y) !== ONEWAY) continue;
    for (let y = n.y + S; y < w.H; y += S) {
      if (hard(w, n.x, y - S)) break;
      if (!topAt(w, n.x, y)) continue;
      const seg = segAt(w, nav, n.x, y);
      const below = seg >= 0 ? nearestOnSeg(nav, seg, n.x) : null;
      if (below && Math.abs(below.x - n.x) < 16) n.links.push({ to: below, type: "drop", cost: 0.3 + (y - n.y) / 400 });
      break;
    }
  }
  for (const arr of nav.segNodes.values()) {
    arr.sort((a, b) => a.x - b.x);
    arr.forEach((n, i) => {
      if (i % LAUNCH_EVERY === 0 || i === arr.length - 1) n.launch = true;
    });
    if (arr.some((n) => n.spring)) continue; // no walking off a spring, only bouncing
    for (let i = 1; i < arr.length; i++) {
      const cost = Math.abs(arr[i].x - arr[i - 1].x) / 90;
      arr[i - 1].links.push({ to: arr[i], type: "walk", cost });
      arr[i].links.push({ to: arr[i - 1], type: "walk", cost });
    }
  }
  return nav;
}

/** Surface id under (x, y), tolerating a cell of slack either way. */
export function segAt(w: World, nav: Nav, x: number, y: number): number {
  const c0 = Math.floor(y / S);
  const c = Math.floor(x / S);
  for (const cy of [c0, c0 + 1, c0 - 1]) {
    if (cy < 0 || cy >= w.MH) continue;
    for (const cx of [c, c - 1, c + 1, c - 2, c + 2]) {
      if (cx >= 0 && cx < w.MW && nav.surf[cy * w.MW + cx] >= 0) return nav.surf[cy * w.MW + cx];
    }
  }
  return -1;
}

export function nearestOnSeg(nav: Nav, seg: number, x: number): NavNode | null {
  let best: NavNode | null = null;
  for (const n of nav.segNodes.get(seg) ?? []) if (!best || Math.abs(n.x - x) < Math.abs(best.x - x)) best = n;
  return best;
}

export function nearestNode(nav: Nav, x: number, y: number, maxDist: number): NavNode | null {
  let best: NavNode | null = null;
  let bd = maxDist;
  for (const n of nav.nodes) {
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < bd) {
      bd = d;
      best = n;
    }
  }
  return best;
}

export interface Arc {
  vx: number;
  vy: number;
  /** flight time until it lands on the target */
  t: number;
  /** the body touches no block or pipe on the way (planned jumps pass through anyway) */
  clear: boolean;
}

/**
 * Launch velocity for a jump from (x0, y0) to (x1, y1). Planned jumps fly straight through
 * text and objects and land exactly on the target, so any spot within jump range is
 * reachable; `clear` only tells whether the flight would look clean.
 */
export function ballistic(
  w: World,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  check: boolean,
  /** launch speed fixed by a spring instead of chosen to fit the target */
  fixedV?: number,
): Arc | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  if (check && (Math.abs(dx) > MAX_JUMP_DX || dy < -MAX_JUMP_UP || dy > MAX_JUMP_DOWN)) return null;
  if (fixedV !== undefined && fixedV * fixedV + 2 * G * dy < 0) return null; // too high for this bounce
  const h = fixedV !== undefined ? (fixedV * fixedV) / (2 * G) : y0 - Math.min(y0, y1) + 18;
  const vy = fixedV !== undefined ? -fixedV : -Math.sqrt(2 * G * h);
  const t = (-vy + Math.sqrt(vy * vy + 2 * G * dy)) / G;
  const vx = dx / t;
  if (check && Math.abs(vx) > MAX_JUMP_VX) return null;
  let clear = true;
  if (check) {
    for (let k = 1; k < 8 && clear; k++) {
      const tt = (t * k) / 8;
      const px = x0 + vx * tt;
      const py = y0 + vy * tt + 0.5 * G * tt * tt;
      if (hard(w, px, py - 2) || hard(w, px, py - FH / 2) || hard(w, px, py - FH)) clear = false;
    }
  }
  return { vx, vy, t, clear };
}

export function jumpsFrom(w: World, nav: Nav, nd: NavNode): Link[] {
  if (nd.jumps) return nd.jumps;
  if (!nd.launch) return (nd.jumps = []);
  // a couple of candidates per surface, nearest first
  const best = new Map<number, { m: NavNode; d: number }[]>();
  const bx0 = Math.floor(nd.x / BUCKET);
  const by0 = Math.floor(nd.y / BUCKET);
  const rx = Math.ceil(MAX_JUMP_DX / BUCKET);
  for (let i = -rx; i <= rx; i++) {
    for (let j = -Math.ceil(MAX_JUMP_UP / BUCKET); j <= Math.ceil(MAX_JUMP_DOWN / BUCKET); j++) {
      for (const m of nav.buckets.get(`${bx0 + i},${by0 + j}`) ?? []) {
        if (m.seg === nd.seg) continue;
        if (Math.abs(m.x - nd.x) > MAX_JUMP_DX) continue;
        const d = Math.hypot(m.x - nd.x, m.y - nd.y);
        const list = best.get(m.seg) ?? [];
        list.push({ m, d });
        best.set(m.seg, list);
      }
    }
  }
  nd.jumps = [];
  // nearest surfaces first, and only a limited number of them
  const lists = [...best.values()].map((l) => l.sort((a, b) => a.d - b.d)).sort((a, b) => a[0].d - b[0].d);
  for (const list of lists.slice(0, MAX_JUMP_TARGETS)) {
    for (const { m, d } of list.slice(0, 2)) {
      if (nd.spring) {
        // from a spring the walker always bounces with the same force; only its sideways speed can vary
        const arc = ballistic(w, nd.x, nd.y, m.x, m.y, true, SPRING_V);
        if (!arc) continue;
        nd.jumps.push({ to: m, type: "spring", cost: 0.3 + d / 400 + (arc.clear ? 0 : 2) });
        break;
      }
      const arc = ballistic(w, nd.x, nd.y, m.x, m.y, true);
      if (!arc) continue;
      const climb = Math.max(0, nd.y - m.y - EASY_JUMP_UP);
      // flying through a block is allowed but looks odd, so it costs extra
      nd.jumps.push({ to: m, type: "jump", cost: 0.5 + d / 300 + climb / 30 + (arc.clear ? 0 : 2) });
      break;
    }
  }
  return nd.jumps;
}

export interface Path {
  steps: Link[];
  /** true when the goal was unreachable and the path ends at the closest reachable node */
  partial: boolean;
}

/** Dijkstra over walk/jump/ladder/pipe links, cost in rough seconds. */
export function findPath(w: World, nav: Nav, start: NavNode, goal: NavNode, maxExpanded = 8000): Path {
  const dist = new Float64Array(nav.nodes.length).fill(Infinity);
  const prev: ({ from: number; e: Link } | undefined)[] = new Array(nav.nodes.length);
  const heap: [number, number][] = [[0, start.i]];
  dist[start.i] = 0;
  const push = (e: [number, number]) => {
    heap.push(e);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  let expanded = 0;
  while (heap.length && expanded < maxExpanded) {
    const [d, i] = pop();
    if (d > dist[i]) continue;
    if (i === goal.i) break;
    expanded++;
    const nd = nav.nodes[i];
    for (const e of nd.links.concat(jumpsFrom(w, nav, nd))) {
      const nd2 = d + e.cost;
      if (nd2 < dist[e.to.i]) {
        dist[e.to.i] = nd2;
        prev[e.to.i] = { from: i, e };
        push([nd2, e.to.i]);
      }
    }
  }
  let end = goal.i;
  let partial = false;
  if (dist[goal.i] === Infinity) {
    // unreachable: head for the reachable node closest to the goal instead
    partial = true;
    end = start.i;
    let bd = Math.hypot(start.x - goal.x, start.y - goal.y);
    for (let i = 0; i < nav.nodes.length; i++) {
      if (dist[i] === Infinity) continue;
      const d = Math.hypot(nav.nodes[i].x - goal.x, nav.nodes[i].y - goal.y);
      if (d < bd) {
        bd = d;
        end = i;
      }
    }
  }
  const steps: Link[] = [];
  for (let i = end; i !== start.i; i = prev[i]!.from) steps.unshift(prev[i]!.e);
  return { steps, partial };
}

