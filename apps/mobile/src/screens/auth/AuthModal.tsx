import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { User, Lock, X, MessageSquare, Store, ShieldCheck } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

export const AuthModal: React.FC = () => {
  const {
    language,
    isAuthModalOpen,
    closeAuthModal,
    loginAsBuyer,
    loginAsMerchant,
  } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const [phone, setPhone] = useState('07701234567');
  const [password, setPassword] = useState('••••••••');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = () => {
    // Check if phone or input corresponds to merchant
    if (phone.includes('merchant') || phone.includes('sel') || phone.includes('0780')) {
      loginAsMerchant('Al-Mansour Electronics', phone);
    } else {
      loginAsBuyer(phone, 'كرار حيدر');
    }
  };

  const handleSendWhatsappOtp = () => {
    setOtpSent(true);
    setIsOtpMode(true);
  };

  return (
    <Modal
      visible={isAuthModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeAuthModal}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header Close */}
          <View style={styles.header}>
            <TouchableOpacity onPress={closeAuthModal} style={styles.closeBtn}>
              <X size={20} color={AppTheme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Title (Matching Sign In.jpg) */}
          <Text style={[styles.title, isRtl && styles.textRtl]}>{t.welcomeBack}</Text>
          <Text style={[styles.subtitle, isRtl && styles.textRtl]}>{t.loginSub}</Text>

          {/* Form Inputs (Matching Sign In.jpg) */}
          <View style={styles.form}>
            {/* Input 1: Phone / Username */}
            <View style={[styles.inputContainer, isRtl && styles.inputContainerRtl]}>
              <User size={18} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={t.usernameOrPhone}
                placeholderTextColor={AppTheme.colors.textMuted}
                style={[styles.input, isRtl && styles.textRtl]}
              />
            </View>

            {/* Input 2: Password or OTP */}
            <View style={[styles.inputContainer, isRtl && styles.inputContainerRtl]}>
              <Lock size={18} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={isOtpMode ? 'Enter 6-digit WhatsApp OTP' : t.password}
                placeholderTextColor={AppTheme.colors.textMuted}
                secureTextEntry={!isOtpMode}
                style={[styles.input, isRtl && styles.textRtl]}
              />
            </View>

            {/* WhatsApp OTP Status */}
            {otpSent && (
              <View style={styles.otpBanner}>
                <MessageSquare size={14} color={AppTheme.colors.green} />
                <Text style={styles.otpBannerText}>
                  {isRtl ? 'تم إرسال رمز التحقق إلى واتساب الخاص بك!' : 'OTP Code sent to your WhatsApp!'}
                </Text>
              </View>
            )}

            {/* Primary Login Button (Matching Sign In.jpg Coral Button) */}
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>{t.loginBtn}</Text>
            </TouchableOpacity>

            {/* WhatsApp Direct OTP Trigger */}
            <TouchableOpacity
              onPress={handleSendWhatsappOtp}
              style={styles.whatsappBtn}
              activeOpacity={0.85}
            >
              <MessageSquare size={16} color="#059669" />
              <Text style={styles.whatsappBtnText}>{t.continueWithWhatsapp}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK DEMO</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1-Tap Demo Shortcuts */}
            <View style={styles.demoRow}>
              <TouchableOpacity
                onPress={() => loginAsBuyer('07701234567', 'كرار حيدر')}
                style={styles.demoPill}
              >
                <User size={13} color={AppTheme.colors.primary} />
                <Text style={styles.demoPillText}>Buyer Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => loginAsMerchant('Al-Mansour Electronics', '07809876543')}
                style={styles.demoPill}
              >
                <Store size={13} color={AppTheme.colors.secondary} />
                <Text style={styles.demoPillText}>Merchant Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputContainerRtl: {
    flexDirection: 'row-reverse',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: AppTheme.colors.textPrimary,
  },
  loginBtn: {
    backgroundColor: AppTheme.colors.primary,
    height: 48,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  whatsappBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    height: 44,
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whatsappBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
  },
  otpBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppTheme.colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: AppTheme.colors.textMuted,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.surface,
    paddingVertical: 10,
    borderRadius: AppTheme.radius.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  textRtl: {
    textAlign: 'right',
  },
});
