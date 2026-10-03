import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Phone,
  MapPin,
  Printer,
  FileText,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import {
  MobileShippingSlipModal,
  MobileShippingOrderItem,
} from '../../components/merchant/MobileShippingSlipModal';
import { MobileDriverManifestModal } from '../../components/merchant/MobileDriverManifestModal';

export const MerchantOrdersScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();

  const [orders, setOrders] = useState<MobileShippingOrderItem[]>([]);

  // Modal States
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<MobileShippingOrderItem | null>(null);
  const [slipModalVisible, setSlipModalVisible] = useState(false);
  const [manifestModalVisible, setManifestModalVisible] = useState(false);

  const handleOpenSlip = (order: MobileShippingOrderItem) => {
    setSelectedSlipOrder(order);
    setSlipModalVisible(true);
  };

  const handleHandoffSingle = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'with_courier' } : o))
    );
  };

  const handleHandoffBatch = (orderIds: string[]) => {
    setOrders((prev) =>
      prev.map((o) => (orderIds.includes(o.id) ? { ...o, status: 'with_courier' } : o))
    );
    Alert.alert(
      'تم تسليم الشحنات بنجاح',
      `تم تسليم ${orderIds.length} طرد إلى كابتن شركة الشحن وتحديث حالتها إلى قيد التوصيل.`
    );
  };

  const readyOrdersCount = orders.filter((o) => o.status === 'ready_for_dispatch').length;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_home')}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={AppTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>إدارة بوالص الشحن والتسليم (AWB)</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Action Banner */}
        <View style={styles.manifestHeroCard}>
          <View style={styles.manifestHeroInfo}>
            <View style={styles.manifestBadge}>
              <Truck size={14} color="#B4F105" />
              <Text style={styles.manifestBadgeText}>بيان تسليم السائق (DRIVER MANIFEST)</Text>
            </View>
            <Text style={styles.manifestHeroTitle}>
              تجهيز شحنات اليوم ومنافيست التسليم
            </Text>
            <Text style={styles.manifestHeroSubtitle}>
              اطبع بوالص الشحن مع باركود GPS لمواقع الزبائن وأنشئ بيان تسليم للسائق مع المبالغ المطلوب تحصيلها نقداً.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setManifestModalVisible(true)}
            style={styles.generateManifestBtn}
            activeOpacity={0.85}
          >
            <FileText size={16} color="#0F172A" />
            <Text style={styles.generateManifestBtnText}>
              إنشاء بيان السائق ({readyOrdersCount} جاهزة)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>الطلبات والطرود المزايد عليها</Text>
          <Text style={styles.orderCountBadge}>{orders.length} طرود</Text>
        </View>

        {/* Order Cards List */}
        {orders.map((item) => (
          <View key={item.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lotTitle} numberOfLines={2}>
                  {item.lotTitle}
                </Text>
                <Text style={styles.orderId}>كود الطرد: {item.id}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'with_courier'
                    ? styles.statusWithCourier
                    : styles.statusReady,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'with_courier'
                      ? styles.statusWithCourierText
                      : styles.statusReadyText,
                  ]}
                >
                  {item.status === 'with_courier' ? 'مع المندوب' : 'جاهز للتسليم'}
                </Text>
              </View>
            </View>

            {/* Buyer & Address */}
            <View style={styles.buyerInfoBox}>
              <View style={styles.infoRow}>
                <MapPin size={13} color="#4392F9" />
                <Text style={styles.infoTextBold}>{item.buyerCity}</Text>
                <Text style={styles.infoTextSub}>- {item.buyerAddress}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={13} color="#10B981" />
                <Text style={styles.infoText}>{item.buyerName} ({item.buyerPhone})</Text>
              </View>
            </View>

            {/* AWB Code */}
            <View style={styles.awbRow}>
              <Text style={styles.awbLabel}>رقم بوليصة الشحن (AWB):</Text>
              <Text style={styles.awbCode}>{item.awb}</Text>
            </View>

            {/* Cash Collection */}
            <View style={styles.codRow}>
              <Text style={styles.codLabel}>المبلغ المطلوب تحصيله عند الباب:</Text>
              <Text style={styles.codAmount}>
                {item.codAmountIqd.toLocaleString()} د.ع
              </Text>
            </View>

            {/* Action Buttons: Print Slip & Handoff */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                onPress={() => handleOpenSlip(item)}
                style={styles.printSlipBtn}
                activeOpacity={0.85}
              >
                <Printer size={15} color="#FFFFFF" />
                <Text style={styles.printSlipBtnText}>طباعة ملصق الشحن (GPS QR)</Text>
              </TouchableOpacity>

              {item.status === 'ready_for_dispatch' ? (
                <TouchableOpacity
                  onPress={() => handleHandoffSingle(item.id)}
                  style={styles.handoffBtn}
                  activeOpacity={0.85}
                >
                  <Truck size={15} color="#0F172A" />
                  <Text style={styles.handoffBtnText}>تسليم للسائق</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.courierDispatchedNotice}>
                  <CheckCircle size={15} color="#065F46" />
                  <Text style={styles.courierDispatchedText}>
                    في طريق التوصيل
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Shipping Slip Print Modal with GPS QR Code */}
      <MobileShippingSlipModal
        visible={slipModalVisible}
        onClose={() => setSlipModalVisible(false)}
        order={selectedSlipOrder}
      />

      {/* Driver Route Manifest Modal with totals and parcel stops */}
      <MobileDriverManifestModal
        visible={manifestModalVisible}
        onClose={() => setManifestModalVisible(false)}
        orders={orders}
        onHandoffBatch={handleHandoffBatch}
        merchantStoreName="متجر الكرادة للإلكترونيات"
        merchantPhone="0770 999 1122"
        merchantCity="بغداد"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  scroll: {
    padding: 16,
  },
  manifestHeroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  manifestHeroInfo: {
    gap: 6,
  },
  manifestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  manifestBadgeText: {
    color: '#B4F105',
    fontSize: 9,
    fontWeight: '900',
  },
  manifestHeroTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  manifestHeroSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  generateManifestBtn: {
    backgroundColor: '#B4F105',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateManifestBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  orderCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textMuted,
    backgroundColor: AppTheme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orderCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  lotTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    lineHeight: 18,
  },
  orderId: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AppTheme.radius.full,
  },
  statusReady: {
    backgroundColor: '#FEF3C7',
  },
  statusReadyText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '800',
  },
  statusWithCourier: {
    backgroundColor: '#ECFDF5',
  },
  statusWithCourierText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  buyerInfoBox: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.sm,
    padding: 10,
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 11,
    color: AppTheme.colors.textPrimary,
    fontWeight: '600',
  },
  infoTextBold: {
    fontSize: 11,
    color: AppTheme.colors.textPrimary,
    fontWeight: '800',
  },
  infoTextSub: {
    fontSize: 10,
    color: AppTheme.colors.textSecondary,
    flexShrink: 1,
  },
  awbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  awbLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
  },
  awbCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
  },
  codRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 12,
  },
  codLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  codAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  printSlipBtn: {
    flex: 1.2,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: AppTheme.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  printSlipBtnText: {
    color: '#B4F105',
    fontSize: 11,
    fontWeight: '900',
  },
  handoffBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: AppTheme.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  handoffBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  courierDispatchedNotice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: AppTheme.radius.sm,
  },
  courierDispatchedText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '800',
  },
});
