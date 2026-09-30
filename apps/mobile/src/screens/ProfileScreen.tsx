import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MobileBuyerSession, clearMobileSession } from '../lib/session';

interface ProfileScreenProps {
  session: MobileBuyerSession | null;
  onOpenAuth: () => void;
  onOpenLocation: () => void;
  language: 'ckb' | 'badini' | 'ar' | 'en';
  onSelectLanguage: (lang: 'ckb' | 'badini' | 'ar' | 'en') => void;
  onSessionCleared: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  session,
  onOpenAuth,
  onOpenLocation,
  language,
  onSelectLanguage,
  onSessionCleared,
}) => {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your active session on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearMobileSession();
          onSessionCleared();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Delivery</Text>
        <Text style={styles.headerSub}>Doorstep Precision & Preferences</Text>
      </View>

      {/* User Session Card */}
      {session ? (
        <View style={styles.sessionCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(session.user.name || session.user.phone || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.userName}>{session.user.name || 'Verified Buyer'}</Text>
            <Text style={styles.userPhone}>{session.user.phone}</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>✓ 90-Day Hardware Session Active</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestDesc}>
            Sign in with WhatsApp in 1 tap to authorize 90-day instant bidding on all live drops.
          </Text>
          <TouchableOpacity onPress={onOpenAuth} style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Sign In with WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delivery Doorstep Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>DELIVERY DESTINATION</Text>
        <View style={styles.card}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationCity}>📍 {session?.user.city || 'Erbil (Default)'}</Text>
            <TouchableOpacity onPress={onOpenLocation} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Map Pin</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.locationSub}>
            Doorstep cash-on-delivery couriers dispatch to your pinned coordinates.
          </Text>
        </View>
      </View>

      {/* Dialect / Language Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>APP DIALECT / زمان</Text>
        <View style={styles.dialectGrid}>
          {[
            { id: 'ckb', label: 'کوردی (سۆرانی)', sub: 'Sorani' },
            { id: 'badini', label: 'کوردی (بادینی)', sub: 'Badini' },
            { id: 'ar', label: 'العربية (عراقي)', sub: 'Iraqi Arabic' },
            { id: 'en', label: 'English', sub: 'Default' },
          ].map((item) => {
            const isSelected = language === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onSelectLanguage(item.id as any)}
                style={[styles.dialectCard, isSelected && styles.dialectCardActive]}
              >
                <Text style={[styles.dialectLabel, isSelected && styles.dialectLabelActive]}>
                  {item.label}
                </Text>
                <Text style={[styles.dialectSub, isSelected && styles.dialectSubActive]}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Marketplace Guarantees */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ZEEDO GUARANTEES</Text>
        <View style={styles.guaranteeCard}>
          <Text style={styles.guaranteeRow}>• Strictly 1,000 IQD starting price on all lots</Text>
          <Text style={styles.guaranteeRow}>• Real-time anti-sniping resets (≤60s timer extension)</Text>
          <Text style={styles.guaranteeRow}>• 100% open-box doorstep cash inspection before payment</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      {session && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out from this Device</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.versionText}>ZEEDO Mobile • v1.0.0 (Production Release)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072F1F',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  headerSub: {
    color: '#A7C1B5',
    fontSize: 12,
    marginTop: 2,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B4F105',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#072F1F',
    fontSize: 22,
    fontWeight: '900',
  },
  sessionInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  userPhone: {
    color: '#A7C1B5',
    fontSize: 12,
    marginTop: 2,
  },
  verifiedPill: {
    marginTop: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  guestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  guestTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  guestDesc: {
    color: '#A7C1B5',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: '#B4F105',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#072F1F',
    fontWeight: '900',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: '#A7C1B5',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationCity: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  editBtn: {
    backgroundColor: 'rgba(180, 241, 5, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: {
    color: '#B4F105',
    fontWeight: '800',
    fontSize: 11,
  },
  locationSub: {
    color: '#A7C1B5',
    fontSize: 12,
    lineHeight: 18,
  },
  dialectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dialectCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dialectCardActive: {
    backgroundColor: '#B4F105',
    borderColor: '#B4F105',
  },
  dialectLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  dialectLabelActive: {
    color: '#072F1F',
  },
  dialectSub: {
    color: '#A7C1B5',
    fontSize: 10,
    marginTop: 2,
  },
  dialectSubActive: {
    color: '#072F1F',
    fontWeight: '700',
  },
  guaranteeCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 8,
  },
  guaranteeRow: {
    color: '#6EE7B7',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#FB7185',
    fontWeight: '800',
    fontSize: 13,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 11,
    textAlign: 'center',
  },
});
