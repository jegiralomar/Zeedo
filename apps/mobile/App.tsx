import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { TOKENS } from './src/theme/tokens';
import { useAuthStore } from './src/store/useAuthStore';
import { useAuctionStore } from './src/store/useAuctionStore';
import { TRANSLATIONS, isRTL } from './src/i18n/translations';
import { MobileAuctionItem } from './src/types';

// Components
import { HeaderBar } from './src/components/HeaderBar';
import { LanguageSelectorModal } from './src/components/LanguageSelectorModal';
import { TwoGateVerificationModal } from './src/components/TwoGateVerificationModal';
import { RooftopLocationModal } from './src/components/RooftopLocationModal';
import { LiveAuctionRoomModal } from './src/components/LiveAuctionRoomModal';
import { CodCheckoutModal } from './src/components/CodCheckoutModal';
import { DisputeModal } from './src/components/DisputeModal';
import { NotificationCenterModal } from './src/components/NotificationCenterModal';
import { LiveChatSupportModal } from './src/components/LiveChatSupportModal';

// Screens
import { BuyerMarketplaceScreen } from './src/screens/BuyerMarketplaceScreen';
import { MyBidsScreen } from './src/screens/MyBidsScreen';
import { SellerStudioScreen } from './src/screens/SellerStudioScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

import { SavedAuctionsScreen } from './src/screens/SavedAuctionsScreen';
import { SellerFinancialsScreen } from './src/screens/SellerFinancialsScreen';
import { SellerProfileScreen } from './src/screens/SellerProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { AccountSwitchModal } from './src/components/AccountSwitchModal';

