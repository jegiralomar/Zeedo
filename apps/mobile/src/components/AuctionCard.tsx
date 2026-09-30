import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SlideToBidSlider } from './SlideToBidSlider';

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
  onSlideBid: (item: MobileAuctionItem) => void;
  onPressCard: (item: MobileAuctionItem) => void;
  language: 'ckb' | 'badini' | 'ar' | 'en';
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  item,
  onQuickBid,
  onSlideBid,
  onPressCard,
  language,
}) => {
  const photoUrl =
    item.photos && item.photos.length > 0
      ? item.photos[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const nextBid = item.currentBid + item.bidIncrement;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPressCard(item)}
      style={styles.card}
    >
      {/* Photo with Overlay Badges */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        
        {/* Soft-Close Anti-Sniping Tag */}
        <View style={styles.snipingBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.snipingText}>LIVE AUCTION</Text>
        </View>

        {/* 1,000 IQD Strict Start Badge */}
        <View style={styles.startingBadge}>
          <Text style={styles.startingText}>Start: 1,000 IQD</Text>
        </View>
      </View>

      {/* Card Details */}
      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
          <Text style={styles.bidsCount}>{item.totalBids} bids placed</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Price & Current High Bid */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Current Highest Bid</Text>
            <Text style={styles.priceValue}>
              {item.currentBid.toLocaleString()} <Text style={styles.currency}>IQD</Text>
            </Text>
            <Text style={styles.usdSubtext}>
              ~${(item.currentBid / 1500).toFixed(2)} USD
            </Text>
          </View>

          {/* Quick Bid +1,000 Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onQuickBid(item)}
            style={styles.quickBidButton}
          >
            <Text style={styles.quickBidLabel}>+1,000 IQD</Text>
            <Text style={styles.quickBidSub}>Instant Bid</Text>
          </TouchableOpacity>
        </View>

        {/* Slide To Bid Slider Container */}
        <View style={styles.sliderWrapper}>
          <SlideToBidSlider
            bidAmount={nextBid}
            onBidConfirmed={() => onSlideBid(item)}
            label={`Slide to Bid ${nextBid.toLocaleString()} IQD`}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  snipingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 47, 31, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(180, 241, 5, 0.4)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B4F105',
    marginRight: 6,
  },
  snipingText: {
    color: '#B4F105',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  startingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  startingText: {
    color: '#F3F4F6',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  bidsCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#072F1F',
  },
  currency: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  usdSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  quickBidButton: {
    backgroundColor: '#072F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  quickBidLabel: {
    color: '#B4F105',
    fontWeight: '900',
    fontSize: 13,
  },
  quickBidSub: {
    color: '#A7C1B5',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  sliderWrapper: {
    alignItems: 'center',
    marginTop: 4,
  },
});
