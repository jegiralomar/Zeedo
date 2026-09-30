import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { getMobileSession, clearMobileSession, MobileBuyerSession } from './src/lib/session';
import { liveSocket } from './src/lib/socket';

export default function App() {
  const [session, setSession] = useState<MobileBuyerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'ckb' | 'badini' | 'ar' | 'en'>('ckb');

  useEffect(() => {
    // 1. Hydrate 90-day hardware session
    getMobileSession().then((saved) => {
      setSession(saved);
      setLoading(false);
    });

    // 2. Connect to lightweight WebSocket gateway
    liveSocket.connect();

    return () => {
      liveSocket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#B4F105" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#072F1F" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ZEEDO</Text>
          <Text style={styles.headerSubtitle}>Live 1,000 IQD Marketplace</Text>
        </View>

        {/* Dialect Switcher */}
        <View style={styles.dialectRow}>
          {(['ckb', 'badini', 'ar', 'en'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[styles.dialectPill, language === lang && styles.dialectPillActive]}
            >
              <Text
                style={[
                  styles.dialectPillText,
                  language === lang && styles.dialectPillTextActive,
                ]}
              >
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Session Status Banner */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionStatusText}>
            {session
              ? `Signed in as ${session.user.name || session.user.phone} (90-Day Active Session)`
              : 'Guest Mode — Instant 1-Tap OTP On First Bid'}
          </Text>
          {session && (
            <TouchableOpacity
              onPress={async () => {
                await clearMobileSession();
                setSession(null);
              }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Live Drops Feed Placeholder */}
        <View style={styles.feedCard}>
          <Text style={styles.feedTitle}>
            {language === 'ckb'
              ? 'مزادە ڕاستەوخۆکان'
              : language === 'badini'
              ? 'مەزادێن ئێکسەر'
              : language === 'ar'
              ? 'المزادات المباشرة'
              : 'Live Auctions'}
          </Text>
          <Text style={styles.feedDesc}>
            {language === 'ckb'
              ? 'دەستپێکردن بە تەنها ١,٠٠٠ دیناری عێراقی لەگەڵ پشکنینی ١٠٠٪ پێش پارەدان.'
              : language === 'badini'
              ? 'دەستپێکرن ب تنێ ١,٠٠٠ دینارێن عیراقی دگەل پشکنینا پێش پارەدانی.'
              : language === 'ar'
              ? 'تبدأ المزايدة بدينار واحد فقط (1,000 د.ع) مع فحص البضاعة عند الاستلام.'
              : 'Starting from strictly 1,000 IQD with 100% open-box inspection before cash payment.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072F1F',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#072F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B4F105',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#A7C1B5',
    marginTop: 2,
  },
  dialectRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dialectPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dialectPillActive: {
    backgroundColor: '#B4F105',
  },
  dialectPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dialectPillTextActive: {
    color: '#072F1F',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  logoutButtonText: {
    color: '#FB7185',
    fontSize: 11,
    fontWeight: 'bold',
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B130F',
    marginBottom: 8,
  },
  feedDesc: {
    fontSize: 13,
    color: '#6C7E75',
    lineHeight: 20,
  },
});
