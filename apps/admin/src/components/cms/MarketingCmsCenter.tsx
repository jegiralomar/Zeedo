'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { MobileBanner, PushNotificationMessage } from '@/types';
import {
  Megaphone,
  Image as ImageIcon,
  Send,
  Bell,
  Trash2,
  Plus,
} from 'lucide-react';

export const MarketingCmsCenter: React.FC = () => {
  const {
    banners,
    notifications,
    addBanner,
    toggleBannerStatus,
    deleteBanner,
    dispatchPushNotification,
    addToast,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'banners' | 'push'>('banners');

  // New Banner Form State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState(
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  );
  const [bannerActionType, setBannerActionType] = useState<'auction' | 'category' | 'url'>('category');
  const [bannerActionTarget, setBannerActionTarget] = useState('Smartphones & Mobile');
  const [bannerAudience, setBannerAudience] = useState<'all' | 'verified_only'>('all');
  const [bannerPriority, setBannerPriority] = useState(1);

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
  const [pushDeepLink, setPushDeepLink] = useState('zeedo://auction/auc-801');

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImageUrl) {
      addToast('error', 'Please enter a banner title and image URL');
      return;
    }

    addBanner({
      title: bannerTitle,
      imageUrl: bannerImageUrl,
      actionType: bannerActionType,
      actionTarget: bannerActionTarget,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      targetAudience: bannerAudience,
      isActive: true,
      priority: bannerPriority,
    });

    setIsBannerModalOpen(false);
    setBannerTitle('');
  };

  const handleDispatchPush = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchPushNotification({
      title: { en: pushTitleEn, ar: pushTitleAr, ckb: pushTitleCkb },
      body: { en: pushBodyEn, ar: pushBodyAr, ckb: pushBodyCkb },
      targetAudience: pushAudience,
      deepLinkTarget: pushDeepLink,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="spark-card !p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803d] flex items-center justify-center font-bold">
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
            <span>Mobile Hero Banners ({banners.length})</span>
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
            <span>Push Notifications ({notifications.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: HERO BANNERS */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7E75]">
                Scheduled Banners
              </span>
              <button
                onClick={() => setIsBannerModalOpen(true)}
                className="btn-spark-lime text-xs"
              >
                <Plus className="w-4 h-4 text-[#072F1F]" />
                <span>+ Schedule New Banner</span>
              </button>
            </div>

            <div className="space-y-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="spark-card !p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-28 h-16 object-cover rounded-xl border border-[#E9EFEF] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#0B130F]">{b.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            b.isActive
                              ? 'bg-[#DCFCE7] text-[#15803d]'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6C7E75] mt-1 font-mono">
                        <span>Action: {b.actionType} &rarr; {b.actionTarget}</span>
                        <span>Audience: {b.targetAudience === 'all' ? 'All Users' : 'KYC Verified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => toggleBannerStatus(b.id)}
                      className="btn-spark-light text-xs py-1 px-3"
                    >
                      {b.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="p-1.5 rounded-xl bg-[#FEE2E2] text-[#EF4444] hover:bg-[#fecaca] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mobile Viewport Simulator Preview */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-[320px] rounded-[44px] bg-[#051C12] border-4 border-slate-700 p-4 shadow-2xl relative overflow-hidden">
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-white text-xs px-1">
                  <span className="font-black text-[#B4F105]">ZEEDO BID</span>
                  <span className="font-mono text-[10px] text-[#879A91]">Erbil &bull; 100% COD</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  {banners[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={banners[0].imageUrl}
                      alt="Banner Preview"
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#B4F105]">
                      FEATURED AUCTIONS
                    </span>
                    <h5 className="text-white text-xs font-bold line-clamp-1">
                      {banners[0]?.title || 'Weekend Tech Drops'}
                    </h5>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-hidden text-[10px] text-slate-400 font-medium">
                  <span className="px-2.5 py-1 rounded-full bg-[#B4F105] text-[#051C12] font-black">
                    All Items
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white">Smartphones</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white">Watches</span>
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
          <div className="lg:col-span-8 spark-card space-y-4">
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
                    <option value="verified_only">KYC-Verified Bidders Only (~4,120)</option>
                    <option value="sellers">Provisioned Sellers (~42)</option>
                    <option value="outbid_bidders">Bidders Outbid in Last 24 Hours (~890)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Deep Link Target</label>
                  <input
                    type="text"
                    value={pushDeepLink}
                    onChange={(e) => setPushDeepLink(e.target.value)}
                    placeholder="zeedo://auction/auc-801"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-xs"
                  />
                </div>
              </div>

              {/* 3 Language Inputs */}
              <div className="space-y-3 pt-2">
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
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="btn-spark-primary text-xs"
                >
                  <Send className="w-4 h-4 text-[#B4F105]" />
                  <span>Dispatch Push Notification Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Phone Lockscreen Preview */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-[320px] rounded-[44px] bg-[#051C12] border-4 border-slate-700 p-4 shadow-2xl relative">
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-6"></div>

              <div className="text-center text-white space-y-1 mb-8">
                <div className="text-4xl font-light font-mono">17:15</div>
                <div className="text-[11px] text-[#879A91]">Monday, September 28</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-[#B4F105] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#B4F105]"></span>
                    <span>ZEEDO BID</span>
                  </div>
                  <span>Now</span>
                </div>
                <div className="font-bold text-xs text-white leading-tight">{pushTitleEn}</div>
                <div className="text-[11px] text-slate-200 leading-snug line-clamp-3">
                  {pushBodyEn}
                </div>
              </div>

              <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-24"></div>
            </div>
          </div>
        </div>
      )}

      {/* New Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9EFEF] p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-extrabold text-[#0B130F] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#072F1F]" />
              Schedule Mobile Hero Banner
            </h3>

            <form onSubmit={handleCreateBanner} className="space-y-3">
              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Mega Weekend Electronics Auction"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-semibold text-xs"
                />
              </div>

              <div>
                <label className="text-[#6C7E75] font-bold block mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Action Type</label>
                  <select
                    value={bannerActionType}
                    onChange={(e) => setBannerActionType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs font-semibold"
                  >
                    <option value="category">Category Filter</option>
                    <option value="auction">Specific Auction Room</option>
                    <option value="url">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#6C7E75] font-bold block mb-1">Action Target</label>
                  <input
                    type="text"
                    value={bannerActionTarget}
                    onChange={(e) => setBannerActionTarget(e.target.value)}
                    placeholder="Smartphones & Mobile or auc-801"
                    className="w-full p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E9EFEF] text-[#0B130F] text-xs"
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
                <button
                  type="submit"
                  className="btn-spark-primary text-xs"
                >
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
