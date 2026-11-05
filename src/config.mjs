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
  // 二合一扫码页：网站上的那个码指向这里。手机相机扫 → 跳到 WhatsApp；微信扫 → 显示微信二维码（长按加好友）
  scanUrl: 'https://ups-china.com/c/',
  address: {
    en: 'SKE Industrial Park, No. 185 Keji Road, Dongkeng Town, Dongguan, Guangdong 523660, China',
    es: 'Parque Industrial SKE, Keji Road n.º 185, Dongkeng, Dongguan, Guangdong 523660, China',
    ru: 'Индустриальный парк SKE, Keji Road, 185, Дункэн, Дунгуань, Гуандун 523660, Китай',
  },
  addressZh: '广东省东莞市东坑镇科技路185号山克工业园',
  lat: 22.82724, lng: 114.17262,
  mapUrl: 'https://maps.app.goo.gl/P23PYMecKo8RuHvWA',
  languages: ['English', 'Español', 'Русский', '中文'],
};

export const LANGS = ['en', 'es', 'ru'];
export const DEFAULT_LANG = 'en';
