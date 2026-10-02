import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import {
  X,
  Truck,
  Printer,
  CheckCircle2,
  Share2,
  MapPin,
  Phone,
  Store,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import { MobileShippingOrderItem } from './MobileShippingSlipModal';

interface MobileDriverManifestModalProps {
  visible: boolean;
  onClose: () => void;
  orders: MobileShippingOrderItem[];
  onHandoffBatch: (orderIds: string[]) => void;
  merchantStoreName?: string;
  merchantPhone?: string;
  merchantCity?: string;
}

export const MobileDriverManifestModal: React.FC<MobileDriverManifestModalProps> = ({
  visible,
  onClose,
  orders,
  onHandoffBatch,
  merchantStoreName = 'متجر زيدو المعتمد',
  merchantPhone = '0770 000 0000',
  merchantCity = 'بغداد',
}) => {
  const [carrierName, setCarrierName] = useState('شركة الزاجل للنقل السريع');
  const [driverName, setDriverName] = useState('حيدر الكرخي (أبو فهد)');
  const [driverPhone, setDriverPhone] = useState('07701234567');
  const [vehiclePlate, setVehiclePlate] = useState('بغداد 84210');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manifestCode, setManifestCode] = useState('');

  useEffect(() => {
    setSelectedIds(orders.map((o) => o.id));
    setManifestCode(`MNF-IQ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [orders, visible]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
  const totalCodAmount = selectedOrders.reduce((acc, o) => acc + o.codAmountIqd, 0);

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
      window.print();
    } else {
      handleShareWhatsApp();
    }
  };

  const handleShareWhatsApp = () => {
    let stopsText = '';
    selectedOrders.forEach((o, idx) => {
      const lat = o.buyerGpsLat || 33.3128;
      const lng = o.buyerGpsLng || 44.3541;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      stopsText +=
        `\n-------------------------\n` +
        `📦 *طرد (${idx + 1}):* ${o.awb}\n` +
        `• السلعة: ${o.lotTitle}\n` +
        `• الزبون: ${o.buyerName} (${o.buyerPhone})\n` +
        `• العنوان: ${o.buyerCity} - ${o.buyerAddress}\n` +
        `• مبلغ التحصيل (COD): *${o.codAmountIqd.toLocaleString()} د.ع*\n` +
        `• موقع GPS للتسليم 📍:\n${mapUrl}\n`;
    });

    const fullMessage = encodeURIComponent(
      `🚚 *بيان ومنافيست تسليم شحنات السائق (ZEEDO MANIFEST)*\n` +
      `• رقم البيان: *${manifestCode}*\n` +
      `• التاريخ: ${new Date().toLocaleDateString('ar-IQ')}\n` +
      `• التاجر: ${merchantStoreName} (${merchantPhone})\n` +
      `• شركة النقل: ${carrierName}\n` +
      `• كابتن التوصيل: ${driverName} (${driverPhone})\n` +
      `• المركبة: ${vehiclePlate}\n` +
      `• إجمالي عدد الطرود: *${selectedOrders.length} طرود*\n` +
      `• إجمالي المبالغ النقدية المطلوب تحصيلها: *${totalCodAmount.toLocaleString()} د.ع*\n` +
      stopsText +
      `\n=========================\n` +
      `*تنبيه: يحق للمشتري فحص السلعة قبل دفع المبلغ نقداً.*`
    );

    Linking.openURL(`https://wa.me/?text=${fullMessage}`);
  };

  const handleConfirmDispatch = () => {
    onHandoffBatch(selectedIds);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Truck size={18} color="#B4F105" />
              <View>
                <Text style={styles.headerTitle}>بيان ومنافيست تسليم السائق (Driver Manifest)</Text>
                <Text style={styles.headerSubtitle}>جدول تسليم الشحنات ومواقع GPS ومبالغ الدفع نقداً</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Courier Info Inputs */}
            <View style={styles.driverConfigBox}>
              <Text style={styles.boxTitle}>بيانات كابتن التوصيل وشركة النقل:</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>شركة الشحن</Text>
                  <TextInput
                    value={carrierName}
                    onChangeText={setCarrierName}
                    style={styles.textInput}
                    placeholder="اسم الشركة"
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>اسم السائق</Text>
                  <TextInput
                    value={driverName}
                    onChangeText={setDriverName}
                    style={styles.textInput}
                    placeholder="اسم الكابتن"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>رقم هاتف السائق</Text>
                  <TextInput
                    value={driverPhone}
                    onChangeText={setDriverPhone}
                    style={styles.textInput}
                    keyboardType="phone-pad"
                    placeholder="0770..."
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>رقم لوحة المركبة</Text>
                  <TextInput
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    style={styles.textInput}
                    placeholder="رقم اللوحة"
                  />
                </View>
              </View>
            </View>

            {/* Summary Highlights */}
            <View style={styles.summaryBar}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>الطرود المحددة</Text>
                <Text style={styles.summaryValue}>{selectedOrders.length} طرد</Text>
              </View>

              <View style={[styles.summaryCard, styles.summaryCardAmber]}>
                <Text style={styles.summaryLabelAmber}>إجمالي المطلوب تحصيله (COD)</Text>
                <Text style={styles.summaryValueAmber}>
                  {totalCodAmount.toLocaleString()} د.ع
                </Text>
              </View>
            </View>

            {/* Orders Selection List */}
            <View style={styles.parcelListSection}>
              <Text style={styles.boxTitle}>حدد الطرود المشمولة في رحلة التوصيل هذه:</Text>

              {orders.map((ord) => {
                const isSelected = selectedIds.includes(ord.id);
                const lat = ord.buyerGpsLat || 33.3128;
                const lng = ord.buyerGpsLng || 44.3541;

                return (
                  <TouchableOpacity
                    key={ord.id}
                    onPress={() => toggleSelect(ord.id)}
                    style={[
                      styles.orderRowCard,
                      isSelected ? styles.orderRowSelected : styles.orderRowUnselected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.checkboxWrap}>
                      {isSelected ? (
                        <CheckSquare size={18} color="#B4F105" />
                      ) : (
                        <Square size={18} color="#64748B" />
                      )}
                    </View>

                    <View style={styles.orderRowDetails}>
                      <View style={styles.orderRowHeader}>
                        <Text style={styles.awbBadge}>{ord.awb}</Text>
                        <Text style={styles.orderCodText}>
                          {ord.codAmountIqd.toLocaleString()} د.ع
                        </Text>
                      </View>

                      <Text style={styles.orderTitleText} numberOfLines={1}>
                        {ord.lotTitle}
                      </Text>

                      <View style={styles.orderBuyerInfo}>
                        <Text style={styles.orderBuyerText}>
                          المشتري: {ord.buyerName} ({ord.buyerPhone})
                        </Text>
                        <View style={styles.gpsBadge}>
                          <MapPin size={10} color="#4392F9" />
                          <Text style={styles.gpsBadgeText}>
                            {lat.toFixed(2)}, {lng.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Driver Legal Statement */}
            <View style={styles.legalBox}>
              <Text style={styles.legalTitle}>إقرار وتعهد كابتن التوصيل:</Text>
              <Text style={styles.legalText}>
                أقر أنا السائق باستلام الطرود المبينة في هذا البيان سليمة ومغلقة مع ملصقات الـ AWB، وأتعهد بتسليمها وفق مواقع الـ GPS الدقيقة للزبائن، وتحصيل المبالغ النقدية وتوريدها للمتجر / المنصة.
              </Text>
            </View>
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleShareWhatsApp}
              style={styles.shareManifestBtn}
              activeOpacity={0.85}
            >
              <Share2 size={15} color="#FFFFFF" />
              <Text style={styles.shareManifestText}>إرسال المسار واللوكيشنات عبر واتساب</Text>
            </TouchableOpacity>

            <View style={styles.footerSplit}>
              <TouchableOpacity
                onPress={handlePrint}
                style={styles.printManifestBtn}
                activeOpacity={0.85}
              >
                <Printer size={15} color="#0F172A" />
                <Text style={styles.printManifestText}>طباعة البيان (Print)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDispatch}
                disabled={selectedOrders.length === 0}
                style={[
                  styles.confirmDispatchBtn,
                  selectedOrders.length === 0 && { opacity: 0.5 },
                ]}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={15} color="#FFFFFF" />
                <Text style={styles.confirmDispatchText}>تأكيد التسليم للسائق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '94%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 14,
  },
  driverConfigBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
    marginBottom: 12,
  },
  boxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  summaryCardAmber: {
    backgroundColor: '#272015',
    borderColor: '#78350F',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  summaryLabelAmber: {
    fontSize: 9,
    color: '#FBBF24',
    fontWeight: '700',
  },
  summaryValueAmber: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FCD34D',
    marginTop: 2,
  },
  parcelListSection: {
    gap: 8,
    marginBottom: 12,
  },
  orderRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    gap: 10,
  },
  orderRowSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  orderRowUnselected: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    opacity: 0.6,
  },
  checkboxWrap: {
    padding: 2,
  },
  orderRowDetails: {
    flex: 1,
    gap: 3,
  },
  orderRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awbBadge: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#94A3B8',
  },
  orderCodText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B4F105',
    fontFamily: 'monospace',
  },
  orderTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  orderBuyerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  orderBuyerText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  gpsBadgeText: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#93C5FD',
    fontWeight: '700',
  },
  legalBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
    marginBottom: 14,
  },
  legalTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  legalText: {
    fontSize: 9,
    color: '#94A3B8',
    lineHeight: 14,
  },
  footer: {
    backgroundColor: '#1E293B',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  shareManifestBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareManifestText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  footerSplit: {
    flexDirection: 'row',
    gap: 8,
  },
  printManifestBtn: {
    flex: 1,
    backgroundColor: '#B4F105',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  printManifestText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  confirmDispatchBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmDispatchText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
