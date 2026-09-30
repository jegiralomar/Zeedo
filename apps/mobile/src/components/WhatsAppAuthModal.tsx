import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { saveMobileSession, MobileBuyerSession } from '../lib/session';
import { EviraTheme, eviraWindowStyles } from '../lib/theme';
import { EviraModal } from './EviraModal';
import { API_BASE_URL } from '../lib/config';

interface WhatsAppAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (session: MobileBuyerSession) => void;
  apiBaseUrl?: string;
}

export const WhatsAppAuthModal: React.FC<WhatsAppAuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
  apiBaseUrl = API_BASE_URL,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    const demoSession: MobileBuyerSession = {
      token: 'zeedo_demo_jwt_token_2026',
      user: {
        id: 'usr-buyer-demo-01',
        phone: '+964 750 123 4567',
        name: 'Ahmed Al-Kurdi (Demo Buyer)',
        city: 'Erbil',
        role: 'buyer',
        verified: true,
      },
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    };
    await saveMobileSession(demoSession);
    onSuccess(demoSession);
    onClose();
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 9) {
      Alert.alert('Invalid Phone', 'Please enter a valid Iraqi mobile number.');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = cleaned.startsWith('964')
        ? `+${cleaned}`
        : cleaned.startsWith('07')
        ? `+964${cleaned.slice(1)}`
        : cleaned.startsWith('7')
        ? `+964${cleaned}`
        : `+964${cleaned}`;

      const res = await fetch(`${apiBaseUrl}/api/auth/whatsapp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch WhatsApp OTP');
      }

      if (data.sandboxCode) {
        setSandboxCode(data.sandboxCode);
      }
      setPhone(formattedPhone);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('OTP Error', err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit WhatsApp code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/whatsapp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired code.');
      }

      const session: MobileBuyerSession = {
        token: data.sessionToken || data.token || '',
        user: {
          id: data.user?.id || `usr-${Date.now()}`,
          phone: phone,
          name: data.user?.name || name || '',
          verified: true,
        },
        expiresAt: data.expiresAt || new Date(Date.now() + 90 * 86400000).toISOString(),
      };

      // Persist 90-day token into secure storage
      await saveMobileSession(session);
      onSuccess(session);
      onClose();
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    onClose();
  };

  return (
    <EviraModal
      visible={visible}
      onClose={handleClose}
      title={step === 'phone' ? 'Sign In with WhatsApp' : 'Enter 6-Digit Code'}
      subtitle={
        step === 'phone'
          ? 'Receive an instant 1-tap verification code via WhatsApp. Zero passwords, 90-day active session.'
          : `We sent a 6-digit security code via WhatsApp to ${phone}.`
      }
    >
      {step === 'phone' && (
        <View style={styles.inputSection}>
          <Text style={eviraWindowStyles.inputLabel}>Iraqi Mobile Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBadge}>
              <Text style={styles.countryCodeText}>🇮🇶 +964</Text>
            </View>
            <TextInput
              style={styles.phoneTextInput}
              placeholder="750 123 4567"
              placeholderTextColor={EviraTheme.colors.textTertiary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
          </View>

          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={loading}
            style={eviraWindowStyles.primaryButton}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={EviraTheme.colors.textWhite} />
            ) : (
              <Text style={eviraWindowStyles.primaryButtonText}>Send WhatsApp Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDemoLogin}
            style={styles.demoLoginButton}
            activeOpacity={0.7}
          >
            <Text style={styles.demoLoginText}>
              ⚡ Instant Demo Login (Skip OTP for Testing)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'otp' && (
        <View style={styles.inputSection}>
          {sandboxCode && (
            <TouchableOpacity
              onPress={() => setOtp(sandboxCode)}
              style={styles.sandboxPill}
              activeOpacity={0.8}
            >
              <Text style={styles.sandboxText}>
                ⚡ Sandbox Code: <Text style={styles.sandboxBold}>{sandboxCode}</Text> (Tap to fill)
              </Text>
            </TouchableOpacity>
          )}

          <Text style={eviraWindowStyles.inputLabel}>6-Digit Verification Code</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="123456"
            placeholderTextColor={EviraTheme.colors.textTertiary}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />

          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={loading}
            style={eviraWindowStyles.primaryButton}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={EviraTheme.colors.textWhite} />
            ) : (
              <Text style={eviraWindowStyles.primaryButtonText}>
                Verify & Authorize 90-Day Session
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStep('phone')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Change Phone Number</Text>
          </TouchableOpacity>
        </View>
      )}
    </EviraModal>
  );
};

const styles = StyleSheet.create({
  inputSection: {
    gap: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
  },
  countryCodeBadge: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: EviraTheme.colors.surfaceSubtle,
    borderRightWidth: 1,
    borderRightColor: EviraTheme.colors.border,
  },
  countryCodeText: {
    color: EviraTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  phoneTextInput: {
    flex: 1,
    color: EviraTheme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  otpInput: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.lg,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
    color: EviraTheme.colors.textPrimary,
    textAlign: 'center',
    fontSize: 26,
    letterSpacing: 8,
    fontWeight: '900',
    paddingVertical: 14,
  },
  sandboxPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    borderRadius: EviraTheme.radii.md,
    marginBottom: 4,
  },
  sandboxText: {
    color: '#92400E',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  sandboxBold: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  demoLoginButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  demoLoginText: {
    color: EviraTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    color: EviraTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
