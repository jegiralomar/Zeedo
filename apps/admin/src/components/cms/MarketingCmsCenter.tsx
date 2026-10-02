'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore, getAdminAuthHeaders } from '@/store/useAdminStore';
import {
  Megaphone,
  Image as ImageIcon,
  Send,
  Bell,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
  Smartphone,
  ExternalLink,
  Gavel,
  CheckCircle2,
} from 'lucide-react';

interface DbBanner {
  id: string;
  titleAr: string;
  titleEn: string;
  titleCkb?: string;
  titleBadini?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  subtitleCkb?: string;
  imageUrl: string;
  tapAction: 'none' | 'auction' | 'category' | 'url' | 'support';
  actionTarget?: string;
  position: 'hero' | 'middle' | 'strip';
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export const MarketingCmsCenter: React.FC = () => {
  const { notifications, dispatchPushNotification, addToast, auctions } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'banners' | 'push'>('banners');
  const [dbBanners, setDbBanners] = useState<DbBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);

  // New Banner Modal Form State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleCkb, setTitleCkb] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  );
  const [position, setPosition] = useState<'hero' | 'middle' | 'strip'>('hero');
  const [tapAction, setTapAction] = useState<'auction' | 'category' | 'url' | 'support'>('auction');
  const [actionTarget, setActionTarget] = useState('zd-104928');

  // Push Notification Form State
  const [pushTitleEn, setPushTitleEn] = useState('⚡ Flash Auction Starting Now!');
  const [pushTitleAr, setPushTitleAr] = useState('⚡ مزاد سريع يبدأ الآن!');
  const [pushTitleCkb, setPushTitleCkb] = useState('⚡ زیادکردنی بەپەلە دەستی پێکرد!');
  const [pushBodyEn, setPushBodyEn] = useState(
    'Starting at 1,000 IQD. Tap to place your bid before the 60s soft close!'
  );
  const [pushBodyAr, setPushBodyAr] = useState(
    'المزايدة تبدأ من 1,000 دينار فقط. انقر للمشاركة قبل تفعيل الإغلاق التلقائي!'
  );
  const [pushBodyCkb, setPushBodyCkb] = useState(
    'لە ١,٠٠٠ دینارەوە دەست پێدەکات. پەنجە بنێ بۆ بەشداریکردن!'
  );
  const [pushAudience, setPushAudience] = useState<
    'all' | 'verified_only' | 'sellers' | 'outbid_bidders'
  >('all');
  const [pushDeepLink, setPushDeepLink] = useState('zeedo://auction/zd-104928');
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'ar' | 'ckb'>('ar');
  const [dispatchedHistory, setDispatchedHistory] = useState<any[]>([
    {
      id: 'push-prev-01',
      title: '⚡ مزاد سريع يبدأ الآن!',
      audience: 'All Registered Users (~14,200)',
      target: 'zeedo://auction/zd-104928',
      time: '2 hours ago',
      status: 'Delivered (99.4%)',
    },
    {
      id: 'push-prev-02',
      title: '📦 حق المعاينة قبل الدفع عند الاستلام',
      audience: 'Phone-Verified Bidders (~4,120)',
      target: 'zeedo://support',
      time: 'Yesterday',
      status: 'Delivered (98.9%)',
    },
  ]);

