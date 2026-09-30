import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/["'\r\n]/g, '').trim();

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

function parseAndNormalizePayload(parsed: any, targetUrl: string): ScrapedProductPayload {
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
      en: { title: parsed.title || '', description: parsed.description || '', specs: parsed.specs || [] },
      ar: { title: parsed.title || '', description: parsed.description || '', specs: parsed.specs || [] },
      ckb: { title: parsed.title || '', description: parsed.description || '', specs: parsed.specs || [] },
      badini: { title: parsed.title || '', description: parsed.description || '', specs: parsed.specs || [] },
    },
  };
}

/**
 * Native Gemini URL Context Tool via official Interactions API:
 * https://ai.google.dev/gemini-api/docs/url-context
 */
async function extractWithGeminiUrlContext(targetUrl: string): Promise<ScrapedProductPayload | null> {
  if (!GEMINI_API_KEY) return null;

  const prompt = `You are the lead product catalog intelligence for ZEEDO, Iraq's premier cash-on-delivery auction marketplace.
Analyze this product page using the provided url_context tool: "${targetUrl}".

TASKS:
1. Inspect the product URL to extract authentic product details:
   - Official product title and manufacturer brand.
   - Genuine retail price in USD ($) (numeric integer/float).
   - Valid high-resolution product image CDN URLs from the page or official manufacturer CDN.
   - Comprehensive technical specifications (4-6 key bullet points).
   - Engaging 2-sentence marketing description.
2. If the URL is behind anti-bot or access is blocked, infer the exact product details, authentic retail price, and images from the URL slug/model name and your comprehensive product catalog knowledge.
3. Automatically generate accurate, native, high-quality translations across 4 Iraqi market dialects:
   - "en": English
   - "ar": Arabic
   - "ckb": Kurdish Sorani (for Erbil & Sulaymaniyah marketplace)
   - "badini": Kurdish Badini (for Duhok & Zakho marketplace)
4. Category must be one of: "Smartphones", "Consumer Electronics", "Watches & Luxury", "Computers & Tablets", "Gaming & Consoles", "Heavy Tools & Machinery", "Home & Lifestyle", "Fashion & Apparel".

RETURN ONLY VALID JSON (no markdown formatting, no backticks, no codeblock wrapper):
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
}`;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash'];

  for (const model of models) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          input: prompt,
          tools: [
            { type: 'url_context' },
            { type: 'google_search' },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        console.warn(`url_context interaction with ${model} returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      for (const step of data.steps || []) {
        if (step.type === 'model_output' && step.content) {
          for (const block of step.content) {
            if (block.type === 'text' && block.text) {
              const cleanText = block.text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanText);
              return parseAndNormalizePayload(parsed, targetUrl);
            }
          }
        }
      }
    } catch (err: any) {
      console.warn(`Gemini url_context tool attempt failed on ${model}:`, err?.message);
    }
  }

  return null;
}

/**
 * Fallback pipeline using Jina Reader + direct Gemini generateContent
 */
async function extractWithGeminiFallback(
  targetUrl: string,
  pageContent: string
): Promise<ScrapedProductPayload> {
  const prompt = `You are the lead e-commerce product extraction intelligence for ZEEDO marketplace.
A store merchant submitted this URL: "${targetUrl}".

Page Content Snippet:
${pageContent ? pageContent.slice(0, 12000) : 'URL Only: ' + targetUrl}

INSTRUCTIONS:
1. Identify product title, brand, authentic retail price in USD ($), high-res images, and key specifications.
2. If page is protected or blocked, infer details from the URL slug and your catalog knowledge.
3. Automatically generate translations across 4 Iraqi market dialects: "en", "ar", "ckb" (Sorani), "badini" (Badini).
4. Category must be: "Smartphones", "Consumer Electronics", "Watches & Luxury", "Computers & Tablets", "Gaming & Consoles", "Heavy Tools & Machinery", "Home & Lifestyle", "Fashion & Apparel".

RETURN ONLY VALID JSON:
{
  "title": "Exact Product Name in English",
  "brand": "Brand",
  "category": "Smartphones",
  "retailPriceUsd": 999,
  "condition": "New",
  "images": ["https://...jpg"],
  "specs": ["spec 1", "spec 2", "spec 3", "spec 4"],
  "description": "Engaging description in English",
  "multilingual": {
    "en": { "title": "...", "description": "...", "specs": ["..."] },
    "ar": { "title": "...", "description": "...", "specs": ["..."] },
    "ckb": { "title": "...", "description": "...", "specs": ["..."] },
    "badini": { "title": "...", "description": "...", "specs": ["..."] }
  }
}`;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];

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
          signal: AbortSignal.timeout(15000),
        }
      );

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return parseAndNormalizePayload(parsed, targetUrl);
      }
    } catch (err: any) {
      console.warn(`Fallback model ${model} failed:`, err?.message);
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

    // 1. Primary: Use Gemini native URL Context Tool (https://ai.google.dev/gemini-api/docs/url-context)
    try {
      const urlContextProduct = await extractWithGeminiUrlContext(targetUrl);
      if (urlContextProduct && urlContextProduct.title) {
        if (!urlContextProduct.images || urlContextProduct.images.length === 0) {
          urlContextProduct.images = [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          ];
        }
        return NextResponse.json({
          success: true,
          method: 'gemini_url_context',
          data: urlContextProduct,
        });
      }
    } catch (urlContextErr: any) {
      console.warn('Gemini url_context pipeline failed, moving to fallback:', urlContextErr.message);
    }

    // 2. Secondary fallback: Headless reader + direct content generation
    let pageContent = '';
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${targetUrl}`, {
        headers: {
          Accept: 'text/plain',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (jinaResponse.ok) {
        pageContent = await jinaResponse.text();
      }
    } catch (jinaErr: any) {
      console.warn('Jina reader skipped/timeout:', jinaErr.message);
    }

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
          signal: AbortSignal.timeout(6000),
        });

        if (directResponse.ok) {
          pageContent = await directResponse.text();
        }
      } catch (directErr: any) {
        console.warn('Direct fetch skipped/failed:', directErr.message);
      }
    }

    const fallbackProduct = await extractWithGeminiFallback(targetUrl, pageContent);

    if (!fallbackProduct.images || fallbackProduct.images.length === 0) {
      fallbackProduct.images = [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ];
    }

    return NextResponse.json({
      success: true,
      method: 'gemini_fallback',
      data: fallbackProduct,
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

