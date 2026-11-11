import { LANGS } from '../config.mjs';
import { term } from '../i18n.mjs';
import { typesOf } from './category.mjs';
// 栏目页"已发布型号"上方的搜索 + 筛选条（src/components/CatSearch.astro）的界面文字
export const ST = {
  en: { ph: 'Search model or rating, e.g. {ex}', any: 'Any', sort: 'Sort', sDef: 'Default', sAsc: '{f}: low → high', sDesc: '{f}: high → low',
    n: '{n} models', n1: '1 model', none: 'No model matches. Clear the search or pick another value.', clear: 'Clear' },
  es: { ph: 'Buscar modelo o valor, p. ej. {ex}', any: 'Todos', sort: 'Ordenar', sDef: 'Predeterminado', sAsc: '{f}: menor → mayor', sDesc: '{f}: mayor → menor',
    n: '{n} modelos', n1: '1 modelo', none: 'Ningún modelo coincide. Borre la búsqueda o elija otro valor.', clear: 'Borrar' },
  ru: { ph: 'Модель или параметр, напр. {ex}', any: 'Все', sort: 'Сортировка', sDef: 'По умолчанию', sAsc: '{f}: по возрастанию', sDesc: '{f}: по убыванию',
    n: 'Моделей: {n}', n1: 'Моделей: 1', none: 'Ничего не найдено. Очистите поиск или выберите другое значение.', clear: 'Сбросить' },
};
// 筛选项名称（栏目页共用）
export const SF = {
  en: { cap: 'Capacity', sys: 'System capacity', mod: 'Power module', pw: 'Power', e: 'Energy', ah: 'Capacity', v: 'Voltage', cool: 'Cooling capacity', kw: 'Inverter power', dcv: 'DC voltage', n: 'Batteries' },
  es: { cap: 'Capacidad', sys: 'Capacidad del sistema', mod: 'Módulo de potencia', pw: 'Potencia', e: 'Energía', ah: 'Capacidad', v: 'Voltaje', cool: 'Capacidad de enfriamiento', kw: 'Potencia del inversor', dcv: 'Voltaje CC', n: 'Baterías' },
  ru: { cap: 'Мощность', sys: 'Мощность системы', mod: 'Силовой модуль', pw: 'Мощность', e: 'Энергия', ah: 'Ёмкость', v: 'Напряжение', cool: 'Холодопроизводительность', kw: 'Мощность инвертора', dcv: 'Напряжение DC', n: 'Батарей' },
};

// 每个型号的搜索数据：型号 + 品类名（三种语言），加上筛选用的数值（单位和 facets 里一致）
export function csData(p, nums = {}, extra = '') {
  const types = typesOf(p);
  const h = [p.model, p.brand, ...types.flatMap((t) => LANGS.map((l) => term(t, l))), extra].filter(Boolean).join(' | ');
  const d = { h };
  for (const [k, v] of Object.entries(nums)) if (+v > 0) d[k] = Math.round(+v * 100) / 100;
  return JSON.stringify(d);
}
