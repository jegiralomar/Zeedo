import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  MapPin,
  AlertCircle,
  Share2,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

const { width } = Dimensions.get('window');

export const AuctionDetailScreen: React.FC = () => {
  const {
    language,
    selectedAuctionId,
    setSelectedAuctionId,
    auctions,
    placeBid,
    watchlistIds,
    toggleWatchlist,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const auction = auctions.find((a) => a.id === selectedAuctionId) || auctions[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedIncrement, setSelectedIncrement] = useState(auction?.incrementStepIqd || 10000);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTicker((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!auction) return null;

  const isWatched = watchlistIds.includes(auction.id);
  const title = isRtl && auction.titleAr ? auction.titleAr : auction.title;
  const description = isRtl && auction.descriptionAr ? auction.descriptionAr : auction.description;

  // Format remaining time
  const totalMs = new Date(auction.endsAt).getTime() - Date.now();
  const isEnded = totalMs <= 0;
  const totalSecs = Math.max(0, Math.floor(totalMs / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  const countdownFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const nextBidAmountIqd = auction.currentBidIqd + selectedIncrement;

  const handlePlaceBid = async () => {
    setIsBidding(true);
    setBidError('');
    const result = await placeBid(auction.id, nextBidAmountIqd);
    setIsBidding(false);
    if (result.success) {
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3500);
    } else if (result.message && result.message !== 'Login required') {
      setBidError(result.message);
      setTimeout(() => setBidError(''), 4000);
    }
  };

  const increments = [
    auction.incrementStepIqd,
    auction.incrementStepIqd * 2,
    auction.incrementStepIqd * 5,
    auction.incrementStepIqd * 10,
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, isRtl && styles.topBarRtl]}>
        <TouchableOpacity
          onPress={() => setSelectedAuctionId(null)}
          style={styles.circleButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveIndicatorText}>
              {isRtl ? 'مزاد حي مباشر' : 'LIVE AUCTION'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => toggleWatchlist(auction.id)}
            activeOpacity={0.7}
          >
            <Heart
              size={18}
              color={isWatched ? '#F83758' : '#0F172A'}
              fill={isWatched ? '#F83758' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* 1. Main High-Res Image Gallery */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: auction.images[activeImageIndex] || auction.images[0] }}
            style={styles.mainImage}
          />

          {/* Image Dots */}
          {auction.images.length > 1 && (
            <View style={styles.dotsContainer}>
              {auction.images.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveImageIndex(idx)}
                  style={[styles.dot, activeImageIndex === idx && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Floating Time Pill */}
          <View style={styles.floatingTimer}>
            <Clock size={14} color="#FFFFFF" />
            <Text style={styles.floatingTimerText}>{countdownFormatted}</Text>
          </View>
        </View>

        {/* 2. Soft-Close Anti-Sniping Alert */}
        <View style={styles.antiSnipingCard}>
          <AlertCircle size={16} color="#D97706" />
          <Text style={styles.antiSnipingText}>
            {isRtl
              ? 'قاعدة تمديد الدقيقة الأخيرة: أي مزايدة في آخر 60 ثانية تمدد وقت المزاد 60 ثانية إضافية لمنع القنص.'
              : 'Soft-Close Rule: Any bid placed in the final 60 seconds extends the auction by 60s to prevent sniping.'}
          </Text>
        </View>

        {/* 3. Title & Current Price Section */}
        <View style={styles.infoCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryBadge}>{auction.category.toUpperCase()}</Text>
            {auction.sellerCity && (
              <View style={styles.locationBadge}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.locationText}>{auction.sellerCity}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.titleText, isRtl && styles.titleTextRtl]}>{title}</Text>

          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>{t.currentBid}</Text>
              <Text style={styles.priceValue}>
                {auction.currentBidIqd.toLocaleString()} {t.currency}
              </Text>
            </View>
            <View style={styles.bidsCountBox}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.bidsCountText}>
                {auction.bidsCount} {isRtl ? 'مزايدة مسجلة' : 'bids'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Zeedo Trust & Doorstep Inspection Guarantee */}
        <View style={styles.guaranteeBox}>
          <View style={styles.guaranteeHeader}>
            <ShieldCheck size={20} color="#10B981" />
            <Text style={styles.guaranteeTitle}>
              {isRtl ? 'ضمان زيدو للمعانية عند الاستلام (COD)' : 'Zeedo Doorstep Inspection Guarantee'}
            </Text>
          </View>
          <Text style={styles.guaranteeBody}>
            {isRtl
              ? 'يحق لك فتح الطرد وفحص ومطابقة السلعة بالكامل أمام مندوب التوصيل في منزلك قبل دفع أي دينار. الدفع نقداً عند الاستلام فقط.'
              : 'Open and inspect the item completely at your doorstep with the courier before paying cash. 100% peace of mind.'}
          </Text>
        </View>

        {/* 5. Product Specs */}
        {auction.specs && auction.specs.length > 0 && (
          <View style={styles.specsCard}>
            <Text style={styles.sectionHeader}>{isRtl ? 'مواصفات السلعة' : 'Specifications'}</Text>
            <View style={styles.specsList}>
              {auction.specs.map((spec, i) => (
                <View key={i} style={styles.specItem}>
                  <CheckCircle2 size={15} color="#10B981" />
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 6. Item Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionHeader}>{isRtl ? 'تفاصيل السلعة' : 'Description'}</Text>
          <Text style={[styles.descriptionText, isRtl && styles.descriptionTextRtl]}>
            {description}
          </Text>
        </View>

        {/* 7. Live Room Bid History Ticker */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Flame size={18} color="#EF4444" />
            <Text style={styles.sectionHeader}>{isRtl ? 'سجل المزايدات الحية' : 'Live Bid Activity'}</Text>
          </View>
          <View style={styles.historyList}>
            {auction.bidsHistory && auction.bidsHistory.length > 0 ? (
              auction.bidsHistory.map((bid, index) => (
                <View
                  key={bid.bidId || index}
                  style={[styles.historyRow, index === 0 && styles.historyRowLeading]}
                >
                  <View style={styles.bidderInfo}>
                    <View style={[styles.bidderAvatar, index === 0 && styles.bidderAvatarLeading]}>
                      <Text style={styles.bidderAvatarText}>
                        {bid.bidderName ? bid.bidderName.charAt(0) : 'Z'}
                      </Text>
                    </View>
                    <View>
                      <View style={styles.bidderNameRow}>
                        <Text style={styles.bidderName}>{bid.bidderName}</Text>
                        {index === 0 && (
                          <View style={styles.leadingPill}>
                            <Text style={styles.leadingPillText}>
                              {isRtl ? 'المتصدر الحالي' : 'Leading'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.bidTime}>{bid.timestamp}</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.bidAmount,
                      index === 0 && styles.bidAmountLeading,
                    ]}
                  >
                    {bid.amountIqd.toLocaleString()} {t.currency}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noBidsText}>
                {isRtl ? 'كن أول من يفتتح المزاد!' : 'Be the first to place a bid!'}
              </Text>
            )}
          </View>
        </View>

        {/* Spacer for sticky bottom bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 8. Sticky Bottom Bidding Controller */}
      <View style={styles.bottomBar}>
        {/* Success Feedback Banner */}
        {bidSuccess && (
          <View style={styles.bidSuccessToast}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.bidSuccessToastText}>
              {isRtl
                ? `تم تسجيل مزايدتك بنجاح بقيمة ${auction.currentBidIqd.toLocaleString()} د.ع! أنت المتصدر الآن 🏆`
                : `Your bid of ${auction.currentBidIqd.toLocaleString()} IQD is placed! You are leading 🏆`}
            </Text>
          </View>
        )}

        {/* Error Feedback Banner */}
        {bidError ? (
          <View style={[styles.bidSuccessToast, { backgroundColor: '#EF4444' }]}>
            <AlertCircle size={16} color="#FFFFFF" />
            <Text style={styles.bidSuccessToastText}>{bidError}</Text>
          </View>
        ) : null}

        {/* Increment Selection Chips */}
        <View style={styles.chipsRow}>
          <Text style={styles.chipsLabel}>{isRtl ? 'اختر الزيادة:' : 'Increment:'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {increments.map((inc) => {
              const isSelected = selectedIncrement === inc;
              return (
                <TouchableOpacity
                  key={inc}
                  onPress={() => setSelectedIncrement(inc)}
                  style={[styles.incrementChip, isSelected && styles.incrementChipActive]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.incrementChipText,
                      isSelected && styles.incrementChipTextActive,
                    ]}
                  >
                    +{inc.toLocaleString()} {t.currency}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Big Action Bid Button */}
        <TouchableOpacity
          style={[styles.mainBidButton, isEnded && styles.mainBidButtonDisabled]}
          onPress={handlePlaceBid}
          disabled={isEnded}
          activeOpacity={0.85}
        >
          <View style={styles.bidButtonContent}>
            <Text style={styles.bidButtonText}>
              {isEnded
                ? (isRtl ? 'المزاد منتهي' : 'Auction Ended')
                : (isRtl ? `زايد الآن بـ ${nextBidAmountIqd.toLocaleString()} د.ع` : `Place Bid: ${nextBidAmountIqd.toLocaleString()} IQD`)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarRtl: {
    flexDirection: 'row-reverse',
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  liveIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollArea: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    width: '100%',
    height: width * 0.85,
    backgroundColor: '#FFFFFF',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dotActive: {
    width: 20,
    backgroundColor: AppTheme.colors.primary,
  },
  floatingTimer: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  floatingTimerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  antiSnipingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  antiSnipingText: {
    flex: 1,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: AppTheme.colors.primary,
    backgroundColor: '#FFF1F2',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 14,
  },
  titleTextRtl: {
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  bidsCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bidsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  guaranteeBox: {
    backgroundColor: '#ECFDF5',
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  guaranteeBody: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
    fontWeight: '500',
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  specsList: {
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  descriptionTextRtl: {
    textAlign: 'right',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  historyRowLeading: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bidderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidderAvatarLeading: {
    backgroundColor: '#3B82F6',
  },
  bidderAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bidderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bidderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  leadingPill: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  leadingPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E40AF',
  },
  bidTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  bidAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  bidAmountLeading: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  noBidsText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  bidSuccessToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  bidSuccessToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 8,
  },
  chipsScroll: {
    gap: 6,
  },
  incrementChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  incrementChipActive: {
    backgroundColor: '#FFF1F2',
    borderColor: AppTheme.colors.primary,
  },
  incrementChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  incrementChipTextActive: {
    color: AppTheme.colors.primary,
  },
  mainBidButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBidButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bidButtonContent: {
    alignItems: 'center',
  },
  bidButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
