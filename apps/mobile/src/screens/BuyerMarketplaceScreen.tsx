import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { MobileAuctionItem } from '../types';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, isRTL } from '../i18n/translations';
import { ListingCardRtl } from '../components/ListingCardRtl';
import { CompactListingCard } from '../components/CompactListingCard';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Radio,
  Sparkles,
  Smartphone,
  Watch,
  Gamepad2,
  Laptop,
  Layers,
  ArrowRight,
  ArrowLeft,
  Timer,
  LayoutGrid,
  List,
} from 'lucide-react-native';

interface BuyerMarketplaceScreenProps {
  onSelectItem: (item: MobileAuctionItem) => void;
  onRequestTwoGate: () => void;
}

export const BuyerMarketplaceScreen: React.FC<BuyerMarketplaceScreenProps> = ({
  onSelectItem,
  onRequestTwoGate,
}) => {
  const { auctions, savedAuctionIds, toggleSaveAuction } = useAuctionStore();
  const { language, isTwoGateVerified } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Smooth animated transition value
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleToggleView = (mode: 'grid' | 'list') => {
    if (mode === viewMode) return;
    // Animate fade out and fade in
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    setViewMode(mode);
  };

  const categories = [
    { id: 'All', label: 'All', icon: Layers },
    { id: 'Smartphones', label: 'Phones', icon: Smartphone },
    { id: 'Watches', label: 'Watches', icon: Watch },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'Computers', label: 'Laptops', icon: Laptop },
  ];

  const filteredAuctions = auctions.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const localized = item.multilingual[language] || item.multilingual.en;
    const matchesQuery =
      searchQuery.trim() === '' ||
      localized.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const hotAuction = auctions.find((a) => a.isAntiSnipingActive) || auctions[0];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={[styles.searchBarContainer, rtl && styles.rtlRow]}>
        <View style={[styles.searchInputWrapper, rtl && styles.rtlRow]}>
          <Search size={16} color={TOKENS.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, rtl && styles.alignRight]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={TOKENS.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <SlidersHorizontal size={16} color={TOKENS.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoryScroll, rtl && styles.rtlRow]}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComponent = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <IconComponent
                  size={13}
                  color={isSelected ? '#FFFFFF' : TOKENS.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.id === 'All' ? t.allCategories : cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sub-Header: Live Count & Grid/List Segmented Toggle */}
      <View style={[styles.streamHeader, rtl && styles.rtlRow]}>
        <View style={[styles.streamTitleRow, rtl && styles.rtlRow]}>
          <Radio size={15} color={TOKENS.colors.secondary} />
          <Text style={styles.streamTitle}>{t.liveNow}</Text>
          <Text style={styles.countText}>({filteredAuctions.length})</Text>
        </View>

        {/* View Mode Switcher Pill */}
        <View style={styles.viewModeTogglePill}>
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === 'grid' && styles.viewToggleBtnActive,
            ]}
            onPress={() => handleToggleView('grid')}
            activeOpacity={0.8}
          >
            <LayoutGrid
              size={15}
              color={viewMode === 'grid' ? '#FFFFFF' : TOKENS.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === 'list' && styles.viewToggleBtnActive,
            ]}
            onPress={() => handleToggleView('list')}
            activeOpacity={0.8}
          >
            <List
              size={15}
              color={viewMode === 'list' ? '#FFFFFF' : TOKENS.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Animated Listing Container */}
      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
        <FlatList
          key={viewMode === 'grid' ? 'grid-view' : 'list-view'}
          data={filteredAuctions}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Spotlight Live Auction Card */}
              {hotAuction && selectedCategory === 'All' && !searchQuery && (
                <TouchableOpacity
                  style={styles.spotlightCard}
                  onPress={() => onSelectItem(hotAuction)}
                  activeOpacity={0.92}
                >
                  <Image
                    source={{ uri: hotAuction.imageUrl }}
                    style={styles.spotlightImage}
                    resizeMode="cover"
                  />
                  <View style={styles.spotlightGradientOverlay}>
                    <View style={[styles.spotlightBadgeRow, rtl && styles.rtlRow]}>
                      <View style={styles.hotPill}>
                        <Flame size={12} color="#FFFFFF" />
                        <Text style={styles.hotPillText}>HOT AUCTION</Text>
                      </View>
                      <View style={styles.spotlightTimerPill}>
                        <Timer size={12} color="#FFFFFF" />
                        <Text style={styles.spotlightTimerText}>Ending Soon</Text>
                      </View>
                    </View>

                    <View style={styles.spotlightBottom}>
                      <Text numberOfLines={1} style={styles.spotlightTitle}>
                        {hotAuction.multilingual[language]?.title || hotAuction.multilingual.en.title}
                      </Text>
                      <View style={[styles.spotlightPriceRow, rtl && styles.rtlRow]}>
                        <View>
                          <Text style={styles.spotlightPriceLabel}>Winning Bid</Text>
                          <Text style={styles.spotlightPriceValue}>
                            {hotAuction.currentBidIqd.toLocaleString()} IQD
                          </Text>
                        </View>
                        <View style={styles.spotlightActionPill}>
                          <Text style={styles.spotlightActionText}>Bid</Text>
                          {rtl ? (
                            <ArrowLeft size={13} color="#FFFFFF" />
                          ) : (
                            <ArrowRight size={13} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Two-Gate Gating Banner */}
              {!isTwoGateVerified() && (
                <TouchableOpacity
                  style={[styles.gateNoticeBanner, rtl && styles.rtlRow]}
                  onPress={onRequestTwoGate}
                  activeOpacity={0.88}
                >
                  <View style={styles.gateIconBox}>
                    <Sparkles size={16} color={TOKENS.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gateNoticeTitle, rtl && styles.alignRight]}>
                      {t.gateModalTitle}
                    </Text>
                    <Text style={[styles.gateNoticeSub, rtl && styles.alignRight]}>
                      {rtl
                        ? 'پێناس و نەخشەی سەربان تەواو بکە بۆ ئەوەی ڕێگەت پێبدرێت.'
                        : 'Verify Civil ID & Rooftop Pin for 100% COD.'}
                    </Text>
                  </View>
                  {rtl ? (
                    <ArrowLeft size={16} color={TOKENS.colors.primary} />
                  ) : (
                    <ArrowRight size={16} color={TOKENS.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            </>
          }
          renderItem={({ item }) =>
            viewMode === 'grid' ? (
              <CompactListingCard
                item={item}
                language={language}
                isSaved={savedAuctionIds.includes(item.id)}
                onSelect={onSelectItem}
                onBookmark={(i) => toggleSaveAuction(i.id)}
              />
            ) : (
              <ListingCardRtl
                item={item}
                language={language}
                isSaved={savedAuctionIds.includes(item.id)}
                onSelect={onSelectItem}
                onBookmark={(i) => toggleSaveAuction(i.id)}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: TOKENS.spacing.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: TOKENS.borderRadius.full,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: TOKENS.colors.textPrimary,
  },
  alignRight: {
    textAlign: 'right',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryScroll: {
    paddingHorizontal: TOKENS.spacing.md,
    gap: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
  },
  categoryPillActive: {
    backgroundColor: TOKENS.colors.primary,
    borderColor: TOKENS.colors.primary,
    ...TOKENS.shadows.glowPrimary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  streamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.md,
    paddingVertical: 4,
    marginBottom: 4,
  },
  streamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
  },
  viewModeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  viewToggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: TOKENS.colors.primary,
  },
  spotlightCard: {
    height: 150,
    borderRadius: TOKENS.borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: 8,
    marginHorizontal: 4,
    position: 'relative',
    backgroundColor: '#0F172A',
    ...TOKENS.shadows.card,
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  spotlightGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: TOKENS.spacing.md,
    justifyContent: 'space-between',
  },
  spotlightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  hotPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spotlightTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  spotlightTimerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotlightBottom: {
    gap: 3,
  },
  spotlightTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spotlightPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  spotlightPriceLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  spotlightPriceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spotlightActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
  },
  spotlightActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gateNoticeBanner: {
    marginBottom: 8,
    marginHorizontal: 4,
    padding: 10,
    backgroundColor: TOKENS.colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: TOKENS.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gateIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  gateNoticeSub: {
    fontSize: 10,
    color: TOKENS.colors.textSecondary,
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 110,
  },
});
