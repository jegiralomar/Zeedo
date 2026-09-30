import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppTheme } from '../lib/theme';

export interface MobileAuctionItem {
  id: string;
  title: string;
  category: string;
  currentBid: number;
  startingPrice: number;
  bidIncrement: number;
  endsAt: string;
  photos: string[];
  totalBids: number;
  condition: string;
  sellerName?: string;
  sellerAvatar?: string;
}

interface AuctionCardProps {
  item: MobileAuctionItem;
  onQuickBid: (item: MobileAuctionItem) => void;
  onSlideBid?: (item: MobileAuctionItem) => void;
  onPressCard: (item: MobileAuctionItem) => void;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
  language?: 'ckb' | 'badini' | 'ar' | 'en';
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  item,
  onQuickBid,
  onPressCard,
  onToggleSave,
  isSaved = false,
  language = 'ar',
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(item.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('منتهي');
        setIsUrgent(false);
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      setIsUrgent(diff <= 120000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else {
        setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.endsAt]);

  const photoUrl =
    item.photos && item.photos.length > 0
      ? item.photos[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const sellerName = item.sellerName || 'عادل عدنان';
  const sellerAvatar =
    item.sellerAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  const bidButtonLabel =
    language === 'ar'
      ? 'عطاء الآن'
      : language === 'ckb'
      ? 'ئێستا زیاد بکە'
      : language === 'badini'
      ? 'نوکە زێدە بکە'
      : 'Bid Now';

  const liveBadgeLabel =
    language === 'ar' ? 'يعيش •' : language === 'ckb' ? 'ڕاستەوخۆ •' : '• LIVE';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPressCard(item)}
      style={styles.cardContainer}
    >
      {/* Product Image Area */}
      <View style={styles.imageBox}>
        <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />

        {/* Top-Right Floating Live Badge (white pill with red dot) */}
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>{liveBadgeLabel}</Text>
        </View>

        {/* Top-Left Wishlist Heart */}
        <TouchableOpacity
          onPress={() => onToggleSave && onToggleSave(item.id)}
          style={[styles.heartButton, isSaved && styles.heartButtonActive]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heartIcon, isSaved && styles.heartIconActive]}>
            {isSaved ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        {/* Bottom-Left Seller Pill (avatar + name) */}
        <View style={styles.sellerPill}>
          <Image source={{ uri: sellerAvatar }} style={styles.sellerAvatar} />
          <Text style={styles.sellerName} numberOfLines={1}>
            {sellerName}
          </Text>
        </View>
      </View>

      {/* Card Content & CTA */}
      <View style={styles.detailsContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {/* Current Bid & Timer Info */}
        <View style={styles.infoRow}>
          <Text style={styles.priceText}>{item.currentBid.toLocaleString()} IQD</Text>
          <Text style={[styles.timerText, isUrgent && styles.timerUrgent]}>
            ⏱ {timeLeft}
          </Text>
        </View>

        {/* Signature Royal Indigo Full-Width Bid Button ("عطاء الآن") */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onQuickBid(item)}
          style={styles.bidButton}
        >
          <Text style={styles.bidButtonText}>{bidButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '48.5%',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: AppTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  imageBox: {
    width: '100%',
    height: 155,
    backgroundColor: '#EDF2F7',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  livePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.liveBadgeBg,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: AppTheme.radii.full,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppTheme.colors.liveRed,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: AppTheme.colors.liveRed,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  heartIcon: {
    fontSize: 14,
    color: AppTheme.colors.textPrimary,
  },
  heartIconActive: {
    color: AppTheme.colors.liveRed,
  },
  sellerPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: AppTheme.radii.full,
    gap: 4,
    maxWidth: '85%',
  },
  sellerAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sellerName: {
    fontSize: 9,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  detailsContainer: {
    padding: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '600',
    color: AppTheme.colors.textSecondary,
  },
  timerUrgent: {
    color: AppTheme.colors.liveRed,
    fontWeight: '800',
  },
  bidButton: {
    backgroundColor: AppTheme.colors.primary,
    width: '100%',
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bidButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
  },
});
