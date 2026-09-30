import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MobileAuctionItem, AuctionCard } from '../components/AuctionCard';
import { AppTheme } from '../lib/theme';

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
  language = 'ar',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const savedItems = items.filter((it) => savedIds.includes(it.id));

  const filtered = savedItems.filter((it) =>
    selectedCategory === 'all'
      ? true
      : it.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  const t = {
    title: language === 'ar' ? 'قائمة الرغبات' : language === 'ckb' ? 'دڵخوازەکانم' : 'My Wishlist',
    countText: (count: number) =>
      language === 'ar'
        ? `${count} مزادات محفوظة`
        : language === 'ckb'
        ? `${count} پارێزراو`
        : `${count} Saved Drops`,
    emptyTitle: language === 'ar' ? 'قائمة الرغبات فارغة' : 'Your Wishlist is Empty',
    emptySub:
      language === 'ar'
        ? 'انقر على أيقونة القلب على أي مزاد لمتابعة التوقيت والصفقات المميزة هنا.'
        : 'Tap the heart icon on any auction lot to monitor live timers and bids here.',
  };

  const categories = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { id: 'cars', label: language === 'ar' ? 'سيارات' : 'Cars' },
    { id: 'gaming', label: language === 'ar' ? 'ألعاب' : 'Gaming' },
    { id: 'watches', label: language === 'ar' ? 'ساعات' : 'Watches' },
    { id: 'home', label: language === 'ar' ? 'أجهزة' : 'Devices' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSub}>{t.countText(savedItems.length)}</Text>
        </View>

        <View style={styles.heartBadge}>
          <Text style={styles.heartBadgeIcon}>♥</Text>
        </View>
      </View>

      {/* Horizontal Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.filterPill,
              selectedCategory === cat.id && styles.filterPillActive,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === cat.id && styles.filterPillTextActive,
              ]}
            >
              {cat.label}
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
            <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
            <Text style={styles.emptySub}>{t.emptySub}</Text>
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
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  heartBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBadgeIcon: {
    fontSize: 20,
    color: AppTheme.colors.liveRed,
  },
  filterPillsRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: AppTheme.radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  filterPillActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginTop: 30,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 26,
    color: AppTheme.colors.primary,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
