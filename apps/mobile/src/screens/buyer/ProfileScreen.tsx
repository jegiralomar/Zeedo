import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
} from 'react-native';
import {
  ShieldCheck,
  Globe,
  Gavel,
  Trophy,
  LogOut,
  MapPin,
  MessageCircle,
  FileText,
  ChevronRight,
  User,
  Sparkles,
  ArrowRight,
  Camera,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { LanguageCode } from '../../types';
import { ZEEDO_CONFIG } from '../../config/api';

export const ProfileScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    logout,
    openAuthModal,
    openLocationSetup,
    wonOrders,
    myBids,
    updateUserProfile,
    sessionToken,
  } = useAppStore();

  const [isUpdatingAvatar, setIsUpdatingAvatar] = React.useState(false);

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const languages: { code: LanguageCode; label: string; sub: string }[] = [
    { code: 'ar', label: 'العربية', sub: 'العراق' },
    { code: 'ckb', label: 'کوردی (سۆرانی)', sub: 'کوردستان' },
    { code: 'badini', label: 'کوردی (بادینی)', sub: 'کوردستان' },
    { code: 'en', label: 'English', sub: 'Global' },
  ];

  const handleOpenWhatsApp = () => {
    const phone = '+9647508813641';
    const message = encodeURIComponent(
      isRtl
        ? 'مرحباً دعم زيدو للمزادات، أحتاج مساعدة بخصوص حسابي.'
        : 'Hello Zeedo Support, I need assistance with my account.'
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`).catch(() => {
      Alert.alert(
        isRtl ? 'تطبيق واتساب غير مثبت' : 'WhatsApp not found',
        isRtl
          ? 'يمكنك التواصل مع خدمة العملاء عبر الرقم: 07508813641'
          : 'You can contact customer service at: +964 750 881 3641'
      );
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. GUEST VIEW (When Not Logged In)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.guestScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.guestCard}>
          {/* 1. Primary Sign In / Register Action */}
          <TouchableOpacity
            style={styles.guestAuthBtn}
            onPress={openAuthModal}
            activeOpacity={0.88}
          >
            <View style={styles.primaryAuthBtnInner}>
              <User size={20} color="#FFFFFF" />
              <Text style={styles.guestAuthBtnText}>
                {isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Sign Up / Log In'}
              </Text>
              <Sparkles size={18} color="#FFE4E8" />
            </View>
          </TouchableOpacity>

          {/* 2. 4-Dialect Language Switcher */}
          <View style={styles.guestLangSection}>
            <View style={[styles.sectionTitleRow, isRtl && styles.sectionTitleRowRtl]}>
              <Globe size={18} color={AppTheme.colors.primary} />
              <Text style={styles.sectionTitle}>{t.language}</Text>
            </View>

            <View style={styles.langGrid}>
              {languages.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  onPress={() => setLanguage(item.code)}
                  style={[
                    styles.langButton,
                    language === item.code && styles.langButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.langButtonText,
                      language === item.code && styles.langButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.langSub}>{item.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Space for Floating Pill BottomNav */}
        <View style={{ height: 88 }} />
      </ScrollView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. LOGGED-IN VIEW (Full Rich Profile)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleUpdateAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isRtl ? 'صلاحية الاستوديو' : 'Permission Required',
          isRtl
            ? 'يرجى السماح بالوصول للاستوديو لتغيير صورتك الشخصية'
            : 'Please grant gallery access to change your avatar'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setIsUpdatingAvatar(true);

        try {
          const formData = new FormData();
          const filename = localUri.split('/').pop() || `avatar-${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('file', {
            uri: localUri,
            name: filename,
            type: fileType,
          } as any);
          formData.append('folder', 'avatars');

          const uploadRes = await fetch(`${ZEEDO_CONFIG.API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });

          let finalUrl = localUri;
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData.success && uploadData.url) {
              finalUrl = uploadData.url;
            }
          }

          await updateUserProfile({ avatar: finalUrl }, sessionToken || undefined);
        } catch (uploadErr) {
          console.warn('Avatar update failed:', uploadErr);
          await updateUserProfile({ avatar: localUri }, sessionToken || undefined);
        } finally {
          setIsUpdatingAvatar(false);
        }
      }
    } catch (err) {
      console.warn('Avatar picker error:', err);
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Profile Card */}
      <View style={styles.headerCard}>
        <TouchableOpacity
          onPress={handleUpdateAvatar}
          disabled={isUpdatingAvatar}
          activeOpacity={0.8}
          style={styles.avatarWrapper}
        >
          {currentUser.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Camera size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userPhone}>{currentUser.phone}</Text>

        <View style={styles.badgesRow}>
          {currentUser.gender && (
            <View style={styles.genderBadge}>
              <Text style={styles.genderBadgeText}>
                {currentUser.gender === 'female'
                  ? (isRtl ? 'أنثى' : 'Female')
                  : (isRtl ? 'ذكر' : 'Male')}
              </Text>
            </View>
          )}

          <View style={styles.kycBadge}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.kycBadgeText}>
              {currentUser.kycStatus === 'verified'
                ? (isRtl ? 'حساب موثق بالبطاقة الوطنية' : 'KYC Verified Bidder')
                : (isRtl ? 'حساب مؤكد برقم الهاتف' : 'Verified Phone Account')}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Bidder Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Gavel size={18} color={AppTheme.colors.primary} />
          <Text style={styles.statNumber}>{myBids.length}</Text>
          <Text style={styles.statLabel}>{t.totalBids}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Trophy size={18} color="#D97706" />
          <Text style={styles.statNumber}>{wonOrders.length}</Text>
          <Text style={styles.statLabel}>{t.totalWins}</Text>
        </View>
      </View>

      {/* 3. Saved Delivery Address Card */}
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={openLocationSetup}
          activeOpacity={0.7}
        >
          <MapPin size={18} color={AppTheme.colors.primary} />
          <View style={styles.menuTextContent}>
            <Text style={styles.menuTitle}>
              {isRtl ? 'عنوان التوصيل المعتمد' : 'Verified Delivery Address'}
            </Text>
            <Text style={styles.menuSub} numberOfLines={1}>
              {currentUser.deliveryLocation?.address ||
                (isRtl ? `${currentUser.city} (اضغط لتحديد العنوان)` : `${currentUser.city} (Tap to set address)`)}
            </Text>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* 4. 4-Dialect Language Switcher */}
      <View style={styles.section}>
        <View style={[styles.sectionTitleRow, isRtl && styles.sectionTitleRowRtl]}>
          <Globe size={18} color={AppTheme.colors.primary} />
          <Text style={styles.sectionTitle}>{t.language}</Text>
        </View>

        <View style={styles.langGrid}>
          {languages.map((item) => (
            <TouchableOpacity
              key={item.code}
              onPress={() => setLanguage(item.code)}
              style={[
                styles.langButton,
                language === item.code && styles.langButtonActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.langButtonText,
                  language === item.code && styles.langButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.langSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. Trust & Doorstep Inspection Disclosure */}
      <View style={styles.trustSection}>
        <View style={styles.trustRow}>
          <ShieldCheck size={20} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>
              {isRtl ? 'حق المعاينة قبل الدفع' : 'Doorstep Inspection Policy'}
            </Text>
            <Text style={styles.trustBody}>
              {isRtl
                ? 'في زيدو، لك الحق الكامل بفتح الطرد وتشغيل وفحص السلعة أمام مندوب التوصيل في منزلك والتأكد من مطابقتها قبل دفع المبلغ نقداً.'
                : 'You have full right to open and inspect the item at your doorstep with the courier before paying cash on delivery.'}
            </Text>
          </View>
        </View>
      </View>

      {/* 6. Direct WhatsApp Support */}
      <TouchableOpacity
        style={styles.whatsappCard}
        onPress={handleOpenWhatsApp}
        activeOpacity={0.85}
      >
        <View style={styles.whatsappIconCircle}>
          <MessageCircle size={22} color="#FFFFFF" />
        </View>
        <View style={styles.whatsappContent}>
          <Text style={styles.whatsappTitle}>
            {isRtl ? 'تواصل مع الدعم الفني عبر واتساب' : 'Direct WhatsApp Support'}
          </Text>
          <Text style={styles.whatsappSub}>
            {isRtl
              ? 'فريق الدعم متاح لمساعدتك في أي استفسار'
              : 'Our support team is available 24/7 to assist you'}
          </Text>
        </View>
        <ChevronRight size={18} color="#64748B" />
      </TouchableOpacity>

      {/* 7. Terms & Conditions */}
      <View style={styles.menuCard}>
        <View style={styles.menuItem}>
          <FileText size={18} color="#64748B" />
          <View style={styles.menuTextContent}>
            <Text style={styles.menuTitle}>
              {isRtl ? 'شروط وأحكام المزايدة في العراق' : 'Bidding Terms & Conditions'}
            </Text>
            <Text style={styles.menuSub}>
              {isRtl ? 'نظام المزايدة العادل، وتمديد الدقيقة الأخيرة' : 'Fair Bidding & Soft-Close Rules'}
            </Text>
          </View>
        </View>
      </View>

      {/* 8. Log Out Action Button */}
      <View style={styles.authSection}>
        <TouchableOpacity
          onPress={logout}
          style={styles.logoutButton}
          activeOpacity={0.85}
        >
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.logoutButtonText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      {/* Extra Bottom Padding for Floating Pill BottomNav */}
      <View style={{ height: 88 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  // Guest View
  guestScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  guestAuthBtn: {
    backgroundColor: AppTheme.colors.primary,
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  guestAuthBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  guestLangSection: {
    marginTop: 6,
  },
  primaryAuthBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Logged In View
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 6,
    right: -2,
    backgroundColor: AppTheme.colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: AppTheme.colors.primary,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genderBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kycBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitleRowRtl: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  langButtonActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: AppTheme.colors.primaryLight,
  },
  langButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  langButtonTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  langSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  trustSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  trustRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  trustBody: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  whatsappIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappContent: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  whatsappSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  authSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});
