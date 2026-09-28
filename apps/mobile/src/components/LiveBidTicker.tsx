import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { BidRecord } from '../types';
import { Radio } from 'lucide-react-native';

interface LiveBidTickerProps {
  bids: BidRecord[];
  isRtl?: boolean;
}

export const LiveBidTicker: React.FC<LiveBidTickerProps> = ({ bids, isRtl = false }) => {
  const displayBids = bids.slice(0, 4);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.tickerContainer}>
      {/* Header */}
      <View style={[styles.headerRow, isRtl && styles.rtlRow]}>
        <Text style={styles.headerTitle}>
          {isRtl ? 'چالاکی و بەشدارییە ڕاستەوخۆکان' : 'Recent Bid Activity'}
        </Text>
        <View style={styles.liveFeedBadge}>
          <Radio size={12} color={TOKENS.colors.primary} />
          <Text style={styles.liveFeedText}>Live Feed</Text>
        </View>
      </View>

      {/* Bids List */}
      <View style={styles.list}>
        {displayBids.map((bid, index) => {
          const isLatest = index === 0;
          return (
            <View
              key={bid.id}
              style={[
                styles.bidRow,
                isLatest ? styles.latestRow : styles.olderRow,
                isRtl && styles.rtlRow,
              ]}
            >
              <View style={[styles.bidderInfo, isRtl && styles.rtlRow]}>
                <View
                  style={[
                    styles.avatarBadge,
                    isLatest ? styles.latestAvatar : styles.olderAvatar,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      isLatest ? styles.latestAvatarText : styles.olderAvatarText,
                    ]}
                  >
                    {getInitials(bid.bidderName)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.bidderName}>{bid.bidderName}</Text>
                  <Text style={styles.bidTime}>{bid.timestamp}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.bidAmount,
                  isLatest ? styles.latestAmount : styles.olderAmount,
                ]}
              >
                {bid.amountIqd.toLocaleString()} IQD
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tickerContainer: {
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    marginVertical: TOKENS.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TOKENS.spacing.sm,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.onSurfaceVariant,
  },
  liveFeedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${TOKENS.colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  liveFeedText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
  list: {
    gap: 6,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    paddingHorizontal: TOKENS.spacing.sm,
    paddingVertical: 8,
    borderRadius: TOKENS.borderRadius.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.surfaceContainerHigh,
  },
  latestRow: {
    borderLeftWidth: 3,
    borderLeftColor: TOKENS.colors.secondary,
  },
  olderRow: {
    opacity: 0.85,
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.sm,
  },
  avatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestAvatar: {
    backgroundColor: TOKENS.colors.secondaryFixed,
  },
  olderAvatar: {
    backgroundColor: TOKENS.colors.surfaceContainerHigh,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
  },
  latestAvatarText: {
    color: TOKENS.colors.onSecondaryFixed,
  },
  olderAvatarText: {
    color: TOKENS.colors.onSurfaceVariant,
  },
  bidderName: {
    fontSize: 12,
    fontWeight: '600',
    color: TOKENS.colors.onSurface,
  },
  bidTime: {
    fontSize: 9,
    color: TOKENS.colors.outline,
  },
  bidAmount: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  latestAmount: {
    color: TOKENS.colors.primary,
  },
  olderAmount: {
    color: TOKENS.colors.onSurfaceVariant,
  },
});
