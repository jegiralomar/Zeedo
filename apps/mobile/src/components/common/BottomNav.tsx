import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Heart, Gavel, Search, Settings, ShoppingBag, Store, Package } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

export const BottomNav: React.FC = () => {
  const { language, activeScreen, setActiveScreen, userRole } = useAppStore();
  const t = getTranslation(language);

  // If merchant is logged in, show merchant bottom dock
  if (userRole === 'merchant') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_home')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Store
            size={22}
            color={activeScreen === 'merchant_home' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeScreen === 'merchant_home' && styles.tabLabelActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_orders')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Package
            size={22}
            color={activeScreen === 'merchant_orders' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeScreen === 'merchant_orders' && styles.tabLabelActive,
            ]}
          >
            COD Orders
          </Text>
        </TouchableOpacity>

        {/* Center Floating Fast Action */}
        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_orders')}
          style={styles.centerFab}
          activeOpacity={0.85}
        >
          <View style={styles.fabInner}>
            <Gavel size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_commissions')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <ShoppingBag
            size={22}
            color={activeScreen === 'merchant_commissions' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeScreen === 'merchant_commissions' && styles.tabLabelActive,
            ]}
          >
            Ledger
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('profile')}
          style={styles.tabItem}
          activeOpacity={0.7}
        >
          <Settings
            size={22}
            color={activeScreen === 'profile' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeScreen === 'profile' && styles.tabLabelActive,
            ]}
          >
            Store
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Regular Buyer / Guest Bottom Dock (Matches Home page.jpg)
  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <TouchableOpacity
        onPress={() => setActiveScreen('home')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <Home
          size={22}
          color={activeScreen === 'home' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeScreen === 'home' && styles.tabLabelActive]}>
          {t.home}
        </Text>
      </TouchableOpacity>

      {/* Wishlist Tab */}
      <TouchableOpacity
        onPress={() => setActiveScreen('home')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <Heart
          size={22}
          color={activeScreen === 'wishlist' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeScreen === 'wishlist' && styles.tabLabelActive]}>
          {t.wishlist}
        </Text>
      </TouchableOpacity>

      {/* Center Floating Red Button (Cart / Bids) */}
      <TouchableOpacity
        onPress={() => setActiveScreen('won_lots')}
        style={styles.centerFab}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Gavel size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Search Tab */}
      <TouchableOpacity
        onPress={() => setActiveScreen('home')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <Search
          size={22}
          color={activeScreen === 'search' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeScreen === 'search' && styles.tabLabelActive]}>
          {t.search}
        </Text>
      </TouchableOpacity>

      {/* Profile / Settings Tab */}
      <TouchableOpacity
        onPress={() => setActiveScreen('profile')}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <Settings
          size={22}
          color={activeScreen === 'profile' ? AppTheme.colors.primary : AppTheme.colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeScreen === 'profile' && styles.tabLabelActive]}>
          {t.settings}
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
    height: 64,
    backgroundColor: AppTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    paddingBottom: 4,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
  centerFab: {
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
