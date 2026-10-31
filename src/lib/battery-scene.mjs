// 电池实景示意：按真实安装方式画出电池架 / 电池柜（SVG 字符串，网页和测试共用）
// 参考的真实做法：
// · 铅酸 VRLA：钢制多层电池架，从下往上装（重心低），每块电池两侧留 ≥ 10 mm 通风，层间留出检修空间；
//   同层电池用连接条串联，层与层之间用跨层电缆，最后接到电池开关箱（DC 断路器 / 熔断器）再到 UPS。
// · 锂电 LFP：高压电池柜，一柜 10 个 51.2 V 电池模块串联 = 512 V，顶部是主控箱（BMS 主控、高压开关、触摸屏），
//   柜子一字排开并柜，通常放在 UPS 旁边（如 600 × 1100 × 2000 mm、一柜 10 × 51.2 V 100 Ah 的数据中心锂电柜）。
// 尺寸都是估算值，最终以报价方案为准。

// 常见 12 V VRLA 外形尺寸（长 × 宽 × 高，mm），按 Ah 取最接近的一档
const BLOCK = [
  [7, 151, 65, 94], [9, 151, 65, 94], [12, 151, 98, 95], [17, 181, 77, 167], [24, 166, 175, 125], [26, 166, 175, 125],
  [33, 197, 130, 160], [38, 197, 165, 170], [40, 197, 165, 170], [45, 229, 138, 208], [50, 229, 138, 208], [55, 229, 138, 208],
  [65, 350, 167, 179], [70, 260, 168, 208], [80, 260, 168, 208], [90, 307, 169, 212], [100, 330, 171, 215], [120, 410, 177, 225],
  [134, 340, 173, 280], [150, 483, 170, 240], [160, 532, 206, 216], [180, 532, 206, 216], [200, 522, 240, 219],
];
export function blockDims(ah) {
  const b = BLOCK.find((x) => x[0] >= ah) || BLOCK[BLOCK.length - 1];
  return { L: b[1], W: b[2], H: b[3] };
}

// 一串 40 节怎么上架：小电池多层，大电池（≥ 150 Ah，单块 45–60 kg）只放 2 层；每层最多 10 块，放不下就分成多个架子
export function vrlaLayout(ah, blocksPerString = 40) {
  const d = blockDims(ah);
  const tiers = ah >= 150 ? 2 : ah >= 100 ? 4 : 5;
  const perTierString = Math.ceil(blocksPerString / tiers);
  const racks = Math.ceil(perTierString / 10);
  const perTier = Math.ceil(perTierString / racks);
  const len = Math.round(perTier * (d.W + 12) + 80);
  const depth = d.L + 80;
  const height = Math.round(tiers * (d.H + 160) + 120);
  return { ...d, blocks: blocksPerString, tiers, perTier, racks, len, depth, height, area: (len / 1000) * ((depth + 800) / 1000) }; // 面积含 0.8 m 检修通道
}

// 锂电柜外形（≈），模块越大柜子越高
export function lfpCabinet(ah) {
  if (ah <= 100) return { w: 600, d: 1100, h: 2000 };
  if (ah <= 200) return { w: 600, d: 1100, h: 2200 };
  return { w: 650, d: 1100, h: 2300 };
}

const f1 = (x) => Math.round(x * 10) / 10;

