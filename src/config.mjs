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
  wechat: '15201273157',            // 微信号；二维码图片在 CRM 网站管理 → Contact 联系页面 → 微信个人二维码
  address: { en: '', es: '', ru: '' }, // 工厂地址（三语），填了才显示"参观工厂"一栏
  mapUrl: '',                       // 地图链接（Google 地图分享链接）
  languages: ['English', 'Español', 'Русский', '中文'],
};

export const LANGS = ['en', 'es', 'ru'];
export const DEFAULT_LANG = 'en';
