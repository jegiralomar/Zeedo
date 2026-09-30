import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface MultiDialectData {
  title: string;
  description: string;
  specs: string[];
}

interface ScrapedProductPayload {
  title: string;
  brand: string;
  category: string;
  retailPriceUsd: number;
  condition: 'New' | 'Used' | 'New Open Box';
  images: string[];
  specs: string[];
  description: string;
  sourceUrl: string;
  multilingual: {
    en: MultiDialectData;
    ar: MultiDialectData;
    ckb: MultiDialectData;
    badini: MultiDialectData;
  };
}

async function extractWithGemini(
  targetUrl: string,
  pageContent: string
): Promise<ScrapedProductPayload> {
  const prompt = `You are the lead e-commerce product extraction and cataloging intelligence for ZEEDO, Iraq's leading cash-on-delivery auction marketplace.
A store merchant has submitted this external product URL: "${targetUrl}".

Page Content Snippet (from headless reader or HTML):
${pageContent ? pageContent.slice(0, 15000) : 'URL Only: ' + targetUrl}

INSTRUCTIONS:
1. Identify the exact product title, manufacturer brand, official retail price in USD ($), high-res images, and key technical specifications.
2. If the page is a robot check, captcha, or blocked, infer the exact product details, authentic retail price, and images from the URL slug/model name and your comprehensive product catalog knowledge.
3. Automatically generate accurate, native, high-quality translations across 4 Iraqi market dialects:
   - "en": English
   - "ar": Arabic
   - "ckb": Kurdish Sorani (for Erbil & Sulaymaniyah marketplace)
   - "badini": Kurdish Badini (for Duhok & Zakho marketplace)
4. Valid categories: "Smartphones", "Consumer Electronics", "Watches & Luxury", "Computers & Tablets", "Gaming & Consoles", "Heavy Tools & Machinery", "Home & Lifestyle", "Fashion & Apparel".
5. For images: extract valid high-resolution image URLs found in the content or official CDN URLs for this exact product. Provide 2-6 images.

RETURN ONLY VALID JSON conforming to this exact structure:
{
  "title": "Exact Product Name in English",
  "brand": "Apple / Sony / etc.",
  "category": "Smartphones",
  "retailPriceUsd": 999,
  "condition": "New",
  "images": ["https://...jpg"],
  "specs": ["spec 1", "spec 2", "spec 3", "spec 4"],
  "description": "Engaging 2-sentence description in English",
  "multilingual": {
    "en": {
      "title": "Exact Product Name in English",
      "description": "Engaging 2-sentence description in English",
      "specs": ["spec 1", "spec 2", "spec 3", "spec 4"]
    },
    "ar": {
      "title": "اسم المنتج الدقيق بالعربية",
      "description": "وصف دقيق وجذاب للمنتج بالعربية",
      "specs": ["مواصفة 1", "مواصفة 2", "مواصفة 3", "مواصفة 4"]
    },
    "ckb": {
      "title": "ناوی کاڵا بە کوردی سۆرانی",
      "description": "پێناسەیەکی کورت و بەهێز بە کوردی سۆرانی بۆ بازاڕی هەولێر و سلێمانی",
      "specs": ["خاڵی بەهێز 1", "خاڵی بەهێز 2", "خاڵی بەهێز 3", "خاڵی بەهێز 4"]
    },
    "badini": {
      "title": "ناڤێ کەلەپەلی ب کوردی بادینی",
      "description": "پێناسەکا کورت و بهێز ب کوردی بادینی بۆ دهۆک و زاخۆ",
      "specs": ["خالا 1", "خالا 2", "خالا 3", "خالا 4"]
    }
  }
}
Pure JSON only, no markdown wrapping, no backticks.`;

  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return {
          title: parsed.title || 'Imported Product',
          brand: parsed.brand || 'Brand',
          category: parsed.category || 'Consumer Electronics',
          retailPriceUsd: Number(parsed.retailPriceUsd) || 100,
          condition: (parsed.condition as any) || 'New',
          images: Array.isArray(parsed.images) && parsed.images.length > 0 ? parsed.images : [],
          specs: Array.isArray(parsed.specs) && parsed.specs.length > 0 ? parsed.specs : ['Authentic Verified Item'],
          description: parsed.description || parsed.multilingual?.en?.description || '',
          sourceUrl: targetUrl,
          multilingual: parsed.multilingual || {
            en: { title: parsed.title, description: parsed.description || '', specs: parsed.specs || [] },
            ar: { title: parsed.title, description: parsed.description || '', specs: parsed.specs || [] },
            ckb: { title: parsed.title, description: parsed.description || '', specs: parsed.specs || [] },
            badini: { title: parsed.title, description: parsed.description || '', specs: parsed.specs || [] },
          },
        };
      }
    } catch (err: any) {
      console.warn(`Model ${model} extraction attempt failed:`, err?.message);
    }
  }

  throw new Error('Could not parse product data with AI engine.');
}

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

    let pageContent = '';

    // 1. Try Jina Reader headless browser pipeline
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${targetUrl}`, {
        headers: {
          Accept: 'text/plain',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (jinaResponse.ok) {
        pageContent = await jinaResponse.text();
      }
    } catch (jinaErr: any) {
      console.warn('Jina reader skipped/timeout:', jinaErr.message);
    }

    // 2. If Jina returned empty or failed, fetch directly with modern browser headers
    if (!pageContent || pageContent.length < 200) {
      try {
        const directResponse = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (directResponse.ok) {
          pageContent = await directResponse.text();
        }
      } catch (directErr: any) {
        console.warn('Direct fetch skipped/failed:', directErr.message);
      }
    }

    // 3. Process with Gemini Intelligence (with anti-bot / URL slug catalog fallback)
    const product = await extractWithGemini(targetUrl, pageContent);

    // If no images were extracted, provide high quality fallback
    if (!product.images || product.images.length === 0) {
      product.images = [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ];
    }

    return NextResponse.json({
      success: true,
      data: product,
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
