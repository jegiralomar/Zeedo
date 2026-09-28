import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem } from '../types';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, isRTL } from '../i18n/translations';
import { CompactListingCard } from '../components/CompactListingCard';
import { ListingCardRtl } from '../components/ListingCardRtl';
import {
  Bookmark,
  Flame,
  LayoutGrid,
  List,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';

interface SavedAuctionsScreenProps {
  onSelectItem: (item: MobileAuctionItem) => void;
  onNavigateHome: () => void;
}

export const SavedAuctionsScreen: React.FC<SavedAuctionsScreenProps> = ({
  onSelectItem,
  onNavigateHome,
}) => {
  const { auctions, savedAuctionIds, toggleSaveAuction } = useAuctionStore();
  const { language } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const savedAuctions = auctions.filter((item) =>
    savedAuctionIds.includes(item.id)
  );

  return (
    <View style={styles.container}>
      {/* Watchlist Header Card */}
      <View style={styles.headerCard}>
        <View style={[styles.headerRow, rtl && styles.rtlRow]}>
          <View style={styles.iconCircle}>
            <Bookmark size={20} color={TOKENS.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.titleRow, rtl && styles.rtlRow]}>
              <Text style={styles.headerTitle}>{t.tabSaved}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{savedAuctions.length}</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>
              {rtl
                ? 'موزایەدەکانی تۆمارکراون بۆ ئاگاداربوون لە بەرزترین نرخەکان'
                : 'Tracked live auctions with instant slide-to-bid access'}
            </Text>
          </View>

          {/* Grid / List View Toggle Pill */}
          <View style={styles.viewModeTogglePill}>
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === 'grid' && styles.viewToggleBtnActive,
              ]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.8}
            >
              <LayoutGrid
                size={14}
                color={viewMode === 'grid' ? '#FFFFFF' : TOKENS.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === 'list' && styles.viewToggleBtnActive,
              ]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <List
                size={14}
                color={viewMode === 'list' ? '#FFFFFF' : TOKENS.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content List or Empty State */}
      {savedAuctions.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Bookmark size={32} color={TOKENS.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t.noSavedAuctions}</Text>
            <Text style={styles.emptySub}>{t.noSavedAuctionsSub}</Text>

            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={onNavigateHome}
              activeOpacity={0.85}
            >
              <Flame size={16} color="#FFFFFF" />
              <Text style={styles.exploreBtnText}>
                {rtl ? 'گەڕان لە زیادکردنەکان' : 'Explore Live Auctions'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* COD Assurance Card */}
          <View style={styles.assuranceCard}>
            <ShieldCheck size={18} color={TOKENS.colors.secondary} />
            <Text style={styles.assuranceText}>
              {rtl
                ? '١٠٠٪ پارەدان لە کاتی وەرگرتن (کاش) - هیچ کارتی بانکی پێویست نییە.'
                : '100% Cash-on-Delivery Guarantee. Pay physical cash to the courier at your doorstep.'}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={savedAuctions}
          key={viewMode === 'grid' ? 'saved-grid' : 'saved-list'}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) =>
            viewMode === 'grid' ? (
              <CompactListingCard
                item={item}
                language={language}
                onSelect={onSelectItem}
              />
            ) : (
              <ListingCardRtl
                item={item}
                language={language}
                onSelect={onSelectItem}
                onBookmark={(i) => toggleSaveAuction(i.id)}
              />
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: TOKENS.spacing.md,
    marginTop: TOKENS.spacing.md,
    marginBottom: TOKENS.spacing.sm,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: TOKENS.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: TOKENS.borderRadius.full,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  viewModeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TOKENS.colors.cardMuted,
    borderRadius: TOKENS.borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },
  viewToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: TOKENS.colors.primary,
    ...TOKENS.shadows.glowPrimary,
  },
  listContent: {
    paddingHorizontal: TOKENS.spacing.md - 4,
    paddingBottom: 110,
  },
  emptyContainer: {
    padding: TOKENS.spacing.md,
    paddingBottom: 120,
    gap: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: TOKENS.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.secondaryLight,
    padding: 14,
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  assuranceText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    lineHeight: 17,
  },
});
