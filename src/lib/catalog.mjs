// 网站产品目录：菜单（Base.astro）和首页（index.astro）共用的一份栏目清单。
// 三组：UPS / 光伏与储能 / 电池。每个栏目：key（首页图片位 cat_<key>、文案键）、page（栏目页路径）、名称、筛选产品的函数。
// 以后新增栏目：在对应组里加一行，菜单和首页会同时出现。
import { OT } from './offline-i18n.mjs';
import { RT } from './rack-i18n.mjs';
import { MT } from './modular-i18n.mjs';
import { IT } from './industrial-i18n.mjs';
import { OL } from './online-i18n.mjs';
import { SL } from './solar-i18n.mjs';
import { RB } from './rackbatt-i18n.mjs';
import { WB } from './wallbatt-i18n.mjs';
import { FB } from './floorbatt-i18n.mjs';
import { SD, NAV_GROUPS } from './designer-i18n.mjs';
import { AO } from './aio-i18n.mjs';
import { HV } from './hvcab-i18n.mjs';
import { PB } from './pbr-i18n.mjs';
import { HE } from './ess-i18n.mjs';
import { CI } from './cie-i18n.mjs';
import { CT } from './custom-i18n.mjs';
import { VR } from './vrla-i18n.mjs';
import { V2 } from './vrla2-i18n.mjs';
import {
  isMini, isOffline, isOnline, isAio, isRack, isModular, isIndustrial, isInverter, isHomeEss, isCiEss,
  isWallBattery, isFloorBattery, isRackBattery, isHvCab, isPbReplace, isVrla12, isVrla2,
} from './category.mjs';

export function catalog(lang) {
  const NG = NAV_GROUPS[lang];
  return [
    { key: 'ups', h: NG.ups, items: [
      { key: 'mini', page: 'mini-ups/', label: OT[lang].navMini, f: isMini, unit: 'dc',
        sub: { page: 'custom/', label: CT[lang].title } }, // 菜单里 Mini DC UPS 下面缩进一行：定制 Mini UPS（OEM / ODM）
      { key: 'offline', page: 'offline-ups/', label: OT[lang].nav, f: isOffline, unit: 'va' },
      { key: 'online', page: 'online-ups/', label: OL[lang].nav, f: isOnline, unit: 'va' },
      { key: 'aio', page: 'all-in-one-ups/', label: AO[lang].nav, f: isAio, unit: 'va' },
      { key: 'rack', page: 'rack-ups/', label: RT[lang].nav, f: isRack, unit: 'va' },
      { key: 'modular', page: 'modular-ups/', label: MT[lang].nav, f: isModular, unit: 'va' },
      { key: 'industrial', page: 'industrial-ups/', label: IT[lang].nav, f: isIndustrial, unit: 'va' },
    ] },
    { key: 'solar', h: NG.solar, items: [
      { key: 'inverter', page: 'solar-inverters/', label: SL[lang].nav, f: isInverter, unit: 'kw' },
      { key: 'homeess', page: 'home-ess/', label: HE[lang].nav, f: isHomeEss, unit: 'kwh' },
      { key: 'ciess', page: 'ci-ess/', label: CI[lang].nav, f: isCiEss, unit: 'kwh' },
      { key: 'designer', page: 'solar-designer/', label: SD[lang].nav, tool: true },
    ] },
    { key: 'batt', h: NG.batt, items: [
      { key: 'wall', page: 'batteries/wall-lithium/', label: WB[lang].nav, f: isWallBattery, unit: 'kwh' },
      { key: 'floor', page: 'batteries/floor-lithium/', label: FB[lang].nav, f: isFloorBattery, unit: 'kwh' },
      { key: 'rackbatt', page: 'batteries/rack-lithium/', label: RB[lang].nav, f: isRackBattery, unit: 'kwh' },
      { key: 'hvcab', page: 'batteries/hv-cabinet/', label: HV[lang].nav, f: isHvCab, unit: 'kwh' },
      { key: 'pbr', page: 'batteries/lead-acid-replacement/', label: PB[lang].nav, f: isPbReplace, unit: 'v' },
      { key: 'vrla', page: 'batteries/vrla/', label: VR[lang].nav, f: isVrla12, unit: 'ah' },
      { key: 'vrla2', page: 'batteries/vrla-2v/', label: V2[lang].nav, f: isVrla2, unit: 'ah2' },
    ] },
  ];
}
