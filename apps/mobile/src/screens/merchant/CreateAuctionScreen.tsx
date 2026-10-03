import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Gavel,
  ShieldCheck,
  Eye,
  RefreshCw,
  Printer,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';
import { ZEEDO_CONFIG } from '../../config/api';
import { MobileAuctionItem } from '../../types';

interface CreateAuctionScreenProps {
  onBack?: () => void;
}

const DEMO_URLS = [
  { label: 'Sony PS5 Slim (Amazon)', url: 'https://www.amazon.com/dp/B0CL5KNB9M' },
  { label: 'Apple Watch Ultra 2 (Noon)', url: 'https://www.noon.com/uae-en/apple-watch-ultra-2/N53432414A/p/' },
  { label: 'AirPods Pro 2 (eBay)', url: 'https://www.ebay.com/itm/apple-airpods-pro-2nd-gen' },
];

export const CreateAuctionScreen: React.FC<CreateAuctionScreenProps> = ({ onBack }) => {
  const { language, currentUser, setMerchantScreen, setSelectedAuctionId, fetchAuctions } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [productUrl, setProductUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // Scraped / Form Data
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleCkb, setTitleCkb] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [category, setCategory] = useState('electronics');
  const [condition, setCondition] = useState<'New' | 'Used' | 'New Open Box'>('New');
  const [images, setImages] = useState<string[]>([]);
  const [startingPriceIqd, setStartingPriceIqd] = useState('');
  const [incrementStepIqd, setIncrementStepIqd] = useState('1000');
  const [retailPriceIqd, setRetailPriceIqd] = useState('');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createdAuctionId, setCreatedAuctionId] = useState<string | null>(null);

  // 1. Scrape Product via API
  const handleScrapeProduct = async (urlToScrape?: string) => {
    const targetUrl = (urlToScrape || productUrl).trim();
    if (!targetUrl) {
      setScrapeError(isRtl ? 'يرجى إدخال رابط منتج صالح' : 'Please enter a valid product URL');
      return;
    }

    setIsScraping(true);
    setScrapeError('');

    try {
      const res = await fetch(ZEEDO_CONFIG.ENDPOINTS.SCRAPE_PRODUCT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setTitleEn(d.title || '');
        if (d.multilingual) {
          setTitleAr(d.multilingual.ar?.title || d.title || '');
          setTitleCkb(d.multilingual.ckb?.title || d.title || '');
          setDescriptionAr(d.multilingual.ar?.description || d.description || '');
          setDescriptionEn(d.multilingual.en?.description || d.description || '');
        } else {
          setTitleAr(d.title || '');
          setTitleCkb(d.title || '');
          setDescriptionAr(d.description || '');
          setDescriptionEn(d.description || '');
        }

        if (Array.isArray(d.images) && d.images.length > 0) {
          setImages(d.images);
        }

        if (d.retailPriceIqd) {
          setRetailPriceIqd(String(d.retailPriceIqd));
          setStartingPriceIqd('1000');
        } else if (d.retailPriceUsd) {
          setRetailPriceIqd(String(d.retailPriceUsd));
          setStartingPriceIqd('1000');
        }

        if (d.category) {
          const lower = d.category.toLowerCase();
          if (lower.includes('watch')) setCategory('watches');
          else if (lower.includes('fashion') || lower.includes('shoe')) setCategory('fashion');
          else if (lower.includes('motor') || lower.includes('car')) setCategory('motors');
          else setCategory('electronics');
        }

        setStep(2);
      } else {
        setScrapeError(json.message || (isRtl ? 'تعذر استخراج بيانات الرابط' : 'Failed to scrape URL'));
      }
    } catch {
      setScrapeError(isRtl ? 'حدث خطأ في الاتصال بالخادم' : 'Network error scraping product');
    } finally {
      setIsScraping(false);
    }
  };

  // 2. Publish Auction via POST /api/listings
  const handlePublishAuction = async () => {
    setIsPublishing(true);
    try {
      const newAuctionId = `zd-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const endsAt = new Date(now.getTime() + durationHours * 3600 * 1000);

      const payload = {
        id: newAuctionId,
        sellerId: currentUser?.id || 'sel-mansour',
        sellerName: currentUser?.storeName || 'Al-Mansour Electronics',
        sellerPhone: currentUser?.phone || '+964 780 987 6543',
        sellerAutoApprove: true,
        status: 'live',
        condition,
        startingPriceIqd: Number(startingPriceIqd) || 1000,
        currentBidIqd: Number(startingPriceIqd) || 1000,
        incrementStepIqd: Number(incrementStepIqd) || 2500,
        estimatedRetailMarketPriceIqd: Number(retailPriceIqd) || 200000,
        category,
        sourceType: 'url',
        sourceValue: productUrl,
        proposedDurationHours: durationHours,
        auctionStartsAt: now.toISOString(),
        auctionEndsAt: endsAt.toISOString(),
        images,
        multilingual: {
          en: {
            title: titleEn || titleAr,
            description: descriptionEn || descriptionAr,
            specs: ['Authentic Verified Item', 'Fast COD Delivery Across Iraq'],
          },
          ar: {
            title: titleAr || titleEn,
            description: descriptionAr || descriptionEn,
            specs: ['منتج أصلي مفحوص', 'شحن سريع ودفع عند الاستلام لكافة المحافظات'],
          },
          ckb: {
            title: titleCkb || titleAr || titleEn,
            description: descriptionAr || descriptionEn,
            specs: ['کاڵای ئەسڵی و باوەڕپێکراو', 'گەیاندنی خێرا لەگەڵ پارەدان لە کاتی وەرگرتن'],
          },
        },
      };

      const res = await fetch(`${ZEEDO_CONFIG.API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCreatedAuctionId(newAuctionId);
        // Refresh catalog in background
        fetchAuctions().catch(() => {});
        setStep(4);
      } else {
        Alert.alert(isRtl ? 'خطأ' : 'Error', isRtl ? 'فشل نشر المزاد' : 'Failed to publish auction');
      }
    } catch {
      Alert.alert(isRtl ? 'خطأ' : 'Error', isRtl ? 'خطأ في الاتصال بالخادم' : 'Network error publishing auction');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (onBack) onBack();
    else setMerchantScreen('dashboard');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backBtn} activeOpacity={0.8}>
          {isRtl ? <ArrowRight size={20} color="#0B130F" /> : <ArrowLeft size={20} color="#0B130F" />}
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isRtl ? 'إدراج مزاد جديد' : 'List New Auction'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {step === 1 && (isRtl ? 'الخطوة 1: سحب بيانات المنتج' : 'Step 1: Scrape Product')}
            {step === 2 && (isRtl ? 'الخطوة 2: مراجعة العناوين والصور' : 'Step 2: Details & AI')}
            {step === 3 && (isRtl ? 'الخطوة 3: تحديد السعر والمدة' : 'Step 3: Pricing & Duration')}
            {step === 4 && (isRtl ? 'تم النشر بنجاح! 🚀' : 'Published Successfully! 🚀')}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* ── STEP 1: Paste URL & Scrape ─────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.infoBanner}>
              <Sparkles size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoBannerTitle}>
                  {isRtl ? 'الاستيراد الذكي بالذكاء الاصطناعي' : 'AI-Powered Smart Scraper'}
                </Text>
                <Text style={styles.infoBannerText}>
                  {isRtl
                    ? 'الصق رابط أي منتج من Amazon أو Noon أو AliExpress وسيقوم الذكاء الاصطناعي بجلب الصور والمواصفات وترجمتها للعربية والكردية تلقائياً.'
                    : 'Paste any product link from Amazon, Noon, or AliExpress. AI will extract images, specs, and translate to Arabic and Kurdish automatically.'}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {isRtl ? 'رابط المنتج (URL)' : 'Product URL'}
              </Text>
              <View style={styles.urlInputRow}>
                <LinkIcon size={18} color="#94A3B8" />
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://www.amazon.com/dp/..."
                  placeholderTextColor="#94A3B8"
                  value={productUrl}
                  onChangeText={setProductUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {scrapeError ? <Text style={styles.errorText}>{scrapeError}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, isScraping && styles.btnDisabled]}
              onPress={() => handleScrapeProduct()}
              disabled={isScraping}
              activeOpacity={0.85}
            >
              {isScraping ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#0B130F" />
                  <Text style={styles.primaryBtnText}>
                    {isRtl ? 'جارٍ مسح المنتج وترجمته...' : 'Scanning & Translating...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <Sparkles size={18} color="#0B130F" />
                  <Text style={styles.primaryBtnText}>
                    {isRtl ? 'سحب المنتج بالذكاء الاصطناعي' : 'Extract Product with AI'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Quick Demo Pre-fills */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>
                {isRtl ? 'أو جرّب أحد هذه الروابط السريعة:' : 'Or test with a sample product:'}
              </Text>
              <View style={styles.demoPills}>
                {DEMO_URLS.map((demo, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.demoPill}
                    onPress={() => {
                      setProductUrl(demo.url);
                      handleScrapeProduct(demo.url);
                    }}
                  >
                    <Text style={styles.demoPillText}>{demo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Skip to manual */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                setTitleAr('سلعة مزاد مميزة');
                setTitleEn('Premium Auction Item');
                setStep(2);
              }}
            >
              <Text style={styles.skipBtnText}>
                {isRtl ? 'أو أدخل البيانات يدوياً بدون رابط' : 'Or enter details manually without URL'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: Edit Details & AI Translations ────────────────── */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            {/* Scraped Images Preview */}
            <Text style={styles.label}>{isRtl ? 'صور المنتج' : 'Product Images'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.previewThumb} />
              ))}
            </ScrollView>

            {/* Arabic Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'عنوان المزاد (بالعربية) *' : 'Title (Arabic) *'}</Text>
              <TextInput
                style={styles.textInput}
                value={titleAr}
                onChangeText={setTitleAr}
                placeholder="عنوان السلعة بالعربية"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Kurdish Sorani Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'العنوان بالكردية (سۆرانی)' : 'Title (Kurdish Sorani)'}</Text>
              <TextInput
                style={styles.textInput}
                value={titleCkb}
                onChangeText={setTitleCkb}
                placeholder="سەردێڕی کاڵا بە کوردی"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* English Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'العنوان بالإنجليزية' : 'Title (English)'}</Text>
              <TextInput
                style={styles.textInput}
                value={titleEn}
                onChangeText={setTitleEn}
                placeholder="Product title in English"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'القسم' : 'Category'}</Text>
              <View style={styles.pillRow}>
                {['electronics', 'watches', 'fashion', 'motors'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.selectPill, category === cat && styles.selectPillActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.selectPillText, category === cat && styles.selectPillTextActive]}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Condition Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'حالة السلعة' : 'Item Condition'}</Text>
              <View style={styles.pillRow}>
                {(['New', 'New Open Box', 'Used'] as const).map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.selectPill, condition === cond && styles.selectPillActive]}
                    onPress={() => setCondition(cond)}
                  >
                    <Text style={[styles.selectPillText, condition === cond && styles.selectPillTextActive]}>
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>{isRtl ? 'التالي: السعر والمدة' : 'Next: Pricing & Time'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 3: Pricing & Duration ─────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'سعر البدء (د.ع) *' : 'Starting Price (IQD) *'}</Text>
              <TextInput
                style={styles.textInput}
                value={startingPriceIqd}
                onChangeText={setStartingPriceIqd}
                keyboardType="numeric"
              />
              <Text style={styles.fieldHint}>
                {isRtl ? 'ننصح ببدء المزاد من 1,000 د.ع لجذب أكبر عدد من المزايدين' : 'Recommended 1,000 IQD to drive viral bidding'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'خطوة المزايدة (د.ع)' : 'Bid Increment Step (IQD)'}</Text>
              <View style={styles.pillRow}>
                {['1000', '2500', '5000', '10000'].map((inc) => (
                  <TouchableOpacity
                    key={inc}
                    style={[styles.selectPill, incrementStepIqd === inc && styles.selectPillActive]}
                    onPress={() => setIncrementStepIqd(inc)}
                  >
                    <Text style={[styles.selectPillText, incrementStepIqd === inc && styles.selectPillTextActive]}>
                      +{Number(inc).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'القيمة التقديرية في السوق (د.ع)' : 'Estimated Market Retail (IQD)'}</Text>
              <TextInput
                style={styles.textInput}
                value={retailPriceIqd}
                onChangeText={setRetailPriceIqd}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRtl ? 'مدة المزاد' : 'Auction Duration'}</Text>
              <View style={styles.pillRow}>
                {[6, 12, 24, 48, 72].map((hrs) => (
                  <TouchableOpacity
                    key={hrs}
                    style={[styles.selectPill, durationHours === hrs && styles.selectPillActive]}
                    onPress={() => setDurationHours(hrs)}
                  >
                    <Text style={[styles.selectPillText, durationHours === hrs && styles.selectPillTextActive]}>
                      {hrs}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buyer Live Preview Card */}
            <View style={styles.previewBox}>
              <Text style={styles.previewHeader}>{isRtl ? 'معاينة كارت المزاد للزبائن:' : 'Buyer Card Preview:'}</Text>
              <View style={styles.miniCard}>
                <Image source={{ uri: images[0] }} style={styles.miniCardImage} />
                <View style={styles.miniCardContent}>
                  <Text style={styles.miniCardTitle} numberOfLines={1}>{titleAr || titleEn}</Text>
                  <Text style={styles.miniCardBid}>
                    {Number(startingPriceIqd || 1000).toLocaleString()} د.ع
                  </Text>
                  <View style={styles.miniCardTimer}>
                    <Clock size={11} color="#059669" />
                    <Text style={styles.miniCardTimerText}>{durationHours}h remaining</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.publishBtn, isPublishing && styles.btnDisabled]}
              onPress={handlePublishAuction}
              disabled={isPublishing}
              activeOpacity={0.85}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="#0B130F" />
              ) : (
                <View style={styles.btnRow}>
                  <Gavel size={18} color="#0B130F" />
                  <Text style={styles.publishBtnText}>
                    {isRtl ? 'نشر المزاد مباشرة الآن 🚀' : 'Launch Auction Live Now 🚀'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 4: Success Screen ─────────────────────────────────── */}
        {step === 4 && (
          <View style={styles.successContainer}>
            <View style={styles.successIconWrap}>
              <CheckCircle2 size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>
              {isRtl ? 'تم نشر المزاد بنجاح!' : 'Auction Is Live!'}
            </Text>
            <Text style={styles.successSub}>
              {isRtl
                ? `المزاد متاح الآن لكافة المشترين في العراق وكردستان. رقم المزاد: ${createdAuctionId}`
                : `Your lot is now live in the Zeedo marketplace feed. ID: ${createdAuctionId}`}
            </Text>

            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 10 }}>
                {isRtl ? 'كود المخزن والتوصيل الذكي (اطبعه للمنتج)' : 'Inventory & Smart Delivery QR Code'}
              </Text>
              <View style={{ padding: 10, backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 }}>
                <Image 
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://zeedo.bid/track/${createdAuctionId}` }} 
                  style={{ width: 180, height: 180 }} 
                />
              </View>
              <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 12, paddingHorizontal: 20 }}>
                {isRtl 
                  ? 'اطبع هذا الكود والصقه على المنتج للمخزن. بعد انتهاء المزاد وبيعه، يتحدث الكود تلقائياً بمعلومات المشتري وموقع الخريطة (Google Maps) للسائق. رسم نشر المزاد (1,000 د.ع).' 
                  : 'Print and attach this QR to your item for inventory. Once sold, this QR updates with buyer details & Google Maps location for your delivery driver. Listing fee: 1,000 IQD.'}
              </Text>

              {/* Print Button for QR Code */}
              <TouchableOpacity
                style={styles.printQrBtn}
                onPress={() => {
                  const printUrl = `https://zeedo.bid/track/${createdAuctionId}`;
                  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
                    window.print();
                  } else {
                    Linking.openURL(printUrl).catch((err) => {
                      console.warn('Failed to open print QR link:', err);
                    });
                  }
                }}
                activeOpacity={0.85}
              >
                <Printer size={18} color="#0B130F" />
                <Text style={styles.printQrBtnText}>
                  {isRtl ? 'طباعة باركود المنتج (Print QR)' : 'Print Inventory QR Code'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                if (createdAuctionId) setSelectedAuctionId(createdAuctionId);
                setMerchantScreen('dashboard');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {isRtl ? 'عرض المزاد في الغرفة المباشرة' : 'View in Live Room'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setMerchantScreen('dashboard')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>
                {isRtl ? 'العودة للوحة تحكم التاجر' : 'Back to Merchant Dashboard'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B130F',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 14,
    borderRadius: 16,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  urlInput: {
    flex: 1,
    fontSize: 13,
    color: '#0B130F',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13,
    color: '#0B130F',
  },
  fieldHint: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#B4F105',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B130F',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  demoSection: {
    marginTop: 10,
    gap: 8,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  demoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoPillText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  imageScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  previewThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  selectPillActive: {
    backgroundColor: '#072F1F',
    borderColor: '#072F1F',
  },
  selectPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  selectPillTextActive: {
    color: '#B4F105',
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  previewHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  miniCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  miniCardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  miniCardContent: {
    flex: 1,
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B130F',
  },
  miniCardBid: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  miniCardTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  miniCardTimerText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  publishBtn: {
    backgroundColor: '#B4F105',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  publishBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B130F',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  successIconWrap: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0B130F',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  printQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B4F105',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  printQrBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B130F',
  },
});