// —— 铅酸：电池架 ——
function rackSvg(L, x0, y0, k, rackNo, blocksHere, ah, delay0, breaker) {
  const bw = L.W * k, bh = L.H * k, gap = 12 * k, post = 34 * k, beam = 26 * k, pitch = (L.H + 160) * k;
  const dx = L.depth * k * 0.22, dy = -L.depth * k * 0.14; // 斜二测：往右上方退
  const W = L.perTier * (bw + gap) + gap + post * 2;
  const H = L.tiers * pitch + beam;
  let s = '';
  // 背面立柱
  s += `<rect x="${x0 + dx}" y="${y0 - H + dy}" width="${post}" height="${H}" class="post back"/><rect x="${x0 + W - post + dx}" y="${y0 - H + dy}" width="${post}" height="${H}" class="post back"/>`;
  let n = 0;
  for (let t = 0; t < L.tiers; t++) {
    const yb = y0 - t * pitch; // 这一层层板的上表面（前沿）
    // 层板：顶面 + 前沿
    s += `<polygon class="shelf-top" points="${x0},${yb} ${x0 + W},${yb} ${x0 + W + dx},${yb + dy} ${x0 + dx},${yb + dy}"/>`;
    s += `<rect class="shelf" x="${x0}" y="${yb}" width="${W}" height="${beam}"/>`;
    for (let i = 0; i < L.perTier && n < blocksHere; i++, n++) {
      const bx = x0 + post + gap + i * (bw + gap), by = yb - bh;
      const ddx = dx * 0.85, ddy = dy * 0.85;
      const d = delay0 + (t * L.perTier + i) * 22;
      s += `<g class="blk" style="--d:${d}ms">`;
      s += `<polygon class="b-side" points="${bx + bw},${by} ${bx + bw + ddx},${by + ddy} ${bx + bw + ddx},${yb + ddy} ${bx + bw},${yb}"/>`;
      s += `<polygon class="b-top" points="${bx},${by} ${bx + bw},${by} ${bx + bw + ddx},${by + ddy} ${bx + ddx},${by + ddy}"/>`;
      s += `<rect class="b-face" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${2 * k * 4}"/>`;
      s += `<rect class="b-band" x="${bx}" y="${by}" width="${bw}" height="${bh * 0.16}"/>`;
      s += `<rect class="b-label" x="${bx + bw * 0.14}" y="${by + bh * 0.36}" width="${bw * 0.72}" height="${bh * 0.34}" rx="${3 * k * 4}"/>`;
      if (bw > 22) s += `<text class="b-txt" x="${bx + bw / 2}" y="${by + bh * 0.58}" font-size="${Math.min(bw * 0.24, 15)}">${ah}Ah</text>`;
      // 端子：正极红、负极黑，放在顶面靠前
      const ty = by + ddy * 0.35, tr = Math.max(1.6, bw * 0.08);
      s += `<circle class="t-pos" cx="${bx + bw * 0.24 + ddx * 0.35}" cy="${ty}" r="${tr}"/><circle class="t-neg" cx="${bx + bw * 0.76 + ddx * 0.35}" cy="${ty}" r="${tr}"/>`;
      // 和下一块之间的连接条
      if (i < L.perTier - 1 && n < blocksHere - 1) s += `<line class="link" x1="${bx + bw * 0.76 + ddx * 0.35}" y1="${ty}" x2="${bx + bw + gap + bw * 0.24 + ddx * 0.35}" y2="${ty}"/>`;
      s += '</g>';
    }
    // 跨层电缆（左右交替，走在立柱内侧）
    if (t < L.tiers - 1) {
      const right = t % 2 === 0, cx = right ? x0 + W - post - gap * 0.5 : x0 + post + gap * 0.5;
      s += `<path class="cable" d="M${cx} ${yb - bh * 0.9} C ${cx + (right ? 10 : -10)} ${yb - pitch * 0.6}, ${cx + (right ? 10 : -10)} ${yb - pitch * 1.1}, ${cx} ${yb - pitch - bh * 0.9}"/>`;
    }
  }
  // 顶层上面的盖板
  const yt = y0 - L.tiers * pitch;
  s += `<polygon class="shelf-top" points="${x0},${yt} ${x0 + W},${yt} ${x0 + W + dx},${yt + dy} ${x0 + dx},${yt + dy}"/><rect class="shelf" x="${x0}" y="${yt}" width="${W}" height="${beam}"/>`;
  // 正面立柱（带绝缘护套的颜色）
  s += `<rect x="${x0}" y="${yt}" width="${post}" height="${H}" class="post"/><rect x="${x0 + W - post}" y="${yt}" width="${post}" height="${H}" class="post"/>`;
  // 电池开关箱（每串一个，装在这串第一个架子的侧面）
  if (breaker) {
    const bxw = 150 * k * 1.4, bxh = 220 * k * 1.4, bx = x0 + W + 40 * k, by = yt + 20 * k;
    s += `<g class="brk"><rect class="brk-box" x="${bx}" y="${by}" width="${bxw}" height="${bxh}" rx="${4 * k * 4}"/>`;
    s += `<rect class="brk-win" x="${bx + bxw * 0.25}" y="${by + bxh * 0.2}" width="${bxw * 0.5}" height="${bxh * 0.34}" rx="2"/>`;
    s += `<rect class="brk-h" x="${bx + bxw * 0.42}" y="${by + bxh * 0.26}" width="${bxw * 0.16}" height="${bxh * 0.14}" rx="1"/>`;
    s += `<text class="brk-t" x="${bx + bxw / 2}" y="${by + bxh * 0.8}" font-size="${Math.max(7, bxw * 0.2)}">DC</text></g>`;
  }
  // 架号
  s += `<text class="rk-no" x="${x0 + W / 2}" y="${y0 + beam + 30}" font-size="22">${rackNo}</text>`;
  return { svg: s, W: W + (breaker ? 260 * k : 0) + dx, H: H - dy };
}

