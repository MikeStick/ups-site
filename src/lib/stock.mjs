// 现货标记（CRM 产品编辑 / AI批量导入里勾选"现货"）：网站产品图右上角显示，搜索可只看现货
export const STOCK_LABEL = { en: 'In stock', es: 'En stock', ru: 'В наличии', ar: 'متوفر' };
export const STOCK_ONLY = { en: 'In stock only', es: 'Solo en stock', ru: 'Только в наличии', ar: 'المتوفر فقط' };
// 栏目页默认排序：现货（CRM 勾了"现货"）排在最前，其余保持各栏目原来的排序。用于 .sort((a, b) => stockFirst(a, b) || 原比较)
// a / b 是 { p, ... } 包装对象或产品本身
const inStockOf = (x) => ((x && x.p ? x.p : x) || {}).inStock ? 1 : 0;
export const stockFirst = (a, b) => inStockOf(b) - inStockOf(a);
