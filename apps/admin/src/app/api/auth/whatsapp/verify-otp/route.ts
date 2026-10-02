import { NextRequest } from 'next/server';
import { verifyWhatsAppOtp } from '@/lib/whatsapp';
import { handleCorsOptions, jsonResponse, safeParseJson } from '@/lib/cors';
import { getDb, initDatabaseSchema } from '@/lib/db';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJson<{ phoneNumber?: string; code?: string }>(req);
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return jsonResponse(
        { isValid: false, message: 'Both phone number and OTP code are required' },
        { status: 400 },
        req
      );
    }

    const result = verifyWhatsAppOtp(phoneNumber, code);
    if (result.isValid) {
      const canonicalPhone = result.normalizedPhone;
      const defaultUserId = `usr-${canonicalPhone.replace(/\D/g, '')}`;

      await initDatabaseSchema();
      const sql = getDb();

      let userRecord: any = null;
      if (sql) {
        try {
          // Ensure is_blocked column exists
          await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE`.catch(() => {});

          const rows = await sql`
            INSERT INTO users (
              id, phone, name, city, role, kyc_status, created_at, updated_at
            ) VALUES (
              ${defaultUserId}, ${canonicalPhone}, 'مشترك زيدو', 'العراق', 'buyer', 'verified', NOW(), NOW()
            )
            ON CONFLICT (phone) DO UPDATE SET
              updated_at = NOW()
            RETURNING *;
          `;
          userRecord = rows[0];
        } catch (dbErr: any) {
          console.error('Error upserting verified user in database:', dbErr);
        }
      }

      // Block check — prevent blocked users from logging in
      if (userRecord?.is_blocked) {
        return jsonResponse(
          { isValid: false, isBlocked: true, message: 'هذا الحساب موقوف. للاستفسار تواصل مع دعم زيدو.' },
          { status: 403 },
          req
        );
      }

      const effectiveUserId = userRecord?.id || defaultUserId;
      const effectiveRole = userRecord?.role || 'buyer';

      const { createSessionToken } = await import('@/lib/session');
      const sessionToken = createSessionToken({
        id: effectiveUserId,
        phone: canonicalPhone,
        role: effectiveRole,
      });

      const parsedPin = userRecord?.rooftop_pin ? (
        typeof userRecord.rooftop_pin === 'string' ? JSON.parse(userRecord.rooftop_pin) : userRecord.rooftop_pin
      ) : null;

      const deliveryLocation = userRecord?.rooftop_lat && userRecord?.rooftop_lng ? {
        lat: Number(userRecord.rooftop_lat),
        lng: Number(userRecord.rooftop_lng),
        address: userRecord.rooftop_landmark || '',
        city: userRecord.city || 'العراق',
      } : (parsedPin ? {
        lat: Number(parsedPin.latitude || parsedPin.lat),
        lng: Number(parsedPin.longitude || parsedPin.lng),
        address: parsedPin.addressText || parsedPin.landmark || userRecord?.rooftop_landmark || '',
        city: parsedPin.city || userRecord?.city || 'العراق',
      } : undefined);

      return jsonResponse({
        ...result,
        sessionToken,
        user: {
          id: effectiveUserId,
          phone: canonicalPhone,
          name: userRecord?.name || 'مشترك زيدو',
          gender: userRecord?.gender || undefined,
          avatar: userRecord?.avatar || undefined,
          city: userRecord?.city || 'العراق',
          role: effectiveRole,
          kycStatus: userRecord?.kyc_status || 'verified',
          totalBids: Number(userRecord?.total_bids || 0),
          totalWins: Number(userRecord?.total_wins || 0),
          deliveryLocation,
        },
        expiresInDays: 90,
      }, undefined, req);
    }
    return jsonResponse(result, undefined, req);
  } catch (error) {
    console.error('Error verifying WhatsApp OTP:', error);
    return jsonResponse(
      { isValid: false, message: 'Internal server error verifying OTP' },
      { status: 500 },
      req
    );
  }
}
