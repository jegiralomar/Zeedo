import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem, LanguageCode } from '../types';
import { isRTL } from '../i18n/translations';
import {
  Gavel,
  ShieldCheck,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Flame,
  Radio,
  Timer,
} from 'lucide-react-native';

interface ListingCardRtlProps {
  item: MobileAuctionItem;
  language: LanguageCode;
  isSaved?: boolean;
  onSelect: (item: MobileAuctionItem) => void;
  onBookmark?: (item: MobileAuctionItem) => void;
}

export const ListingCardRtl: React.FC<ListingCardRtlProps> = ({
  item,
  language,
  isSaved = false,
  onSelect,
  onBookmark,
}) => {
  const rtl = isRTL(language);
  const localized = item.multilingual[language] || item.multilingual.en;

  const getDialectBadgeText = () => {
    switch (language) {
      case 'badini':
        return 'بادینی (RTL)';
      case 'ckb':
        return 'سۆرانی (RTL)';
      case 'ar':
        return 'عربي (RTL)';
      default:
        return 'English';
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Product Image Stage with 22px corners */}
      <View style={styles.imageStage}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges Overlay */}
        <View style={[styles.topBadgesRow, rtl && styles.rtlRow]}>
          {/* Dialect / Condition Pill */}
          <View style={styles.frostedPill}>
            <Text style={styles.frostedPillText}>{getDialectBadgeText()}</Text>
          </View>

          {/* Live / Soft-Close Status Pill */}
          {item.isAntiSnipingActive ? (
            <View style={styles.urgentPill}>
              <Timer size={11} color="#ffffff" />
              <Text style={styles.urgentPillText}>SOFT CLOSE</Text>
            </View>
          ) : (
            <View style={styles.livePill}>
              <View style={styles.livePulseDot} />
              <Text style={styles.livePillText}>LIVE NOW</Text>
            </View>
          )}
        </View>

        {/* Floating Price Pill Over Image */}
        <View style={[styles.floatingPriceBox, rtl ? styles.priceBoxRight : styles.priceBoxLeft]}>
          <Text style={styles.priceLabel}>
            {rtl ? 'بەرزترین نرخ' : 'Current Bid'}
          </Text>
          <View style={[styles.priceInline, rtl && styles.rtlRow]}>
            <Text style={styles.priceNumber}>{item.currentBidIqd.toLocaleString()}</Text>
            <Text style={styles.priceUnit}>IQD</Text>
          </View>
        </View>

        {/* Verified Badge Icon */}
        <View style={[styles.verifiedTag, rtl ? styles.verifiedTagLeft : styles.verifiedTagRight]}>
          <ShieldCheck size={12} color={TOKENS.colors.secondary} />
          <Text style={styles.verifiedTagText}>
            {rtl ? 'ڕەسەن' : 'Verified'}
          </Text>
        </View>
      </View>

      {/* Content Body */}
      <View style={styles.contentBody}>
        {/* Title */}
        <Text style={[styles.itemTitle, rtl && styles.alignRight]} numberOfLines={2}>
          {localized.title}
        </Text>

        {/* Description */}
        <Text
          numberOfLines={2}
          style={[styles.itemDescription, rtl && styles.alignRight]}
        >
          {localized.description}
        </Text>

        {/* Modern Pill Chips for Specifications */}
        {localized.specs && localized.specs.length > 0 && (
          <View style={[styles.specsPillsRow, rtl && styles.rtlRow]}>
            {localized.specs.slice(0, 3).map((spec, idx) => (
              <View key={idx} style={styles.specChip}>
                <View style={styles.specDot} />
                <Text style={styles.specChipText} numberOfLines={1}>{spec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Footer */}
        <View style={[styles.footerRow, rtl && styles.rtlRow]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => onSelect(item)}
            activeOpacity={0.88}
          >
            <Gavel size={16} color="#ffffff" />
            <Text style={styles.ctaButtonText}>
              {rtl ? 'بەشداری لە زیادکردن' : 'Enter Live Auction'}
            </Text>
            {rtl ? (
              <ChevronLeft size={16} color="#ffffff" />
            ) : (
              <ChevronRight size={16} color="#ffffff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookmarkButton, isSaved && styles.bookmarkButtonActive]}
            onPress={() => onBookmark && onBookmark(item)}
            activeOpacity={0.7}
          >
            <Bookmark
              size={18}
              color={isSaved ? TOKENS.colors.primary : TOKENS.colors.textSecondary}
              fill={isSaved ? TOKENS.colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  imageStage: {
    height: 195,
    width: '100%',
    backgroundColor: TOKENS.colors.cardMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  frostedPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
  },
  frostedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  livePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.accent,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
  },
  urgentPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingPriceBox: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.lg,
    ...TOKENS.shadows.card,
  },
  priceBoxLeft: {
    left: 12,
  },
  priceBoxRight: {
    right: 12,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
  },
  priceInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  priceNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  priceUnit: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.textSecondary,
  },
  verifiedTag: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
  },
  verifiedTagLeft: {
    left: 12,
  },
  verifiedTagRight: {
    right: 12,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  contentBody: {
    padding: TOKENS.spacing.md,
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    lineHeight: 21,
  },
  alignRight: {
    textAlign: 'right',
  },
  itemDescription: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    lineHeight: 17,
  },
  specsPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.cardMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.md,
    maxWidth: '48%',
  },
  specDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TOKENS.colors.primary,
  },
  specChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: TOKENS.colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: TOKENS.colors.primary,
    height: 44,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  bookmarkButtonActive: {
    backgroundColor: TOKENS.colors.primaryLight,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
});
