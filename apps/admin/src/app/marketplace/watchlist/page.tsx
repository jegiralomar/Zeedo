'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Flame, ArrowLeft, Gavel } from 'lucide-react';
import { useBuyerAuctionStore } from '@/store/useBuyerAuctionStore';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS } from '@/i18n/translations';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { LiveAuctionRoomModal } from '@/components/marketplace/LiveAuctionRoomModal';
import { TwoGateKycModal } from '@/components/marketplace/TwoGateKycModal';
import { MobileAuctionItem } from '@/types/marketplace';

export default function WatchlistPage() {
  const { auctions, savedAuctionIds } = useBuyerAuctionStore();
  const { language } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];

  const [selectedAuction, setSelectedAuction] = useState<MobileAuctionItem | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);

  const bookmarked = auctions.filter((a) => savedAuctionIds.includes(a.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{t.tabSaved}</h2>
          <p className="text-xs text-slate-500">Live auctions you have bookmarked for real-time tracking</p>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Browse All</span>
        </Link>
      </div>

      {bookmarked.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t.noSavedAuctions || 'No saved auctions'}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.noSavedAuctionsSub || 'Tap the bookmark icon on any auction card to track live bids here.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Flame className="w-4 h-4" />
            <span>Explore Live Auctions</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarked.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              onOpenLiveRoom={(target) => setSelectedAuction(target)}
              onRequestKyc={() => setShowKycModal(true)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <LiveAuctionRoomModal
        item={selectedAuction}
        isOpen={Boolean(selectedAuction)}
        onClose={() => setSelectedAuction(null)}
        onRequestKyc={() => setShowKycModal(true)}
      />

      <TwoGateKycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />
    </div>
  );
}