// Icons
import {
  Flame,
  Gavel,
  Store,
  User,
  Zap,
  Bookmark,
  TrendingUp,
  Building2,
} from 'lucide-react-native';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width > 500;

  const { isAuthenticated, role, language, buyer, isTwoGateVerified, completeGate1, completeGate2 } =
    useAuthStore();
  const { auctions, myAutoBids, placeSlideBid, setAutoBidCeiling, lastBidAlert, clearLastBidAlert } =
    useAuctionStore();

  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  // Dedicated role-segregated navigation states:
  // Buyers navigate: Explore | My Bids | Watchlist | Profile
  // Sellers navigate ONLY: Studio (Create Listings) | Financial Reports | Store Profile
  const [buyerTab, setBuyerTab] = useState<'home' | 'my-bids' | 'saved' | 'profile'>('home');
  const [sellerTab, setSellerTab] = useState<'studio' | 'finance' | 'profile'>('studio');

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAccountSwitchModal, setShowAccountSwitchModal] = useState(false);
  const [showTwoGateModal, setShowTwoGateModal] = useState(false);
  const [showRooftopModal, setShowRooftopModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<MobileAuctionItem | null>(null);
  const [checkoutAuction, setCheckoutAuction] = useState<MobileAuctionItem | null>(null);
  const [disputeAuction, setDisputeAuction] = useState<MobileAuctionItem | null>(null);

  const currentOpenAuction = selectedAuction
    ? auctions.find((a) => a.id === selectedAuction.id) || selectedAuction
    : null;

  return (
    <View style={[styles.outerContainer, isDesktopWeb && styles.outerDesktopContainer]}>
      {/* Centered Phone Shell Container */}
      <View style={[styles.shellContainer, isDesktopWeb && styles.desktopShell]}>
        {/* Dynamic Island / Speaker Pill for authentic mobile frame preview on desktop */}
        {isDesktopWeb && (
          <View style={styles.deviceSpeakerBar}>
            <View style={styles.dynamicIsland} />
          </View>
        )}

        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
          />

          {/* Modals & Dialogs */}
          <LanguageSelectorModal
            visible={showLanguageModal}
            onClose={() => setShowLanguageModal(false)}
          />

          {!isAuthenticated ? (
            // Dedicated Unauthenticated Onboarding Flow (WhatsApp OTP & Merchant Portal)
            <AuthScreen onOpenLanguageModal={() => setShowLanguageModal(true)} />
          ) : (
            <>
              {/* Header Bar */}
              <HeaderBar
                onOpenLanguageModal={() => setShowLanguageModal(true)}
                onOpenNotifications={() => setShowNotificationsModal(true)}
                onOpenSupport={() => setShowSupportModal(true)}
              />

              {/* Real-time Bid Alert Pill Banner */}
              {lastBidAlert && (
                <View style={styles.alertContainer}>
                  <TouchableOpacity
                    style={styles.alertBar}
                    onPress={clearLastBidAlert}
                    activeOpacity={0.9}
                  >
                    <View style={styles.alertIconCircle}>
                      <Zap size={12} color="#ffffff" />
                    </View>
                    <Text style={styles.alertText}>{lastBidAlert}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Main Screen Body */}
              <View style={styles.body}>
                {role === 'seller' ? (
                  // SELLER SCOPE: Strictly Seller Studio, Financial Reports, and Store Profile
                  sellerTab === 'studio' ? (
                    <SellerStudioScreen />
                  ) : sellerTab === 'finance' ? (
                    <SellerFinancialsScreen />
                  ) : (
                    <SellerProfileScreen
                      onRequestLanguage={() => setShowLanguageModal(true)}
                      onRequestSwitchAccount={() => setShowAccountSwitchModal(true)}
                    />
                  )
                ) : (
                  // BUYER SCOPE: Marketplace, My Bids, Watchlist, Buyer Profile
                  buyerTab === 'home' ? (
                    <BuyerMarketplaceScreen
                      onSelectItem={(item) => setSelectedAuction(item)}
                      onRequestTwoGate={() => setShowTwoGateModal(true)}
                    />
                  ) : buyerTab === 'my-bids' ? (
                    <MyBidsScreen
                      onOpenCheckout={(item) => setCheckoutAuction(item)}
                      onOpenDispute={(item) => setDisputeAuction(item)}
                    />
                  ) : buyerTab === 'saved' ? (
                    <SavedAuctionsScreen
                      onSelectItem={(item) => setSelectedAuction(item)}
                      onNavigateHome={() => setBuyerTab('home')}
                    />
                  ) : (
                    <ProfileScreen
                      onRequestTwoGate={() => setShowTwoGateModal(true)}
                      onRequestLanguage={() => setShowLanguageModal(true)}
                      onRequestRooftop={() => setShowRooftopModal(true)}
                      onRequestSwitchAccount={() => setShowAccountSwitchModal(true)}
                      onRequestSupport={() => setShowSupportModal(true)}
                    />
                  )
                )}
              </View>

              {/* Modern Floating Bottom Navigation Bar (Role-Segregated) */}
              <View style={styles.floatingNavWrapper}>
                <View style={[styles.bottomNav, rtl && styles.rtlRow]}>
                  {role === 'seller' ? (
                    // SELLER NAVIGATION: Studio | Financial Reports | Store Profile
                    <>
                      <TouchableOpacity
                        style={[styles.navTab, sellerTab === 'studio' && styles.navTabStudioActive]}
                        onPress={() => setSellerTab('studio')}
                        activeOpacity={0.75}
                      >
                        <Store
                          size={18}
                          color={
                            sellerTab === 'studio'
                              ? TOKENS.colors.secondary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            sellerTab === 'studio' && styles.navLabelStudioActiveText,
                          ]}
                        >
                          {t.tabStudio}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navTab, sellerTab === 'finance' && styles.navTabStudioActive]}
                        onPress={() => setSellerTab('finance')}
                        activeOpacity={0.75}
                      >
                        <TrendingUp
                          size={18}
                          color={
                            sellerTab === 'finance'
                              ? TOKENS.colors.secondary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            sellerTab === 'finance' && styles.navLabelStudioActiveText,
                          ]}
                        >
                          {t.tabFinance}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navTab, sellerTab === 'profile' && styles.navTabStudioActive]}
                        onPress={() => setSellerTab('profile')}
                        activeOpacity={0.75}
                      >
                        <Building2
                          size={18}
                          color={
                            sellerTab === 'profile'
                              ? TOKENS.colors.secondary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            sellerTab === 'profile' && styles.navLabelStudioActiveText,
                          ]}
                        >
                          {t.tabStoreProfile}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // BUYER NAVIGATION: Explore | My Bids | Watchlist | Profile (Strictly NO listing access!)
                    <>
                      <TouchableOpacity
                        style={[styles.navTab, buyerTab === 'home' && styles.navTabActive]}
                        onPress={() => setBuyerTab('home')}
                        activeOpacity={0.75}
                      >
                        <Flame
                          size={18}
                          color={
                            buyerTab === 'home'
                              ? TOKENS.colors.primary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            buyerTab === 'home' && styles.navLabelActive,
                          ]}
                        >
                          {t.tabHome}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navTab, buyerTab === 'my-bids' && styles.navTabActive]}
                        onPress={() => setBuyerTab('my-bids')}
                        activeOpacity={0.75}
                      >
                        <Gavel
                          size={18}
                          color={
                            buyerTab === 'my-bids'
                              ? TOKENS.colors.primary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            buyerTab === 'my-bids' && styles.navLabelActive,
                          ]}
                        >
                          {t.tabMyBids}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navTab, buyerTab === 'saved' && styles.navTabActive]}
                        onPress={() => setBuyerTab('saved')}
                        activeOpacity={0.75}
                      >
                        <Bookmark
                          size={18}
                          color={
                            buyerTab === 'saved'
                              ? TOKENS.colors.primary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            buyerTab === 'saved' && styles.navLabelActive,
                          ]}
                        >
                          {t.tabSaved}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navTab, buyerTab === 'profile' && styles.navTabActive]}
                        onPress={() => setBuyerTab('profile')}
                        activeOpacity={0.75}
                      >
                        <User
                          size={18}
                          color={
                            buyerTab === 'profile'
                              ? TOKENS.colors.primary
                              : TOKENS.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.navLabel,
                            buyerTab === 'profile' && styles.navLabelActive,
                          ]}
                        >
                          {t.tabProfile}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Modals & Dialogs */}
              <AccountSwitchModal
                visible={showAccountSwitchModal}
                onClose={() => setShowAccountSwitchModal(false)}
              />

              <TwoGateVerificationModal
                visible={showTwoGateModal}
                onSuccess={() => setShowTwoGateModal(false)}
                onClose={() => setShowTwoGateModal(false)}
              />

              <RooftopLocationModal
                visible={showRooftopModal}
                onSavePin={(pin) => completeGate2(pin)}
                onClose={() => setShowRooftopModal(false)}
                isRtl={rtl}
              />

              {currentOpenAuction && (
                <LiveAuctionRoomModal
                  visible={!!selectedAuction}
                  item={currentOpenAuction}
                  language={language}
                  myCeiling={myAutoBids[currentOpenAuction.id]}
                  onPlaceBid={(auctionId) =>
                    placeSlideBid(auctionId, buyer.name, buyer.phone)
                  }
                  onSetCeiling={(auctionId, ceiling) =>
                    setAutoBidCeiling(auctionId, ceiling)
                  }
                  onRequestTwoGate={() => setShowTwoGateModal(true)}
                  onRequestSupport={() => setShowSupportModal(true)}
                  isTwoGateVerified={isTwoGateVerified()}
                  onClose={() => setSelectedAuction(null)}
                />
              )}

              <CodCheckoutModal
                visible={!!checkoutAuction}
                item={checkoutAuction}
                rooftopPin={buyer.rooftopPin}
                onConfirmDispatch={(awb) => {
                  setCheckoutAuction(null);
                }}
                onClose={() => setCheckoutAuction(null)}
                isRtl={rtl}
              />

              {disputeAuction && (
                <DisputeModal
                  visible={!!disputeAuction}
                  orderRef={`ORD-${disputeAuction.id.toUpperCase()}`}
                  itemTitle={disputeAuction.multilingual.en.title}
                  onClose={() => setDisputeAuction(null)}
                  onSubmit={(reason, details) => {
                    setDisputeAuction(null);
                  }}
                  isRtl={rtl}
                />
              )}

              {/* Notification Center Modal */}
              <NotificationCenterModal
                visible={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                onSelectAuction={(auctionId) => {
                  const target = auctions.find((a) => a.id === auctionId);
                  if (target) setSelectedAuction(target);
                }}
              />

              {/* 24/7 Live Chat Concierge Modal */}
              <LiveChatSupportModal
                visible={showSupportModal}
                onClose={() => setShowSupportModal(false)}
              />
            </>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  outerDesktopContainer: {
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  shellContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: TOKENS.colors.background,
  },
  desktopShell: {
    maxWidth: 440,
    maxHeight: 900,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 20,
  },
  deviceSpeakerBar: {
    height: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dynamicIsland: {
    width: 90,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  body: {
    flex: 1,
  },
  alertContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  alertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  alertIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
  },
  floatingNavWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  bottomNav: {
    width: '100%',
    maxWidth: 420,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: TOKENS.borderRadius.full,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...TOKENS.shadows.floatingBar,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: TOKENS.borderRadius.full,
  },
  navTabActive: {
    backgroundColor: TOKENS.colors.primaryLight,
  },
  navTabStudioActive: {
    backgroundColor: TOKENS.colors.secondaryLight,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
  },
  navLabelActive: {
    color: TOKENS.colors.primary,
    fontWeight: '900',
  },
  navLabelStudioActiveText: {
    color: TOKENS.colors.secondary,
    fontWeight: '900',
  },
});
