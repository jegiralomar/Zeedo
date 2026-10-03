import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Trophy,
  Flame,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  PackageCheck,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

const IRAQI_CITIES = [
  'بغداد',
  'أربيل',
  'البصرة',
  'السليمانية',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'الموصل (نينوى)',
  'كركوك',
  'دهوك',
  'بابل (الحلة)',
  'الديوانية',
  'ذي قار (الناصرية)',
  'ميسان (العمارة)',
  'الأنبار (الرمادي)',
  'ديالى (بعقوبة)',
  'صلاح الدين (تكريت)',
];

export const BagScreen: React.FC = () => {
  const {
    language,
    wonOrders,
    isLoadingWonOrders,
    fetchWonOrders,
    myBids,
    auctions,
    setSelectedAuctionId,
    setActiveTab,
  } = useAppStore();

  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const [segment, setSegment] = useState<'active' | 'won'>('active');
  const [selectedCity, setSelectedCity] = useState('بغداد');
  const [addressDetails, setAddressDetails] = useState('');
  const [phoneRecipient, setPhoneRecipient] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  React.useEffect(() => {
    fetchWonOrders();
  }, []);

  const handleConfirmDelivery = (orderId: string) => {
    setOrderConfirmed(true);
    setTimeout(() => {
      setOrderConfirmed(false);
      Alert.alert(
        isRtl ? 'تم تأكيد طلب التوصيل' : 'Delivery Confirmed',
        isRtl
          ? 'تم إرسال الطلب لشركة الشحن للتوصيل مع ميزة الفحص عند الباب والدفع نقداً عند الاستلام.'
          : 'Order sent for courier dispatch with doorstep inspection & COD payment guarantee.'
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Segment Switcher */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, isRtl && styles.screenTitleRtl]}>
          {t.bagTab}
        </Text>

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentTab, segment === 'active' && styles.segmentTabActive]}
            onPress={() => setSegment('active')}
            activeOpacity={0.8}
          >
            <Flame
              size={16}
              color={segment === 'active' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentLabel,
                segment === 'active' && styles.segmentLabelActive,
              ]}
            >
              {isRtl ? 'عطاءاتي الحية' : 'Active Bids'} ({myBids.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentTab, segment === 'won' && styles.segmentTabActive]}
            onPress={() => setSegment('won')}
            activeOpacity={0.8}
          >
            <Trophy
              size={16}
              color={segment === 'won' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentLabel,
                segment === 'won' && styles.segmentLabelActive,
              ]}
            >
              {isRtl ? 'المزادات الرابحة' : 'Won Lots'} ({wonOrders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* SEGMENT 1: WON LOTS */}
        {segment === 'won' && (
          <View style={styles.sectionBody}>
            {/* Inspection Guarantee Banner */}
            <View style={styles.trustBanner}>
              <ShieldCheck size={20} color="#10B981" />
              <Text style={styles.trustText}>
                {isRtl
                  ? 'مبارك فوزك! فحص السلعة مضمون عند باب منزلك قبل تسليم أي مبلغ لمندوب التوصيل.'
                  : 'Congratulations! Doorstep inspection guaranteed before paying the courier.'}
              </Text>
            </View>

            {wonOrders.length > 0 ? (
              wonOrders.map((order) => (
                <View key={order.orderId} style={styles.wonCard}>
                  <View style={styles.wonHeader}>
                    <View style={styles.wonPill}>
                      <Trophy size={14} color="#D97706" />
                      <Text style={styles.wonPillText}>
                        {isRtl ? 'صفقة رابحة' : 'Won Deal'}
                      </Text>
                    </View>
                    <Text style={styles.orderIdText}>{order.orderId}</Text>
                  </View>

                  <View style={styles.wonItemRow}>
                    <Image source={{ uri: order.image }} style={styles.itemThumb} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {order.title}
                      </Text>
                      <View style={styles.winningBidRow}>
                        <Text style={styles.bidLabel}>
                          {isRtl ? 'مبلغ الفوز:' : 'Winning Bid:'}
                        </Text>
                        <Text style={styles.bidAmount}>
                          {order.winningBidIqd.toLocaleString()} {t.currency}
                        </Text>
                      </View>
                      <Text style={styles.codLabel}>
                        {isRtl ? 'الدفع نقداً عند الباب (COD)' : 'Cash on Delivery'}
                      </Text>
                    </View>
                  </View>

                  {/* Iraqi Address & City Selector */}
                  <View style={styles.addressForm}>
                    <Text style={styles.formTitle}>
                      {isRtl ? 'عنوان التوصيل في العراق:' : 'Delivery Address in Iraq:'}
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.cityScroll}
                    >
                      {IRAQI_CITIES.slice(0, 8).map((city) => (
                        <TouchableOpacity
                          key={city}
                          onPress={() => setSelectedCity(city)}
                          style={[
                            styles.cityChip,
                            selectedCity === city && styles.cityChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.cityChipText,
                              selectedCity === city && styles.cityChipTextActive,
                            ]}
                          >
                            {city}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        isRtl
                          ? 'المنطقة، الشارع، أقرب نقطة دالة'
                          : 'District, street, nearest landmark'
                      }
                      placeholderTextColor="#94A3B8"
                      value={addressDetails}
                      onChangeText={setAddressDetails}
                    />

                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        isRtl
                          ? 'رقم هاتف المستلم (07xxxxxxxxx)'
                          : 'Recipient phone number'
                      }
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={phoneRecipient}
                      onChangeText={setPhoneRecipient}
                    />

                    <TouchableOpacity
                      style={styles.confirmDeliveryButton}
                      onPress={() => handleConfirmDelivery(order.orderId)}
                      activeOpacity={0.85}
                    >
                      <Truck size={18} color="#FFFFFF" />
                      <Text style={styles.confirmDeliveryButtonText}>
                        {isRtl
                          ? 'تأكيد إرسال الطلب (دفع عند الباب)'
                          : 'Confirm Doorstep COD Dispatch'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <PackageCheck size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>
                  {isRtl ? 'لا توجد مزادات رابحة حالياً' : 'No Won Auctions Yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {isRtl
                    ? 'شارك بالمزايدة على السلع الحية وستظهر الصفقات التي ربحتها هنا لتأكيد التوصيل.'
                    : 'Participate in live auctions to win deals and confirm delivery here.'}
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setActiveTab('auctions')}
                >
                  <Text style={styles.actionButtonText}>
                    {isRtl ? 'استعراض المزادات' : 'Browse Auctions'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* SEGMENT 2: ACTIVE LIVE BIDS */}
        {segment === 'active' && (
          <View style={styles.sectionBody}>
            {myBids.length > 0 ? (
              myBids.map((b) => {
                const targetAuction = auctions.find((a) => a.id === b.auctionId);
                if (!targetAuction) return null;

                const isLeading = b.isLeading;
                const title =
                  isRtl && targetAuction.titleAr
                    ? targetAuction.titleAr
                    : targetAuction.title;

                return (
                  <TouchableOpacity
                    key={b.auctionId}
                    style={[
                      styles.activeBidCard,
                      isLeading ? styles.cardLeading : styles.cardOutbid,
                    ]}
                    onPress={() => setSelectedAuctionId(targetAuction.id)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.activeBidHeader}>
                      {isLeading ? (
                        <View style={styles.leadingStatusPill}>
                          <CheckCircle2 size={13} color="#059669" />
                          <Text style={styles.leadingStatusText}>
                            {isRtl ? 'أنت المتصدر حالياً 🏆' : 'You are Leading 🏆'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.outbidStatusPill}>
                          <Clock size={13} color="#DC2626" />
                          <Text style={styles.outbidStatusText}>
                            {isRtl ? 'تمت المزايدة عليك! ⚠️' : 'You were outbid! ⚠️'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.auctionCity}>
                        {targetAuction.sellerCity}
                      </Text>
                    </View>

                    <View style={styles.activeItemRow}>
                      <Image
                        source={{ uri: targetAuction.images[0] }}
                        style={styles.activeThumb}
                      />
                      <View style={styles.activeDetails}>
                        <Text style={styles.activeTitle} numberOfLines={2}>
                          {title}
                        </Text>
                        <View style={styles.pricesRow}>
                          <View>
                            <Text style={styles.smallPriceLabel}>
                              {isRtl ? 'عطاؤك:' : 'Your Bid:'}
                            </Text>
                            <Text style={styles.myBidValue}>
                              {b.amountIqd.toLocaleString()} {t.currency}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.smallPriceLabel}>
                              {isRtl ? 'أعلى سعر حالياً:' : 'Top Bid:'}
                            </Text>
                            <Text style={styles.topBidValue}>
                              {targetAuction.currentBidIqd.toLocaleString()}{' '}
                              {t.currency}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Quick Action Button */}
                    <View style={styles.cardActionRow}>
                      <Text style={styles.enterRoomPrompt}>
                        {isLeading
                          ? isRtl
                            ? 'تابع المزاد حتى النهاية'
                            : 'Watch until countdown ends'
                          : isRtl
                          ? 'ادخل غرفة المزاد لرفع عطائك'
                          : 'Enter room to place higher bid'}
                      </Text>
                      <View style={styles.enterRoomButton}>
                        <Text style={styles.enterRoomButtonText}>
                          {isRtl ? 'غرفة المزاد' : 'Auction Room'}
                        </Text>
                        <ArrowRight size={13} color="#FFFFFF" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Flame size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>
                  {isRtl ? 'لا توجد عطاءات نشطة حالياً' : 'No Active Bids'}
                </Text>
                <Text style={styles.emptySub}>
                  {isRtl
                    ? 'شارك في أي مزاد حي لتتابع ترتيبك وما إذا كنت المتصدر حتى انتهاء الوقت.'
                    : 'Bid on any live auction to track your leading position in real time.'}
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setActiveTab('auctions')}
                >
                  <Text style={styles.actionButtonText}>
                    {isRtl ? 'زايد الآن' : 'Start Bidding'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 96 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  screenTitleRtl: {
    textAlign: 'right',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segmentTabActive: {
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentLabelActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  sectionBody: {
    padding: 16,
    gap: 14,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trustText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 16,
  },
  wonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  wonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  wonPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  orderIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  wonItemRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  winningBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bidLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bidAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  codLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  addressForm: {
    marginTop: 12,
    gap: 8,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cityScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  cityChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cityChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#0F172A',
  },
  confirmDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  confirmDeliveryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeBidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeading: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  cardOutbid: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  activeBidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leadingStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  leadingStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  outbidStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  outbidStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  auctionCity: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  activeItemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activeThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    resizeMode: 'cover',
  },
  activeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  activeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  pricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallPriceLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  myBidValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  topBidValue: {
    fontSize: 13,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  enterRoomPrompt: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  enterRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  enterRoomButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 18,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
