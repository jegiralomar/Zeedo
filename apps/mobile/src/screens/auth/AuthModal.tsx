import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Linking,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Phone,
  Lock,
  X,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Sparkles,
  ExternalLink,
  User,
  Camera,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
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
    updateUserProfile,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  type AuthStep = 'phone' | 'otp' | 'profile' | 'location';
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receivedOtpCode, setReceivedOtpCode] = useState<string | null>(null);

  // Profile Setup State (Step 2)
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Holds verified session across steps
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
        setStep('otp');
        if (data.code) {
          setReceivedOtpCode(data.code);
        }
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

  // 2. Verify WhatsApp OTP Code
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
          id: data.user?.id || `usr-${phone.replace(/\D/g, '')}`,
          name: data.user?.name || (isRtl ? 'مشترك جديد' : 'New Member'),
          phone: phone.trim(),
          city: data.user?.city || 'العراق',
          role: 'buyer',
          kycStatus: 'verified',
          gender: data.user?.gender,
          avatar: data.user?.avatar,
        };

        setPendingSession({ token, user });

        // Authenticate immediately in background store
        loginWithSession(token, user);

        // Advance to Step 2: Profile Setup (Name, Gender, Avatar)
        setStep('profile');
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

  // 3. Handle Avatar Photo Picker (Gallery)
  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isRtl ? 'صلاحية الاستوديو' : 'Permission Required',
          isRtl
            ? 'يرجى السماح بالوصول للاستوديو لاختيار صورتك الشخصية'
            : 'Please grant gallery access to choose an avatar photo'
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
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Avatar picker error:', err);
    }
  };

  // 4. Save Profile & Advance to Location (Step 3)
  const handleSaveProfileAndNext = async () => {
    if (!pendingSession) return;

    const trimmedName = fullName.trim() || (isRtl ? 'مشترك زيدو' : 'Zeedo Member');
    const updatedUser: MobileUser = {
      ...pendingSession.user,
      name: trimmedName,
      gender,
      avatar: avatarUri || undefined,
    };

    setPendingSession({ token: pendingSession.token, user: updatedUser });

    // Update in store and server
    loginWithSession(pendingSession.token, updatedUser);
    updateUserProfile(
      { name: trimmedName, gender, avatar: avatarUri || undefined },
      pendingSession.token
    );

    // Proceed to Step 3: Location
    setStep('location');
  };

  // 5. Skip Profile Step
  const handleSkipProfile = () => {
    if (pendingSession) {
      loginWithSession(pendingSession.token, pendingSession.user);
    }
    setStep('location');
  };

  // 6. Confirm Location (Step 3)
  const handleLocationConfirm = async (loc: DeliveryLocation) => {
    if (!pendingSession) return;
    setIsSavingLocation(true);
    try {
      const userWithLocation: MobileUser = {
        ...pendingSession.user,
        city: loc.city,
        deliveryLocation: loc,
      };
      loginWithSession(pendingSession.token, userWithLocation);
      await saveDeliveryLocation(loc, pendingSession.token);
    } catch (_) {
      // Best-effort
    } finally {
      setIsSavingLocation(false);
      resetState();
      closeAuthModal();
    }
  };

  const handleSkipLocation = () => {
    if (pendingSession) {
      loginWithSession(pendingSession.token, pendingSession.user);
    }
    resetState();
    closeAuthModal();
  };

  const handleClose = () => {
    if (pendingSession) {
      loginWithSession(pendingSession.token, pendingSession.user);
    }
    resetState();
    closeAuthModal();
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
    setFullName('');
    setAvatarUri(null);
    setGender('male');
  };

  // ─── Step Indicator Dots ──────────────────────────────────────────────────
  const stepDots = (
    <View style={styles.stepDots}>
      {(['phone', 'profile', 'location'] as const).map((s, i) => {
        const isCurrent =
          (s === 'phone' && (step === 'phone' || step === 'otp')) ||
          (s === 'profile' && step === 'profile') ||
          (s === 'location' && step === 'location');
        const isDone =
          (s === 'phone' && (step === 'profile' || step === 'location')) ||
          (s === 'profile' && step === 'location');

        return (
          <View
            key={s}
            style={[
              styles.stepDot,
              isCurrent && styles.stepDotActive,
              isDone && styles.stepDotDone,
            ]}
          />
        );
      })}
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
        <View
          style={[
            styles.sheet,
            (step === 'location' || step === 'profile') && styles.sheetTall,
          ]}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {step === 'profile' && (
                <View style={styles.stepHeaderTag}>
                  <UserCheck size={14} color="#FFFFFF" />
                  <Text style={styles.stepLabel}>
                    {isRtl ? 'الخطوة 2 من 3: الملف الشخصي' : 'Step 2 of 3: Profile'}
                  </Text>
                </View>
              )}
              {step === 'location' && (
                <View style={styles.stepHeaderTag}>
                  <MapPin size={14} color="#FFFFFF" />
                  <Text style={styles.stepLabel}>
                    {isRtl ? 'الخطوة 3 من 3: عنوان التوصيل' : 'Step 3 of 3: Delivery'}
                  </Text>
                </View>
              )}
              {(step === 'phone' || step === 'otp') && stepDots}
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color={AppTheme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* STEP 2: PROFILE SETUP (Name, Gender, Avatar)                     */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {step === 'profile' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.profileSetupContainer}
            >
              <View style={styles.titleSection}>
                <Text style={[styles.title, isRtl && styles.textRtl]}>
                  {isRtl ? 'إكمال الملف الشخصي' : 'Complete Your Profile'}
                </Text>
                <Text style={[styles.subtitle, isRtl && styles.textRtl]}>
                  {isRtl
                    ? 'أدخل اسمك الكريم وصورة شخصية لتمييز حسابك ومزايداتك'
                    : 'Add your name and avatar to personalize your bidder profile'}
                </Text>
              </View>

              {/* Avatar Selector */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  onPress={handlePickAvatar}
                  style={styles.avatarPickerBtn}
                  activeOpacity={0.85}
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarPickerImg} />
                  ) : (
                    <View style={styles.avatarPickerPlaceholder}>
                      <User size={36} color="#94A3B8" />
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Camera size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>
                  {avatarUri
                    ? (isRtl ? 'اضغط لتغيير الصورة' : 'Tap to change photo')
                    : (isRtl ? '+ إضافة صورة شخصية (اختياري)' : '+ Add Photo (Optional)')}
                </Text>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isRtl && styles.textRtl]}>
                  {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
                </Text>
                <View style={[styles.inputContainer, isRtl && styles.inputContainerRtl]}>
                  <User size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder={isRtl ? 'مثال: علي محمد' : 'e.g. Ali Mohammed'}
                    placeholderTextColor="#94A3B8"
                    style={[styles.input, isRtl && styles.textRtl]}
                  />
                </View>
              </View>

              {/* Gender Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isRtl && styles.textRtl]}>
                  {isRtl ? 'الجنس' : 'Gender'}
                </Text>
                <View style={[styles.genderRow, isRtl && styles.genderRowRtl]}>
                  <TouchableOpacity
                    onPress={() => setGender('male')}
                    style={[
                      styles.genderPill,
                      gender === 'male' && styles.genderPillActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.genderIcon}>👨</Text>
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'male' && styles.genderTextActive,
                      ]}
                    >
                      {isRtl ? 'ذكر' : 'Male'}
                    </Text>
                    {gender === 'male' && (
                      <Check size={14} color={AppTheme.colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setGender('female')}
                    style={[
                      styles.genderPill,
                      gender === 'female' && styles.genderPillActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.genderIcon}>👩</Text>
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'female' && styles.genderTextActive,
                      ]}
                    >
                      {isRtl ? 'أنثى' : 'Female'}
                    </Text>
                    {gender === 'female' && (
                      <Check size={14} color={AppTheme.colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.profileActions}>
                <TouchableOpacity
                  onPress={handleSaveProfileAndNext}
                  style={styles.submitBtn}
                  activeOpacity={0.88}
                >
                  <View style={styles.btnContent}>
                    <Text style={styles.submitBtnText}>
                      {isRtl ? 'المتابعة لعنوان التوصيل' : 'Continue to Delivery'}
                    </Text>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSkipProfile}
                  style={styles.skipBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.skipBtnText}>
                    {isRtl ? 'تخطي الآن والمتابعة' : 'Skip for now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : step === 'location' ? (
            /* ───────────────────────────────────────────────────────────── */
            /* STEP 3: LOCATION PICKER                                       */
            /* ───────────────────────────────────────────────────────────── */
            <LocationPickerStep
              isRtl={isRtl}
              onConfirm={handleLocationConfirm}
              onSkip={handleSkipLocation}
              isSaving={isSavingLocation}
            />
          ) : (
            /* ───────────────────────────────────────────────────────────── */
            /* STEP 1: PHONE & OTP                                           */
            /* ───────────────────────────────────────────────────────────── */
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
                {/* Phone Input */}
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

                {/* OTP Input (Shown after OTP is sent) */}
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

                    {receivedOtpCode ? (
                      <TouchableOpacity
                        onPress={() => {
                          setOtpCode(receivedOtpCode);
                          setErrorMessage('');
                        }}
                        style={styles.devOtpBadge}
                        activeOpacity={0.8}
                      >
                        <Sparkles size={14} color="#059669" />
                        <Text style={styles.devOtpBadgeText}>
                          {isRtl
                            ? `رمز التحقق المستلم: ${receivedOtpCode} (اضغط للتعبئة التلقائية)`
                            : `Received Code: ${receivedOtpCode} (Tap to auto-fill)`}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    <View style={styles.otpActionsRow}>
                      <TouchableOpacity
                        onPress={handleSendOtp}
                        disabled={isLoading}
                        style={styles.resendButton}
                      >
                        <Text style={styles.resendButtonText}>
                          {isRtl ? 'إعادة إرسال الرمز؟' : 'Resend code?'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            `https://wa.me/${ZEEDO_CONFIG.WHATSAPP_BOT_NUMBER.replace(/\D/g, '')}`
                          )
                        }
                        style={styles.waChatBtn}
                        activeOpacity={0.8}
                      >
                        <ExternalLink size={12} color="#059669" />
                        <Text style={styles.waChatBtnText}>
                          {isRtl ? 'فتح محادثة واتساب' : 'Open WhatsApp'}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
                          ? (isRtl ? 'تأكيد الدخول' : 'Verify & Continue')
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
                      ? 'تسجيل آمن ومشفّر 100% بدون أي كلمات مرور تقليدية'
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  sheetTall: {
    minHeight: '78%',
    maxHeight: '94%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
    maxWidth: 290,
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
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
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
  devOtpBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  devOtpBadgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  otpActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  waChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  waChatBtnText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  // Profile Setup Specific Styles
  profileSetupContainer: {
    gap: 16,
    paddingBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatarPickerBtn: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPickerPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPickerImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.primary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderRowRtl: {
    flexDirection: 'row-reverse',
  },
  genderPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  genderPillActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  genderIcon: {
    fontSize: 18,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  genderTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  profileActions: {
    gap: 8,
    marginTop: 8,
  },
  skipBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
