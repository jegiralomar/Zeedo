'use client';

import React, { useState, useEffect } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingQrSection } from './LandingQrSection';
import { LandingFooter } from './LandingFooter';

type Lang = 'ar' | 'ckb' | 'en';

const TRANSLATIONS = {
  ar: {
    navFeatures: 'المميزات',
    navHowItWorks: 'كيف تزايد',
    navDownload: 'تحميل التطبيق',
    navMerchant: 'بوابة التجار',
    ctaGetApp: 'حمّل التطبيق الآن',

    heroBadge: 'تطبيق الهاتف متاح الآن في العراق',
    heroTitle: 'تطبيق المزادات الحية الأول في العراق',
    heroSubtitle:
      'زايد من 1,000 دينار فقط على إلكترونيات، أزياء، وأجهزة أصلية 100%. افحص بضاعتك عند باب بيتك وادفع كاش عند الاستلام في كافة محافظات العراق.',
    btnAppStore: 'App Store',
    btnGooglePlay: 'Google Play',
    btnApk: 'تحميل مباشر APK',
    trustCod: 'دفع كاش عند الاستلام',
    trustInspection: 'معاينة وفحص عند الباب',
    trustStartingBid: 'المزايدات تبدأ من 1,000 د.ع',

    liveAuction: 'مزاد حي نشط',
    placeBid: 'زايد +1,000 د.ع',
    timeLeft: 'الوقت المتبقي',
    currentBid: 'أعلى مزايدة حالية',
    bidNotification: 'مزايدة جديدة: 39,000 د.ع من أحمد (أربيل)',
    itemTitle: 'حذاء Nike Air Max الأصلي (إصدار حصري)',

    featuresBadge: 'لماذا يختار العراقيون ZEEDO؟',
    featuresTitle: 'تجربة مزادات ذكية، عادلة، وبدون مجازفة',
    featuresSubtitle:
      'صممنا تطبيق ZEEDO ليمنحك شفافية مطلقة وتجربة تسوق مشوّقة تضمن حقوقك بالكامل.',
    f1Tag: 'حماية المزايدة',
    f1Title: 'حماية الثانية الأخيرة (Anti-Sniping)',
    f1Desc:
      'نظام أوتوماتيكي يمدد وقت المزاد تلقائياً عند وضع أي مزايدة في آخر 60 ثانية لضمان فرصة عادلة للجميع ومنع سرقة المزادات في اللحظة الأخيرة.',
    f2Tag: 'أمان 100%',
    f2Title: 'دفع كاش مع الفحص عند الباب',
    f2Desc:
      'لا حاجة لأي بطاقة بنكية أو تحويل مسبق. المندوب يصل لباب منزلك، تفحص المنتج وتتأكد من مطابقته قبل أن تدفع أي دينار.',
    f3Tag: 'أصالة معتمدة',
    f3Title: 'تجار محليون موثوقون وضمان الأصالة',
    f3Desc:
      'جميع المنتجات المعروضة بالمزاد تأتي من متاجر وشركات معتمدة في بغداد وأربيل مع علبها الأصلية وضمانات الاسترجاع.',
    f4Tag: 'تواصل فوري',
    f4Title: 'إشعارات لحظية عبر واتساب',
    f4Desc:
      'تسجيل دخول فوري بدون كلمات مرور عبر رمز OTP في واتساب، مع تنبيهك فوراً إذا زاد أحد على سعرك لمتابعة المزاد بكل سهولة.',

    qrBadge: 'التحميل السريع',
    qrTitle: 'حمّل تطبيق ZEEDO على هاتفك الآن',
    qrSubtitle:
      'امسح رمز الاستجابة السريعة (QR Code) بكاميرا هاتفك لبدء التنزيل فوراً على نظامي iOS و Android واستمتع بأول مزايدة مجانية.',
    qrScanInstruction: 'وجّه كاميرا هاتفك لمسح الرمز والتحميل',
    compatibility: 'يدعم جميع هواتف آيفون (iOS 15+) وأندرويد (Android 8+)',

    footerTagline: 'منصة المزادات الحية الأولى في العراق',
    footerDesc:
      'ZEEDO يجمع بين متعة المزادات الحية والتسوق الآمن بالدفع عند الاستلام عبر جميع محافظات العراق وإقليم كردستان.',
    quickLinks: 'روابط سريعة',
    forSellers: 'للتجار والشركات',
    support: 'الدعم والمساعدة',
    terms: 'شروط الاستخدام والمزادات',
    privacy: 'سياسة الخصوصية',
    sellerLogin: 'دخول لوحة التاجر',
    whatsappSupport: 'خدمة العملاء عبر واتساب',
    erbilOffice: 'مكتب أربيل: شارع 100 متري، مجمع التجارة',
    baghdadOffice: 'مكتب بغداد: المنصور، شارع الأميرات',
    allRightsReserved: 'جميع الحقوق محفوظة.',
  },
  ckb: {
    navFeatures: 'تایبەتمەندییەکان',
    navHowItWorks: 'چۆنیەتی بەشداریکردن',
    navDownload: 'دابەزاندنی ئەپ',
    navMerchant: 'دەروازەی بازرگانان',
    ctaGetApp: 'ئەپڵیکەیشن دابەزێنە',

    heroBadge: 'ئەپی مۆبایل ئێستا بەردەستە لە عێراق',
    heroTitle: 'یەکەم ئەپڵیکەیشنی مەزادی ڕاستەوخۆ لە عێراق',
    heroSubtitle:
      'مەزاد دەستپێدەکات لە 1,000 دینارەوە بۆ کاڵای ئەسڵی 100%. کاڵاکەت لەسەر دەرگا بپشکنە و پارەدانی کاش لە کاتی وەرگرتن لە هەموو پارێزگاکانی عێراق و هەرێمی کوردستان.',
    btnAppStore: 'App Store',
    btnGooglePlay: 'Google Play',
    btnApk: 'دابەزاندنی ڕاستەوخۆ APK',
    trustCod: 'پارەدانی کاش لەسەر دەرگا',
    trustInspection: 'پشکنینی کاڵا پێش پارەدان',
    trustStartingBid: 'مەزاد لە 1,000 دینارەوە',

    liveAuction: 'مەزادی ڕاستەوخۆی چالاک',
    placeBid: 'مەزاد بکە +1,000 د.ع',
    timeLeft: 'کاتی ماوە',
    currentBid: 'بەرزترین نرخی ئێستا',
    bidNotification: 'مەزادی نوێ: 39,000 د.ع لە ئەحمەد (هەولێر)',
    itemTitle: 'پێڵاوی وەرزشی Nike Air Max ئەسڵی',

    featuresBadge: 'بۆچی عێراقییەکان ZEEDO هەڵدەبژێرن؟',
    featuresTitle: 'ئەزموونێکی مەزادی زیرەک، دادپەروەر، بێ مەترسی',
    featuresSubtitle:
      'ئەپی ZEEDO بە شێوازێک دروستکراوە کە تەواوی مافەکانت بپارێزێت و بە کەیفخۆشی بەشداری مەزادەکان بیت.',
    f1Tag: 'پاراستنی مەزاد',
    f1Title: 'پاراستنی چرکەی کۆتایی (Anti-Sniping)',
    f1Desc:
      'سیستەمێکی ئۆتۆماتیکییە کە لە دوا 60 چرکەدا کاتی مەزادەکە درێژ دەکاتەوە لە کاتی زیادکردنی نرخ بۆ ئەوەی هەمووان هەلی یەکسانیان هەبێت.',
    f2Tag: 'ئاسایشی 100%',
    f2Title: 'پارەدانی کاش لەگەڵ پشکنین لەبەردەم ماڵ',
    f2Desc:
      'پێویست بە هیچ کارتێکی بانکی ناکات. مەندووب کاڵاکە دێنێتە بەر دەرگات، دەیپشکنیت و دواتر پارەکەی دەدەیت بە کاش.',
    f3Tag: 'ڕەسەنایەتی مسۆگەر',
    f3Title: 'بازرگانانی متمانەپێکراو و کاڵای ئۆرجیناڵ',
    f3Desc:
      'تەواوی کاڵاکانی ناو مەزاد لە فرۆشگا و براندە باوەڕپێکراوەکانی بەغداد و هەولێر و سلێمانییەوە دابین دەکرێن.',
    f4Tag: 'ئاگاداری خێرا',
    f4Title: 'ئاگادارکردنەوەی دەستبەجێ لە واتسئەپ',
    f4Desc:
      'چوونەژوورەوەی خێرا بەبێ وشەی نهێنی لە ڕێگەی کودی واتسئەپ، لەگەڵ ئاگادارکردنەوەی ڕاستەوخۆ کاتێک کەسێک نرخی مەزادەکەت بەرز دەکاتەوە.',

    qrBadge: 'دابەزاندنی خێرا',
    qrTitle: 'ئێستا ئەپی ZEEDO بخەرە سەر مۆبایلەکەت',
    qrSubtitle:
      'کامێرای مۆبایلەکەت ئاڕاستەی کۆدی QR بکە بۆ دابەزاندنی خێرا لەسەر هەردوو سیستەمی iOS و Android.',
    qrScanInstruction: 'کامێرای مۆبایلەکەت بۆ کۆدەکە ڕابگرە',
    compatibility: 'پشتگیری هەموو مۆبایلەکانی ئایفۆن و ئەندرۆید دەکات',

    footerTagline: 'پێشەنگی مەزادە ڕاستەوخۆکان لە عێراق',
    footerDesc:
      'ZEEDO جۆش و خرۆشی مەزادی ڕاستەوخۆ لەگەڵ کڕینی پارێزراو بە پارەدانی کاش کۆدەکاتەوە لە تەواوی عێراقدا.',
    quickLinks: 'بەستەرە خێراکان',
    forSellers: 'بۆ بازرگان و فرۆشیاران',
    support: 'پشتیوانی و یارمەتی',
    terms: 'یاساکانی مەزاد و بەکارهێنان',
    privacy: 'سیاسەتی پاراستنی نهێنی',
    sellerLogin: 'چوونەژوورەوەی فرۆشیار',
    whatsappSupport: 'پشتیوانی واتسئەپ',
    erbilOffice: 'ئۆفیسی هەولێر: شەقامی 100 مەتری',
    baghdadOffice: 'ئۆفیسی بەغداد: مەنسور، شەقامی ئەمیرات',
    allRightsReserved: 'هەموو مافەکان پارێزراون.',
  },
  en: {
    navFeatures: 'Features',
    navHowItWorks: 'How Bidding Works',
    navDownload: 'Download App',
    navMerchant: 'Seller Portal',
    ctaGetApp: 'Get App Now',

    heroBadge: 'Mobile App Now Live in Iraq',
    heroTitle: "Iraq's #1 Live Auction Mobile App",
    heroSubtitle:
      'Start bidding from just 1,000 IQD on 100% authentic electronics, fashion, and luxury items. Free doorstep inspection and Cash on Delivery across all 18 governorates.',
    btnAppStore: 'App Store',
    btnGooglePlay: 'Google Play',
    btnApk: 'Direct APK Download',
    trustCod: 'Cash on Delivery',
    trustInspection: 'Doorstep Inspection',
    trustStartingBid: 'Bids Start at 1,000 IQD',

    liveAuction: 'Active Live Auction',
    placeBid: 'Bid +1,000 IQD',
    timeLeft: 'Time Remaining',
    currentBid: 'Current Highest Bid',
    bidNotification: 'New Bid: 39,000 IQD by Ahmed (Erbil)',
    itemTitle: 'Nike Air Max Authentic Limited Edition',

    featuresBadge: 'Why Iraqis Choose ZEEDO',
    featuresTitle: 'Smart, Fair & Risk-Free Live Bidding',
    featuresSubtitle:
      'Engineered specifically for the Iraqi market with guaranteed transparency, verified sellers, and full buyer protection.',
    f1Tag: 'Fair Play',
    f1Title: 'Anti-Sniping Engine (Last-Second Protection)',
    f1Desc:
      'Automatic timer resets if a bid is placed in the final 60 seconds, preventing last-millisecond bot snipes and giving everyone a fair chance to counter-bid.',
    f2Tag: '100% Secure',
    f2Title: 'Doorstep Inspection & Cash on Delivery',
    f2Desc:
      'Zero credit card or bank transfer required. The courier delivers to your door — open the box, inspect the goods, and pay cash only when satisfied.',
    f3Tag: 'Verified Sellers',
    f3Title: 'Authentic Local Merchants & Genuine Brands',
    f3Desc:
      'All auction inventory originates from certified retailers and registered brands across Baghdad, Erbil, and Sulaymaniyah in factory-sealed boxes.',
    f4Tag: 'Instant Sync',
    f4Title: 'Real-Time WhatsApp Alerts & OTP Login',
    f4Desc:
      'Seamless passwordless sign-in with 6-digit WhatsApp OTP, plus instant WhatsApp notifications whenever you are outbid or your parcel is out for delivery.',

    qrBadge: 'Instant Download',
    qrTitle: 'Download ZEEDO on Your Phone Today',
    qrSubtitle:
      'Point your phone camera at the QR code to install the app on iOS or Android and join thousands of active bidders across Iraq.',
    qrScanInstruction: 'Point your camera to scan & download',
    compatibility: 'Compatible with iOS 15+ and Android 8+',

    footerTagline: "Iraq's Premier Live Auction Marketplace",
    footerDesc:
      'ZEEDO brings live bidding excitement, verified authenticity, and reliable Cash on Delivery to buyers across all 18 governorates.',
    quickLinks: 'Quick Links',
    forSellers: 'For Merchants',
    support: 'Support & Help',
    terms: 'Terms & Auction Rules',
    privacy: 'Privacy Policy',
    sellerLogin: 'Merchant Login',
    whatsappSupport: 'WhatsApp Live Support',
    erbilOffice: 'Erbil Hub: 100m Commercial Boulevard',
    baghdadOffice: 'Baghdad Hub: Al-Mansour, Princesses St.',
    allRightsReserved: 'All rights reserved.',
  },
};

export function LandingPageContent() {
  const [lang, setLang] = useState<Lang>('ar');

  // Load language preference from localStorage if set
  useEffect(() => {
    const saved = localStorage.getItem('zeedo_lang') as Lang;
    if (saved && (saved === 'ar' || saved === 'ckb' || saved === 'en')) {
      setLang(saved);
    }
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('zeedo_lang', newLang);
  };

  const isRtl = lang === 'ar' || lang === 'ckb';
  const t = TRANSLATIONS[lang];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-white text-[#17223B] font-['Montserrat','Tajawal',sans-serif] selection:bg-[#F83758] selection:text-white"
    >
      <LandingHeader lang={lang} onLangChange={handleLangChange} t={t} />
      <main>
        <LandingHero lang={lang} t={t} />
        <LandingFeatures lang={lang} t={t} />
        <LandingQrSection lang={lang} t={t} />
      </main>
      <LandingFooter lang={lang} t={t} />
    </div>
  );
}
