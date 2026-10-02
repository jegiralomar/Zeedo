import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Gavel, Heart, ShoppingBag, User, LayoutDashboard, Package, Receipt, Store } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

export const BottomNav: React.FC = () => {
  const {
    language,
    activeTab,
    setActiveTab,
    merchantScreen,
    setMerchantScreen,
    userRole,
    wonOrders,
    myBids,
  } = useAppStore();
  const t = getTranslation(language);

  // Total active bag items (won orders + active bids)
  const bagCount = wonOrders.length + myBids.length;

  // Strict Merchant Dock if logged in as merchant
  if (userRole === 'merchant') {
    return (
      <View style={styles.floatingWrapper} pointerEvents="box-none">
        <View style={styles.pillContainer}>
          <TouchableOpacity
            onPress={() => {
              setMerchantScreen('dashboard');
              setActiveTab('auctions');
            }}
            style={[styles.tabItem, merchantScreen === 'dashboard' && styles.tabItemActive]}
            activeOpacity={0.75}
          >
            <LayoutDashboard
              size={20}
              color={merchantScreen === 'dashboard' ? AppTheme.colors.primary : '#64748B'}
            />
            <Text
              style={[
                styles.tabLabel,
                merchantScreen === 'dashboard' && styles.tabLabelActive,
              ]}
            >
              {language === 'en' ? 'Dashboard' : 'الرئيسية'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMerchantScreen('orders');
              setActiveTab('auctions');
            }}
            style={[styles.tabItem, merchantScreen === 'orders' && styles.tabItemActive]}
            activeOpacity={0.75}
          >
            <Package
              size={20}
              color={merchantScreen === 'orders' ? AppTheme.colors.primary : '#64748B'}
            />
            <Text
              style={[
                styles.tabLabel,
                merchantScreen === 'orders' && styles.tabLabelActive,
              ]}
            >
              {language === 'en' ? 'COD Orders' : 'الطلبات'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMerchantScreen('ledger');
              setActiveTab('auctions');
            }}
            style={[styles.tabItem, merchantScreen === 'ledger' && styles.tabItemActive]}
            activeOpacity={0.75}
          >
            <Receipt
              size={20}
              color={merchantScreen === 'ledger' ? AppTheme.colors.primary : '#64748B'}
            />
            <Text
              style={[
                styles.tabLabel,
                merchantScreen === 'ledger' && styles.tabLabelActive,
              ]}
            >
              {language === 'en' ? 'Commissions' : 'العمولات'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
            activeOpacity={0.75}
          >
            <Store
              size={20}
              color={activeTab === 'profile' ? AppTheme.colors.primary : '#64748B'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'profile' && styles.tabLabelActive,
              ]}
            >
              {language === 'en' ? 'Store' : 'المتجر'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pure Buyer 4-Tab Custom Dock (Auctions, Watchlist, Bag, Profile)
  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.pillContainer}>
        {/* 1. Auctions / المزادات */}
        <TouchableOpacity
          onPress={() => setActiveTab('auctions')}
          style={[styles.tabItem, activeTab === 'auctions' && styles.tabItemActive]}
          activeOpacity={0.75}
        >
          <Gavel
            size={20}
            color={activeTab === 'auctions' ? AppTheme.colors.primary : '#64748B'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'auctions' && styles.tabLabelActive,
            ]}
          >
            {t.auctionsTab}
          </Text>
        </TouchableOpacity>

        {/* 2. Watchlist / المفضلة */}
        <TouchableOpacity
          onPress={() => setActiveTab('watchlist')}
          style={[styles.tabItem, activeTab === 'watchlist' && styles.tabItemActive]}
          activeOpacity={0.75}
        >
          <Heart
            size={20}
            color={activeTab === 'watchlist' ? AppTheme.colors.primary : '#64748B'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'watchlist' && styles.tabLabelActive,
            ]}
          >
            {t.watchlistTab}
          </Text>
        </TouchableOpacity>

        {/* 3. My Bag / حقيبتي (Won Lots + Active Bids) */}
        <TouchableOpacity
          onPress={() => setActiveTab('bag')}
          style={[styles.tabItem, activeTab === 'bag' && styles.tabItemActive]}
          activeOpacity={0.75}
        >
          <View style={styles.iconWithBadge}>
            <ShoppingBag
              size={20}
              color={activeTab === 'bag' ? AppTheme.colors.primary : '#64748B'}
            />
            {bagCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{bagCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'bag' && styles.tabLabelActive,
            ]}
          >
            {t.bagTab}
          </Text>
        </TouchableOpacity>

        {/* 4. Profile / حسابي */}
        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          activeOpacity={0.75}
        >
          <User
            size={20}
            color={activeTab === 'profile' ? AppTheme.colors.primary : '#64748B'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            {t.profileTab}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 999,
  },
  pillContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: '#FFE4E8',
  },
  iconWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  tabLabelActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
});
