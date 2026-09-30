import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { saveMobileSession, MobileBuyerSession } from '../lib/session';

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
  apiBaseUrl = 'https://zeedo.auction',
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

      // Persist 90-day token into iOS Keychain / Android Keystore
      await saveMobileSession(session);
      onSuccess(session);
      onClose();
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {step === 'phone'
                ? 'Sign In with WhatsApp'
                : 'Enter 6-Digit Code'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Receive an instant 1-tap verification code via WhatsApp. Zero passwords, 90-day active session.'
              : `We sent a 6-digit security code via WhatsApp to ${phone}.`}
          </Text>

          {step === 'phone' && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Iraqi Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>🇮🇶 +964</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="750 123 4567"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#072F1F" />
                ) : (
                  <Text style={styles.submitButtonText}>Send WhatsApp Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDemoLogin}
                style={{ marginTop: 12, paddingVertical: 8, alignItems: 'center' }}
              >
                <Text style={{ color: '#D97706', fontSize: 13, fontWeight: '700' }}>
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
                >
                  <Text style={styles.sandboxText}>
                    ⚡ Test Sandbox Code: <Text style={styles.sandboxBold}>{sandboxCode}</Text> (Tap to auto-fill)
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
              <TextInput
                style={[styles.textInput, styles.otpInput]}
                placeholder="123456"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#072F1F" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify & Authorize 90-Day Session</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep('phone')}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Change Phone Number</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#072F1F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(180, 241, 5, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    color: '#A7C1B5',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputSection: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: '#E5E7EB',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  countryCodeBadge: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  otpInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '900',
  },
  sandboxPill: {
    backgroundColor: 'rgba(180, 241, 5, 0.15)',
    borderWidth: 1,
    borderColor: '#B4F105',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  sandboxText: {
    color: '#B4F105',
    fontSize: 12,
    textAlign: 'center',
  },
  sandboxBold: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#B4F105',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#072F1F',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#A7C1B5',
    fontSize: 12,
    fontWeight: '700',
  },
});