export function sceneVrla(b, L, opt = {}) {
  const strings = b.strings, totalRacks = strings * L.racks;
  const show = Math.min(totalRacks, 4);
  const cols = show <= 2 ? show : 2, rows = Math.ceil(show / cols);
  const k = 0.25; // px / mm（之后由 viewBox 缩放）
  // 先量一个架子的大小
  const probe = rackSvg(L, 0, 0, k, '', L.perTier * L.tiers, b.ah, 0, true);
  const cw = probe.W + 60, ch = probe.H + 70;
  const VW = cols * cw + 120, VH = rows * ch + 40;
  let body = '', idx = 0;
  // 地面
  body += `<defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1a12"/><stop offset="1" stop-color="#0b0b07"/></linearGradient>
    <pattern id="tile" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(250,204,21,.07)" stroke-width="1"/></pattern></defs>`;
  body += `<rect x="0" y="0" width="${VW}" height="${VH}" fill="url(#tile)"/>`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && idx < show; c++, idx++) {
      const sNo = Math.floor(idx / L.racks) + 1, rNo = (idx % L.racks) + 1;
      const label = L.racks > 1 ? `S${sNo}-${rNo}` : `S${sNo}`;
      const x0 = 20 + c * cw, y0 = 20 + r * ch + probe.H - 20;
      const isLastRack = rNo === L.racks;
      const inThis = Math.min(L.perTier * L.tiers, (L.blocks || 40) - (rNo - 1) * L.perTier * L.tiers);
      body += `<ellipse class="shadow" cx="${x0 + probe.W / 2}" cy="${y0 + 18}" rx="${probe.W * 0.55}" ry="14"/>`;
      body += rackSvg(L, x0, y0, k, label, inThis, b.ah, idx * 220, rNo === 1).svg;
      // 到 UPS 的直流电缆（从开关箱出来，走地面）
      if (rNo === 1) body += `<path class="dc" d="M${x0 + probe.W - 40} ${y0 - probe.H + 90} V ${y0 + 10} H ${VW - 10}"/>`;
      void isLastRack;
    }
  }
  body += `<text class="to-ups" x="${VW - 14}" y="${VH - 14}" font-size="24">→ UPS</text>`;
  const more = totalRacks > show ? `<div class="scene-more">+${totalRacks - show}</div>` : '';
  const sets = opt.sets > 1 ? `<div class="scene-sets">× ${opt.sets}</div>` : '';
  return `<div class="scene vr"><svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="battery racks">${body}</svg>${more}${sets}</div>`;
}

