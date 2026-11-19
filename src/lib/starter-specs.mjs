// 启动电池（汽车 / 卡车 / 驻车空调 EFB）：型号参数（由规格书抄录）。栏目 /batteries/starter/，产品页参数表也查这里。
// g：car 乘用车 / truck 商用车 / efb 驻车空调两用；std：JIS / DIN / N / EFB；rc：储备容量（25A，分钟）；ah：20HR 额定容量（规格书只给其一）
// cca：冷启动电流（-18°C）；L/W/H 毫米（含端子总高）；kg 约重；ter 端子类型 1 锥形柱 Ø19.5/17.9、3 细锥形柱 Ø14.7/13.0、4 L 形螺栓端子；pol 端子布局；fix 固定方式；han 提手
export const STARTER_LIST = [
  {"m": "38B20L","g": "car","std": "JIS","rc": 50,"ah": null,"cca": 310,"L": 195,"W": 126,"H": 222,"kg": 9.7,"ter": "3","pol": "0","fix": "B0","case": "Black PP","cover": "Black PP","han": "TS1"},{"m": "80D26XL","g": "car","std": "JIS","rc": null,"ah": 70,"cca": 600,"L": 260,"W": 172,"H": 221,"kg": 18,"ter": "1","pol": "0","fix": "B01","case": "Black PP","cover": "Black PP","han": "TS1"},{"m": "57220","g": "car","std": "DIN","rc": null,"ah": 72,"cca": 630,"L": 278,"W": 175,"H": 190,"kg": 18,"ter": "1","pol": "0","fix": "B13","case": "Black PP","cover": "Black PP","han": "TS6"},{"m": "N105","g": "truck","std": "N","rc": 175,"ah": null,"cca": 720,"L": 408,"W": 170,"H": 233.5,"kg": 24.0,"ter": "1","pol": "1","fix": "B0","case": "White PP","cover": "Black PP","han": "TS8"},{"m": "N120","g": "truck","std": "N","rc": 200,"ah": null,"cca": 750,"L": 504,"W": 183.5,"H": 223,"kg": 32.4,"ter": "1","pol": "3","fix": "B0","case": "White PP","cover": "Black PP","han": "TS8"},{"m": "N150","g": "truck","std": "N","rc": 240,"ah": null,"cca": 800,"L": 510,"W": 222,"H": 226.5,"kg": 35.8,"ter": "4","pol": "3","fix": "B0","case": "Black PP","cover": "Black PP","han": "TS8"},{"m": "N180","g": "truck","std": "N","rc": 303,"ah": null,"cca": 900,"L": 510,"W": 222,"H": 217,"kg": 43.5,"ter": "1","pol": "3","fix": "B0","case": "White PP","cover": "Black PP","han": "TS8"},{"m": "N200B","g": "truck","std": "N","rc": null,"ah": 200,"cca": 950,"L": 521,"W": 261,"H": 250,"kg": 51.5,"ter": "4","pol": "3","fix": "B0","case": "White PP","cover": "Black PP","han": "TS8"},{"m": "EFB-225G51R","g": "efb","std": "EFB","rc": 380,"ah": null,"cca": 1050,"L": 510,"W": 222,"H": 217,"kg": 46.0,"ter": "1","pol": "3","fix": "B0","case": "Black PP","cover": "Black PP","han": "TS8"},
];
// CRM 里的写法：38B20L、38B20L (12V)、蓝标 N150、EFB-225G51R 都认
export const starterKey = (m) => {
  const s = String(m || '').normalize('NFKC').toUpperCase().replace(/[（(].*$/, '').replace(/\s+/g, '');
  return (STARTER_LIST.find((x) => s === x.m || s.endsWith(x.m)) || {}).m || '';
};
export const starterSpec = (p) => STARTER_LIST.find((x) => x.m === starterKey(p && p.model)) || null;
export const STARTER_GROUPS = ['car', 'truck', 'efb'];
