// 离线式 UPS 的输出插座：6 种标准，每台最多 10 个（工厂出厂装好）
const F = 'fill="#f3f5f4" stroke="#5d6b68" stroke-width="2"', P = 'fill="#15211f"';
const sq = `<rect x="4" y="4" width="48" height="48" rx="9" ${F}/>`;
const svg = (inner) => `<svg viewBox="0 0 56 56" aria-hidden="true">${inner}</svg>`;
export const SOCKET_ICON = {
  SCHUKO: svg(`<circle cx="28" cy="28" r="24" ${F}/><circle cx="19" cy="28" r="3.5" ${P}/><circle cx="37" cy="28" r="3.5" ${P}/><rect x="25" y="5" width="6" height="6" rx="1" fill="#9aa5a2"/><rect x="25" y="45" width="6" height="6" rx="1" fill="#9aa5a2"/>`),
  NEMA: svg(`${sq}<rect x="15" y="16" width="4" height="15" rx="1" ${P}/><rect x="37" y="16" width="4" height="15" rx="1" ${P}/><path d="M24 40a4 4 0 018 0v3h-8z" ${P}/>`),
  UK: svg(`${sq}<rect x="25" y="11" width="6" height="13" rx="1" ${P}/><rect x="12" y="32" width="12" height="6" rx="1" ${P}/><rect x="32" y="32" width="12" height="6" rx="1" ${P}/>`),
  UNIVERSAL: svg(`${sq}<circle cx="28" cy="28" r="18" fill="none" stroke="#5d6b68" stroke-width="1.5"/><rect x="16" y="22" width="9" height="3" rx="1" ${P}/><rect x="31" y="22" width="9" height="3" rx="1" ${P}/><circle cx="20" cy="33" r="2.5" ${P}/><circle cx="36" cy="33" r="2.5" ${P}/><rect x="26" y="34" width="4" height="7" rx="1" ${P}/>`),
  IEC: svg(`${sq}<path d="M14 16h28v18l-6 7H20l-6-7z" fill="none" stroke="#15211f" stroke-width="2.5"/><rect x="19" y="24" width="3" height="8" ${P}/><rect x="34" y="24" width="3" height="8" ${P}/><rect x="26.5" y="20" width="3" height="7" ${P}/>`),
  AU: svg(`${sq}<rect x="15" y="15" width="4" height="13" rx="1" ${P} transform="rotate(-30 17 21)"/><rect x="37" y="15" width="4" height="13" rx="1" ${P} transform="rotate(30 39 21)"/><rect x="26" y="32" width="4" height="11" rx="1" ${P}/>`),
};
export const SOCKET_IDS = ['SCHUKO', 'NEMA', 'UK', 'UNIVERSAL', 'IEC', 'AU'];
export const SOCKET_MAX = 10;
export const SOCKET_NAME = { SCHUKO: 'Schuko', NEMA: 'NEMA 5-15', UK: 'UK BS1363', UNIVERSAL: 'Universal', IEC: 'IEC C13', AU: 'Type I (AU/CN)' };
export const SOCKET_WHERE = {
  en: { SCHUKO: 'Europe, Russia, CIS', NEMA: 'Americas incl. Venezuela', UK: 'UK, Gulf, Nigeria, Malaysia', UNIVERSAL: 'Multi-standard markets', IEC: 'Servers, racks, IT gear', AU: 'Australia, Argentina, China' },
  es: { SCHUKO: 'Europa, Rusia, CEI', NEMA: 'América, incl. Venezuela', UK: 'Reino Unido, Golfo, Nigeria', UNIVERSAL: 'Mercados multiestándar', IEC: 'Servidores, racks, TI', AU: 'Australia, Argentina, China' },
  ru: { SCHUKO: 'Европа, Россия, СНГ', NEMA: 'Америка, вкл. Венесуэлу', UK: 'Великобритания, Персидский залив', UNIVERSAL: 'Мультистандартные рынки', IEC: 'Серверы, стойки, ИТ', AU: 'Австралия, Аргентина, Китай' },
};
export const socketsText = (list) => (Array.isArray(list) ? list : []).filter((s) => SOCKET_NAME[s.type] && s.count > 0).map((s) => `${s.count} × ${SOCKET_NAME[s.type]}`).join(' + ');
