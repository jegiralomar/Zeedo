import { NextRequest } from 'next/server';
import { getDb, initDatabaseSchema } from '@/lib/db';
import { jsonResponse, handleCorsOptions, safeParseJson } from '@/lib/cors';
import { verifyAdminRequest } from '@/lib/session';

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    const position = searchParams.get('position');

    let rows;
    if (includeInactive) {
      if (position) {
        rows = await sql`
          SELECT * FROM cms_banners
          WHERE position = ${position}
          ORDER BY sort_order ASC, created_at DESC
        `;
      } else {
        rows = await sql`
          SELECT * FROM cms_banners
          ORDER BY sort_order ASC, created_at DESC
        `;
      }
    } else {
      if (position) {
        rows = await sql`
          SELECT * FROM cms_banners
          WHERE is_active = TRUE AND position = ${position}
          ORDER BY sort_order ASC, created_at DESC
        `;
      } else {
        rows = await sql`
          SELECT * FROM cms_banners
          WHERE is_active = TRUE
          ORDER BY sort_order ASC, created_at DESC
        `;
      }
    }

    const banners = rows.map((r: any) => ({
      id: r.id,
      titleAr: r.title_ar,
      titleEn: r.title_en,
      titleCkb: r.title_ckb || '',
      titleBadini: r.title_badini || '',
      subtitleAr: r.subtitle_ar || '',
      subtitleEn: r.subtitle_en || '',
      subtitleCkb: r.subtitle_ckb || '',
      subtitleBadini: r.subtitle_badini || '',
      imageUrl: r.image_url,
      tapAction: r.tap_action || 'none',
      actionTarget: r.action_target || '',
      position: r.position || 'hero',
      isActive: Boolean(r.is_active),
      sortOrder: Number(r.sort_order || 0),
      validFrom: r.valid_from,
      validUntil: r.valid_until,
      createdAt: r.created_at,
    }));

    return jsonResponse({ success: true, banners }, {}, request);
  } catch (err: any) {
    console.error('Error fetching CMS banners:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.isValid) {
      return jsonResponse({ success: false, error: auth.error || 'Unauthorized admin access' }, { status: 401 }, request);
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const body = await safeParseJson<any>(request);
    const id = body.id || `ban-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const titleAr = body.titleAr || body.title_ar || '';
    const titleEn = body.titleEn || body.title_en || '';
    const titleCkb = body.titleCkb || body.title_ckb || '';
    const titleBadini = body.titleBadini || body.title_badini || '';
    const subtitleAr = body.subtitleAr || body.subtitle_ar || '';
    const subtitleEn = body.subtitleEn || body.subtitle_en || '';
    const subtitleCkb = body.subtitleCkb || body.subtitle_ckb || '';
    const subtitleBadini = body.subtitleBadini || body.subtitle_badini || '';
    const imageUrl = body.imageUrl || body.image_url || '';
    const tapAction = body.tapAction || body.tap_action || 'none';
    const actionTarget = body.actionTarget || body.action_target || '';
    const position = body.position || 'hero';
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
    const sortOrder = Number(body.sortOrder || body.sort_order || 0);

    if (!titleAr && !titleEn) {
      return jsonResponse({ success: false, error: 'Title is required' }, { status: 400 }, request);
    }
    if (!imageUrl) {
      return jsonResponse({ success: false, error: 'Image URL is required' }, { status: 400 }, request);
    }

    await sql`
      INSERT INTO cms_banners (
        id, title_ar, title_en, title_ckb, title_badini,
        subtitle_ar, subtitle_en, subtitle_ckb, subtitle_badini,
        image_url, tap_action, action_target, position, is_active, sort_order,
        created_at, updated_at
      ) VALUES (
        ${id}, ${titleAr}, ${titleEn}, ${titleCkb}, ${titleBadini},
        ${subtitleAr}, ${subtitleEn}, ${subtitleCkb}, ${subtitleBadini},
        ${imageUrl}, ${tapAction}, ${actionTarget}, ${position}, ${isActive}, ${sortOrder},
        NOW(), NOW()
      )
    `;

    return jsonResponse({ success: true, banner: { id, titleAr, titleEn, imageUrl, isActive, position } }, { status: 201 }, request);
  } catch (err: any) {
    console.error('Error creating CMS banner:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.isValid) {
      return jsonResponse({ success: false, error: auth.error || 'Unauthorized admin access' }, { status: 401 }, request);
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const body = await safeParseJson<any>(request);
    const { id } = body;
    if (!id) {
      return jsonResponse({ success: false, error: 'Banner ID required' }, { status: 400 }, request);
    }

    const updates: Record<string, any> = {};
    if (body.titleAr !== undefined) updates.title_ar = body.titleAr;
    if (body.titleEn !== undefined) updates.title_en = body.titleEn;
    if (body.titleCkb !== undefined) updates.title_ckb = body.titleCkb;
    if (body.titleBadini !== undefined) updates.title_badini = body.titleBadini;
    if (body.subtitleAr !== undefined) updates.subtitle_ar = body.subtitleAr;
    if (body.subtitleEn !== undefined) updates.subtitle_en = body.subtitleEn;
    if (body.subtitleCkb !== undefined) updates.subtitle_ckb = body.subtitleCkb;
    if (body.subtitleBadini !== undefined) updates.subtitle_badini = body.subtitleBadini;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.tapAction !== undefined) updates.tap_action = body.tapAction;
    if (body.actionTarget !== undefined) updates.action_target = body.actionTarget;
    if (body.position !== undefined) updates.position = body.position;
    if (body.isActive !== undefined) updates.is_active = Boolean(body.isActive);
    if (body.sortOrder !== undefined) updates.sort_order = Number(body.sortOrder);

    // Apply updates
    await sql`
      UPDATE cms_banners SET
        title_ar = COALESCE(${updates.title_ar ?? null}, title_ar),
        title_en = COALESCE(${updates.title_en ?? null}, title_en),
        title_ckb = COALESCE(${updates.title_ckb ?? null}, title_ckb),
        title_badini = COALESCE(${updates.title_badini ?? null}, title_badini),
        subtitle_ar = COALESCE(${updates.subtitle_ar ?? null}, subtitle_ar),
        subtitle_en = COALESCE(${updates.subtitle_en ?? null}, subtitle_en),
        subtitle_ckb = COALESCE(${updates.subtitle_ckb ?? null}, subtitle_ckb),
        subtitle_badini = COALESCE(${updates.subtitle_badini ?? null}, subtitle_badini),
        image_url = COALESCE(${updates.image_url ?? null}, image_url),
        tap_action = COALESCE(${updates.tap_action ?? null}, tap_action),
        action_target = COALESCE(${updates.action_target ?? null}, action_target),
        position = COALESCE(${updates.position ?? null}, position),
        is_active = COALESCE(${updates.is_active ?? null}, is_active),
        sort_order = COALESCE(${updates.sort_order ?? null}, sort_order),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return jsonResponse({ success: true, updated: id }, {}, request);
  } catch (err: any) {
    console.error('Error updating CMS banner:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.isValid) {
      return jsonResponse({ success: false, error: auth.error || 'Unauthorized admin access' }, { status: 401 }, request);
    }

    await initDatabaseSchema();
    const sql = getDb();
    if (!sql) {
      return jsonResponse({ success: false, error: 'Database not connected' }, { status: 500 }, request);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return jsonResponse({ success: false, error: 'Banner ID required' }, { status: 400 }, request);
    }

    await sql`DELETE FROM cms_banners WHERE id = ${id}`;
    return jsonResponse({ success: true, deleted: id }, {}, request);
  } catch (err: any) {
    console.error('Error deleting CMS banner:', err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 }, request);
  }
}
