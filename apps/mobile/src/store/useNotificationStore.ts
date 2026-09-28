import { create } from 'zustand';
import { AppNotification } from '../types';

interface NotificationStoreState {
  notifications: AppNotification[];
  unreadCount: () => number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  deleteNotification: (id: string) => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'outbid',
    title: {
      en: '⚡ Outbid Alert',
      ar: '⚡ تنبيه: تمت المزايدة عليك',
      ckb: '⚡ ئاگاداری: نرخی بەرزتر دانرا',
      badini: '⚡ ئاگەهداری: بهایێ بلندتر هاتە دانان',
    },
    body: {
      en: 'You were outbid on iPhone 16 Pro Max by +25,000 IQD. Tap to place a slide bid before the clock expires!',
      ar: 'تمت المزايدة على iPhone 16 Pro Max بمقدار +25,000 د.ع. اسحب للمزايدة قبل انتهاء الوقت!',
      ckb: 'لەسەر ئایفۆن ١٦ پرۆ ماکس بە +٢٥،٠٠٠ دینار پێشت کەوتن. پەنجە بنێ بۆ مزایەدەکردن پێش تەواوبوونی کات!',
      badini: 'ل سەر ئایفۆن ١٦ پرۆ ماکس ب +٢٥،٠٠٠ دینار پێش تە کەفتن. دەستێ خۆ ب بخشینە بۆ زێدەکرنێ!',
    },
    timestamp: 'Just now',
    isRead: false,
    auctionId: 'auc-01',
  },
  {
    id: 'notif-2',
    type: 'auction_won',
    title: {
      en: '🏆 Congratulations! You Won',
      ar: '🏆 مبروك! لقد فزت بالمزاد',
      ckb: '🏆 پیرۆزە! تۆ لە زیادکردنەکە براوە بوویت',
      badini: '🏆 پیرۆزە! تە زێدەکرن بر',
    },
    body: {
      en: 'You won the Rolex Submariner Date at 4,850,000 IQD. Confirm your rooftop delivery pin for 100% COD dispatch.',
      ar: 'لقد فزت بـ Rolex Submariner بمبلغ 4,850,000 د.ع. أكد نقطة موقعك للتوصيل بالدفع عند الاستلام.',
      ckb: 'سەعاتی ڕۆلێکس سابمارینەرت بە ٤،٨٥٠،٠٠٠ دینار بردەوە. ناونیشانی سەربانەکەت پشتڕاست بکەرەوە بۆ گەیاندن بە پارەی کاش.',
      badini: 'تە سەعەتا ڕۆلێکس ب ٤،٨٥٠،٠٠٠ دینار بر. جهێ خانیێ خۆ پشتڕاست بکە بۆ گەهاندن ب کاش.',
    },
    timestamp: '25m ago',
    isRead: false,
    auctionId: 'auc-03',
  },
  {
    id: 'notif-3',
    type: 'delivery',
    title: {
      en: '📦 Courier Dispatched (AWB-IQ-804)',
      ar: '📦 تم تسليم الشحنة لشركة التوصيل',
      ckb: '📦 پاکێج ڕادەستی کۆمپانیای گەیاندن کرا',
      badini: '📦 بار بۆ کۆمپانیا هاتە هنارتن',
    },
    body: {
      en: 'Erbil Express Courier is en route with your order. The driver will call your mobile (+964 750...) upon arrival at your landmark.',
      ar: 'مندوب أربيل إكسبريس في الطريق إليك. سيتصل السائق برقم هاتفك فور وصوله إلى المعلم المحدد.',
      ckb: 'شۆفێری هەولێر ئێکسپرێس لە ڕێگایە. لەگەڵ گەیشتن بە شوێنە دیاریکراوەکەت پەیوەندیت پێوە دەکات بۆ پشکنینی ناو کارتۆنەکە.',
      badini: 'شۆفێرێ هەولێر ئێکسپرێس د ڕێکێ دایە. دەمێ گەهشتە نێزیک خانیێ تە دێ پەیوەندیێ کەت بۆ دیتنا کەلوپەلی.',
    },
    timestamp: '2h ago',
    isRead: true,
    awbId: 'AWB-IQ-202609-804',
  },
  {
    id: 'notif-4',
    type: 'ending_soon',
    title: {
      en: '⏰ 5 Minutes Left: PlayStation 5 Pro',
      ar: '⏰ 5 دقائق متبقية: PlayStation 5 Pro',
      ckb: '⏰ ٥ خولەک ماوە: پلەیستەیشن ٥ پرۆ',
      badini: '⏰ ٥ خولەک ماینە: پلەیستەیشن ٥ پرۆ',
    },
    body: {
      en: 'Current bid is only 310,000 IQD! Pure No-Reserve auction ending soon. Highest bid at 0:00 wins.',
      ar: 'المزايدة الحالية 310,000 د.ع فقط! مزاد حر بدون حد أدنى ينتهي قريباً. أعلى سعر عند الصفر يفوز.',
      ckb: 'بەرزترین نرخ تەنها ٣١٠،٠٠٠ دینارە! زیادکردنی ئازاد بەبێ یەدەگ تەواو دەبێت. بەرزترین نرخ لە چرکەی سفردا دەباتەوە.',
      badini: 'بهایێ نۆکە بتنێ ٣١٠،٠٠٠ دینارە! زێدەکرنا ئازاد بەر ب دوماهیێ دچیت.',
    },
    timestamp: '4h ago',
    isRead: true,
    auctionId: 'auc-02',
  },
];

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,

  unreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  addNotification: (notification) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  deleteNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
