// 铅酸电池柜（C-1 … C-40）：型号 → 参数；电池组 → 配几个什么柜子（"配电池联动"的核心）。
// 规则：一个柜子 = 一串 12V 电池（C-n 放 n 节，直流 12×n V）。电池容量 ≤ maxAh 才放得下（C-1…C-32 ≤ 120 Ah，C-40 ≤ 100 Ah；≥150 Ah 都放不下）。
// 一串电池正好 = 某个柜子的节数 → 每串一个柜；没有正好的 → 选空位最少的柜子；一串超过 40 节 → 拆到几个同型号柜子里。
// 给别的页面用：cabFor({ n, ah, strings })；12V 电池产品页 / 12V 栏目选型结果可以直接调它显示"配 X 个 C-xx 电池柜"。
// 测试：node scripts/test-cab-engine.mjs
import { CAB_SPECS } from './cab-specs.mjs';

export const CAB_LIST = Object.values(CAB_SPECS).sort((a, b) => a.n - b.n);
export const CAB_MAX_AH = Math.max(...CAB_LIST.map((c) => c.maxAh));
// CRM 里的写法：C-16、C16、C-16电池柜、C-16 (192V) 都认
export const cabKey = (m) => {
  const x = String(m || '').normalize('NFKC').toUpperCase().match(/^\s*C\s*-?\s*(\d{1,2})(?=$|[\s(（\u4e00-\u9fff])/);
  return x ? `C-${+x[1]}` : '';
};
export const cabSpec = (p) => CAB_SPECS[cabKey(p && p.model)] || null;
export const isCabModel = (p) => !!cabSpec(p);

// n：一串电池节数（= 直流电压 ÷ 12）；ah：单节容量；strings：几串
// 返回 { best: { cab, perString, qty, empty }, alts: [...] } 或 { none: 'ah' | 'n' }
export function cabFor({ n, ah = 0, strings = 1 }) {
  n = Math.round(+n || 0); ah = +ah || 0; strings = Math.max(1, Math.round(+strings || 1));
  if (n <= 0) return { none: 'n' };
  const pool = CAB_LIST.filter((c) => !ah || ah <= c.maxAh);
  if (!pool.length) return { none: 'ah' };
  const opts = pool.map((c) => {
    const k = Math.ceil(n / c.n); // 一串要几个柜子
    return { cab: c, perString: k, qty: k * strings, empty: k * c.n - n };
  }).filter((o) => o.perString <= 4);
  if (!opts.length) return { none: 'n' };
  // 柜子数少优先，其次空位少，再其次柜子小
  opts.sort((a, b) => a.qty - b.qty || a.empty - b.empty || a.cab.n - b.cab.n);
  const best = opts[0];
  const alts = opts.filter((o) => o !== best && o.perString <= Math.max(2, best.perString) && o.empty <= Math.max(2, best.empty)).slice(0, 2);
  return { best, alts };
}

// 某个容量的 12V 电池能放进哪些柜（12V 电池产品页"适配电池柜"用）
export const cabsForAh = (ah) => CAB_LIST.filter((c) => (+ah || 0) <= c.maxAh);
