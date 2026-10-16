// 电源插头：正面示意图（下单面板和定制页共用）
const sq = '<rect x="4" y="4" width="40" height="40" rx="7" fill="#f3f5f4" stroke="#5d6b68" stroke-width="1.5"/>';
const rd = '<circle cx="24" cy="24" r="20" fill="#f3f5f4" stroke="#5d6b68" stroke-width="1.5"/>';
const P = 'fill="#15211f"', F = 'fill="#15211f" opacity=".3"';
const face = (shape, pins) => `<svg viewBox="0 0 48 48" aria-hidden="true">${shape}${pins}</svg>`;
export const PLUG_ICON = {
  US: face(sq, `<rect x="14" y="11" width="4" height="15" rx="1" ${P}/><rect x="30" y="11" width="4" height="15" rx="1" ${P}/><circle cx="24" cy="34" r="3.5" ${F}/>`),
  EU: face(rd, `<circle cx="15" cy="24" r="3.5" ${P}/><circle cx="33" cy="24" r="3.5" ${P}/><rect x="22" y="5" width="4" height="5" rx="1" ${F}/><rect x="22" y="38" width="4" height="5" rx="1" ${F}/>`),
  UK: face(sq, `<rect x="21.5" y="9" width="5" height="12" rx="1" ${P}/><rect x="10" y="29" width="11" height="5" rx="1" ${P}/><rect x="27" y="29" width="11" height="5" rx="1" ${P}/>`),
  AU: face(sq, `<rect x="13" y="12" width="3.5" height="13" rx="1" transform="rotate(-30 14.75 18.5)" ${P}/><rect x="31.5" y="12" width="3.5" height="13" rx="1" transform="rotate(30 33.25 18.5)" ${P}/><rect x="22.25" y="28" width="3.5" height="11" rx="1" ${F}/>`),
  IN: face(rd, `<circle cx="24" cy="14" r="5" ${P}/><circle cx="15" cy="30" r="3.5" ${P}/><circle cx="33" cy="30" r="3.5" ${P}/>`),
  OT: face('<rect x="4" y="4" width="40" height="40" rx="7" fill="#f3f5f4" stroke="#5d6b68" stroke-width="1.5" stroke-dasharray="4 3"/>', `<text x="24" y="31" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="600" ${P}>?</text>`),
};
// [代码, 显示名, 插头型号]
export const PLUGS = [['US', 'US', 'A/B'], ['EU', 'EU', 'C/F'], ['UK', 'UK', 'G'], ['AU', 'AU', 'I'], ['IN', 'India', 'D'], ['OT', '', '']];
