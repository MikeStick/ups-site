// 动环监控主机 SK-DEM：型号识别 + 监控点规划。
// 接口来自产品前面板：8 × COM（RS485/RS232）、8 × DI（D1–D8）、6 × AI（A1–A6）、2 × IR、2 × BUS、2 × WG（韦根）、2 × ETH。
// 规划规则（建议接法，最终以项目接线图为准）：
//   同一类 RS485 设备（UPS、空调、配电柜、PDU、电池监测、温湿度）按地址并在同一个 COM 口上，一类占一个 COM；
//   烟感、漏水、门磁每个占一路 DI；红外每个占一路 IR；门禁读卡器每门占一路 WG；摄像头经 NVR / 交换机走 ETH，不占采集口。
// 测试：node scripts/test-dem-engine.mjs
export const DEM_PORTS = { com: 8, di: 8, ai: 6, ir: 2, wg: 2, eth: 2 };
export const isDemModel = (p) => /^SK-?DEM\b/i.test(String((p && p.model) || '').normalize('NFKC').trim());

// 设备类型 → 占用的接口
export const DEM_DEVICES = [
  { k: 'ups', port: 'com', bus: true }, { k: 'ac', port: 'com', bus: true }, { k: 'pdc', port: 'com', bus: true }, { k: 'pdu', port: 'com', bus: true },
  { k: 'batt', port: 'com', bus: true }, { k: 'th', port: 'com', bus: true },
  { k: 'smoke', port: 'di' }, { k: 'leak', port: 'di' }, { k: 'door', port: 'di' },
  { k: 'ir', port: 'ir' }, { k: 'reader', port: 'wg' }, { k: 'cam', port: 'eth', nvr: true },
];

// qty: { ups: 2, smoke: 3, … } → { units, used: { com, di, ir, wg }, lines: [{ k, n, port }], nvr }
export function demPlan(qty) {
  const used = { com: 0, di: 0, ir: 0, wg: 0 };
  const lines = [];
  let nvr = false;
  for (const d of DEM_DEVICES) {
    const n = Math.max(0, Math.round(+qty[d.k] || 0));
    if (!n) continue;
    if (d.port === 'eth') { nvr = true; lines.push({ k: d.k, n, port: 'eth', ports: 0 }); continue; }
    const ports = d.bus ? 1 : n;
    used[d.port] += ports;
    lines.push({ k: d.k, n, port: d.port, ports });
  }
  const units = Math.max(1, ...['com', 'di', 'ir', 'wg'].map((p) => Math.ceil(used[p] / DEM_PORTS[p])));
  return { units, used, cap: Object.fromEntries(['com', 'di', 'ir', 'wg'].map((p) => [p, DEM_PORTS[p] * units])), lines, nvr };
}
