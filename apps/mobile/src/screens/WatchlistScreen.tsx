import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MobileAuctionItem, AuctionCard } from '../components/AuctionCard';
import { EviraTheme } from '../lib/theme';

interface WatchlistScreenProps {
  savedIds: string[];
  items: MobileAuctionItem[];
  onToggleSave: (id: string) => void;
  onQuickBid: (item: MobileAuctionItem) => void;
  onViewItem: (item: MobileAuctionItem) => void;
  language?: 'ckb' | 'badini' | 'ar' | 'en';
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  savedIds,
  items,
  onToggleSave,
  onQuickBid,
  onViewItem,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const savedItems = items.filter((it) => savedIds.includes(it.id));

  const filtered = savedItems.filter((it) =>
    selectedCategory === 'all'
      ? true
      : it.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Evira Wishlist Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSub}>{savedItems.length} Saved Drops</Text>
        </View>

        <TouchableOpacity style={styles.searchIconButton}>
          <Text style={styles.searchIconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {['all', 'gaming', 'smartphones', 'watches', 'computers'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.filterPill,
              selectedCategory === cat && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === cat && styles.filterPillTextActive,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 2-Column Product Grid */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>♡</Text>
            </View>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any auction lot to monitor live timers, anti-sniping resets, and outbid activity here.
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filtered.map((item) => (
              <AuctionCard
                key={item.id}
                item={item}
                language={language}
                onQuickBid={onQuickBid}
                onPressCard={onViewItem}
                onToggleSave={onToggleSave}
                isSaved={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EviraTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: EviraTheme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  searchIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 16,
  },
  filterPillsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: EviraTheme.radii.full,
    backgroundColor: EviraTheme.colors.background,
    borderWidth: 1.5,
    borderColor: EviraTheme.colors.border,
  },
  filterPillActive: {
    backgroundColor: EviraTheme.colors.primary,
    borderColor: EviraTheme.colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
  },
  filterPillTextActive: {
    color: EviraTheme.colors.textWhite,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: EviraTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 26,
    color: EviraTheme.colors.textTertiary,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: EviraTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
