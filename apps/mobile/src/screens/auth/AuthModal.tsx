import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Phone, Lock, X, MessageSquare, ShieldCheck, MapPin } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { ZEEDO_CONFIG } from '../../config/api';
import { LocationPickerStep } from '../../components/LocationPickerStep';
import { MobileUser, DeliveryLocation } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    language,
    isAuthModalOpen,
    closeAuthModal,
    loginWithSession,
    saveDeliveryLocation,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  type AuthStep = 'phone' | 'otp' | 'location';
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Holds verified session until location is confirmed
  const [pendingSession, setPendingSession] = useState<{ token: string; user: MobileUser } | null>(null);

  // 1. Dispatch Real WhatsApp OTP from Zeedo Baileys Gateway (+964 750 881 3641)
  const handleSendOtp = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      setErrorMessage(
        isRtl
          ? 'يرجى إدخال رقم هاتف عراقي صحيح (مثال: 0750XXXXXXX)'
          : 'Please enter a valid Iraqi mobile number (e.g. 0750XXXXXXX)'
      );
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(ZEEDO_CONFIG.ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: trimmedPhone }),
      });

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        setIsOtpSent(true);
      } else {
        setErrorMessage(
          data.message ||
            (isRtl
              ? 'تعذر إرسال الرمز، يرجى التأكد من الرقم والمحاولة ثانية'
              : 'Failed to send OTP code. Please check the number and retry.')
        );
      }
    } catch (err: any) {
      console.warn('WhatsApp OTP dispatch error:', err);
      setErrorMessage(
        isRtl
          ? 'تعذر الاتصال بخادم واتساب، يرجى التحقق من اتصال الإنترنت'
          : 'Could not connect to WhatsApp gateway. Please check network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify Real OTP Code and Log In
  const handleVerifyOtp = async () => {
    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp || trimmedOtp.length < 6) {
      setErrorMessage(
        isRtl
          ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام'
          : 'Please enter the 6-digit verification code'
      );
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(ZEEDO_CONFIG.ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone.trim(), code: trimmedOtp }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        const token = data.sessionToken || `tok-${Date.now()}`;
        const user: MobileUser = {
          id: `usr-${phone.replace(/\D/g, '')}`,
          name: isRtl ? 'مشترك زيدو' : 'Zeedo Member',
          phone: phone.trim(),
          city: 'العراق',
          role: 'buyer',
          kycStatus: 'verified',
        };
        // Preserve session and proceed to Step 3 Location Picker (do NOT call loginWithSession yet as it closes the modal)
        setPendingSession({ token, user });
        setStep('location');
      } else {
        setErrorMessage(
          data.message ||
            (isRtl
              ? 'رمز التحقق غير صحيح أو منتهي الصلاحية'
              : 'Invalid or expired OTP code.')
        );
      }
    } catch (err: any) {
      console.warn('WhatsApp OTP verification error:', err);
      setErrorMessage(
        isRtl
          ? 'حدث خطأ أثناء التحقق، يرجى المحاولة ثانية'
          : 'Error verifying OTP code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setPhone('');
    setOtpCode('');
    setIsOtpSent(false);
    setStep('phone');
    setErrorMessage('');
    setIsLoading(false);
    setIsSavingLocation(false);
    setPendingSession(null);
  };

  const handleLocationConfirm = async (loc: DeliveryLocation) => {
    if (!pendingSession) return;
    setIsSavingLocation(true);
    try {
      const userWithLocation: MobileUser = {
        ...pendingSession.user,
        city: loc.city,
        deliveryLocation: loc,
      };
      // Log in now that location has been pinned and confirmed
      loginWithSession(pendingSession.token, userWithLocation);
      await saveDeliveryLocation(loc, pendingSession.token);
    } finally {
      setIsSavingLocation(false);
      resetState();
      closeAuthModal();
    }
  };

  const handleClose = () => {
    resetState();
    closeAuthModal();
  };

  // ─── Step indicator ───────────────────────────────────────────────────────
  const stepDots = (
    <View style={styles.stepDots}>
      {(['phone', 'otp', 'location'] as const).map((s, i) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            step === s && styles.stepDotActive,
            (step === 'otp' && i === 0) || (step === 'location' && i <= 1)
              ? styles.stepDotDone
              : null,
          ]}
        />
      ))}
    </View>
  );

  return (
    <Modal
      visible={isAuthModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, step === 'location' && styles.sheetTall]}>
          {/* Header Close */}
          <View style={styles.header}>
            {step === 'location' ? (
              <View style={styles.locationHeader}>
                <View style={styles.locationHeaderLeft}>
                  <View style={styles.stepBadge}>
                    <MapPin size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepLabel}>
                    {isRtl ? 'الخطوة 3 من 3' : 'Step 3 of 3'}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <X size={20} color={AppTheme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {stepDots}
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <X size={20} color={AppTheme.colors.textMuted} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── Step 3: Location Picker ── */}
          {step === 'location' ? (
            <LocationPickerStep
              isRtl={isRtl}
              onConfirm={handleLocationConfirm}
              isSaving={isSavingLocation}
            />
          ) : (
            <>
          {/* Title & Trust Header */}
          <View style={styles.titleSection}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeLetter}>Z</Text>
            </View>
            <Text style={[styles.title, isRtl && styles.textRtl]}>
              {isRtl ? 'تسجيل الدخول إلى زيدو' : 'Sign in to Zeedo'}
            </Text>
            <Text style={[styles.subtitle, isRtl && styles.textRtl]}>
              {isRtl
                ? 'أدخل رقم هاتفك لاستلام رمز التحقق الفوري عبر واتساب'
                : 'Enter your phone number for instant WhatsApp verification'}
            </Text>
          </View>

          {/* Bot Number Notice */}
          <View style={styles.botNoticeBox}>
            <MessageSquare size={16} color="#059669" />
            <Text style={styles.botNoticeText}>
              {isRtl
                ? `يصلك الرمز مباشرة من رقم زيدو المعتمد: ${ZEEDO_CONFIG.WHATSAPP_BOT_NUMBER}`
                : `OTP arrives from official Zeedo bot: ${ZEEDO_CONFIG.WHATSAPP_BOT_NUMBER}`}
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Inputs */}
          <View style={styles.form}>
            {/* Step 1: Phone Input */}
            <View style={[styles.inputContainer, isRtl && styles.inputContainerRtl]}>
              <Phone size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setErrorMessage('');
                }}
                placeholder={isRtl ? 'رقم الهاتف (مثال: 07501234567)' : 'Phone (e.g. 07501234567)'}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                editable={!isOtpSent}
                style={[styles.input, isRtl && styles.textRtl]}
              />
            </View>

            {/* Step 2: OTP Input (Shown after OTP is sent) */}
            {isOtpSent && (
              <View>
                <View style={[styles.inputContainer, isRtl && styles.inputContainerRtl]}>
                  <Lock size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={otpCode}
                    onChangeText={(text) => {
                      setOtpCode(text);
                      setErrorMessage('');
                    }}
                    placeholder={isRtl ? 'أدخل رمز واتساب المكون من 6 أرقام' : 'Enter 6-digit WhatsApp OTP'}
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[styles.input, isRtl && styles.textRtl, styles.otpInputText]}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={isLoading}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>
                    {isRtl ? 'إعادة إرسال الرمز؟' : 'Resend code?'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isLoading}
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <MessageSquare size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>
                    {isOtpSent
                      ? (isRtl ? 'تأكيد الدخول' : 'Verify & Sign In')
                      : (isRtl ? 'إرسال الرمز عبر واتساب' : 'Send WhatsApp Code')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Security Footnote */}
            <View style={styles.secureFootnote}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.secureFootnoteText}>
                {isRtl
                  ? 'تسجيل آمن ومشفر 100% بدون أي كلمات مرور تقليدية'
                  : '100% secure passwordless authentication'}
              </Text>
            </View>
          </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  sheetTall: {
    minHeight: '75%',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandBadgeLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  textRtl: {
    textAlign: 'right',
  },
  botNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  botNoticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerRtl: {
    flexDirection: 'row-reverse',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  otpInputText: {
    letterSpacing: 4,
    fontWeight: '800',
    fontSize: 16,
  },
  resendButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
  },
  resendButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.primary,
  },
  submitBtn: {
    backgroundColor: AppTheme.colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secureFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  secureFootnoteText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  // Step dots
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    width: 20,
    backgroundColor: AppTheme.colors.primary,
  },
  stepDotDone: {
    backgroundColor: '#A7F3D0',
  },
  // Location step header
  locationHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
