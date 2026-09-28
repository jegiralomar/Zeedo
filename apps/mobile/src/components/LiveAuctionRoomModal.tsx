import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem, LanguageCode } from '../types';
import { isRTL } from '../i18n/translations';
import { AntiSnipingBanner } from './AntiSnipingBanner';
import { LiveBidTicker } from './LiveBidTicker';
import { SlideToBidSlider } from './SlideToBidSlider';
import { ProxyCeilingModal } from './ProxyCeilingModal';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sliders,
  Headphones,
  ShieldAlert,
} from 'lucide-react-native';

interface LiveAuctionRoomModalProps {
  visible: boolean;
  item: MobileAuctionItem | null;
  language: LanguageCode;
  myCeiling?: number;
  onPlaceBid: (auctionId: string) => boolean;
  onSetCeiling: (auctionId: string, ceilingIqd: number) => void;
  onRequestTwoGate: () => void;
  onRequestSupport?: () => void;
  isTwoGateVerified: boolean;
  onClose: () => void;
}

export const LiveAuctionRoomModal: React.FC<LiveAuctionRoomModalProps> = ({
  visible,
  item,
  language,
  myCeiling,
  onPlaceBid,
  onSetCeiling,
  onRequestTwoGate,
  onRequestSupport,
  isTwoGateVerified,
  onClose,
}) => {
  const [showCeilingModal, setShowCeilingModal] = useState(false);

  if (!item) return null;

  const rtl = isRTL(language);
  const localized = item.multilingual[language] || item.multilingual.en;

  const handleSlideBid = (): boolean => {
    if (!isTwoGateVerified) {
      onRequestTwoGate();
      return false;
    }
    return onPlaceBid(item.id);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={[styles.topBar, rtl && styles.rtlRow]}>
          <View style={[styles.navLeft, rtl && styles.rtlRow]}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.8}>
              {rtl ? (
                <ChevronRight size={18} color={TOKENS.colors.textPrimary} />
              ) : (
                <ChevronLeft size={18} color={TOKENS.colors.textPrimary} />
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.roomSubtitle}>
                {rtl ? 'ژووری زیادکردنی ڕاستەوخۆ' : 'Live Auction Room'}
              </Text>
              <Text numberOfLines={1} style={styles.roomTitle}>
                {localized.title}
              </Text>
            </View>
          </View>

          <View style={[styles.navRight, rtl && styles.rtlRow]}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>

            <TouchableOpacity
              style={styles.supportPill}
              onPress={onRequestSupport}
              activeOpacity={0.8}
            >
              <Headphones size={13} color={TOKENS.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Media Stage with Floating Card */}
          <View style={styles.heroStage}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Viewers Pill */}
            <View style={styles.viewersPill}>
              <Eye size={12} color="#FFFFFF" />
              <Text style={styles.viewersText}>1,420 watching</Text>
            </View>

            {/* Floating Porcelain Current Bid Card */}
            <View style={styles.floatingCard}>
              <Text numberOfLines={1} style={styles.floatingTitle}>
                {localized.title}
              </Text>

              <View style={[styles.bidDetailRow, rtl && styles.rtlRow]}>
                <View>
                  <Text style={styles.currentBidLabel}>
                    {rtl ? 'بەرزترین نرخ' : 'Current Winning Bid'}
                  </Text>
                  <Text style={styles.currentBidValue}>
                    {item.currentBidIqd.toLocaleString()} <Text style={styles.iqdTag}>IQD</Text>
                  </Text>
                </View>

                <View style={styles.leaderBox}>
                  <Text style={styles.leaderLabel}>
                    {rtl ? 'پێشەنگ' : 'Leading Bidder'}
                  </Text>
                  <View style={[styles.leaderTag, rtl && styles.rtlRow]}>
                    <CheckCircle2 size={13} color={TOKENS.colors.secondary} />
                    <Text style={styles.leaderName}>
                      {item.highestBidder?.name || 'Opening Bid'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Anti-Sniping Soft-Close Banner */}
          <AntiSnipingBanner
            endTime={item.auctionEndsAt}
            incrementStepIqd={item.incrementStepIqd}
            isRtl={rtl}
          />

          {/* Verification Notice Banner if unverified */}
          {!isTwoGateVerified && (
            <TouchableOpacity
              style={styles.unverifiedBanner}
              onPress={onRequestTwoGate}
              activeOpacity={0.85}
            >
              <ShieldAlert size={18} color={TOKENS.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.unverifiedTitle}>
                  {rtl ? 'پشتڕاستکردنەوە پێویستە' : 'Verification Required to Bid'}
                </Text>
                <Text style={styles.unverifiedSub}>
                  {rtl
                    ? 'پێناس + دیاریکردنی سەربان لەسەر نەخشە تەواو بکە بۆ ئەوەی ڕێگەت پێبدرێت.'
                    : 'Civil ID + Rooftop Map Pin required to slide and place live bids.'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Live Activity Ticker */}
          <LiveBidTicker bids={item.bidsHistory} isRtl={rtl} />

          {/* Specification Card */}
          {localized.specs && (
            <View style={styles.specsCard}>
              <Text style={styles.specsTitle}>
                {rtl ? 'تایبەتمەندییە فەرمییەکان' : 'Verified Specifications'}
              </Text>
              <View style={styles.specsGrid}>
                {localized.specs.map((s, i) => (
                  <View key={i} style={[styles.specLine, rtl && styles.rtlRow]}>
                    <View style={styles.specDot} />
                    <Text style={styles.specLineText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Pinned Bottom Action Dock */}
        <View style={styles.bottomDock}>
          {/* Proxy Ceiling Status & Trigger */}
          <View style={[styles.ceilingRow, rtl && styles.rtlRow]}>
            <Text style={styles.ceilingText}>
              {rtl ? 'سنووری خۆکاری تۆ:' : 'Your Auto-Bid Ceiling:'}{' '}
              <Text style={styles.ceilingAmount}>
                {myCeiling ? `${myCeiling.toLocaleString()} IQD` : 'None'}
              </Text>
            </Text>

            <TouchableOpacity
              style={styles.tuneBtn}
              onPress={() => setShowCeilingModal(true)}
              activeOpacity={0.7}
            >
              <Sliders size={13} color={TOKENS.colors.primary} />
              <Text style={styles.tuneBtnText}>
                {rtl ? 'ڕێکخستنی سنور' : 'Set Ceiling'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slide-to-Bid Slider */}
          <SlideToBidSlider
            currentBidIqd={item.currentBidIqd}
            incrementStepIqd={item.incrementStepIqd}
            onBidConfirmed={() => { handleSlideBid(); }}
            disabled={item.status !== 'live'}
            isRTL={rtl}
          />
        </View>

        {/* Proxy Ceiling Modal */}
        <ProxyCeilingModal
          visible={showCeilingModal}
          currentBidIqd={item.currentBidIqd}
          estimatedRetailIqd={item.estimatedRetailMarketPriceIqd}
          initialCeiling={myCeiling}
          onSave={(ceiling) => onSetCeiling(item.id, ceiling)}
          onClose={() => setShowCeilingModal(false)}
          isRtl={rtl}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  topBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.cardBorder,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    maxWidth: 190,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TOKENS.colors.accent,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: TOKENS.colors.accent,
  },
  supportPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: TOKENS.spacing.md,
    paddingBottom: 170,
    gap: 10,
  },
  heroStage: {
    height: 270,
    borderRadius: TOKENS.borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    ...TOKENS.shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  viewersPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
  },
  viewersText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  floatingCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    ...TOKENS.shadows.card,
  },
  floatingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    marginBottom: 6,
  },
  bidDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  currentBidLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  currentBidValue: {
    fontSize: 22,
    fontWeight: '900',
    color: TOKENS.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  iqdTag: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  leaderBox: {
    alignItems: 'flex-end',
  },
  leaderLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  leaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  leaderName: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  unverifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
  },
  unverifiedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  unverifiedSub: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  specsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  specsGrid: {
    gap: 6,
  },
  specLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: TOKENS.colors.primary,
  },
  specLineText: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: TOKENS.spacing.md,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.cardBorder,
    gap: 6,
    ...TOKENS.shadows.floatingBar,
  },
  ceilingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  ceilingText: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
  },
  ceilingAmount: {
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  tuneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tuneBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
});
