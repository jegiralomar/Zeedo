/**
 * WhatsApp Gateway Client for ZEEDO BID APP
 * Sends 6-digit OTP codes and notifications to Iraqi mobile numbers (+964 7XX...)
 * via the Self-Hosted Baileys WhatsApp Gateway (port 3001).
 */

export interface WhatsAppOtpSendResult {
  isSuccess: boolean;
  normalizedPhone: string;
  isSandbox: boolean;
  messageId?: string;
  expiresAt: number;
  message: string;
}

export interface WhatsAppOtpVerifyResult {
  isValid: boolean;
  normalizedPhone: string;
  message: string;
}

interface StoredOtpSession {
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP session cache (keyed by normalized phone number)
const otpStore = new Map<string, StoredOtpSession>();

/**
 * Normalizes Iraqi phone numbers to standard E.164 format (+9647XXXXXXXXX)
 */
export function normalizeIraqiPhone(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00964')) {
    return `+${digits.substring(2)}`;
  }
  if (digits.startsWith('964')) {
    return `+${digits}`;
  }
  if (digits.startsWith('07')) {
    return `+964${digits.substring(1)}`;
  }
  if (digits.startsWith('7')) {
    return `+964${digits}`;
  }
  return `+${digits}`;
}

/**
 * Send 6-digit WhatsApp OTP verification code via self-hosted Baileys Gateway
 */
export async function sendWhatsAppOtp(rawPhone: string): Promise<WhatsAppOtpSendResult> {
  const normalizedPhone = normalizeIraqiPhone(rawPhone);
  
  // Generate dynamic 6-digit verification code (100000 - 999999)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedPhone, {
    code,
    createdAt: now,
    expiresAt,
    attempts: 0,
  });

  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001';

  try {
    const gatewayResponse = await fetch(`${gatewayUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        code,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (gatewayResponse.ok) {
      const gatewayResult = await gatewayResponse.json();
      if (gatewayResult.isSuccess) {
        return {
          isSuccess: true,
          normalizedPhone,
          isSandbox: false,
          messageId: gatewayResult.messageId,
          expiresAt,
          message: `Official WhatsApp verification code sent via Zeedo Gateway to ${normalizedPhone}`,
        };
      }
    }
  } catch (err: any) {
    console.error('WhatsApp Gateway dispatch error:', err?.message);
  }

  return {
    isSuccess: false,
    normalizedPhone,
    isSandbox: false,
    expiresAt,
    message: 'Failed to send WhatsApp verification code. WhatsApp Gateway is offline or unlinked.',
  };
}

/**
 * Verify submitted OTP against active session
 */
export function verifyWhatsAppOtp(rawPhone: string, submittedCode: string): WhatsAppOtpVerifyResult {
  const normalizedPhone = normalizeIraqiPhone(rawPhone);
  const cleanCode = submittedCode.trim();

  const session = otpStore.get(normalizedPhone);

  if (!session) {
    return {
      isValid: false,
      normalizedPhone,
      message: 'No active OTP request found for this phone number. Please request a new code.',
    };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(normalizedPhone);
    return {
      isValid: false,
      normalizedPhone,
      message: 'OTP has expired. Please request a new verification code.',
    };
  }

  if (session.code !== cleanCode) {
    session.attempts += 1;
    if (session.attempts >= 5) {
      otpStore.delete(normalizedPhone);
      return {
        isValid: false,
        normalizedPhone,
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }
    return {
      isValid: false,
      normalizedPhone,
      message: `Invalid code. ${5 - session.attempts} attempts remaining.`,
    };
  }

  // Success: consume the OTP
  otpStore.delete(normalizedPhone);
  return {
    isValid: true,
    normalizedPhone,
    message: 'WhatsApp phone number successfully verified!',
  };
}

/**
 * Send a custom text message via WhatsApp Gateway
 */
export async function sendWhatsAppCustomMessage(
  rawPhone: string,
  messageText: string
): Promise<{ isSuccess: boolean; message: string; messageId?: string }> {
  const normalizedPhone = normalizeIraqiPhone(rawPhone);
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001';

  try {
    const gatewayResponse = await fetch(`${gatewayUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        message: messageText,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (gatewayResponse.ok) {
      const data = await gatewayResponse.json();
      if (data.isSuccess) {
        return { isSuccess: true, message: 'Message sent via WhatsApp Gateway', messageId: data.messageId };
      }
    }
  } catch (err: any) {
    console.error('WhatsApp Gateway message error:', err?.message);
  }

  return { isSuccess: false, message: 'WhatsApp Gateway offline or unlinked' };
}
