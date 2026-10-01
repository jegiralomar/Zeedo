import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Heart, MapPin, Gavel, Sparkles } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export const WatchlistScreen: React.FC = () => {
  const {
    language,
    auctions,
    watchlistIds,
    toggleWatchlist,
    setSelectedAuctionId,
    setActiveTab,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTicker((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (endsAt: string) => {
    const totalMs = new Date(endsAt).getTime() - Date.now();
    if (totalMs <= 0) return isRtl ? 'منتهي' : 'Ended';
    const totalSecs = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const watchedAuctions = auctions.filter((a) => watchlistIds.includes(a.id));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, isRtl && styles.headerRtl]}>
        <View style={styles.titleRow}>
          <Heart size={20} color="#F83758" fill="#F83758" />
          <Text style={styles.title}>{t.watchlistTab}</Text>
        </View>
        <Text style={styles.countText}>
          {watchedAuctions.length} {isRtl ? 'مزاد محفوظ' : 'saved'}
        </Text>
      </View>

      {/* Grid of Watched Items */}
      {watchedAuctions.length > 0 ? (
        <View style={styles.gridContainer}>
          {watchedAuctions.map((item) => {
            const countdown = formatCountdown(item.endsAt);
            const isEnded = countdown === 'Ended' || countdown === 'منتهي';

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => setSelectedAuctionId(item.id)}
                activeOpacity={0.88}
              >
                {/* Product Image & Overlays */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.images[0] }} style={styles.cardImage} />

                  {/* Countdown Pill */}
                  <View style={[styles.countdownPill, isEnded && styles.countdownPillEnded]}>
                    <View style={[styles.timerDot, isEnded && styles.timerDotEnded]} />
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>

                  {/* Heart Button */}
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleWatchlist(item.id)}
                    activeOpacity={0.8}
                  >
                    <Heart size={16} color="#F83758" fill="#F83758" />
                  </TouchableOpacity>

                  {item.sellerCity && (
                    <View style={styles.cityBadge}>
                      <MapPin size={10} color="#FFFFFF" />
                      <Text style={styles.cityText} numberOfLines={1}>
                        {item.sellerCity}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <Text
                    style={[styles.cardTitle, isRtl && styles.cardTitleRtl]}
                    numberOfLines={2}
                  >
                    {isRtl && item.titleAr ? item.titleAr : item.title}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{t.currentBid}</Text>
                    <Text style={styles.priceValue}>
                      {item.currentBidIqd.toLocaleString()} {t.currency}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.bidsBadge}>
                      <Gavel size={11} color="#64748B" />
                      <Text style={styles.bidsBadgeText}>
                        {item.bidsCount} {isRtl ? 'مزايدة' : 'bids'}
                      </Text>
                    </View>
                    <View style={styles.viewRoomPill}>
                      <Text style={styles.viewRoomText}>
                        {isRtl ? 'المزاد' : 'Room'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Heart size={40} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>
            {isRtl ? 'قائمة المفضلة فارغة' : 'Your Watchlist is Empty'}
          </Text>
          <Text style={styles.emptySub}>
            {isRtl
              ? 'اضغط على رمز القلب في أي مزاد لمتابعته واستلام تنبيهات حية قبل انتهائه.'
              : 'Tap the heart icon on any auction to follow it and receive live alerts.'}
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => setActiveTab('auctions')}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreButtonText}>
              {isRtl ? 'تصفح المزادات الحية' : 'Explore Live Auctions'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 28 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 1.05,
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  countdownPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  countdownPillEnded: {
    backgroundColor: 'rgba(100, 116, 139, 0.85)',
  },
  timerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  timerDotEnded: {
    backgroundColor: '#94A3B8',
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  cityBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  cityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
    minHeight: 36,
  },
  cardTitleRtl: {
    textAlign: 'right',
  },
  priceRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bidsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  viewRoomPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  viewRoomText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
