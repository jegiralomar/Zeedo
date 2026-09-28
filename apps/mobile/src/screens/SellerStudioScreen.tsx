import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS, isRTL, DIALECT_LABELS } from '../i18n/translations';
import { LanguageCode } from '../types';
import { apiEnrichItem, ItemEnrichmentResponse } from '../services/api';
import {
  Store,
  Sparkles,
  Plus,
  Lock,
  Clock,
  CheckCircle,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Globe,
  Image as ImageIcon,
  Check,
  Tag,
  Scan,
} from 'lucide-react-native';

export const SellerStudioScreen: React.FC = () => {
  const { auctions, createSellerListing } = useAuctionStore();
  const { role, language, seller, setRole } = useAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [condition, setCondition] = useState<'New' | 'Used' | 'New Open Box'>('New');
  const [estimatedRetail, setEstimatedRetail] = useState('850000');
  const [description, setDescription] = useState('');
  const [isAiScraping, setIsAiScraping] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiData, setAiData] = useState<ItemEnrichmentResponse | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState(
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
  ]);
  const [specsList, setSpecsList] = useState<string[]>([
    'Official Iraqi Dealer Warranty Included',
    'Factory Sealed Packaging',
    '100% Cash-on-Delivery Doorstep Inspection',
  ]);
  const [selectedDialectPreview, setSelectedDialectPreview] = useState<LanguageCode>(language);

  const myListings = auctions.filter((a) => a.sellerId === seller.id);
  const commissionPercent = Math.round(seller.commissionRate * 100);

  // Gemini AI Smart Fill with Web Scraping
  const handleAiSmartFill = async (manualQuery?: string) => {
    const q = manualQuery || title || 'Apple iPhone 15 Pro Max 256GB';
    setIsAiScraping(true);
    try {
      const res = await apiEnrichItem(q);
      setAiData(res);
      setTitle(res.titles[language] || res.titles.en);
      setDescription(res.descriptions[language] || res.descriptions.en);
      setCategory(res.category);
      setCondition(res.condition);
      setEstimatedRetail(res.estimatedRetailMarketPriceIqd.toString());
      if (res.galleryImageUrls?.length) {
        setGalleryUrls(res.galleryImageUrls);
        setActiveImageUrl(res.galleryImageUrls[0]);
      }
      if (res.specifications?.length) {
        setSpecsList(res.specifications);
      }
      setAiSuccess(true);
    } catch (err) {
      console.warn('Gemini smart fill error:', err);
    } finally {
      setIsAiScraping(false);
    }
  };

  const handlePublish = () => {
    // STRICT RBAC: Only sellers can add a new listing
    if (role !== 'seller') {
      alert('Unauthorized: Only verified sellers can publish listings.');
      return;
    }
    if (!title.trim()) return;

    createSellerListing({
      sellerId: seller.id,
      sellerName: seller.storeName,
      category,
      condition,
      imageUrl: activeImageUrl,
      estimatedRetailMarketPriceIqd: parseInt(estimatedRetail, 10) || 500000,
      primaryTitle: title,
      primaryDescription: description || 'Verified merchant listing for Iraqi marketplace.',
      primarySpecs:
        specsList.length > 0
          ? specsList
          : ['Official Warranty Included', 'Factory Sealed', '100% COD Doorstep Inspection'],
      isAutonomousSeller: seller.auto_approve_listings,
      multilingual: aiData?.titles
        ? {
            en: {
              title: aiData.titles.en,
              description: aiData.descriptions.en,
              specs: specsList,
            },
            ar: {
              title: aiData.titles.ar,
              description: aiData.descriptions.ar,
              specs: specsList,
            },
            ckb: {
              title: aiData.titles.ckb,
              description: aiData.descriptions.ckb,
              specs: specsList,
            },
            badini: {
              title: aiData.titles.badini,
              description: aiData.descriptions.badini,
              specs: specsList,
            },
          }
        : undefined,
    });

    setTitle('');
    setDescription('');
    setAiSuccess(false);
    setAiData(null);
    setShowCreateModal(false);
  };

  // If user is not in seller mode, render strict permission gate card
  if (role !== 'seller') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.restrictedContent}>
        <View style={styles.restrictedCard}>
          <View style={styles.restrictedBadge}>
            <ShieldAlert size={12} color={TOKENS.colors.accent} />
            <Text style={styles.restrictedBadgeText}>{t.sellerOnlyPill}</Text>
          </View>

          <View style={styles.restrictedIconBox}>
            <Store size={38} color={TOKENS.colors.primary} />
            <View style={styles.restrictedLockBadge}>
              <Lock size={13} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.restrictedTitle}>{t.onlySellersCanListTitle}</Text>
          <Text style={styles.restrictedDesc}>{t.onlySellersCanListDesc}</Text>

          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => setRole('seller')}
            activeOpacity={0.85}
          >
            <Store size={16} color="#FFFFFF" />
            <Text style={styles.switchRoleBtnText}>{t.switchToSellerMode}</Text>
          </TouchableOpacity>
        </View>

        {/* Merchant Privilege Rules */}
        <View style={styles.merchantInfoCard}>
          <Text style={styles.merchantInfoTitle}>Merchant Listing Protocol:</Text>

          <View style={[styles.merchantBulletRow, rtl && styles.rtlRow]}>
            <View style={styles.bulletDot} />
            <Text style={[styles.bulletText, rtl && styles.alignRight]}>
              Physical Iraq Commercial Hub (Erbil / Baghdad / Basra warehouse)
            </Text>
          </View>

          <View style={[styles.merchantBulletRow, rtl && styles.rtlRow]}>
            <View style={styles.bulletDot} />
            <Text style={[styles.bulletText, rtl && styles.alignRight]}>
              Universal 1,000 IQD starting price strictly locked on all listings
            </Text>
          </View>

          <View style={[styles.merchantBulletRow, rtl && styles.rtlRow]}>
            <View style={styles.bulletDot} />
            <Text style={[styles.bulletText, rtl && styles.alignRight]}>
              100% Cash-on-Delivery doorstep cash courier dispatch agreement
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Studio Header Card with 28px corners */}
      <View style={styles.studioHeaderCard}>
        <View style={[styles.studioHeaderRow, rtl && styles.rtlRow]}>
          <View style={styles.storeIconCircle}>
            <Store size={22} color={TOKENS.colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{seller.storeName}</Text>
            <Text style={styles.storeOwner}>
              {seller.ownerName} • {seller.city} Hub (Rating: {seller.rating} ★)
            </Text>
          </View>
          <View style={styles.ratePill}>
            <Text style={styles.rateText}>{commissionPercent}% Fee</Text>
          </View>
        </View>

        {/* Financial Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>{t.sellerGrossSales}</Text>
            <Text style={styles.metricNumber}>
              {(seller.totalCodVolumeIqd / 1000000).toFixed(1)}M IQD
            </Text>
            <Text style={styles.metricSub}>38 COD parcels completed</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>{t.netPayout}</Text>
            <Text style={styles.netPayoutValue}>
              {((seller.totalCodVolumeIqd * (1 - seller.commissionRate)) / 1000000).toFixed(1)}M IQD
            </Text>
            <Text style={styles.metricSubGreen}>Direct Cash Doorstep</Text>
          </View>
        </View>

        {/* Platform 1,000 IQD Base Fee Rule Notice */}
        <View style={styles.ruleNotice}>
          <Lock size={14} color={TOKENS.colors.primary} />
          <Text style={styles.ruleNoticeText}>
            Universal 1,000 IQD Rule: The initial 1,000 IQD starting price is retained by ZEEDO as a base listing service fee. Merchant payouts apply to the remaining balance at {commissionPercent}%.
          </Text>
        </View>
      </View>

      {/* Action Button: Create New Listing */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.88}
      >
        <Plus size={18} color="#ffffff" />
        <Text style={styles.createBtnText}>{t.createListing}</Text>
      </TouchableOpacity>

      {/* Seller Listings Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t.myListings} ({myListings.length})</Text>
        <Text style={styles.sectionSub}>Active in Marketplace</Text>
      </View>

      <View style={styles.listingsList}>
        {myListings.map((item) => (
          <View key={item.id} style={styles.listingCard}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.listingThumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <View style={styles.listingTopRow}>
                <Text style={styles.listingRef}>#{item.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'grace_period'
                      ? styles.graceBadge
                      : styles.liveBadge,
                  ]}
                >
                  {item.status === 'grace_period' ? (
                    <Clock size={10} color={TOKENS.colors.accent} />
                  ) : (
                    <CheckCircle size={10} color={TOKENS.colors.secondary} />
                  )}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'grace_period'
                        ? styles.graceBadgeText
                        : styles.liveBadgeText,
                    ]}
                  >
                    {item.status === 'grace_period' ? '10m Grace Edit' : 'Live Bids'}
                  </Text>
                </View>
              </View>

              <Text numberOfLines={1} style={styles.listingTitle}>
                {item.multilingual.en.title}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.currentBidText}>
                  Current: {item.currentBidIqd.toLocaleString()} IQD
                </Text>
                <Text style={styles.bidsCountText}>{item.totalBids} bids</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Create Listing Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t.createListing}</Text>
                <Text style={styles.modalSubtitle}>Autonomous Merchant Studio</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <X size={18} color={TOKENS.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {/* Strict 1,000 IQD Starting Price Lock */}
              <View style={styles.lockRow}>
                <View style={styles.lockIconBox}>
                  <Lock size={16} color={TOKENS.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lockTitle}>Universal 1,000 IQD Starting Price</Text>
                  <Text style={styles.lockDesc}>
                    Fixed ecosystem rule: All listings start strictly at 1,000 IQD.
                  </Text>
                </View>
                <View style={styles.lockedPill}>
                  <Text style={styles.lockedPillText}>LOCKED</Text>
                </View>
              </View>

              {/* Magic Keyword Search & AI Smart Fill Section */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={styles.inputLabel}>{t.itemTitle}</Text>
                  <Text style={styles.inputLabelHint}>Enter keywords or brand</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. iPhone 15 Pro Max 256GB Desert Titanium"
                  placeholderTextColor={TOKENS.colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Quick Template Chips */}
              <View style={styles.quickChipsRow}>
                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={() => handleAiSmartFill('Apple iPhone 15 Pro Max 256GB')}
                  disabled={isAiScraping}
                >
                  <Text style={styles.quickChipText}>📱 iPhone 15 Pro Max</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={() => handleAiSmartFill('Sony PlayStation 5 Slim 1TB')}
                  disabled={isAiScraping}
                >
                  <Text style={styles.quickChipText}>🎮 PS5 Slim 1TB</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={() => handleAiSmartFill('Tissot PRX Powermatic 80 Watch')}
                  disabled={isAiScraping}
                >
                  <Text style={styles.quickChipText}>⌚ Luxury Watch</Text>
                </TouchableOpacity>
              </View>

              {/* Gemini AI 1-Tap Smart Fill Button */}
              <TouchableOpacity
                style={[
                  styles.aiSmartFillBtn,
                  aiSuccess && styles.aiSmartFillBtnSuccess,
                  isAiScraping && styles.aiSmartFillBtnLoading,
                ]}
                onPress={() => handleAiSmartFill()}
                disabled={isAiScraping}
                activeOpacity={0.88}
              >
                {isAiScraping ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.aiSmartFillTextLoading}>
                      Gemini Scraping Specs, Images & Iraqi Market Rates...
                    </Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} color={aiSuccess ? '#FFFFFF' : '#FCD34D'} />
                    <Text style={styles.aiSmartFillText}>
                      {aiSuccess ? '✨ Re-Run ZEEDO AI Smart Fill' : '⚡ ZEEDO AI Smart Fill (Images + Copy + Price)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Scraped Image Gallery Preview & Selector */}
              {galleryUrls.length > 0 && (
                <View style={styles.gallerySection}>
                  <View style={styles.galleryHeaderRow}>
                    <Text style={styles.inputLabel}>Scraped Product Gallery ({galleryUrls.length} photos)</Text>
                    <View style={styles.geminiBadge}>
                      <Sparkles size={11} color={TOKENS.colors.secondary} />
                      <Text style={styles.geminiBadgeText}>Gemini Verified</Text>
                    </View>
                  </View>

                  {/* Primary Featured Image */}
                  <View style={styles.featuredImageContainer}>
                    <Image source={{ uri: activeImageUrl }} style={styles.featuredImage} />
                    <View style={styles.primaryImagePill}>
                      <Check size={11} color="#FFFFFF" />
                      <Text style={styles.primaryImagePillText}>Primary Listing Image</Text>
                    </View>
                  </View>

                  {/* Thumbnails Row */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailsRow}>
                    {galleryUrls.map((imgUrl, idx) => {
                      const isSelected = activeImageUrl === imgUrl;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.thumbnailCard, isSelected && styles.thumbnailCardActive]}
                          onPress={() => setActiveImageUrl(imgUrl)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: imgUrl }} style={styles.thumbnailImg} />
                          {isSelected && (
                            <View style={styles.selectedCheckOverlay}>
                              <Check size={12} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Iraqi Market Price & Saving Card */}
              <View style={styles.marketPriceCard}>
                <View style={styles.marketPriceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marketPriceSub}>ESTIMATED IRAQI RETAIL RATE</Text>
                    <Text style={styles.marketPriceValue}>
                      {parseInt(estimatedRetail, 10).toLocaleString()} IQD
                      {aiData?.estimatedRetailMarketPriceUsd ? (
                        <Text style={styles.marketPriceUsd}> (~${aiData.estimatedRetailMarketPriceUsd} USD)</Text>
                      ) : null}
                    </Text>
                  </View>
                  <View style={styles.savingsPill}>
                    <Zap size={12} color="#065F46" />
                    <Text style={styles.savingsPillText}>Save vs 1,000 IQD Bid</Text>
                  </View>
                </View>

                {/* Editable Retail input */}
                <View style={styles.retailInputRow}>
                  <Text style={styles.retailInputLabel}>Adjust Market Baseline (IQD):</Text>
                  <TextInput
                    style={styles.retailInputInline}
                    keyboardType="numeric"
                    value={estimatedRetail}
                    onChangeText={setEstimatedRetail}
                  />
                </View>
              </View>

              {/* 4-Dialect Multi-Lingual Copy Tabs & Preview */}
              <View style={styles.dialectSection}>
                <View style={styles.galleryHeaderRow}>
                  <Text style={styles.inputLabel}>Multilingual Copy Preview (4 Dialects)</Text>
                  <View style={styles.dialectCountPill}>
                    <Globe size={11} color={TOKENS.colors.primary} />
                    <Text style={styles.dialectCountText}>Auto 4-Lang</Text>
                  </View>
                </View>

                {/* Dialect Tabs */}
                <View style={styles.dialectTabsRow}>
                  {(['ckb', 'badini', 'ar', 'en'] as LanguageCode[]).map((langKey) => (
                    <TouchableOpacity
                      key={langKey}
                      style={[
                        styles.dialectTab,
                        selectedDialectPreview === langKey && styles.dialectTabActive,
                      ]}
                      onPress={() => {
                        setSelectedDialectPreview(langKey);
                        if (aiData?.titles[langKey]) {
                          setTitle(aiData.titles[langKey]);
                        }
                        if (aiData?.descriptions[langKey]) {
                          setDescription(aiData.descriptions[langKey]);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dialectTabText,
                          selectedDialectPreview === langKey && styles.dialectTabTextActive,
                        ]}
                      >
                        {langKey === 'ckb'
                          ? 'سۆرانی'
                          : langKey === 'badini'
                          ? 'بادینی'
                          : langKey === 'ar'
                          ? 'العربية'
                          : 'English'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Active Dialect Title & Description */}
                <View style={styles.dialectPreviewCard}>
                  <Text style={styles.dialectPreviewTitle}>
                    {aiData?.titles[selectedDialectPreview] || title || 'Title in ' + selectedDialectPreview}
                  </Text>
                  <Text style={styles.dialectPreviewDesc}>
                    {aiData?.descriptions[selectedDialectPreview] || description || 'Verified merchant listing for Iraqi marketplace.'}
                  </Text>
                </View>
              </View>

              {/* Technical Specifications Pills */}
              {specsList.length > 0 && (
                <View style={styles.specsSection}>
                  <Text style={styles.inputLabel}>Scraped Technical Specifications</Text>
                  <View style={styles.specsPillsWrap}>
                    {specsList.map((spec, sIdx) => (
                      <View key={sIdx} style={styles.specPill}>
                        <Tag size={11} color={TOKENS.colors.primary} />
                        <Text style={styles.specPillText}>{spec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Category Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.itemCategory}</Text>
                <View style={styles.catChipsRow}>
                  {['Smartphones', 'Watches & Luxury', 'Gaming & Consoles', 'Laptops & Computers', 'Audio & Sound'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catChip, category.includes(c.split(' ')[0]) && styles.catChipActive]}
                      onPress={() => setCategory(c.split(' ')[0])}
                    >
                      <Text style={[styles.catChipText, category.includes(c.split(' ')[0]) && styles.catChipTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Condition Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Condition</Text>
                <View style={styles.catChipsRow}>
                  {(['New', 'New Open Box', 'Used'] as const).map((cond) => (
                    <TouchableOpacity
                      key={cond}
                      style={[styles.catChip, condition === cond && styles.catChipActive]}
                      onPress={() => setCondition(cond)}
                    >
                      <Text style={[styles.catChipText, condition === cond && styles.catChipTextActive]}>
                        {cond}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 10-Minute Grace Window Notice */}
              <View style={styles.graceNoticeCard}>
                <Clock size={16} color={TOKENS.colors.accent} />
                <Text style={styles.graceNoticeText}>{t.tenMinGraceNotice}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.publishBtn, !title.trim() && styles.publishBtnDisabled]}
                onPress={handlePublish}
                disabled={!title.trim() || isAiScraping}
                activeOpacity={0.88}
              >
                <CheckCircle size={18} color="#ffffff" />
                <Text style={styles.publishBtnText}>Publish Verified Listing (1,000 IQD Start)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  content: {
    padding: TOKENS.spacing.md,
    paddingBottom: 110,
    gap: 12,
  },
  studioHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  studioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  storeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  storeOwner: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: TOKENS.colors.cardMuted,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
    textTransform: 'uppercase',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    marginTop: 2,
  },
  netPayoutValue: {
    fontSize: 18,
    fontWeight: '900',
    color: TOKENS.colors.secondary,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
    marginTop: 2,
  },
  metricSubGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
    marginTop: 2,
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primaryLight,
    padding: 10,
    borderRadius: TOKENS.borderRadius.md,
  },
  ruleNoticeText: {
    flex: 1,
    fontSize: 10,
    color: TOKENS.colors.primary,
    lineHeight: 14,
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    height: 48,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
  },
  listingsList: {
    gap: 8,
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  listingThumb: {
    width: 56,
    height: 56,
    borderRadius: TOKENS.borderRadius.md,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  listingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingRef: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  graceBadge: {
    backgroundColor: TOKENS.colors.accentLight,
  },
  liveBadge: {
    backgroundColor: TOKENS.colors.secondaryLight,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  graceBadgeText: {
    color: TOKENS.colors.accent,
  },
  liveBadgeText: {
    color: TOKENS.colors.secondary,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  currentBidText: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  bidsCountText: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: TOKENS.borderRadius.xxl,
    borderTopRightRadius: TOKENS.borderRadius.xxl,
    maxHeight: '92%',
    ...TOKENS.shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TOKENS.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.cardBorder,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: TOKENS.spacing.lg,
    gap: TOKENS.spacing.md,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.primaryLight,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
  },
  lockIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  lockDesc: {
    fontSize: 10,
    color: TOKENS.colors.textSecondary,
  },
  lockedPill: {
    backgroundColor: TOKENS.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.sm,
  },
  lockedPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.textSecondary,
  },
  textInput: {
    height: 44,
    backgroundColor: TOKENS.colors.cardMuted,
    borderRadius: TOKENS.borderRadius.lg,
    paddingHorizontal: 12,
    fontSize: 13,
    color: TOKENS.colors.textPrimary,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
  },
  aiTranslateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.violetLight,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  aiTranslateBtnSuccess: {
    backgroundColor: TOKENS.colors.secondaryLight,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  aiTranslateText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.violet,
  },
  aiTranslateTextSuccess: {
    color: TOKENS.colors.secondary,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  catChipActive: {
    backgroundColor: TOKENS.colors.primary,
  },
  catChipText: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  graceNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.accentLight,
    padding: 10,
    borderRadius: TOKENS.borderRadius.md,
  },
  graceNoticeText: {
    flex: 1,
    fontSize: 10,
    color: TOKENS.colors.accent,
    lineHeight: 14,
    fontWeight: '600',
  },
  modalFooter: {
    padding: TOKENS.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.cardBorder,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.secondary,
    height: 48,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowSecondary,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  restrictedContent: {
    padding: TOKENS.spacing.md,
    paddingBottom: 110,
    gap: 14,
  },
  restrictedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xxl,
    padding: TOKENS.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  restrictedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    marginBottom: 16,
  },
  restrictedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.accent,
    letterSpacing: 0.5,
  },
  restrictedIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  restrictedLockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TOKENS.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  restrictedTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  restrictedDesc: {
    fontSize: 13,
    color: TOKENS.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 300,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.glowPrimary,
  },
  switchRoleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  merchantInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    gap: 10,
  },
  merchantInfoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  merchantBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TOKENS.colors.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    lineHeight: 16,
  },
  alignRight: {
    textAlign: 'right',
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabelHint: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  quickChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  aiSmartFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: TOKENS.borderRadius.xl,
    marginBottom: 12,
    ...TOKENS.shadows.glowPrimary,
  },
  aiSmartFillBtnSuccess: {
    backgroundColor: '#059669',
  },
  aiSmartFillBtnLoading: {
    backgroundColor: '#6366F1',
    opacity: 0.9,
  },
  aiSmartFillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiSmartFillTextLoading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gallerySection: {
    gap: 8,
    marginBottom: 12,
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  geminiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: TOKENS.borderRadius.full,
  },
  geminiBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  featuredImageContainer: {
    height: 140,
    borderRadius: TOKENS.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryImagePill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  primaryImagePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  thumbnailsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  thumbnailCard: {
    width: 60,
    height: 60,
    borderRadius: TOKENS.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbnailCardActive: {
    borderColor: TOKENS.colors.secondary,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  selectedCheckOverlay: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: TOKENS.colors.secondary,
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketPriceCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: TOKENS.borderRadius.xl,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  marketPriceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  marketPriceSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  marketPriceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
  },
  marketPriceUsd: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.full,
  },
  savingsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  retailInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  retailInputLabel: {
    fontSize: 10.5,
    color: '#065F46',
    fontWeight: '600',
  },
  retailInputInline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: TOKENS.borderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
    width: 110,
    textAlign: 'right',
  },
  dialectSection: {
    marginBottom: 12,
    gap: 6,
  },
  dialectCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: TOKENS.borderRadius.full,
  },
  dialectCountText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  dialectTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: TOKENS.borderRadius.lg,
    padding: 3,
    gap: 4,
  },
  dialectTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: TOKENS.borderRadius.md,
  },
  dialectTabActive: {
    backgroundColor: '#FFFFFF',
    ...TOKENS.shadows.card,
  },
  dialectTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textMuted,
  },
  dialectTabTextActive: {
    color: TOKENS.colors.primary,
    fontWeight: '800',
  },
  dialectPreviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: TOKENS.borderRadius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    gap: 4,
  },
  dialectPreviewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  dialectPreviewDesc: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    lineHeight: 16,
  },
  specsSection: {
    marginBottom: 12,
    gap: 6,
  },
  specsPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  specPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
});

