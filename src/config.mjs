// 网站基本信息——上线前把这里改成真实信息
export const SITE = {
  name: 'SKE Power',
  tagline: { es: 'Fabricante directo de UPS', en: 'Direct UPS manufacturer', ru: 'Прямой производитель ИБП' },
  // WhatsApp 号码：国际格式，只写数字，不带 + 和空格，例如 8613800000000
  whatsapp: '8615201273157',
  whatsappDisplay: '+86 152 0127 3157',
  email: 'sales@ups-china.com',
};

// 联系我们页面（/contact/）用的补充信息；留空的项不显示
export const CONTACT = {
  tz: 'Asia/Shanghai',
  // 工作时间：周几（1=周一 … 7=周日）和几点到几点（工厂当地时间）。页面上按这个显示"在线 / 下班"
  days: [1, 2, 3, 4, 5, 6], from: 9, to: 18,
  wechat: '',                       // 微信号，例如 'ske-power'
  address: { en: '', es: '', ru: '' }, // 工厂地址（三语），填了才显示"参观工厂"一栏
  mapUrl: '',                       // 地图链接（Google 地图分享链接）
  languages: ['English', 'Español', 'Русский', '中文'],
};

export const LANGS = ['en', 'es', 'ru'];
export const DEFAULT_LANG = 'en';
