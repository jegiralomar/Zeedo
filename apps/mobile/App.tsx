import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { AppTheme } from './src/theme/colors';
import { Header } from './src/components/common/Header';
import { BottomNav } from './src/components/common/BottomNav';
import { HomeScreen } from './src/screens/buyer/HomeScreen';
import { AuctionDetailScreen } from './src/screens/buyer/AuctionDetailScreen';
import { CheckoutScreen } from './src/screens/buyer/CheckoutScreen';
import { ProfileScreen } from './src/screens/buyer/ProfileScreen';
import { MerchantHomeScreen } from './src/screens/merchant/MerchantHomeScreen';
import { MerchantOrdersScreen } from './src/screens/merchant/MerchantOrdersScreen';
import { MerchantCommissionsScreen } from './src/screens/merchant/MerchantCommissionsScreen';
import { AuthModal } from './src/screens/auth/AuthModal';

export default function App() {
  const {
    activeScreen,
    selectedAuctionId,
    setSearchQuery,
    userRole,
  } = useAppStore();

  const renderScreen = () => {
    if (selectedAuctionId) {
      return <AuctionDetailScreen />;
    }

    if (activeScreen === 'checkout' || activeScreen === 'won_lots') {
      return <CheckoutScreen />;
    }

    if (activeScreen === 'profile') {
      return <ProfileScreen />;
    }

    // Merchant Role Screens
    if (userRole === 'merchant') {
      if (activeScreen === 'merchant_orders') {
        return <MerchantOrdersScreen />;
      }
      if (activeScreen === 'merchant_commissions') {
        return <MerchantCommissionsScreen />;
      }
      return <MerchantHomeScreen />;
    }

    // Default Buyer Home
    return <HomeScreen />;
  };

  const showHeader = !selectedAuctionId && activeScreen !== 'checkout' && userRole !== 'merchant';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {showHeader && <Header onSearchChange={setSearchQuery} />}
        <View style={styles.screenContainer}>{renderScreen()}</View>
        <BottomNav />
        <AuthModal />
      </View>
    </SafeAreaView>
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
    backgroundColor: AppTheme.colors.canvas,
  },
  screenContainer: {
    flex: 1,
  },
});
