import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MobileAuctionItem } from '../components/AuctionCard';

interface WatchlistScreenProps {
  savedIds: string[];
  items: MobileAuctionItem[];
  onToggleSave: (id: string) => void;
  onQuickBid: (item: MobileAuctionItem) => void;
  onViewItem: (item: MobileAuctionItem) => void;
  language: 'ckb' | 'badini' | 'ar' | 'en';
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  savedIds,
  items,
  onToggleSave,
  onQuickBid,
  onViewItem,
  language,
}) => {
  const savedItems = items.filter((it) => savedIds.includes(it.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watchlist</Text>
        <Text style={styles.headerSub}>{savedItems.length} Saved Drops</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {savedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyTitle}>Your Watchlist is Empty</Text>
            <Text style={styles.emptySub}>
              Tap the bookmark icon on any live drop to monitor timer resets and outbid activity here.
            </Text>
          </View>
        ) : (
          savedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => onViewItem(item)}
              style={styles.card}
            >
              <Image
                source={{
                  uri:
                    item.photos?.[0] ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
                }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <Text style={styles.category}>{item.category.toUpperCase()}</Text>
                  <TouchableOpacity onPress={() => onToggleSave(item.id)}>
                    <Text style={styles.bookmarkActive}>★ Remove</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.bottomRow}>
                  <View>
                    <Text style={styles.priceLabel}>Current Bid</Text>
                    <Text style={styles.priceValue}>
                      {item.currentBid.toLocaleString()} <Text style={styles.iqd}>IQD</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => onQuickBid(item)}
                    style={styles.bidButton}
                  >
                    <Text style={styles.bidButtonText}>+1,000 IQD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072F1F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  headerSub: {
    color: '#A7C1B5',
    fontSize: 11,
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: '#A7C1B5',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#1E293B',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  bookmarkActive: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginVertical: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#072F1F',
  },
  iqd: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  bidButton: {
    backgroundColor: '#072F1F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bidButtonText: {
    color: '#B4F105',
    fontWeight: '900',
    fontSize: 11,
  },
});
