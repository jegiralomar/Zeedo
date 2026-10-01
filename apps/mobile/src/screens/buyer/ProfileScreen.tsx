import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
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
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { LanguageCode } from '../../types';

export const ProfileScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    logout,
    openAuthModal,
    wonOrders,
    myBids,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const languages: { code: LanguageCode; label: string; sub: string }[] = [
    { code: 'ar', label: 'العربية', sub: 'العراق' },
    { code: 'ckb', label: 'کوردی (سۆرانی)', sub: 'کوردستان' },
    { code: 'badini', label: 'کوردی (بادینی)', sub: 'کوردستان' },
    { code: 'en', label: 'English', sub: 'Global' },
  ];

  const handleOpenWhatsApp = () => {
    const phone = '+9647700000000';
    const message = encodeURIComponent(
      isRtl
        ? 'مرحباً دعم زيدو للمزادات، أحتاج مساعدة بخصوص مزاداتي.'
        : 'Hello Zeedo Support, I need assistance regarding my auctions.'
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`).catch(() => {
      Alert.alert(
        isRtl ? 'تطبيق واتساب غير مثبت' : 'WhatsApp not found',
        isRtl
          ? 'يمكنك التواصل مع خدمة العملاء عبر الرقم: 07700000000'
          : 'You can contact customer service at: +964 770 000 0000'
      );
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header Profile Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'Z'}
          </Text>
        </View>

        <Text style={styles.userName}>
          {currentUser ? currentUser.name : (isRtl ? 'زائر زيدو' : 'Zeedo Guest')}
        </Text>
        <Text style={styles.userPhone}>
          {currentUser ? currentUser.phone : '+964 770 000 0000'}
        </Text>

        <View style={styles.kycBadge}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.kycBadgeText}>
            {currentUser?.kycStatus === 'verified'
              ? (isRtl ? 'حساب موثق بالبطاقة الوطنية' : 'KYC Verified Bidder')
              : (isRtl ? 'حساب مؤكد برقم الهاتف' : 'Verified Phone Account')}
          </Text>
        </View>
      </View>

      {/* 2. Bidder Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Gavel size={18} color={AppTheme.colors.primary} />
          <Text style={styles.statNumber}>{myBids.length + 12}</Text>
          <Text style={styles.statLabel}>{t.totalBids}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Trophy size={18} color="#D97706" />
          <Text style={styles.statNumber}>{wonOrders.length}</Text>
          <Text style={styles.statLabel}>{t.totalWins}</Text>
        </View>
      </View>

      {/* 3. 4-Dialect Language Switcher */}
      <View style={styles.section}>
        <View style={[styles.sectionTitleRow, isRtl && styles.sectionTitleRowRtl]}>
          <Globe size={16} color={AppTheme.colors.primary} />
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

      {/* 4. Trust & Doorstep Inspection Disclosure */}
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

      {/* 5. Direct WhatsApp Support */}
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
              ? 'فريق الدعم متاح 24/7 لمساعدتك في أي استفسار'
              : 'Our support team is available 24/7 to assist you'}
          </Text>
        </View>
        <ChevronRight size={18} color="#64748B" />
      </TouchableOpacity>

      {/* 6. Saved Delivery Addresses */}
      <View style={styles.menuCard}>
        <View style={styles.menuItem}>
          <MapPin size={18} color="#64748B" />
          <View style={styles.menuTextContent}>
            <Text style={styles.menuTitle}>
              {isRtl ? 'عنوان التوصيل الافتراضي' : 'Default Delivery Address'}
            </Text>
            <Text style={styles.menuSub}>
              {isRtl ? 'بغداد، المنصور، شارع 14 رمضان' : 'Baghdad, Al-Mansour'}
            </Text>
          </View>
        </View>

        <View style={styles.menuDivider} />

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

      {/* 7. Auth Action Button */}
      <View style={styles.authSection}>
        {currentUser ? (
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutButton}
            activeOpacity={0.85}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutButtonText}>{t.logout}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={openAuthModal}
            style={styles.loginMainButton}
            activeOpacity={0.85}
          >
            <User size={16} color="#FFFFFF" />
            <Text style={styles.loginMainButtonText}>{t.loginBtn}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFF1F2',
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  kycBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 16,
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
    fontWeight: '600',
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  langButtonActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: '#FFF1F2',
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
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  trustRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  trustBody: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 12,
  },
  whatsappIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  authSection: {
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  loginMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  loginMainButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
