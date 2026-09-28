import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem, LanguageCode } from '../types';
import { isRTL } from '../i18n/translations';
import { Gavel, ShieldCheck, Timer, Bookmark } from 'lucide-react-native';

interface CompactListingCardProps {
  item: MobileAuctionItem;
  language: LanguageCode;
  isSaved?: boolean;
  onSelect: (item: MobileAuctionItem) => void;
  onBookmark?: (item: MobileAuctionItem) => void;
}

export const CompactListingCard: React.FC<CompactListingCardProps> = ({
  item,
  language,
  isSaved = false,
  onSelect,
  onBookmark,
}) => {
  const rtl = isRTL(language);
  const localized = item.multilingual[language] || item.multilingual.en;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(item)}
      activeOpacity={0.88}
    >
      {/* 1:1 Aspect Image Stage with rounded corners */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Floating Badge */}
        <View style={[styles.topBadgeRow, rtl && styles.rtlRow]}>
          {item.isAntiSnipingActive ? (
            <View style={styles.urgentPill}>
              <Timer size={10} color="#FFFFFF" />
              <Text style={styles.urgentText}>SOFT CLOSE</Text>
            </View>
          ) : (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}

          <View style={styles.topRightActions}>
            {onBookmark && (
              <TouchableOpacity
                style={[styles.bookmarkDot, isSaved && styles.bookmarkDotActive]}
                onPress={() => onBookmark(item)}
                activeOpacity={0.75}
              >
                <Bookmark
                  size={10}
                  color={isSaved ? TOKENS.colors.primary : TOKENS.colors.textSecondary}
                  fill={isSaved ? TOKENS.colors.primary : 'transparent'}
                />
              </TouchableOpacity>
            )}

            <View style={styles.verifiedDot}>
              <ShieldCheck size={11} color={TOKENS.colors.secondary} />
            </View>
          </View>
        </View>

        {/* Floating Price Pill */}
        <View style={[styles.priceTag, rtl ? styles.priceRight : styles.priceLeft]}>
          <Text style={styles.priceAmount}>{item.currentBidIqd.toLocaleString()}</Text>
          <Text style={styles.priceCurrency}>IQD</Text>
        </View>
      </View>

      {/* Info Body */}
      <View style={styles.infoBody}>
        <Text numberOfLines={2} style={[styles.title, rtl && styles.textRight]}>
          {localized.title}
        </Text>

        <View style={[styles.subRow, rtl && styles.rtlRow]}>
          <Text style={styles.conditionText}>{item.condition}</Text>
          <Text style={styles.bidsText}>{item.totalBids} bids</Text>
        </View>

        {/* Compact 1-Tap CTA Pill */}
        <TouchableOpacity
          style={styles.bidBtn}
          onPress={() => onSelect(item)}
          activeOpacity={0.8}
        >
          <Gavel size={13} color="#FFFFFF" />
          <Text style={styles.bidBtnText}>
            {rtl ? 'موزایەدە' : 'Bid Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    margin: 4,
    ...TOKENS.shadows.card,
  },
  imageBox: {
    width: '100%',
    height: 130,
    backgroundColor: TOKENS.colors.cardMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: TOKENS.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  urgentText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookmarkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  bookmarkDotActive: {
    backgroundColor: TOKENS.colors.primaryLight,
    borderColor: TOKENS.colors.primary,
  },
  verifiedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    ...TOKENS.shadows.card,
  },
  priceLeft: {
    left: 6,
  },
  priceRight: {
    right: 6,
  },
  priceAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: TOKENS.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  priceCurrency: {
    fontSize: 8,
    fontWeight: '800',
    color: TOKENS.colors.textSecondary,
  },
  infoBody: {
    padding: 8,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    lineHeight: 16,
    height: 32,
  },
  textRight: {
    textAlign: 'right',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionText: {
    fontSize: 9,
    fontWeight: '600',
    color: TOKENS.colors.textMuted,
  },
  bidsText: {
    fontSize: 9,
    color: TOKENS.colors.primary,
    fontWeight: '700',
  },
  bidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.primary,
    height: 32,
    borderRadius: TOKENS.borderRadius.full,
    marginTop: 4,
    ...TOKENS.shadows.glowPrimary,
  },
  bidBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
