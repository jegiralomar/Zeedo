import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html: string, propertyOrName: string): string {
  const match =
    html.match(new RegExp(`<meta\\s+(?:property|name)=["']${propertyOrName}["']\\s+content=["']([^"']*)["']`, 'i')) ||
    html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+(?:property|name)=["']${propertyOrName}["']`, 'i'));
  return match ? cleanText(match[1]) : '';
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

    const parsedUrl = new URL(targetUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, '');

    // Fetch page content
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      // Fallback if blocked
      const fallbackTitle = parsedUrl.pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/[-_]/g, ' ')
        .replace(/\.html?$/i, '') || domain;

      return NextResponse.json({
        success: true,
        data: {
          title: cleanText(fallbackTitle),
          description: `Imported from ${domain}. Please review and finalize product details.`,
          images: [],
          retailPriceUsd: 100,
          currency: 'USD',
          brand: domain.split('.')[0]?.toUpperCase() || 'Brand',
          category: 'Consumer Electronics',
          specs: [`Original source link: ${targetUrl}`],
          sourceUrl: targetUrl,
        },
      });
    }

    const html = await response.text();

    // 1. JSON-LD Schema.org Product Extraction
    let ldProduct: any = null;
    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        try {
          const raw = block.replace(/<script[^>]*>|<\/script>/gi, '').trim();
          const parsed = JSON.parse(raw);
          const candidates = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of candidates) {
            if (item['@type'] === 'Product' || item['@type']?.includes?.('Product')) {
              ldProduct = item;
              break;
            }
            if (item['@graph']) {
              const graphItem = item['@graph'].find((g: any) => g['@type'] === 'Product');
              if (graphItem) {
                ldProduct = graphItem;
                break;
              }
            }
          }
          if (ldProduct) break;
        } catch {
          // ignore malformed JSON-LD
        }
      }
    }

    // 2. Title Extraction
    let title =
      ldProduct?.name ||
      extractMeta(html, 'og:title') ||
      extractMeta(html, 'twitter:title') ||
      '';

    if (!title) {
      const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      title = titleTag ? titleTag[1] : '';
    }
    title = cleanText(title).replace(/\s*\|.*$/, '').replace(/\s*-.*Amazon.*$/i, '');

    // 3. Description Extraction
    let description =
      ldProduct?.description ||
      extractMeta(html, 'og:description') ||
      extractMeta(html, 'description') ||
      extractMeta(html, 'twitter:description') ||
      '';
    description = cleanText(description);

    // 4. Image Extraction
    const images: string[] = [];

    // Check JSON-LD images
    if (ldProduct?.image) {
      if (Array.isArray(ldProduct.image)) {
        ldProduct.image.forEach((img: any) => {
          const url = typeof img === 'string' ? img : img.url;
          if (url && !images.includes(url)) images.push(url);
        });
      } else if (typeof ldProduct.image === 'string') {
        images.push(ldProduct.image);
      } else if (ldProduct.image.url) {
        images.push(ldProduct.image.url);
      }
    }

    // Check OpenGraph and Twitter images
    const ogImg = extractMeta(html, 'og:image') || extractMeta(html, 'og:image:secure_url');
    if (ogImg && !images.includes(ogImg)) images.push(ogImg);

    const twitterImg = extractMeta(html, 'twitter:image');
    if (twitterImg && !images.includes(twitterImg)) images.push(twitterImg);

    // Regex search for high-res product images if few images found
    if (images.length < 3) {
      const imgTags = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["'][^>]*>/gi);
      if (imgTags) {
        for (const tag of imgTags) {
          const srcMatch = tag.match(/src=["'](https?:\/\/[^"']+)["']/i);
          if (srcMatch) {
            const url = srcMatch[1];
            // Filter out tracking icons, avatars, logos
            if (
              !/logo|icon|avatar|badge|pixel|spinner|transparent/i.test(url) &&
              !images.includes(url)
            ) {
              images.push(url);
              if (images.length >= 5) break;
            }
          }
        }
      }
    }

    // 5. Price Extraction in USD ($)
    let retailPriceUsd = 0;

    // From JSON-LD offers
    if (ldProduct?.offers) {
      const offers = Array.isArray(ldProduct.offers) ? ldProduct.offers[0] : ldProduct.offers;
      const rawPrice = parseFloat(offers?.price || offers?.lowPrice || '0');
      if (rawPrice > 0) {
        retailPriceUsd = Math.round(rawPrice);
      }
    }

    // Fallback: OpenGraph price
    if (!retailPriceUsd) {
      const ogPrice = parseFloat(extractMeta(html, 'og:price:amount') || extractMeta(html, 'product:price:amount') || '0');
      if (ogPrice > 0) {
        retailPriceUsd = Math.round(ogPrice);
      }
    }

    // Fallback: Dollar regex pattern search
    if (!retailPriceUsd) {
      const dollarMatch = html.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (dollarMatch) {
        const val = parseFloat(dollarMatch[1].replace(/,/g, ''));
        if (val > 10 && val < 50000) {
          retailPriceUsd = Math.round(val);
        }
      }
    }

    // 6. Specs Extraction
    const specs: string[] = [];
    const liMatches = html.match(/<li[^>]*>(?:<span[^>]*>)?([^<]{10,120})(?:<\/span>)?<\/li>/gi);
    if (liMatches) {
      for (const li of liMatches) {
        const text = cleanText(li);
        if (
          text.length >= 10 &&
          text.length <= 120 &&
          !/cookie|privacy|sign in|cart|account|return/i.test(text)
        ) {
          specs.push(text);
          if (specs.length >= 5) break;
        }
      }
    }

    // Infer category
    let category = 'Consumer Electronics';
    const textCorpus = (title + ' ' + description).toLowerCase();
    if (/phone|iphone|samsung|galaxy|pixel|xiaomi/i.test(textCorpus)) category = 'Smartphones';
    else if (/watch|rolex|patek|audemars|omega|cartier/i.test(textCorpus)) category = 'Watches & Luxury';
    else if (/drill|saw|dewalt|makita|milwaukee|bosch|excavator|crane/i.test(textCorpus)) category = 'Heavy Tools & Machinery';
    else if (/playstation|xbox|nintendo|ps5|console|controller/i.test(textCorpus)) category = 'Gaming & Consoles';
    else if (/laptop|macbook|ipad|dell|thinkpad/i.test(textCorpus)) category = 'Computers & Tablets';

    const brand = ldProduct?.brand?.name || domain.split('.')[0]?.toUpperCase() || 'Brand';

    return NextResponse.json({
      success: true,
      data: {
        title: title || `Imported ${brand} Product`,
        description: description || `Original ${brand} item. 100% Cash-on-Delivery with 5-minute doorstep inspection.`,
        images: images.slice(0, 6),
        retailPriceUsd: retailPriceUsd || 150,
        currency: 'USD',
        brand,
        category,
        specs: specs.length > 0 ? specs : ['Authentic Verified Item', '100% Cash on Delivery', 'Inspected before payment'],
        sourceUrl: targetUrl,
      },
    });
  } catch (error) {
    console.error('Error scraping product:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Could not extract product details from this link. You can enter details manually.',
      },
      { status: 500 }
    );
  }
}