  // Fetch banners from Postgres
  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const res = await fetch('/api/cms/banners?all=true');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.banners)) {
          setDbBanners(data.banners);
        }
      }
    } catch (err) {
      console.warn('Failed to load CMS banners from DB:', err);
    } finally {
      setIsLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr && !titleEn) {
      addToast('error', 'Please provide a title in Arabic or English');
      return;
    }

    try {
      const res = await fetch('/api/cms/banners', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          titleAr: titleAr || titleEn,
          titleEn: titleEn || titleAr,
          titleCkb,
          subtitleAr,
          subtitleEn,
          imageUrl,
          position,
          tapAction,
          actionTarget,
          isActive: true,
        }),
      });

      if (res.ok) {
        addToast('success', 'Banner published to mobile app');
        setIsBannerModalOpen(false);
        setTitleAr('');
        setTitleEn('');
        setTitleCkb('');
        setSubtitleAr('');
        setSubtitleEn('');
        fetchBanners();
      } else {
        addToast('error', 'Could not save banner');
      }
    } catch (err) {
      addToast('error', 'Network error creating banner');
    }
  };

  const handleToggleBanner = async (banner: DbBanner) => {
    try {
      const res = await fetch('/api/cms/banners', {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          id: banner.id,
          is_active: !banner.isActive,
        }),
      });

      if (res.ok) {
        setDbBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
        );
        addToast('info', `Banner ${!banner.isActive ? 'activated' : 'paused'}`);
      }
    } catch (err) {
      addToast('error', 'Failed to toggle banner status');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to remove this banner?')) return;
    try {
      const res = await fetch(`/api/cms/banners?id=${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        setDbBanners((prev) => prev.filter((b) => b.id !== id));
        addToast('info', 'Banner removed');
      }
    } catch (err) {
      addToast('error', 'Failed to delete banner');
    }
  };

  const handleDispatchPush = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchPushNotification({
      title: { en: pushTitleEn, ar: pushTitleAr, ckb: pushTitleCkb },
      body: { en: pushBodyEn, ar: pushBodyAr, ckb: pushBodyCkb },
      targetAudience: pushAudience,
      deepLinkTarget: pushDeepLink,
    });

    const newLog = {
      id: `push-${Date.now()}`,
      title: pushTitleAr || pushTitleEn,
      audience:
        pushAudience === 'all'
          ? 'All Users (~14,200)'
          : pushAudience === 'verified_only'
          ? 'Verified Bidders (~4,120)'
          : pushAudience === 'sellers'
          ? 'Merchants (~42)'
          : 'Outbid Bidders (~890)',
      target: pushDeepLink,
      time: 'Just now',
      status: 'Dispatched (Broadcasting)',
    };

    setDispatchedHistory((prev) => [newLog, ...prev]);
    addToast('success', 'Push notification broadcasted successfully');
  };

  const previewTitle =
    previewLanguage === 'ar' ? pushTitleAr : previewLanguage === 'ckb' ? pushTitleCkb : pushTitleEn;
  const previewBody =
    previewLanguage === 'ar' ? pushBodyAr : previewLanguage === 'ckb' ? pushBodyCkb : pushBodyEn;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803d] flex items-center justify-center font-bold shadow-xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
              Marketing & Mobile Engagement CMS
            </h2>
            <p className="text-xs text-[#6C7E75]">
              Schedule mobile home-screen hero carousel banners and dispatch localized push notifications.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-[#F4F6F5] p-1 rounded-full border border-[#E9EFEF] text-xs">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-1.5 rounded-full font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'banners'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Mobile Banners ({dbBanners.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`px-4 py-1.5 rounded-full font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'push'
                ? 'bg-[#072F1F] text-white shadow-xs'
                : 'text-[#6C7E75] hover:text-[#0B130F]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Push Notifications ({dispatchedHistory.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: HERO & MIDDLE BANNERS */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                  Active & Scheduled Banners
                </span>
                <button
                  onClick={fetchBanners}
                  disabled={isLoadingBanners}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                  title="Refresh from DB"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBanners ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(true)}
                className="btn-spark-lime text-xs"
              >
                <Plus className="w-4 h-4 text-[#072F1F]" />
                <span>+ Schedule New Banner</span>
              </button>
            </div>

            <div className="space-y-3">
              {dbBanners.length === 0 ? (
                <div className="spark-card !p-8 text-center text-slate-400 text-xs">
                  No banners found in database. Click &ldquo;+ Schedule New Banner&rdquo; to create your first promotion.
                </div>
              ) : (
                dbBanners.map((b) => (
                  <div
                    key={b.id}
                    className="spark-card !p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.imageUrl}
                        alt={b.titleAr || b.titleEn}
                        className="w-28 h-16 object-cover rounded-xl border border-[#E9EFEF] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#0B130F]">
                            {b.titleAr || b.titleEn}
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                              b.isActive
                                ? 'bg-[#DCFCE7] text-[#15803d]'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {b.isActive ? 'Active' : 'Paused'}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {b.position}
                          </span>
                        </div>

                        {b.titleEn && b.titleAr && (
                          <div className="text-xs text-slate-500 italic mt-0.5">{b.titleEn}</div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#6C7E75] mt-1 font-mono">
                          <span>
                            Action: <strong>{b.tapAction}</strong> &rarr; {b.actionTarget || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleToggleBanner(b)}
                        className="btn-spark-light text-xs py-1 px-3"
                      >
                        {b.isActive ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded-xl bg-[#FEE2E2] text-[#EF4444] hover:bg-[#fecaca] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Mobile Viewport Simulator Preview */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-[320px] rounded-[44px] bg-[#051C12] border-4 border-slate-700 p-4 shadow-2xl relative overflow-hidden">
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-white text-xs px-1">
                  <span className="font-black text-[#B4F105]">ZEEDO BID</span>
                  <span className="font-mono text-[10px] text-[#879A91]">Iraq &bull; 100% COD</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  {dbBanners[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dbBanners[0].imageUrl}
                      alt="Banner Preview"
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                      No Active Banner
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#B4F105]">
                      FEATURED PROMOTION
                    </span>
                    <h5 className="text-white text-xs font-bold line-clamp-1">
                      {dbBanners[0]?.titleAr || dbBanners[0]?.titleEn || 'Weekend Auction Drops'}
                    </h5>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-hidden text-[10px] text-slate-400 font-medium">
                  <span className="px-2.5 py-1 rounded-full bg-[#B4F105] text-[#051C12] font-black">
                    All Lots
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white">Smartphones</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white">Luxury</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-[#879A91] text-center font-mono">
                  Live Mobile App Marketplace Feed
                </div>
              </div>

              <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-6"></div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PUSH NOTIFICATIONS */}
      {activeTab === 'push' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="spark-card space-y-4">
              <h3 className="text-sm font-extrabold text-[#0B130F] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#072F1F]" />
                Multilingual Push Notification Dispatcher
              </h3>
              <p className="text-xs text-[#6C7E75]">
                Dispatches instant push alerts across all 3 key languages to mobile devices.
              </p>

              <form onSubmit={handleDispatchPush} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#6C7E75] font-bold block mb-1">
                      Audience Segmentation
                    </label>
                    <select
                      value={pushAudience}
                      onChange={(e) => setPushAudience(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs font-semibold"
                    >
                      <option value="all">All Registered Mobile Users (~14,200)</option>
                      <option value="verified_only">Active Phone-Verified Bidders (~4,120)</option>
                      <option value="sellers">Provisioned Merchants (~42)</option>
                      <option value="outbid_bidders">Bidders Outbid in Last 24 Hours (~890)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#6C7E75] font-bold block mb-1">Deep Link Target</label>
                    <input
                      type="text"
                      value={pushDeepLink}
                      onChange={(e) => setPushDeepLink(e.target.value)}
                      placeholder="zeedo://auction/zd-104928"
                      className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 3 Language Inputs */}
                <div className="space-y-3 pt-2">
                  <div dir="rtl" className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-2">
                    <span className="font-bold text-[#0B130F] block text-right">العربية (Arabic)</span>
                    <input
                      type="text"
                      value={pushTitleAr}
                      onChange={(e) => setPushTitleAr(e.target.value)}
                      placeholder="عنوان الإشعار (عربي)"
                      className="w-full p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                    />
                    <textarea
                      rows={2}
                      value={pushBodyAr}
                      onChange={(e) => setPushBodyAr(e.target.value)}
                      placeholder="نص الإشعار (عربي)"
                      className="w-full p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] text-xs"
                    />
                  </div>

                  <div dir="rtl" className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-2">
                    <span className="font-bold text-[#0B130F] block text-right">کوردی سۆرانی (Kurdish Sorani)</span>
                    <input
                      type="text"
                      value={pushTitleCkb}
                      onChange={(e) => setPushTitleCkb(e.target.value)}
                      placeholder="سەردێڕی ئاگاداری"
                      className="w-full p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                    />
                    <textarea
                      rows={2}
                      value={pushBodyCkb}
                      onChange={(e) => setPushBodyCkb(e.target.value)}
                      placeholder="دەقی ئاگاداری"
                      className="w-full p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] text-xs"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E9EFEF] space-y-2">
                    <span className="font-bold text-[#0B130F] block">English (EN)</span>
                    <input
                      type="text"
                      value={pushTitleEn}
                      onChange={(e) => setPushTitleEn(e.target.value)}
                      placeholder="Notification Title (English)"
                      className="w-full p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                    />
                    <textarea
                      rows={2}
                      value={pushBodyEn}
                      onChange={(e) => setPushBodyEn(e.target.value)}
                      placeholder="Message Body (English)"
                      className="w-full p-2 rounded-lg bg-white border border-[#E9EFEF] text-[#0B130F] text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button type="submit" className="btn-spark-primary text-xs flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#B4F105]" />
                    <span>Dispatch Push Notification Now</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Notification History Table */}
            <div className="spark-card space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Recent Notification Broadcasts
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-mono">
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Audience</th>
                      <th className="py-2 px-3">Target</th>
                      <th className="py-2 px-3">Sent Time</th>
                      <th className="py-2 px-3 text-right">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dispatchedHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{item.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.audience}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-600">{item.target}</td>
                        <td className="py-2.5 px-3 text-slate-400">{item.time}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{item.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Phone Lockscreen Preview with Language Tabs */}
          <div className="lg:col-span-4 flex flex-col items-center gap-3">
            {/* Language Switcher for Preview */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setPreviewLanguage('ar')}
                className={`px-3 py-1 rounded-lg ${
                  previewLanguage === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setPreviewLanguage('ckb')}
                className={`px-3 py-1 rounded-lg ${
                  previewLanguage === 'ckb' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                سۆرانی
              </button>
              <button
                onClick={() => setPreviewLanguage('en')}
                className={`px-3 py-1 rounded-lg ${
                  previewLanguage === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                English
              </button>
            </div>

            <div className="w-[320px] rounded-[44px] bg-[#051C12] border-4 border-slate-700 p-4 shadow-2xl relative">
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-6"></div>

              <div className="text-center text-white space-y-1 mb-8">
                <div className="text-4xl font-light font-mono">17:15</div>
                <div className="text-[11px] text-[#879A91]">Monday, October 5</div>
              </div>

              <div
                dir={previewLanguage === 'en' ? 'ltr' : 'rtl'}
                className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-top-4"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-[#B4F105] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#B4F105]"></span>
                    <span>ZEEDO BID</span>
                  </div>
                  <span>Now</span>
                </div>
                <div className="font-bold text-xs text-white leading-tight">{previewTitle}</div>
                <div className="text-[11px] text-slate-200 leading-snug line-clamp-3">
                  {previewBody}
                </div>
              </div>

              <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-24"></div>
            </div>
          </div>
        </div>
      )}

      {/* New Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl text-xs my-8">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#072F1F]" />
              Schedule Mobile Banner Promotion
            </h3>

            <form onSubmit={handleCreateBanner} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div dir="rtl">
                  <label className="text-[#6C7E75] font-bold block mb-1">العنوان بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: مزاد الجمعة الكبرى للإلكترونيات"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Mega Weekend Electronics Auction"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div dir="rtl">
                  <label className="text-[#6C7E75] font-bold block mb-1">الوصف الفرعي (عربي)</label>
                  <input
                    type="text"
                    value={subtitleAr}
                    onChange={(e) => setSubtitleAr(e.target.value)}
                    placeholder="المزايدة تبدأ من 1,000 د.ع مع فحص الطرد"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs"
                  />
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Subtitle (English)</label>
                  <input
                    type="text"
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    placeholder="Bidding starts at 1,000 IQD with doorstep check"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs"
                  />
                </div>
              </div>

              <div dir="rtl">
                <label className="text-[#6C7E75] font-bold block mb-1">سەردێڕی کوردی (Kurdish Title)</label>
                <input
                  type="text"
                  value={titleCkb}
                  onChange={(e) => setTitleCkb(e.target.value)}
                  placeholder="مزایەدەی ڕۆژانەی پڕ لە داشکاندن"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs"
                />
              </div>

              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Placement</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs font-semibold"
                  >
                    <option value="hero">Hero Carousel (Top)</option>
                    <option value="middle">Middle Promo</option>
                    <option value="strip">Announcement Strip</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Action Type</label>
                  <select
                    value={tapAction}
                    onChange={(e) => setTapAction(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs font-semibold"
                  >
                    <option value="auction">Specific Auction (zd-xxxxxx)</option>
                    <option value="category">Category Filter</option>
                    <option value="url">External Link</option>
                    <option value="support">Open Live Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Action Target</label>
                  <input
                    type="text"
                    value={actionTarget}
                    onChange={(e) => setActionTarget(e.target.value)}
                    placeholder="zd-104928 or Smartphones"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9EFEF]">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F6F5] text-[#6C7E75] hover:text-[#0B130F] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-spark-primary text-xs">
                  Schedule Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
