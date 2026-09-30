import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SlideToBidSlider } from './SlideToBidSlider';
import { MobileAuctionItem } from './AuctionCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BidRecord {
  id: string;
  bidderId: string;
  bidderName: string;
  amountIqd: number;
  timestamp: string;
}

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
  language,
  isLeading = false,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);
  const [autoBidCeiling, setAutoBidCeiling] = useState('');
  const [savedCeiling, setSavedCeiling] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, isUrgent: false, isExpired: false });

  // Countdown Calculation
  useEffect(() => {
    if (!item?.endsAt) return;

    const calcTime = () => {
      const now = Date.now();
      const diff = new Date(item.endsAt).getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, isUrgent: false, isExpired: true });
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;

      setTimeLeft({
        h,
        m,
        s,
        isUrgent: diff <= 60000 && diff > 0,
        isExpired: false,
      });
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [item?.endsAt]);

  if (!item) return null;

  const photos =
    item.photos && item.photos.length > 0
      ? item.photos
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const nextBid = item.currentBid + item.bidIncrement;

  const handleBidConfirm = async (inc?: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onPlaceBid(item, inc);
  };

  const handleSaveAutoBid = () => {
    const val = parseInt(autoBidCeiling.replace(/\D/g, ''), 10);
    if (val && val > item.currentBid) {
      setSavedCeiling(val);
      setShowAutoBidModal(false);
      Alert.alert(
        'Auto-Bid Set',
        `ZEEDO will automatically counter-bid in +1,000 IQD steps up to ${val.toLocaleString()} IQD.`
      );
    } else {
      Alert.alert('Invalid Ceiling', `Ceiling must be greater than current bid (${item.currentBid.toLocaleString()} IQD).`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerCategory}>{item.category.toUpperCase()}</Text>
            <Text style={styles.headerId}>#{item.id.slice(-6)}</Text>
          </View>
          <View style={styles.liveIndicatorPill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Main Photo Viewer */}
          <View style={styles.photoContainer}>
            <Image source={{ uri: photos[selectedPhotoIndex] }} style={styles.mainImage} resizeMode="contain" />

            {/* Anti-Sniping Soft-Close Indicator */}
            <View style={[styles.timerBadge, timeLeft.isUrgent && styles.timerBadgeUrgent]}>
              <Text style={[styles.timerText, timeLeft.isUrgent && styles.timerTextUrgent]}>
                {timeLeft.isExpired
                  ? 'AUCTION CONCLUDED'
                  : timeLeft.isUrgent
                  ? `⚡ SOFT-CLOSE: ${timeLeft.s}s (≤60s RESET)`
                  : `⏱ ${String(timeLeft.h).padStart(2, '0')}:${String(timeLeft.m).padStart(2, '0')}:${String(timeLeft.s).padStart(2, '0')}`}
              </Text>
            </View>

            {/* Condition Pill */}
            <View style={styles.conditionPill}>
              <Text style={styles.conditionText}>{item.condition || 'Brand New'}</Text>
            </View>
          </View>

          {/* Photo Thumbnails */}
          {photos.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
              {photos.map((ph, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedPhotoIndex(idx)}
                  style={[styles.thumbBox, selectedPhotoIndex === idx && styles.thumbBoxActive]}
                >
                  <Image source={{ uri: ph }} style={styles.thumbImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Title & Status */}
          <View style={styles.infoCard}>
            <Text style={styles.title}>{item.title}</Text>

            {/* Leading Status Banner */}
            {isLeading ? (
              <View style={styles.leadingBanner}>
                <Text style={styles.leadingText}>🟢 You are the current highest bidder!</Text>
              </View>
            ) : (
              <View style={styles.startingPriceBanner}>
                <Text style={styles.startingPriceText}>
                  🛡️ Strict 1,000 IQD Starting Price • 100% Cash-on-Delivery
                </Text>
              </View>
            )}

            {/* Price Row */}
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceSub}>Current High Bid</Text>
                <Text style={styles.priceValue}>
                  {item.currentBid.toLocaleString()} <Text style={styles.iqd}>IQD</Text>
                </Text>
                <Text style={styles.usdValue}>~${(item.currentBid / 1500).toFixed(2)} USD</Text>
              </View>

              <View style={styles.totalBidsBox}>
                <Text style={styles.totalBidsCount}>{item.totalBids}</Text>
                <Text style={styles.totalBidsLabel}>Bids Placed</Text>
              </View>
            </View>

            {/* Doorstep Inspection Guarantee */}
            <View style={styles.guaranteeBox}>
              <Text style={styles.guaranteeTitle}>📦 100% Doorstep Inspection Guarantee</Text>
              <Text style={styles.guaranteeDesc}>
                Open the package and inspect your item before handing cash to the courier. If it does not match, return it on the spot with zero penalties.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Docked Action Panel */}
        <View style={styles.bottomDock}>
          {/* Quick Jump Buttons */}
          <View style={styles.quickJumpRow}>
            {[1000, 2000, 5000].map((inc) => (
              <TouchableOpacity
                key={inc}
                onPress={() => handleBidConfirm(inc)}
                disabled={timeLeft.isExpired}
                style={styles.quickJumpButton}
              >
                <Text style={styles.quickJumpText}>+{inc.toLocaleString()} IQD</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Slide-To-Bid Slider */}
          <SlideToBidSlider
            bidAmount={nextBid}
            onBidConfirmed={() => handleBidConfirm(item.bidIncrement)}
            label={timeLeft.isExpired ? 'Auction Concluded' : `Slide to Bid ${nextBid.toLocaleString()} IQD`}
            disabled={timeLeft.isExpired}
          />

          {/* Auto-Bid Trigger */}
          <TouchableOpacity onPress={() => setShowAutoBidModal(true)} style={styles.autoBidTrigger}>
            <Text style={styles.autoBidTriggerText}>
              {savedCeiling
                ? `⚡ Auto-Bid Active: Up to ${savedCeiling.toLocaleString()} IQD (Tap to Edit)`
                : '⚙️ Configure Auto-Bid Ceiling'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auto-Bid Modal Dialog */}
        {showAutoBidModal && (
          <View style={styles.autoBidOverlay}>
            <View style={styles.autoBidCard}>
              <Text style={styles.autoBidTitle}>Set Auto-Bid Ceiling</Text>
              <Text style={styles.autoBidSub}>
                Enter the maximum amount you are willing to pay. ZEEDO will automatically counter-bid in +1,000 IQD increments only when outbid.
              </Text>

              <TextInput
                style={styles.autoBidInput}
                placeholder={`e.g. ${(item.currentBid + 10000).toLocaleString()} IQD`}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={autoBidCeiling}
                onChangeText={setAutoBidCeiling}
                autoFocus
              />

              <View style={styles.autoBidActions}>
                <TouchableOpacity onPress={() => setShowAutoBidModal(false)} style={styles.autoBidCancel}>
                  <Text style={styles.autoBidCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveAutoBid} style={styles.autoBidSave}>
                  <Text style={styles.autoBidSaveText}>Activate Auto-Bid</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072F1F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerCategory: {
    color: '#B4F105',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerId: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
  },
  scroll: {
    paddingBottom: 180,
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: '#052216',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  timerBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(7, 47, 31, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B4F105',
  },
  timerBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderColor: '#F87171',
  },
  timerText: {
    color: '#B4F105',
    fontWeight: '900',
    fontSize: 12,
  },
  timerTextUrgent: {
    color: '#FFFFFF',
  },
  conditionPill: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  thumbRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbBoxActive: {
    borderColor: '#B4F105',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 12,
  },
  leadingBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 16,
  },
  leadingText: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  startingPriceBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  startingPriceText: {
    color: '#A7C1B5',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  priceSub: {
    color: '#A7C1B5',
    fontSize: 11,
    fontWeight: '600',
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  iqd: {
    color: '#B4F105',
    fontSize: 16,
    fontWeight: '800',
  },
  usdValue: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  totalBidsBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  totalBidsCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  totalBidsLabel: {
    color: '#A7C1B5',
    fontSize: 10,
    fontWeight: '700',
  },
  guaranteeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  guaranteeTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  guaranteeDesc: {
    color: '#A7C1B5',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#052216',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  quickJumpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    width: '100%',
  },
  quickJumpButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  quickJumpText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  autoBidTrigger: {
    marginTop: 8,
  },
  autoBidTriggerText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  autoBidOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  autoBidCard: {
    backgroundColor: '#072F1F',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#B4F105',
  },
  autoBidTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  autoBidSub: {
    color: '#A7C1B5',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  autoBidInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  autoBidActions: {
    flexDirection: 'row',
    gap: 12,
  },
  autoBidCancel: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  autoBidCancelText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  autoBidSave: {
    flex: 1,
    backgroundColor: '#B4F105',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  autoBidSaveText: {
    color: '#072F1F',
    fontWeight: '900',
  },
});