// —— 锂电：高压电池柜 ——
function cabinetSvg(x0, y0, k, C, ah, no, delay0) {
  const W = C.w * k, H = C.h * k, dx = C.d * k * 0.16, dy = -C.d * k * 0.1;
  const top = 360 * k, plinth = 110 * k, pad = 34 * k;
  const modH = (H - top - plinth - pad * 2) / 10;
  let s = '';
  s += `<polygon class="c-side" points="${x0 + W},${y0 - H} ${x0 + W + dx},${y0 - H + dy} ${x0 + W + dx},${y0 + dy} ${x0 + W},${y0}"/>`;
  s += `<polygon class="c-top" points="${x0},${y0 - H} ${x0 + W},${y0 - H} ${x0 + W + dx},${y0 - H + dy} ${x0 + dx},${y0 - H + dy}"/>`;
  s += `<rect class="c-face" x="${x0}" y="${y0 - H}" width="${W}" height="${H}" rx="${6 * k * 3}"/>`;
  // 顶部主控箱：触摸屏 + 高压开关 + 指示灯
  const ty = y0 - H + pad;
  s += `<rect class="c-ctl" x="${x0 + pad}" y="${ty}" width="${W - pad * 2}" height="${top - pad}" rx="${4 * k * 3}"/>`;
  const sw = (W - pad * 2) * 0.5, sh = (top - pad) * 0.62;
  s += `<rect class="c-scr" x="${x0 + pad * 2}" y="${ty + (top - pad - sh) / 2}" width="${sw}" height="${sh}" rx="3"/>`;
  s += `<text class="c-soc" x="${x0 + pad * 2 + sw / 2}" y="${ty + (top - pad) / 2 + 2}" font-size="${sh * 0.3}">SOC 100%</text>`;
  s += `<rect class="c-socbar" x="${x0 + pad * 2 + sw * 0.12}" y="${ty + (top - pad) / 2 + sh * 0.14}" width="${sw * 0.76}" height="${sh * 0.1}" rx="2"/>`;
  const hx = x0 + pad * 2 + sw + pad * 0.8, hw = (W - pad * 4 - sw) * 0.62;
  s += `<rect class="c-brk" x="${hx}" y="${ty + (top - pad) * 0.2}" width="${hw}" height="${(top - pad) * 0.6}" rx="3"/><rect class="c-brkh" x="${hx + hw * 0.32}" y="${ty + (top - pad) * 0.28}" width="${hw * 0.36}" height="${(top - pad) * 0.22}" rx="2"/>`;
  s += `<circle class="led ok" cx="${x0 + W - pad * 1.6}" cy="${ty + (top - pad) * 0.3}" r="${Math.max(1.6, 9 * k)}"/><circle class="led run" cx="${x0 + W - pad * 1.6}" cy="${ty + (top - pad) * 0.55}" r="${Math.max(1.6, 9 * k)}"/>`;
  // 10 个电池模块
  for (let i = 0; i < 10; i++) {
    const my = ty + top + i * modH, d = delay0 + i * 45;
    s += `<g class="mod" style="--d:${d}ms"><rect class="m-face" x="${x0 + pad}" y="${my}" width="${W - pad * 2}" height="${modH - 6 * k}" rx="${3 * k * 3}"/>`;
    s += `<rect class="m-hdl" x="${x0 + pad * 1.4}" y="${my + modH * 0.25}" width="${10 * k * 3}" height="${modH * 0.42}" rx="2"/><rect class="m-hdl" x="${x0 + W - pad * 1.4 - 10 * k * 3}" y="${my + modH * 0.25}" width="${10 * k * 3}" height="${modH * 0.42}" rx="2"/>`;
    s += `<rect class="m-strip" x="${x0 + pad * 1.4 + 40 * k}" y="${my + modH * 0.36}" width="${W * 0.16}" height="${Math.max(1.5, modH * 0.14)}" rx="1"/>`;
    if (modH > 9) s += `<text class="m-txt" x="${x0 + W * 0.62}" y="${my + modH * 0.62}" font-size="${Math.min(modH * 0.36, 8)}">51.2V ${ah}Ah</text>`;
    s += '</g>';
  }
  // 底座通风口
  const py = y0 - plinth;
  for (let i = 0; i < 6; i++) s += `<rect class="vent" x="${x0 + pad + i * (W - pad * 2) / 6 + 4}" y="${py + plinth * 0.3}" width="${(W - pad * 2) / 6 - 8}" height="${plinth * 0.4}" rx="1"/>`;
  // 玻璃门反光
  s += `<polygon class="glass" points="${x0 + W * 0.3},${y0 - H} ${x0 + W * 0.56},${y0 - H} ${x0 + W * 0.18},${y0} ${x0},${y0} ${x0},${y0 - H * 0.45}"/>`;
  s += `<text class="rk-no" x="${x0 + W / 2}" y="${y0 + 30}" font-size="13">C${no}</text>`;
  return { svg: s, W: W + dx, H: H - dy };
}

export function sceneLfp(b, opt = {}) {
  const C = lfpCabinet(b.ah), k = 0.11;
  const show = Math.min(b.clusters, 6);
  const probe = cabinetSvg(0, 0, k, C, b.ah, 1, 0);
  const W = probe.W - C.d * k * 0.16; // 并柜时只算正面宽度
  const VW = show * (W + 4) + C.d * k * 0.16 + 150, VH = probe.H + 70;
  let body = `<defs><pattern id="tile2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(94,240,160,.07)" stroke-width="1"/></pattern></defs><rect width="${VW}" height="${VH}" fill="url(#tile2)"/>`;
  const y0 = probe.H + 20;
  body += `<ellipse class="shadow" cx="${20 + show * (W + 4) / 2}" cy="${y0 + 14}" rx="${show * (W + 4) * 0.6}" ry="14"/>`;
  // 从右往左画，左边的柜子侧面被右边挡住
  for (let i = show - 1; i >= 0; i--) body += cabinetSvg(20 + i * (W + 4), y0, k, C, b.ah, i + 1, i * 160).svg;
  body += `<path class="dc" d="M${20 + show * (W + 4) + C.d * k * 0.16 - 10} ${y0 - 30} H ${VW - 10}"/><text class="to-ups" x="${VW - 14}" y="${y0 - 40}" font-size="14">→ UPS</text>`;
  const more = b.clusters > show ? `<div class="scene-more">+${b.clusters - show}</div>` : '';
  const sets = opt.sets > 1 ? `<div class="scene-sets">× ${opt.sets}</div>` : '';
  return `<div class="scene li"><svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="lithium battery cabinets">${body}</svg>${more}${sets}</div>`;
}

export const fmtArea = (x) => f1(x);
