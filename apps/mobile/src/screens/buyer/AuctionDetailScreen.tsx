import React, { useState } from 'react';
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
  ShoppingBag,
  Star,
  ShieldCheck,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Building2,
  Truck,
  RotateCcw,
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
    addWonOrder,
    setActiveScreen,
  } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const auction = auctions.find((a) => a.id === selectedAuctionId) || auctions[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedIncrement, setSelectedIncrement] = useState(auction.incrementStepIqd);
  const [bidSuccess, setBidSuccess] = useState(false);

  if (!auction) return null;

  const title = isRtl && auction.titleAr ? auction.titleAr : auction.title;
  const description = isRtl && auction.descriptionAr ? auction.descriptionAr : auction.description;

  const nextBidAmountIqd = auction.currentBidIqd + selectedIncrement;

  const handlePlaceBid = () => {
    placeBid(auction.id, nextBidAmountIqd);
    setBidSuccess(true);
    setTimeout(() => setBidSuccess(false), 3000);
  };

  const handleInstantBuy = () => {
    addWonOrder({
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      auctionId: auction.id,
      title,
      image: auction.images[0],
      winningBidUsd: auction.currentBidUsd,
      winningBidIqd: auction.currentBidIqd,
      deliveryCity: 'بغداد - المنصور',
      addressText: 'شارع فلسطين، قرب مجسر النخلة',
      awbNumber: `AWB-IQ-${Date.now().toString().slice(-5)}`,
      codStatus: 'ready_for_dispatch',
      placedAt: 'الآن',
    });
    setActiveScreen('checkout');
  };

  return (
    <View style={styles.container}>
      {/* Top Bar (Matching Shop page.jpg) */}
      <View style={[styles.topBar, isRtl && styles.topBarRtl]}>
        <TouchableOpacity
          onPress={() => setSelectedAuctionId(null)}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={AppTheme.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          {auction.category.toUpperCase()}
        </Text>

        <TouchableOpacity
          onPress={() => setActiveScreen('won_lots')}
          style={styles.cartButton}
          activeOpacity={0.7}
        >
          <ShoppingBag size={20} color={AppTheme.colors.textPrimary} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>1</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Image Gallery Carousel (Matching Shop page.jpg) */}
        <View style={styles.carouselContainer}>
          <Image source={{ uri: auction.images[activeImageIndex] || auction.images[0] }} style={styles.mainImage} />

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {auction.images.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveImageIndex(idx)}
                style={[
                  styles.dot,
                  activeImageIndex === idx && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {/* Anti-Sniping Soft-Close Banner */}
          <View style={styles.snipingAlert}>
            <Flame size={16} color={AppTheme.colors.primary} />
            <Text style={[styles.snipingAlertText, isRtl && styles.textRtl]}>
              {t.antiSnipingNotice}
            </Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, isRtl && styles.textRtl]}>{title}</Text>
          <Text style={[styles.sellerSub, isRtl && styles.textRtl]}>
            {auction.sellerName} • {auction.sellerCity}
          </Text>

          {/* Star Rating & Reviews */}
          <View style={[styles.ratingRow, isRtl && styles.ratingRowRtl]}>
            <Star size={14} color={AppTheme.colors.star} fill={AppTheme.colors.star} />
            <Text style={styles.ratingText}>{auction.rating}</Text>
            <Text style={styles.reviewCount}>({auction.reviewCount} {isRtl ? 'تقييم موثق' : 'reviews'})</Text>
          </View>

          {/* Pricing Row (Matching Shop page.jpg) */}
          <View style={[styles.priceContainer, isRtl && styles.priceContainerRtl]}>
            <View>
              <Text style={styles.priceLabel}>{t.currentBid}</Text>
              <Text style={styles.currentBidIqd}>
                {auction.currentBidIqd.toLocaleString()} د.ع
              </Text>
              <Text style={styles.currentBidUsd}>
                ≈ ${auction.currentBidUsd} USD
              </Text>
            </View>

            <View style={styles.retailBox}>
              <Text style={styles.retailLabel}>{t.retailPrice}</Text>
              <Text style={styles.retailPriceStrikethrough}>
                ${auction.retailPriceUsd}
              </Text>
              <View style={styles.offBadge}>
                <Text style={styles.offBadgeText}>45% {t.off}</Text>
              </View>
            </View>
          </View>

          {/* Bid Increment Step Selector */}
          <View style={styles.incrementSection}>
            <Text style={[styles.sectionLabel, isRtl && styles.textRtl]}>
              {isRtl ? 'اختر زيادة العطاء القادمة:' : 'Select Next Bid Step:'}
            </Text>
            <View style={[styles.incrementRow, isRtl && styles.incrementRowRtl]}>
              {[auction.incrementStepIqd, auction.incrementStepIqd * 2, auction.incrementStepIqd * 5].map((step) => (
                <TouchableOpacity
                  key={step}
                  onPress={() => setSelectedIncrement(step)}
                  style={[
                    styles.incrementPill,
                    selectedIncrement === step && styles.incrementPillActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.incrementPillText,
                      selectedIncrement === step && styles.incrementPillTextActive,
                    ]}
                  >
                    +{step.toLocaleString()} د.ع
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Verification Badges (From Shop page.jpg) */}
          <View style={[styles.badgeBar, isRtl && styles.badgeBarRtl]}>
            <View style={styles.badgeItem}>
              <Building2 size={13} color={AppTheme.colors.textMuted} />
              <Text style={styles.badgeItemText}>{t.nearestStore}</Text>
            </View>
            <View style={styles.badgeItem}>
              <ShieldCheck size={13} color={AppTheme.colors.primary} />
              <Text style={styles.badgeItemText}>{t.vipVerified}</Text>
            </View>
            <View style={styles.badgeItem}>
              <RotateCcw size={13} color={AppTheme.colors.green} />
              <Text style={styles.badgeItemText}>{t.returnPolicy}</Text>
            </View>
          </View>

          {/* Delivery In 1 Hour / Doorstep COD Banner (Pink box from Shop page.jpg) */}
          <View style={styles.deliveryBox}>
            <Truck size={20} color={AppTheme.colors.primary} />
            <View style={styles.deliveryBoxContent}>
              <Text style={styles.deliveryBoxTitle}>
                {isRtl ? 'التوصيل لجميع المحافظات خلال 24 - 48 ساعة' : 'Delivery Across Iraq in 24-48 Hours'}
              </Text>
              <Text style={styles.deliveryBoxSub}>
                {isRtl ? 'فحص ومعاينة وتشغيل عند الباب قبل تسليم المبلغ' : 'Doorstep inspection before paying cash'}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Go to Cart (Blue) + 1-Tap Fast Bid (Green) */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              onPress={handleInstantBuy}
              style={styles.cartCta}
              activeOpacity={0.85}
            >
              <ShoppingBag size={18} color="#FFFFFF" />
              <Text style={styles.cartCtaText}>{t.buyNow}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlaceBid}
              style={styles.bidCta}
              activeOpacity={0.85}
            >
              <Flame size={18} color="#FFFFFF" />
              <Text style={styles.bidCtaText}>
                {t.placeBid} (+{selectedIncrement.toLocaleString()})
              </Text>
            </TouchableOpacity>
          </View>

          {bidSuccess && (
            <View style={styles.successNotice}>
              <CheckCircle2 size={16} color={AppTheme.colors.green} />
              <Text style={styles.successNoticeText}>
                {isRtl ? 'تم رفع عطائك وتصدرت المزاد بنجاح!' : 'Bid placed successfully! You are highest bidder.'}
              </Text>
            </View>
          )}

          {/* Specifications */}
          <View style={styles.specsSection}>
            <Text style={[styles.sectionTitle, isRtl && styles.textRtl]}>{t.productDetails}</Text>
            <Text style={[styles.descriptionText, isRtl && styles.textRtl]}>{description}</Text>

            <View style={styles.specsList}>
              {auction.specs.map((spec, i) => (
                <View key={i} style={[styles.specRow, isRtl && styles.specRowRtl]}>
                  <View style={styles.specDot} />
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Live Bids History */}
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, isRtl && styles.textRtl]}>{t.bidHistory}</Text>
            <View style={styles.historyCard}>
              {auction.bidsHistory.map((bid, i) => (
                <View key={bid.bidId} style={[styles.historyRow, i > 0 && styles.historyBorder]}>
                  <View>
                    <Text style={styles.bidderName}>{bid.bidderName}</Text>
                    <Text style={styles.bidTime}>{bid.timestamp}</Text>
                  </View>
                  <Text style={styles.historyBidAmount}>
                    {bid.amountIqd.toLocaleString()} د.ع
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  topBarRtl: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    letterSpacing: 1,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scroll: {
    flex: 1,
  },
  carouselContainer: {
    width,
    height: 300,
    backgroundColor: AppTheme.colors.surface,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dotsRow: {
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
    backgroundColor: '#FFFFFF66',
  },
  dotActive: {
    backgroundColor: AppTheme.colors.primary,
    width: 20,
  },
  detailsContainer: {
    padding: 16,
  },
  snipingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AppTheme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FFE4E8',
    borderRadius: AppTheme.radius.md,
    padding: 10,
    marginBottom: 12,
  },
  snipingAlertText: {
    fontSize: 11,
    color: AppTheme.colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 4,
  },
  sellerSub: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  ratingRowRtl: {
    flexDirection: 'row-reverse',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  reviewCount: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    padding: 14,
    borderRadius: AppTheme.radius.md,
    marginBottom: 16,
  },
  priceContainerRtl: {
    flexDirection: 'row-reverse',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: AppTheme.colors.textMuted,
  },
  currentBidIqd: {
    fontSize: 20,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  currentBidUsd: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
  },
  retailBox: {
    alignItems: 'flex-end',
  },
  retailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: AppTheme.colors.textMuted,
  },
  retailPriceStrikethrough: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  offBadge: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  offBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  incrementSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    marginBottom: 8,
  },
  incrementRow: {
    flexDirection: 'row',
    gap: 8,
  },
  incrementRowRtl: {
    flexDirection: 'row-reverse',
  },
  incrementPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 8,
    borderRadius: AppTheme.radius.sm,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  incrementPillActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: AppTheme.colors.primaryLight,
  },
  incrementPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  incrementPillTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '900',
  },
  badgeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 16,
  },
  badgeBarRtl: {
    flexDirection: 'row-reverse',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeItemText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  deliveryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF1F3',
    padding: 12,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: '#FFE4E8',
    marginBottom: 16,
  },
  deliveryBoxContent: {
    flex: 1,
  },
  deliveryBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  deliveryBoxSub: {
    fontSize: 10,
    color: '#D81B43',
    marginTop: 2,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  cartCta: {
    flex: 1,
    backgroundColor: AppTheme.colors.secondary,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cartCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  bidCta: {
    flex: 1.5,
    backgroundColor: AppTheme.colors.green,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bidCtaText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  successNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.greenLight,
    padding: 10,
    borderRadius: AppTheme.radius.sm,
    marginBottom: 16,
  },
  successNoticeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  specsSection: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  specsList: {
    gap: 6,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specRowRtl: {
    flexDirection: 'row-reverse',
  },
  specDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: AppTheme.colors.primary,
  },
  specText: {
    fontSize: 11,
    color: AppTheme.colors.textPrimary,
    fontWeight: '600',
  },
  historySection: {
    marginTop: 12,
  },
  historyCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    padding: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  historyBorder: {
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  bidderName: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  bidTime: {
    fontSize: 9,
    color: AppTheme.colors.textMuted,
  },
  historyBidAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  textRtl: {
    textAlign: 'right',
  },
});
