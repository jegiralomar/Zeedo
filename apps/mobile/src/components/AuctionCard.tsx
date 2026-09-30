import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { EviraTheme } from '../lib/theme';

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
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(item.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('ENDED');
        setIsUrgent(false);
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      setIsUrgent(diff <= 120000); // <= 2 mins

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

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPressCard(item)}
      style={styles.cardContainer}
    >
      {/* Evira Soft-Gray Image Container */}
      <View style={styles.imageBox}>
        <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="contain" />

        {/* Floating Heart / Wishlist Icon */}
        <TouchableOpacity
          onPress={() => onToggleSave && onToggleSave(item.id)}
          style={[styles.heartButton, isSaved && styles.heartButtonActive]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heartIcon, isSaved && styles.heartIconActive]}>
            {isSaved ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        {/* Floating Live Timer Badge */}
        <View style={[styles.timerBadge, isUrgent && styles.timerBadgeUrgent]}>
          <View style={[styles.timerDot, isUrgent && styles.timerDotUrgent]} />
          <Text style={styles.timerText}>{timeLeft}</Text>
        </View>

        {/* Strict 1,000 IQD Start Badge */}
        <View style={styles.startBadge}>
          <Text style={styles.startBadgeText}>1K IQD Start</Text>
        </View>
      </View>

      {/* Evira Clean Product Details */}
      <View style={styles.detailsContainer}>
        {/* Category Pill Tag */}
        <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {/* Rating & Total Bids Row */}
        <View style={styles.metaRow}>
          <Text style={styles.starText}>★ 4.8</Text>
          <Text style={styles.metaDivider}>|</Text>
          <Text style={styles.bidsText}>{item.totalBids} bids</Text>
        </View>

        {/* Price & Quick Bid Row */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Current Bid</Text>
            <Text style={styles.priceValue}>{item.currentBid.toLocaleString()} IQD</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onQuickBid(item)}
            style={styles.bidButton}
          >
            <Text style={styles.bidButtonText}>Bid</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    maxWidth: '48.5%',
    marginBottom: 16,
  },
  imageBox: {
    width: '100%',
    height: 165,
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '88%',
    height: '88%',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: EviraTheme.radii.full,
    backgroundColor: EviraTheme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heartButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  heartIcon: {
    fontSize: 16,
    color: EviraTheme.colors.textPrimary,
  },
  heartIconActive: {
    color: EviraTheme.colors.liveRed,
  },
  timerBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: EviraTheme.radii.full,
    gap: 4,
  },
  timerBadgeUrgent: {
    backgroundColor: EviraTheme.colors.liveRed,
  },
  timerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  timerDotUrgent: {
    backgroundColor: '#FFFFFF',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  startBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  startBadgeText: {
    color: EviraTheme.colors.accentGold,
    fontSize: 9,
    fontWeight: '800',
  },
  detailsContainer: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: EviraTheme.colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  starText: {
    fontSize: 11,
    fontWeight: '700',
    color: EviraTheme.colors.starGold,
  },
  metaDivider: {
    fontSize: 10,
    color: EviraTheme.colors.textTertiary,
  },
  bidsText: {
    fontSize: 11,
    fontWeight: '500',
    color: EviraTheme.colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: EviraTheme.colors.textTertiary,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
  },
  bidButton: {
    backgroundColor: EviraTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: EviraTheme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidButtonText: {
    color: EviraTheme.colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
});
