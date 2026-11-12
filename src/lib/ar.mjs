// 阿拉伯语：所有"三语对照"对象（{ en, es, ru } 或 { en: {...}, es: {...}, ru: {...} }）在模块末尾调用 addAr()，
// 按英文生成 ar：英文原文 → 查 ar-dict.mjs 里的译文；查不到的保持英文（构建时 AR_MISS=1 会把缺的列出来，方便补译）。
// 这样各个文案文件不用逐个加 ar，英文改了而译文没更新时也只是暂时显示英文，不会出错。
import { AR } from './ar-dict.mjs';

// 缺译文的英文句子（scripts/ar-miss.mjs 读取后列出来）
const miss = (globalThis.__arMiss = globalThis.__arMiss || new Set());
// 构建时 AR_MISS=1：退出时把缺译文的英文写到 /tmp/ar-miss.json
const P = globalThis.process;
if (P && P.env && P.env.AR_MISS && P.getBuiltinModule && !globalThis.__arMissHook) {
  globalThis.__arMissHook = true;
  P.on('exit', () => { try { P.getBuiltinModule('fs').writeFileSync('/tmp/ar-miss.json', JSON.stringify([...miss], null, 1)); } catch {} });
}
const LANG_KEYS = new Set(['en', 'es', 'ru', 'ar']);
const isPlain = (o) => o && typeof o === 'object' && (Object.getPrototypeOf(o) === Object.prototype || Array.isArray(o));

export function trAr(v) {
  if (typeof v === 'string') {
    if (!v.trim() || !/[A-Za-z]/.test(v)) return v; // 纯数字、符号、单位不翻译
    const t = AR[v];
    if (t !== undefined) return t;
    miss.add(v);
    return v;
  }
  if (Array.isArray(v)) return v.map(trAr);
  if (isPlain(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, trAr(x)]));
  return v; // 函数等：保持英文版本
}

export function addAr(o, seen = new Set()) {
  if (!isPlain(o) || seen.has(o)) return o;
  seen.add(o);
  if (!Array.isArray(o) && 'en' in o && !('ar' in o) && ('es' in o || 'ru' in o)) {
    try { o.ar = trAr(o.en); } catch { /* 冻结的对象：跳过 */ }
  }
  for (const [k, v] of Object.entries(o)) if (!LANG_KEYS.has(k)) addAr(v, seen);
  return o;
}
