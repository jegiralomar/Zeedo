/**
 * Meta WhatsApp Business Cloud API Client for ZEEDO BID APP
 * Sends 6-digit OTP codes to Iraqi mobile numbers (+964 7XX...).
 * Automatically falls back to Sandbox simulation when API credentials are omitted.
 */

export interface WhatsAppOtpSendResult {
  isSuccess: boolean;
  normalizedPhone: string;
  isSandbox: boolean;
  messageId?: string;
  code?: string; // Provided in sandbox/debug mode for convenient testing
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

function getWhatsAppConfig() {
  const token = process.env.META_WHATSAPP_TOKEN || '';
  const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '';
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME || 'zeedo_auth_otp';
  const mode = process.env.ZEEDO_API_MODE || 'sandbox';
  return {
    token,
    phoneId,
    templateName,
    isLive: mode === 'live' && Boolean(token && phoneId),
  };
}

/**
 * Normalizes Iraqi phone numbers to standard E.164 format (+9647XXXXXXXXX)
 */
export function normalizeIraqiPhone(rawPhone: string): string {
  // Strip all non-digit characters
  const digits = rawPhone.replace(/\D/g, '');

  // If starts with 00964, replace with 964
  if (digits.startsWith('00964')) {
    return `+${digits.substring(2)}`;
  }

  // If starts with 964
  if (digits.startsWith('964')) {
    return `+${digits}`;
  }

  // If starts with Iraqi domestic 07 (e.g. 0750 192 8844)
  if (digits.startsWith('07')) {
    return `+964${digits.substring(1)}`;
  }

  // If starts with 7 (e.g. 750 192 8844)
  if (digits.startsWith('7')) {
    return `+964${digits}`;
  }

  // Fallback to default
  return digits.length > 0 ? `+${digits}` : '+9647501928844';
}

/**
 * Send 6-digit WhatsApp OTP verification code
 */
export async function sendWhatsAppOtp(rawPhone: string): Promise<WhatsAppOtpSendResult> {
  const normalizedPhone = normalizeIraqiPhone(rawPhone);
  const { token, phoneId, templateName, isLive } = getWhatsAppConfig();
  
  // Generate dynamic 6-digit verification code for every attempt (100000 - 999999)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedPhone, {
    code,
    createdAt: now,
    expiresAt,
    attempts: 0,
  });

  // 1. First Priority: Self-Hosted Baileys WhatsApp Gateway (100% Free, VPS Microservice)
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || 'http://whatsapp-gateway:3001';
  try {
    const gatewayResponse = await fetch(`${gatewayUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        code,
      }),
      signal: AbortSignal.timeout(6000), // 6s timeout
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
  } catch (err) {
    // Gateway offline or not linked, continue to Meta API
  }

  // 2. Second Priority: Meta WhatsApp Cloud API (If credentials provided)
  if (isLive) {
    try {
      const recipientPhone = normalizedPhone.replace('+', '');
      const metaUrl = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

      const response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'ar' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: code }],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: code }],
              },
            ],
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          isSuccess: true,
          normalizedPhone,
          isSandbox: false,
          messageId: result?.messages?.[0]?.id,
          expiresAt,
          message: `Official WhatsApp verification code dispatched to ${normalizedPhone}`,
        };
      } else {
        const errorData = await response.json();
        console.warn('Meta WhatsApp API error:', errorData);
      }
    } catch (err) {
      console.warn('Meta WhatsApp fetch error:', err);
    }
  }

  // If neither gateway nor Meta API was able to send the message
  return {
    isSuccess: false,
    normalizedPhone,
    isSandbox: false,
    expiresAt,
    message: 'Failed to send WhatsApp verification code. Please try again.',
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
