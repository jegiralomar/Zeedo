import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SlideToBidSlider } from './SlideToBidSlider';
import { MobileAuctionItem } from './AuctionCard';
import { EviraTheme } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LiveAuctionRoomModalProps {
  visible: boolean;
  item: MobileAuctionItem | null;
  onClose: () => void;
  onPlaceBid: (item: MobileAuctionItem, customIncrement?: number) => void;
  language: 'ckb' | 'badini' | 'ar' | 'en';
  isLeading?: boolean;
}

export const LiveAuctionRoomModal: React.FC<LiveAuctionRoomModalProps> = ({
  visible,
  item,
  onClose,
  onPlaceBid,
  isLeading = false,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, isUrgent: false, isExpired: false });

  useEffect(() => {
    if (!item?.endsAt) return;

    const calcTime = () => {
      const now = Date.now();
      const diff = new Date(item.endsAt).getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, isUrgent: false, isExpired: true });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      setTimeLeft({
        h,
        m,
        s,
        isUrgent: diff <= 120000,
        isExpired: false,
      });
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [item?.endsAt]);

  if (!item) return null;

  const photos =
    item.photos && item.photos.length > 0
      ? item.photos
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

  const nextBidAmount = item.currentBid + item.bidIncrement;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconCircle}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.topBarTitle} numberOfLines={1}>
            {item.category.toUpperCase()}
          </Text>

          <TouchableOpacity
            onPress={() => setIsSaved(!isSaved)}
            style={[styles.iconCircle, isSaved && styles.iconCircleActive]}
          >
            <Text style={[styles.iconText, isSaved && styles.iconTextActive]}>
              {isSaved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Evira Soft-Gray Hero Image Box */}
          <View style={styles.heroImageBox}>
            <Image
              source={{ uri: photos[selectedPhotoIndex] || photos[0] }}
              style={styles.heroImage}
              resizeMode="contain"
            />

            {/* Condition Pill */}
            <View style={styles.conditionPill}>
              <Text style={styles.conditionPillText}>{item.condition || 'Brand New'}</Text>
            </View>

            {/* Carousel Dots */}
            {photos.length > 1 && (
              <View style={styles.dotsRow}>
                {photos.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      selectedPhotoIndex === i && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Thumbnails Row if multiple photos */}
          {photos.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
              {photos.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedPhotoIndex(idx)}
                  style={[
                    styles.thumbBox,
                    selectedPhotoIndex === idx && styles.thumbBoxActive,
                  ]}
                >
                  <Image source={{ uri: p }} style={styles.thumbImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Product Details Section */}
          <View style={styles.detailsContent}>
            {/* Title */}
            <Text style={styles.productTitle}>{item.title}</Text>

            {/* Rating & Review Meta */}
            <View style={styles.metaRow}>
              <Text style={styles.starText}>★ 4.8</Text>
              <Text style={styles.metaReviews}>(240 reviews)</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.totalBidsCount}>{item.totalBids} bids placed</Text>
            </View>

            {/* Leading Status Indicator */}
            {isLeading && (
              <View style={styles.leadingBanner}>
                <Text style={styles.leadingBannerText}>🟢 You are the current highest bidder!</Text>
              </View>
            )}

            {/* Evira Countdown Timer Card */}
            <View style={styles.timerCard}>
              <View style={styles.timerLeft}>
                <Text style={styles.timerCardLabel}>TIME REMAINING</Text>
                <View style={styles.clockRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeDigit}>{String(timeLeft.h).padStart(2, '0')}</Text>
                    <Text style={styles.timeUnit}>hrs</Text>
                  </View>
                  <Text style={styles.colon}>:</Text>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeDigit}>{String(timeLeft.m).padStart(2, '0')}</Text>
                    <Text style={styles.timeUnit}>min</Text>
                  </View>
                  <Text style={styles.colon}>:</Text>
                  <View style={[styles.timeBlock, timeLeft.isUrgent && styles.timeBlockUrgent]}>
                    <Text style={[styles.timeDigit, timeLeft.isUrgent && styles.timeDigitUrgent]}>
                      {String(timeLeft.s).padStart(2, '0')}
                    </Text>
                    <Text style={styles.timeUnit}>sec</Text>
                  </View>
                </View>
              </View>

              <View style={styles.snipingInfo}>
                <View style={styles.snipingTag}>
                  <Text style={styles.snipingTagText}>🛡️ Anti-Sniping</Text>
                </View>
                <Text style={styles.snipingSub}>+60s soft close if bid in last minute</Text>
              </View>
            </View>

            {/* Description & Guarantee */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeading}>Description</Text>
              <Text style={styles.descriptionText}>
                Authentic item sourced directly from verified Iraqi merchants. Includes full accessories, manufacturer seals, and eligible for 100% Cash-on-Delivery inspection before signing with courier.
              </Text>
            </View>

            <View style={styles.guaranteeTile}>
              <Text style={styles.guaranteeIcon}>📦</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>100% Open Box Inspection</Text>
                <Text style={styles.guaranteeSub}>
                  Courier will wait while you inspect the lot before paying cash.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Evira Sticky Bottom Action Bar */}
        <View style={styles.stickyFooter}>
          <View style={styles.footerPriceRow}>
            <View>
              <Text style={styles.footerPriceLabel}>Current Leading Bid</Text>
              <Text style={styles.footerPriceValue}>
                {item.currentBid.toLocaleString()} IQD
              </Text>
            </View>

            <View style={styles.incrementBadge}>
              <Text style={styles.incrementBadgeText}>
                +{(item.bidIncrement || 1000).toLocaleString()} IQD Step
              </Text>
            </View>
          </View>

          <SlideToBidSlider
            bidAmount={nextBidAmount}
            onBidConfirmed={() => onPlaceBid(item)}
            label={`Slide to Bid ${nextBidAmount.toLocaleString()} IQD ➔`}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EviraTheme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: EviraTheme.colors.borderLight,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: '#FEE2E2',
  },
  iconText: {
    fontSize: 18,
    color: EviraTheme.colors.textPrimary,
  },
  iconTextActive: {
    color: EviraTheme.colors.liveRed,
  },
  topBarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: EviraTheme.colors.textTertiary,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  heroImageBox: {
    width: SCREEN_WIDTH - 32,
    height: 280,
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xxl,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '88%',
    height: '88%',
  },
  conditionPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: EviraTheme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: EviraTheme.radii.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: EviraTheme.colors.border,
  },
  dotActive: {
    width: 16,
    backgroundColor: EviraTheme.colors.primary,
  },
  thumbsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: EviraTheme.radii.md,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbBoxActive: {
    borderColor: EviraTheme.colors.primary,
  },
  thumbImage: {
    width: '80%',
    height: '80%',
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  starText: {
    fontSize: 13,
    fontWeight: '800',
    color: EviraTheme.colors.starGold,
  },
  metaReviews: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    fontWeight: '500',
  },
  metaDivider: {
    color: EviraTheme.colors.textTertiary,
  },
  totalBidsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: EviraTheme.colors.textPrimary,
  },
  leadingBanner: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: EviraTheme.radii.md,
    marginBottom: 16,
  },
  leadingBannerText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  timerCard: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timerLeft: {
    flex: 1,
  },
  timerCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: EviraTheme.colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeBlock: {
    backgroundColor: EviraTheme.colors.card,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  timeBlockUrgent: {
    backgroundColor: EviraTheme.colors.liveRed,
  },
  timeDigit: {
    fontSize: 15,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
  },
  timeDigitUrgent: {
    color: EviraTheme.colors.textWhite,
  },
  timeUnit: {
    fontSize: 8,
    color: EviraTheme.colors.textTertiary,
    fontWeight: '700',
    marginTop: 1,
  },
  colon: {
    fontSize: 14,
    fontWeight: '800',
    color: EviraTheme.colors.textTertiary,
  },
  snipingInfo: {
    alignItems: 'flex-end',
    maxWidth: 130,
  },
  snipingTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  snipingTagText: {
    color: EviraTheme.colors.accentGold,
    fontSize: 10,
    fontWeight: '800',
  },
  snipingSub: {
    fontSize: 9,
    color: EviraTheme.colors.textSecondary,
    textAlign: 'right',
    lineHeight: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: EviraTheme.colors.textSecondary,
    lineHeight: 20,
  },
  guaranteeTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    padding: 14,
    gap: 12,
  },
  guaranteeIcon: {
    fontSize: 22,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 2,
  },
  guaranteeSub: {
    fontSize: 11,
    color: EviraTheme.colors.textSecondary,
  },
  stickyFooter: {
    backgroundColor: EviraTheme.colors.background,
    borderTopWidth: 1,
    borderTopColor: EviraTheme.colors.borderLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPriceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: EviraTheme.colors.textTertiary,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
  },
  incrementBadge: {
    backgroundColor: EviraTheme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: EviraTheme.radii.full,
  },
  incrementBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
});
