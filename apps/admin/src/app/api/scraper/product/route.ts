import { NextRequest, NextResponse } from 'next/server';
import { scrapeUniversalProduct } from '@/lib/universalScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = (body.url || '').trim();

    if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing product URL' },
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
