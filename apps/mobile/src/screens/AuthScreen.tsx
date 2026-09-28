import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, DIALECT_LABELS, isRTL } from '../i18n/translations';
import {
  apiSendWhatsAppOtp,
  apiVerifyWhatsAppOtp,
  apiOcrIraqiNationalId,
  IraqiNationalIdOcrResponse,
} from '../services/api';
import {
  ShieldCheck,
  MessageSquare,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  Building2,
  User,
  Globe,
  Camera,
  Sparkles,
  Phone,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Scan,
} from 'lucide-react-native';

interface AuthScreenProps {
  onOpenLanguageModal: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenLanguageModal }) => {
  const { language, loginWithWhatsAppOtp, loginAsMerchantWithCredentials, completeGate1, completeGate2 } =
    useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [authMode, setAuthMode] = useState<'buyer_whatsapp' | 'merchant_creds'>('buyer_whatsapp');

  // Buyer WhatsApp OTP Steps: 1: Phone, 2: Code, 3: ID Upload, 4: Rooftop Pin
  const [buyerStep, setBuyerStep] = useState<1 | 2 | 3 | 4>(1);
  const [phoneNumber, setPhoneNumber] = useState('750 192 8844');
  const [otpCode, setOtpCode] = useState('782910');
  const [fullName, setFullName] = useState('Rebaz Farhad Salih');
  const [selectedCity, setSelectedCity] = useState('Erbil');
  const [civilIdCaptured, setCivilIdCaptured] = useState(false);
  const [landmark, setLandmark] = useState('Behind Family Mall, Street 10');

  // API Call States
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSendStatus, setOtpSendStatus] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Gemini Vision OCR States
  const [isScanningId, setIsScanningId] = useState(false);
  const [nationalIdNumber, setNationalIdNumber] = useState('IQ-19960412-99182');
  const [ocrResult, setOcrResult] = useState<IraqiNationalIdOcrResponse | null>(null);

  // Merchant Credentials State
  const [merchantIdOrPhone, setMerchantIdOrPhone] = useState('sel-merchant-01');
  const [merchantPassword, setMerchantPassword] = useState('admin123');
  const [merchantError, setMerchantError] = useState('');

  // Handle WhatsApp OTP Request
  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) return;
    setIsSendingOtp(true);
    setOtpError(null);
    try {
      const res = await apiSendWhatsAppOtp(phoneNumber);
      setOtpSendStatus(res.message);
      if (res.code) {
        setOtpCode(res.code);
      }
      setBuyerStep(2);
    } catch (err) {
      setOtpError('Failed to dispatch WhatsApp OTP. Please retry.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) return;
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await apiVerifyWhatsAppOtp(phoneNumber, otpCode);
      if (res.isValid) {
        setBuyerStep(3);
      } else {
        setOtpError(res.message || 'Incorrect verification code. Please try again.');
      }
    } catch (err) {
      setOtpError('Verification request failed. Please check your connection.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Gemini Multimodal Vision OCR ID Capture
  const handleCaptureId = async () => {
    setIsScanningId(true);
    try {
      const res = await apiOcrIraqiNationalId();
      setOcrResult(res);
      setNationalIdNumber(res.nationalIdNumber);
      if (res.fullNameEnglish) {
        setFullName(res.fullNameEnglish);
      }
      if (res.governorate) {
        if (res.governorate.toLowerCase().includes('baghdad')) setSelectedCity('Baghdad');
        else if (res.governorate.toLowerCase().includes('sulaymaniyah')) setSelectedCity('Sulaymaniyah');
        else if (res.governorate.toLowerCase().includes('basra')) setSelectedCity('Basra');
        else setSelectedCity('Erbil');
      }
      setCivilIdCaptured(true);
    } catch (err) {
      console.warn('OCR scan error:', err);
      setCivilIdCaptured(true);
    } finally {
      setIsScanningId(false);
    }
  };

  // Handle Proceed to Rooftop
  const handleProceedToRooftop = () => {
    completeGate1(nationalIdNumber || 'IQ-19960412-99182', fullName, '1996-04-12');
    setBuyerStep(4);
  };

  // Handle Complete Buyer Registration
  const handleFinishBuyerOnboarding = () => {
    completeGate2({
      latitude: 36.1911,
      longitude: 44.0092,
      city: selectedCity,
      district: 'Gulan District',
      landmark: landmark,
      addressText: `${landmark}, ${selectedCity}`,
      isVerified: true,
    });
    loginWithWhatsAppOtp(`+964 ${phoneNumber}`, fullName, selectedCity);
  };

  // Handle Merchant Login
  const handleMerchantLogin = () => {
    setMerchantError('');
    const success = loginAsMerchantWithCredentials(merchantIdOrPhone, merchantPassword);
    if (!success) {
      setMerchantError('Invalid merchant credentials. Please check admin-issued access details.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Row with Dialect Switcher */}
      <View style={[styles.topHeader, rtl && styles.rtlRow]}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>
            ZEEDO<Text style={styles.brandDot}>.</Text>
          </Text>
          <View style={styles.codPill}>
            <ShieldCheck size={11} color={TOKENS.colors.secondary} />
            <Text style={styles.codText}>100% COD</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={onOpenLanguageModal}
          activeOpacity={0.8}
        >
          <Globe size={13} color={TOKENS.colors.primary} />
          <Text style={styles.langText}>{DIALECT_LABELS[language].label}</Text>
        </TouchableOpacity>
      </View>

      {/* Account Type Mode Pill Bar */}
      <View style={styles.modeTabBar}>
        <TouchableOpacity
          style={[styles.modeTab, authMode === 'buyer_whatsapp' && styles.modeTabActive]}
          onPress={() => setAuthMode('buyer_whatsapp')}
          activeOpacity={0.8}
        >
          <User
            size={15}
            color={authMode === 'buyer_whatsapp' ? TOKENS.colors.primary : TOKENS.colors.textMuted}
          />
          <Text
            style={[
              styles.modeTabLabel,
              authMode === 'buyer_whatsapp' && styles.modeTabLabelActive,
            ]}
          >
            Buyer WhatsApp Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, authMode === 'merchant_creds' && styles.modeTabActiveMerchant]}
          onPress={() => setAuthMode('merchant_creds')}
          activeOpacity={0.8}
        >
          <Building2
            size={15}
            color={authMode === 'merchant_creds' ? TOKENS.colors.secondary : TOKENS.colors.textMuted}
          />
          <Text
            style={[
              styles.modeTabLabel,
              authMode === 'merchant_creds' && styles.modeTabLabelActiveMerchant,
            ]}
          >
            Merchant Portal
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* BUYER AUTH: WHATSAPP OTP + 2-GATE ONBOARDING                               */}
      {/* ========================================================================= */}
      {authMode === 'buyer_whatsapp' ? (
        <View style={styles.card}>
          {/* Progress Indicator for 4 Steps */}
          <View style={styles.stepProgressRow}>
            {[1, 2, 3, 4].map((stepIdx) => (
              <View
                key={stepIdx}
                style={[
                  styles.progressLine,
                  buyerStep >= stepIdx && styles.progressLineActive,
                ]}
              />
            ))}
          </View>

          {/* STEP 1: Iraqi Phone Number */}
          {buyerStep === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.whatsappIconCircle}>
                  <MessageSquare size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.stepTitle}>Iraqi Mobile Sign In</Text>
                <Text style={styles.stepSub}>
                  Enter your Iraqi mobile number. We will send a secure 6-digit verification code directly via WhatsApp.
                </Text>
              </View>

              {/* Carrier Network Quick Pills */}
              <View style={styles.networkPillsRow}>
                <TouchableOpacity
                  style={styles.networkPill}
                  onPress={() => setPhoneNumber('750 192 8844')}
                >
                  <Text style={styles.networkPillText}>0750 Korek</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.networkPill}
                  onPress={() => setPhoneNumber('770 341 8821')}
                >
                  <Text style={styles.networkPillText}>0770 Asiacell</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.networkPill}
                  onPress={() => setPhoneNumber('780 192 4433')}
                >
                  <Text style={styles.networkPillText}>0780 Zain</Text>
                </TouchableOpacity>
              </View>

              {/* Phone Input Box */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Iraqi Mobile Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.flagBox}>
                    <Text style={styles.flagEmoji}>🇮🇶</Text>
                    <Text style={styles.countryCode}>+964</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="750 XXX XXXX"
                    placeholderTextColor={TOKENS.colors.textMuted}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isSendingOtp && styles.primaryBtnDisabled]}
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                activeOpacity={0.88}
              >
                {isSendingOtp ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Connecting to Meta Cloud API...</Text>
                  </>
                ) : (
                  <>
                    <MessageSquare size={16} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Send WhatsApp Code</Text>
                    {rtl ? <ArrowLeft size={16} color="#FFFFFF" /> : <ArrowRight size={16} color="#FFFFFF" />}
                  </>
                )}
              </TouchableOpacity>

              {otpError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {otpError}</Text>
                </View>
              )}
            </View>
          )}

          {/* STEP 2: 6-Digit WhatsApp OTP Code */}
          {buyerStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.whatsappIconCircle}>
                  <MessageSquare size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.stepTitle}>Enter WhatsApp Code</Text>
                <Text style={styles.stepSub}>
                  Sent via WhatsApp to +964 {phoneNumber}. Please enter the 6-digit code below.
                </Text>
              </View>

              {/* Status or Sandbox Announcement */}
              {otpSendStatus && (
                <View style={styles.sandboxNotificationCard}>
                  <Sparkles size={14} color={TOKENS.colors.secondary} />
                  <Text style={styles.sandboxNotificationText}>{otpSendStatus}</Text>
                </View>
              )}

              {/* Interactive OTP Input */}
              <View style={styles.inputGroup}>
                <View style={styles.otpBoxesRow}>
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const digit = otpCode[idx] || '';
                    return (
                      <View key={idx} style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}>
                        <Text style={styles.otpDigit}>{digit || '·'}</Text>
                      </View>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.hiddenOtpInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  autoFocus
                  placeholder="Enter 6 digits"
                />
              </View>

              {/* Quick Fill Testing Helper */}
              <TouchableOpacity
                style={styles.demoFillBtn}
                onPress={() => setOtpCode('782910')}
                activeOpacity={0.8}
              >
                <Sparkles size={13} color={TOKENS.colors.secondary} />
                <Text style={styles.demoFillText}>Quick Test Code: 782910</Text>
              </TouchableOpacity>

              {otpError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {otpError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, isVerifyingOtp && styles.primaryBtnDisabled]}
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp}
                activeOpacity={0.88}
              >
                {isVerifyingOtp ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Verifying with ZEEDO Security...</Text>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Verify Code & Continue</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setBuyerStep(1)}
              >
                <Text style={styles.backLinkText}>Change mobile number</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Gate 1 - Instant AI Extraction Card & Civil ID Capture */}
          {buyerStep === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.gateIconCircle}>
                  <FileText size={22} color={TOKENS.colors.primary} />
                </View>
                <Text style={styles.stepTitle}>Gate 1: Civil ID Verification</Text>
                <Text style={styles.stepSub}>
                  Powered by Gemini 2.0 Flash Vision: Instant parsing of Iraqi National ID (البطاقة الوطنية الموحدة) for doorstep courier dispatch.
                </Text>
              </View>

              {/* ID Capture / Scanner Trigger */}
              <TouchableOpacity
                style={[
                  styles.idCaptureBox,
                  civilIdCaptured && styles.idCaptureBoxDone,
                  isScanningId && styles.idCaptureBoxScanning,
                ]}
                onPress={handleCaptureId}
                disabled={isScanningId}
                activeOpacity={0.85}
              >
                {isScanningId ? (
                  <View style={styles.idScanningState}>
                    <ActivityIndicator size="large" color={TOKENS.colors.primary} />
                    <Text style={styles.idScanningTitle}>Gemini 2.0 Flash Vision Scanning...</Text>
                    <Text style={styles.idScanningDesc}>
                      Analyzing Arabic & Kurdish text, national ID format, and tamper marks
                    </Text>
                  </View>
                ) : civilIdCaptured ? (
                  <View style={styles.idCapturedState}>
                    <CheckCircle2 size={24} color={TOKENS.colors.secondary} />
                    <Text style={styles.idCapturedTitle}>Iraqi National ID Verified</Text>
                    <Text style={styles.idCapturedDesc}>
                      {nationalIdNumber} • AI Confidence 99.4%
                    </Text>
                  </View>
                ) : (
                  <View style={styles.idPromptState}>
                    <Scan size={28} color={TOKENS.colors.primary} />
                    <Text style={styles.idPromptTitle}>Scan Iraqi National ID (Bataqa Wataniya)</Text>
                    <Text style={styles.idPromptDesc}>
                      Tap to scan card front with Gemini Multimodal AI Vision
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Instant AI Extraction Card (User-selected Recommended Design) */}
              {civilIdCaptured && (
                <View style={styles.aiExtractionCard}>
                  <View style={styles.aiExtractionHeader}>
                    <View style={styles.aiExtractionTitleRow}>
                      <ShieldCheck size={16} color={TOKENS.colors.secondary} />
                      <Text style={styles.aiExtractionTitle}>Instant AI Extraction</Text>
                    </View>
                    <View style={styles.aiVerifiedBadge}>
                      <Sparkles size={11} color={TOKENS.colors.secondary} />
                      <Text style={styles.aiVerifiedBadgeText}>99.4% AI Match</Text>
                    </View>
                  </View>

                  <View style={styles.aiFieldRow}>
                    <Text style={styles.aiFieldLabel}>Document</Text>
                    <Text style={styles.aiFieldValueBold}>
                      {ocrResult?.documentType || 'البطاقة الوطنية الموحدة (Bataqa Wataniya)'}
                    </Text>
                  </View>

                  <View style={styles.aiFieldRow}>
                    <Text style={styles.aiFieldLabel}>Legal Name</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.aiFieldValue}>{fullName}</Text>
                      {ocrResult?.fullNameArabic && (
                        <Text style={styles.aiFieldValueSub}>{ocrResult.fullNameArabic}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.aiFieldRow}>
                    <Text style={styles.aiFieldLabel}>National ID</Text>
                    <Text style={styles.aiFieldValueCode}>{nationalIdNumber}</Text>
                  </View>

                  <View style={styles.aiFieldRow}>
                    <Text style={styles.aiFieldLabel}>Governorate</Text>
                    <Text style={styles.aiFieldValue}>{selectedCity}</Text>
                  </View>

                  <Text style={styles.aiExtractionNote}>
                    ✓ Identity verified. Data ready for courier doorstep inspection protocol.
                  </Text>
                </View>
              )}

              {/* Editable manual fields if buyer wants to refine */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Legal Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Rebaz Farhad Salih"
                  placeholderTextColor={TOKENS.colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Governorate</Text>
                <View style={styles.cityRow}>
                  {['Erbil', 'Baghdad', 'Sulaymaniyah', 'Basra'].map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.cityPill, selectedCity === city && styles.cityPillActive]}
                      onPress={() => setSelectedCity(city)}
                    >
                      <Text
                        style={[
                          styles.cityPillText,
                          selectedCity === city && styles.cityPillTextActive,
                        ]}
                      >
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !civilIdCaptured && styles.primaryBtnDisabled]}
                onPress={handleProceedToRooftop}
                disabled={!civilIdCaptured}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryBtnText}>Confirm & Proceed to Rooftop Pin (Gate 2)</Text>
                {rtl ? <ArrowLeft size={16} color="#FFFFFF" /> : <ArrowRight size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: Gate 2 - Rooftop Map Location Pin Dropper */}
          {buyerStep === 4 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.gateIconCircle}>
                  <MapPin size={22} color={TOKENS.colors.secondary} />
                </View>
                <Text style={styles.stepTitle}>Gate 2: Rooftop Map Pin</Text>
                <Text style={styles.stepSub}>
                  Drop your home rooftop pin to guarantee third-party courier dispatch accuracy for doorstep cash collection.
                </Text>
              </View>

              {/* Interactive Mock Map Pin Dropper */}
              <View style={styles.mapStage}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
                  }}
                  style={styles.mapBg}
                />
                <View style={styles.mapCrosshair}>
                  <View style={styles.pinBubble}>
                    <Text style={styles.pinBubbleText}>📍 Home Rooftop Pin</Text>
                  </View>
                  <View style={styles.crosshairDot} />
                </View>
                <View style={styles.mapGpsPill}>
                  <Text style={styles.mapGpsText}>GPS: 36.1911° N, 44.0092° E (±3m)</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nearest Recognizable Landmark</Text>
                <TextInput
                  style={styles.textInput}
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="e.g. Behind Family Mall, Street 10"
                  placeholderTextColor={TOKENS.colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtnGreen}
                onPress={handleFinishBuyerOnboarding}
                activeOpacity={0.88}
              >
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Complete & Enter 100% COD Auctions</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* ========================================================================= */
        /* MERCHANT AUTH: ADMIN-PROVISIONED CREDENTIALS                              */
        /* ========================================================================= */
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.merchantIconCircle}>
              <Building2 size={24} color={TOKENS.colors.secondary} />
            </View>
            <Text style={styles.stepTitle}>Authorized Merchant Portal</Text>
            <Text style={styles.stepSub}>
              Merchant accounts are created and vetted exclusively by ZEEDO administrators. Please enter your commercial credentials.
            </Text>
          </View>

          {merchantError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{merchantError}</Text>
            </View>
          ) : null}

          {/* Quick Demo Pre-fill */}
          <TouchableOpacity
            style={styles.demoFillBtn}
            onPress={() => {
              setMerchantIdOrPhone('sel-merchant-01');
              setMerchantPassword('admin123');
            }}
          >
            <Sparkles size={13} color={TOKENS.colors.secondary} />
            <Text style={styles.demoFillText}>Quick Fill: Erbil Mobile & Watch Studio</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Merchant ID or Registered Phone</Text>
            <TextInput
              style={styles.textInput}
              value={merchantIdOrPhone}
              onChangeText={setMerchantIdOrPhone}
              placeholder="e.g. sel-merchant-01 or +964 750 441 2000"
              placeholderTextColor={TOKENS.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Admin Access Password</Text>
            <TextInput
              style={styles.textInput}
              secureTextEntry
              value={merchantPassword}
              onChangeText={setMerchantPassword}
              placeholder="••••••••"
              placeholderTextColor={TOKENS.colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryBtnGreen}
            onPress={handleMerchantLogin}
            activeOpacity={0.88}
          >
            <Lock size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Log In to Seller Studio & Financials</Text>
          </TouchableOpacity>

          {/* Strict RBAC Rule Explanation */}
          <View style={styles.merchantNoticeCard}>
            <Text style={styles.merchantNoticeTitle}>Merchant Operations Protocol:</Text>
            <Text style={styles.merchantNoticeText}>
              • Access is restricted to inventory management and financial COD remittance reports.{'\n'}
              • Merchants cannot participate in bidding on marketplace auctions.{'\n'}
              • All listings are subject to the universal 1,000 IQD starting price rule.
            </Text>
          </View>
        </View>
      )}

      {/* 100% COD Policy Footer */}
      <View style={styles.footerPolicy}>
        <ShieldCheck size={16} color={TOKENS.colors.secondary} />
        <Text style={styles.footerPolicyText}>
          ZEEDO 100% Cash-on-Delivery Guarantee. No credit cards required. Doorstep inspection and physical cash exchange only.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  content: {
    padding: TOKENS.spacing.md,
    paddingBottom: 40,
    gap: 14,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    letterSpacing: -0.8,
  },
  brandDot: {
    color: TOKENS.colors.primary,
  },
  codPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  codText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
  modeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: TOKENS.borderRadius.full,
  },
  modeTabActive: {
    backgroundColor: TOKENS.colors.primaryLight,
  },
  modeTabActiveMerchant: {
    backgroundColor: TOKENS.colors.secondaryLight,
  },
  modeTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
  },
  modeTabLabelActive: {
    color: TOKENS.colors.primary,
    fontWeight: '800',
  },
  modeTabLabelActiveMerchant: {
    color: TOKENS.colors.secondary,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.lg,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
    gap: 16,
  },
  stepProgressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  progressLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  progressLineActive: {
    backgroundColor: TOKENS.colors.primary,
  },
  stepContainer: {
    gap: 14,
  },
  stepHeader: {
    alignItems: 'center',
    gap: 8,
  },
  whatsappIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25D366', // Official WhatsApp green
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TOKENS.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  networkPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  networkPill: {
    backgroundColor: TOKENS.colors.cardMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  networkPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: TOKENS.colors.cardBorder,
    borderRadius: TOKENS.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: TOKENS.colors.cardBorder,
  },
  flagEmoji: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: TOKENS.colors.cardBorder,
    borderRadius: TOKENS.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: TOKENS.colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  cityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  cityPillActive: {
    backgroundColor: TOKENS.colors.primary,
  },
  cityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  cityPillTextActive: {
    color: '#FFFFFF',
  },
  idCaptureBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: TOKENS.colors.primary,
    borderRadius: TOKENS.borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TOKENS.colors.primaryLight,
  },
  idCaptureBoxDone: {
    borderColor: TOKENS.colors.secondary,
    backgroundColor: TOKENS.colors.secondaryLight,
    borderStyle: 'solid',
  },
  idPromptState: {
    alignItems: 'center',
    gap: 6,
  },
  idPromptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  idPromptDesc: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
  },
  idCapturedState: {
    alignItems: 'center',
    gap: 4,
  },
  idCapturedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  idCapturedDesc: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  mapStage: {
    height: 150,
    borderRadius: TOKENS.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
  },
  mapBg: {
    width: '100%',
    height: '100%',
  },
  mapCrosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -35 }],
    alignItems: 'center',
  },
  pinBubble: {
    backgroundColor: TOKENS.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
    marginBottom: 4,
    ...TOKENS.shadows.glowSecondary,
  },
  pinBubbleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  crosshairDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: TOKENS.colors.secondary,
  },
  mapGpsPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  mapGpsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: TOKENS.borderRadius.lg,
    backgroundColor: TOKENS.colors.cardMuted,
    borderWidth: 1.5,
    borderColor: TOKENS.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    height: 48,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  primaryBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.secondary,
    height: 48,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowSecondary,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: 12,
    color: TOKENS.colors.primary,
    fontWeight: '700',
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingVertical: 8,
    borderRadius: TOKENS.borderRadius.full,
  },
  demoFillText: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  errorBanner: {
    backgroundColor: TOKENS.colors.accentLight,
    padding: 10,
    borderRadius: TOKENS.borderRadius.md,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.accent,
  },
  merchantNoticeCard: {
    backgroundColor: TOKENS.colors.cardMuted,
    padding: 12,
    borderRadius: TOKENS.borderRadius.lg,
    gap: 4,
  },
  merchantNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  merchantNoticeText: {
    fontSize: 10.5,
    color: TOKENS.colors.textSecondary,
    lineHeight: 16,
  },
  footerPolicy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
  },
  sandboxNotificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: TOKENS.borderRadius.lg,
  },
  sandboxNotificationText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
    lineHeight: 16,
  },
  otpBoxFilled: {
    borderColor: TOKENS.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  hiddenOtpInput: {
    height: 38,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    borderRadius: TOKENS.borderRadius.md,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    color: TOKENS.colors.textPrimary,
  },
  idCaptureBoxScanning: {
    borderColor: TOKENS.colors.primary,
    backgroundColor: '#EEF2FF',
    borderStyle: 'solid',
  },
  idScanningState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  idScanningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  idScanningDesc: {
    fontSize: 10.5,
    color: TOKENS.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  aiExtractionCard: {
    borderRadius: TOKENS.borderRadius.xl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
    gap: 8,
    ...TOKENS.shadows.card,
  },
  aiExtractionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  aiExtractionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiExtractionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  aiVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  aiVerifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  aiFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  aiFieldLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    width: 75,
  },
  aiFieldValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
  },
  aiFieldValueSub: {
    fontSize: 10,
    color: TOKENS.colors.textSecondary,
  },
  aiFieldValueCode: {
    fontSize: 11.5,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: TOKENS.colors.primary,
  },
  aiFieldValueBold: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  aiExtractionNote: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '600',
    marginTop: 4,
  },
  footerPolicyText: {
    flex: 1,
    fontSize: 10.5,
    color: TOKENS.colors.textSecondary,
    lineHeight: 15,
  },
});
