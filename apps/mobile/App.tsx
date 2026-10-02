import React, { useEffect } from 'react';
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
import { CreateAuctionScreen } from './src/screens/merchant/CreateAuctionScreen';
import { AuthModal } from './src/screens/auth/AuthModal';
import { LocationModal } from './src/components/LocationModal';
import { IntroCarouselScreen } from './src/screens/intro/IntroCarouselScreen';

export default function App() {
  const {
    hasSeenIntro,
    activeTab,
    selectedAuctionId,
    setSearchQuery,
    userRole,
    merchantScreen,
    setMerchantScreen,
    hydrate,
    isHydrated,
    currentUser,
    sessionToken,
    openAuthModal,
  } = useAppStore();

  // Load persisted session + intro state from AsyncStorage on first mount
  useEffect(() => {
    hydrate();
  }, []);

  // Check if authenticated user has incomplete profile wizard steps
  useEffect(() => {
    if (isHydrated && currentUser && sessionToken) {
      const hasDelivery = Boolean(
        currentUser.deliveryLocation?.address ||
          (currentUser.city && currentUser.city !== 'العراق' && currentUser.city !== 'Erbil')
      );
      const hasValidName = Boolean(
        currentUser.name &&
          currentUser.name !== 'مشترك جديد' &&
          currentUser.name !== 'مشترك زيدو'
      );
      const hasGender = Boolean(currentUser.gender);

      if (!hasValidName || !hasGender || !hasDelivery) {
        openAuthModal();
      }
    }
  }, [isHydrated, currentUser, sessionToken]);

  // Wait for AsyncStorage hydration before rendering to avoid flicker
  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <View style={styles.safeArea} />
      </SafeAreaProvider>
    );
  }

  // If first-time user, display the Language Picker & Intro Carousel
  if (!hasSeenIntro) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <IntroCarouselScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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
      if (merchantScreen === 'create_auction') {
        return <CreateAuctionScreen onBack={() => setMerchantScreen('dashboard')} />;
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.container}>
          {showHeader && <Header onSearchChange={setSearchQuery} />}
          <View style={styles.screenContainer}>{renderScreen()}</View>
          <BottomNav />
          <AuthModal />
          <LocationModal />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
  },
});
