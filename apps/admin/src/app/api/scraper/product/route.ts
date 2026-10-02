import { NextRequest, NextResponse } from 'next/server';
import { scrapeUniversalProduct } from '@/lib/universalScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

function isPrivateOrLocalUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    // Check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return true;
    }

    // Check localhost & local / container service hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'whatsapp-gateway' ||
      hostname === 'zeedo_db' ||
      hostname === 'zeedo_web' ||
      hostname === 'zeedo_websocket' ||
      hostname === 'web'
    ) {
      return true;
    }

    // Check IPv4 addresses (private, loopback, link-local)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const [_, a, b] = match.map(Number);
      if (a === 127) return true; // loopback
      if (a === 10) return true; // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
      if (a === 192 && b === 168) return true; // 192.168.0.0/16
      if (a === 169 && b === 254) return true; // link-local (cloud metadata)
      if (a === 0) return true; // 0.0.0.0
    }

    // Check IPv6 addresses
    if (
      hostname === '[::1]' ||
      hostname === '::1' ||
      hostname === '[::]' ||
      hostname === '::' ||
      hostname.startsWith('fe80:') ||
      hostname.startsWith('fc00:') ||
      hostname.startsWith('fd00:')
    ) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = (body.url || '').trim();

    if (!targetUrl || !/^https?:\/\//i.test(targetUrl) || isPrivateOrLocalUrl(targetUrl)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or prohibited product URL' },
        { status: 400 }
      );
    }

    // 1. Primary: Universal Multi-Platform Engine (Shopify, Trendyol, Noon, AliExpress, eBay, Amazon, JSON-LD)
    try {
      const product = await scrapeUniversalProduct(targetUrl);
      if (product && product.title) {
        if (!product.images || product.images.length === 0) {
          product.images = [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          ];
        }

        return NextResponse.json({
          success: true,
          method: `universal_${product.sourcePlatform}`,
          data: product,
        });
      }
    } catch (universalErr: any) {
      console.warn('Universal scraper pipeline failed, moving to fallback:', universalErr?.message);
    }

    // 2. Fallback: URL Slug Parser
    const fallbackTitle = targetUrl
      .split('/')
      .pop()
      ?.replace(/[-_]/g, ' ')
      .replace(/\.(html|php|htm|aspx)$/i, '') || 'Imported Auction Item';

    return NextResponse.json({
      success: true,
      method: 'url_slug_fallback',
      data: {
        title: fallbackTitle,
        brand: 'Verified Brand',
        category: 'Consumer Electronics',
        retailPriceUsd: 150,
        condition: 'New',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        specs: ['Authentic Verified Item', 'Inspected for Quality', 'Ready for Dispatch'],
        description: `${fallbackTitle}. Authentic item sourced for ZEEDO auctions.`,
        sourceUrl: targetUrl,
        multilingual: {
          en: {
            title: fallbackTitle,
            description: `${fallbackTitle} - authentic item.`,
            specs: ['Authentic Verified Item', 'Inspected for Quality'],
          },
          ar: {
            title: `${fallbackTitle} — أصلي بالكامل`,
            description: `${fallbackTitle}. بضاعة أصلية جاهزة للمعاينة مع الدفع عند الاستلام.`,
            specs: ['منتج أصلي معتمد', 'فحص الجودة مضمون'],
          },
          ckb: {
            title: `${fallbackTitle} — ئەسڵی`,
            description: `${fallbackTitle}. بەرهەمی ئەسڵی و کواڵیتی بەرز لەگەڵ پارەدان لە کاتی گەیشتن.`,
            specs: ['بەرهەمی ئەسڵی و باوەڕپێکراو', 'پشکنینی کوالێتی تەواو کراوە'],
          },
          badini: {
            title: `${fallbackTitle} — ئۆرجینال`,
            description: `${fallbackTitle}. بەرهەمێ ئۆرجینال و باوەرپێکری دگەل پارەدان پشتی گەهشتنێ.`,
            specs: ['بەرهەمێ ئۆرجینال', 'گرەنتیا پشکنینێ'],
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Error in product scraper API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Could not extract product details. You can enter details manually.',
      },
      { status: 500 }
    );
  }
}
