import React from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from './src/store/useAppStore';
import { AppTheme } from './src/theme/colors';
import { Header } from './src/components/common/Header';
import { BottomNav } from './src/components/common/BottomNav';
import { HomeScreen } from './src/screens/buyer/HomeScreen';
import { AuctionDetailScreen } from './src/screens/buyer/AuctionDetailScreen';
import { WatchlistScreen } from './src/screens/buyer/WatchlistScreen';
import { BagScreen } from './src/screens/buyer/BagScreen';
import { ProfileScreen } from './src/screens/buyer/ProfileScreen';
import { MerchantHomeScreen } from './src/screens/merchant/MerchantHomeScreen';
import { MerchantOrdersScreen } from './src/screens/merchant/MerchantOrdersScreen';
import { MerchantCommissionsScreen } from './src/screens/merchant/MerchantCommissionsScreen';
import { AuthModal } from './src/screens/auth/AuthModal';

export default function App() {
  const {
    activeTab,
    selectedAuctionId,
    setSearchQuery,
    userRole,
    merchantScreen,
  } = useAppStore();

  const renderScreen = () => {
    // 1. Dedicated Full Auction Room Detail
    if (selectedAuctionId) {
      return <AuctionDetailScreen />;
    }

    // 2. Strict Merchant Role Screens
    if (userRole === 'merchant') {
      if (activeTab === 'profile') {
        return <ProfileScreen />;
      }
      if (merchantScreen === 'orders') {
        return <MerchantOrdersScreen />;
      }
      if (merchantScreen === 'ledger') {
        return <MerchantCommissionsScreen />;
      }
      return <MerchantHomeScreen />;
    }

    // 3. Buyer 4-Tab Custom Screens
    if (activeTab === 'watchlist') {
      return <WatchlistScreen />;
    }

    if (activeTab === 'bag') {
      return <BagScreen />;
    }

    if (activeTab === 'profile') {
      return <ProfileScreen />;
    }

    // Default Tab: Auctions (المزادات)
    return <HomeScreen />;
  };

  // Header is shown on main screens, hidden when in full auction room
  const showHeader = !selectedAuctionId && userRole !== 'merchant';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.container}>
          {showHeader && <Header onSearchChange={setSearchQuery} />}
          <View style={styles.screenContainer}>{renderScreen()}</View>
          <BottomNav />
          <AuthModal />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
});
