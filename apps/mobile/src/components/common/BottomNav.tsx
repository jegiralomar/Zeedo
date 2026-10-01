import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            setMerchantScreen('dashboard');
            setActiveTab('auctions');
          }}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <LayoutDashboard
            size={22}
            color={merchantScreen === 'dashboard' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              merchantScreen === 'dashboard' && styles.tabLabelActive,
            ]}
          >
            {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMerchantScreen('orders');
            setActiveTab('auctions');
          }}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Package
            size={22}
            color={merchantScreen === 'orders' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              merchantScreen === 'orders' && styles.tabLabelActive,
            ]}
          >
            {language === 'en' ? 'COD Orders' : 'طلبات COD'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMerchantScreen('ledger');
            setActiveTab('auctions');
          }}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Receipt
            size={22}
            color={merchantScreen === 'ledger' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
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
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Store
            size={22}
            color={activeTab === 'profile' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            {language === 'en' ? 'Store' : 'حساب المتجر'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pure Buyer 4-Tab Custom Dock (Auctions, Watchlist, Bag, Profile)
  return (
    <View style={styles.container}>
      {/* 1. Auctions / المزادات */}
      <TouchableOpacity
        onPress={() => setActiveTab('auctions')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <Gavel
          size={22}
          color={activeTab === 'auctions' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
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
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <Heart
          size={22}
          color={activeTab === 'watchlist' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === 'watchlist' && styles.tabLabelActive]}>
          {t.watchlistTab}
        </Text>
      </TouchableOpacity>

      {/* 3. My Bag / حقيبتي (Won Lots + Active Bids) */}
      <TouchableOpacity
        onPress={() => setActiveTab('bag')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View style={styles.iconWithBadge}>
          <ShoppingBag
            size={22}
            color={activeTab === 'bag' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          {bagCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{bagCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, activeTab === 'bag' && styles.tabLabelActive]}>
          {t.bagTab}
        </Text>
      </TouchableOpacity>

      {/* 4. Profile / حسابي */}
      <TouchableOpacity
        onPress={() => setActiveTab('profile')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <User
          size={22}
          color={activeTab === 'profile' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
          {t.profileTab}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
});
