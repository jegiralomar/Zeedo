import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Phone,
  MapPin,
  Barcode,
  Printer,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';

export const MerchantOrdersScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();

  const [orders, setOrders] = useState([
    {
      id: 'ORD-98214',
      awb: 'AWB-IQ-2026-98214',
      lotTitle: 'Sony PlayStation 5 Pro 2TB Edition (عراقي أصلي)',
      buyerName: 'كرار حيدر',
      buyerPhone: '07701234567',
      buyerCity: 'بغداد - المنصور',
      codAmountIqd: 450000,
      status: 'ready_for_dispatch',
    },
    {
      id: 'ORD-98102',
      awb: 'AWB-IQ-2026-98102',
      lotTitle: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
      buyerName: 'علي المنصوري',
      buyerPhone: '07802345678',
      buyerCity: 'البصرة - العشار',
      codAmountIqd: 820000,
      status: 'with_courier',
    },
  ]);

  const handleHandoff = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'with_courier' } : o))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_home')}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={AppTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Merchant COD Fulfillment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerSubtitle}>
          Generate AWB thermal labels and hand off parcels to 3PL couriers (Al-Zajel) for doorstep COD inspection.
        </Text>

        {orders.map((item) => (
          <View key={item.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <div>
                <Text style={styles.lotTitle}>{item.lotTitle}</Text>
                <Text style={styles.orderId}>ID: {item.id}</Text>
              </div>
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
                  {item.status === 'with_courier' ? 'With Courier' : 'Ready for Courier'}
                </Text>
              </View>
            </View>

            <View style={styles.buyerInfoBox}>
              <View style={styles.infoRow}>
                <MapPin size={13} color={AppTheme.colors.textMuted} />
                <Text style={styles.infoText}>{item.buyerCity}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={13} color={AppTheme.colors.textMuted} />
                <Text style={styles.infoText}>{item.buyerName} ({item.buyerPhone})</Text>
              </View>
            </View>

            {/* AWB Code */}
            <View style={styles.awbRow}>
              <Text style={styles.awbLabel}>AWB Tracking Code:</Text>
              <Text style={styles.awbCode}>{item.awb}</Text>
            </View>

            {/* Cash Collection */}
            <View style={styles.codRow}>
              <Text style={styles.codLabel}>Doorstep Cash to Collect:</Text>
              <Text style={styles.codAmount}>
                {item.codAmountIqd.toLocaleString()} د.ع
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              {item.status === 'ready_for_dispatch' ? (
                <TouchableOpacity
                  onPress={() => handleHandoff(item.id)}
                  style={styles.handoffBtn}
                  activeOpacity={0.85}
                >
                  <Truck size={16} color="#FFFFFF" />
                  <Text style={styles.handoffBtnText}>Handoff to Al-Zajel Courier</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.courierDispatchedNotice}>
                  <CheckCircle size={16} color={AppTheme.colors.green} />
                  <Text style={styles.courierDispatchedText}>
                    Dispatched on Route with Courier
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  scroll: {
    padding: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    lineHeight: 16,
    marginBottom: 16,
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
  },
  lotTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    maxWidth: 220,
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
  },
  infoText: {
    fontSize: 11,
    color: AppTheme.colors.textPrimary,
    fontWeight: '600',
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
  actionsRow: {
    marginTop: 2,
  },
  handoffBtn: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  handoffBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  courierDispatchedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: AppTheme.radius.sm,
  },
  courierDispatchedText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
});
