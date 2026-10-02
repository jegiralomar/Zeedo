import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from 'react-native';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  MapPin,
  Phone,
  Store,
  ShieldCheck,
  Package,
  ExternalLink,
  Share2,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';

export interface MobileShippingOrderItem {
  id: string;
  awb: string;
  lotTitle: string;
  itemCondition?: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  buyerAddress: string;
  buyerGpsLat?: number;
  buyerGpsLng?: number;
  codAmountIqd: number;
  status: string;
  sellerStoreName?: string;
  sellerPhone?: string;
  sellerCity?: string;
}

interface MobileShippingSlipModalProps {
  visible: boolean;
  onClose: () => void;
  order: MobileShippingOrderItem | null;
}

export const MobileShippingSlipModal: React.FC<MobileShippingSlipModalProps> = ({
  visible,
  onClose,
  order,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const lat = order?.buyerGpsLat || 33.3128;
  const lng = order?.buyerGpsLng || 44.3541;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    if (!order) return;
    QRCode.toDataURL(mapsUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.warn('QR Code generation error:', err));
  }, [order, mapsUrl]);

  if (!order) return null;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
      window.print();
    } else {
      Linking.openURL(mapsUrl);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📦 *بوليصة شحن طرد زيدو (ZEEDO AWB)*\n` +
      `• رقم البوليصة: ${order.awb}\n` +
      `• السلعة: ${order.lotTitle}\n` +
      `• المشتري: ${order.buyerName}\n` +
      `• هاتف المشتري: ${order.buyerPhone}\n` +
      `• المدينة والعنوان: ${order.buyerCity} - ${order.buyerAddress}\n` +
      `• المبلغ المطلوب تحصيله (COD): ${order.codAmountIqd.toLocaleString()} د.ع\n` +
      `• موقع الزبون الدقيق على الخريطة 📍:\n${mapsUrl}\n\n` +
      `*ملاحظة: يحق للزبون معاينة السلعة قبل دفع المبلغ نقداً.*`
    );
    Linking.openURL(`https://wa.me/?text=${text}`);
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
          {/* Header Controls */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Package size={18} color="#B4F105" />
              <View>
                <Text style={styles.headerTitle}>بوليصة الشحن (AWB Shipping Slip)</Text>
                <Text style={styles.headerSubtitle}>وصل حراري يلصق على الطرد مع باركود GPS</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Printable Scroll Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.slipSheet}>
              {/* Slip Top Header */}
              <View style={styles.slipHeader}>
                <View>
                  <Text style={styles.brandTitle}>منصة زيدو • ZEEDO EXPRESS</Text>
                  <Text style={styles.slipSubTitle}>بوليصة إرسال طرد فحص ومعاينة عند الاستلام</Text>
                </View>
                <View style={styles.awbBadge}>
                  <Text style={styles.awbBadgeText}>STANDARD AWB</Text>
                </View>
              </View>

              {/* Barcode & Tracking Number */}
              <View style={styles.barcodeSection}>
                <Text style={styles.barcodeSimulated}>|||||||| | |||||| ||||||||||||||||| | |||||</Text>
                <Text style={styles.awbText}>{order.awb}</Text>
              </View>

              {/* Consignee (Buyer) & QR Grid */}
              <View style={styles.consigneeCard}>
                <View style={styles.consigneeDetails}>
                  <Text style={styles.sectionLabel}>المرسل إليه (المشتري / المستلم):</Text>
                  <Text style={styles.buyerNameText}>{order.buyerName}</Text>
                  <View style={styles.iconLine}>
                    <Phone size={12} color="#4B5563" />
                    <Text style={styles.phoneText}>{order.buyerPhone}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <MapPin size={12} color="#4B5563" />
                    <Text style={styles.addressCityText}>{order.buyerCity}</Text>
                  </View>
                  <Text style={styles.addressDetailText}>{order.buyerAddress}</Text>
                </View>

                {/* GPS QR Code Box */}
                <View style={styles.qrBox}>
                  {qrDataUrl ? (
                    <Image
                      source={{ uri: qrDataUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.qrPlaceholder}>
                      <Text style={styles.qrLoadingText}>جاري إنشاء الـ QR...</Text>
                    </View>
                  )}
                  <Text style={styles.qrHint}>امسح لموقع الزبون 📍</Text>
                  <Text style={styles.qrCoords}>
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </Text>
                </View>
              </View>

              {/* Direct Map Button */}
              <TouchableOpacity
                onPress={() => Linking.openURL(mapsUrl)}
                style={styles.mapLinkBtn}
              >
                <MapPin size={13} color="#4392F9" />
                <Text style={styles.mapLinkText}>فتح موقع المشتري في خرائط Google</Text>
                <ExternalLink size={12} color="#4392F9" />
              </TouchableOpacity>

              {/* COD Cash Collection Box */}
              <View style={styles.codBox}>
                <View>
                  <Text style={styles.codBoxLabel}>المبلغ المطلوب تحصيله نقداً عند الباب (COD):</Text>
                  <Text style={styles.codAmountText}>
                    {order.codAmountIqd.toLocaleString()} <Text style={styles.codCurrency}>د.ع</Text>
                  </Text>
                </View>
                <View style={styles.cashOnlyBadge}>
                  <Text style={styles.cashOnlyText}>CASH ONLY</Text>
                </View>
              </View>

              {/* Item Details & Sender */}
              <View style={styles.itemSenderRow}>
                <View style={styles.itemCol}>
                  <Text style={styles.sectionLabel}>تفاصيل السلعة المزايد عليها:</Text>
                  <Text style={styles.itemTitleText}>{order.lotTitle}</Text>
                  <Text style={styles.itemConditionText}>
                    الحالة: {order.itemCondition || 'أصلي مفحوص'}
                  </Text>
                </View>

                <View style={styles.senderCol}>
                  <Text style={styles.sectionLabel}>المرسل (التاجر المعتمد):</Text>
                  <Text style={styles.senderNameText}>
                    {order.sellerStoreName || 'متجر معتمد - زيدو'}
                  </Text>
                  <Text style={styles.senderPhoneText}>
                    {order.sellerPhone || '0770 000 0000'}
                  </Text>
                  <Text style={styles.senderCityText}>
                    {order.sellerCity || 'العراق'}
                  </Text>
                </View>
              </View>

              {/* Inspection Notice */}
              <View style={styles.inspectionNotice}>
                <ShieldCheck size={16} color="#065F46" />
                <Text style={styles.inspectionText}>
                  ضمان فحص زيدو: يحق للمشتري فتح الطرد ومعاينة السلعة والتأكد من مطابقتها قبل سداد المبلغ نقداً للمندوب.
                </Text>
              </View>

              {/* Footer */}
              <Text style={styles.slipFooterBarcode}>
                * ZEEDO LOGISTICS * {order.awb} * VERIFIED DELIVERY *
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              onPress={handleShareWhatsApp}
              style={styles.shareBtn}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>مشاركة مع السائق (WhatsApp)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrint}
              style={styles.printBtn}
              activeOpacity={0.8}
            >
              <Printer size={16} color="#17223B" />
              <Text style={styles.printBtnText}>طباعة الملصق (Print)</Text>
            </TouchableOpacity>
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
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '94%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    backgroundColor: '#0F172A',
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
  },
  headerTitle: {
    fontSize: 13,
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
  contentScroll: {
    backgroundColor: '#F1F5F9',
  },
  contentInner: {
    padding: 14,
  },
  slipSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    gap: 12,
  },
  slipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0F172A',
    paddingBottom: 8,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  slipSubTitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  awbBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  awbBadgeText: {
    color: '#B4F105',
    fontSize: 9,
    fontWeight: '900',
  },
  barcodeSection: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  barcodeSimulated: {
    fontSize: 14,
    letterSpacing: 3,
    fontFamily: 'monospace',
    color: '#0F172A',
  },
  awbText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#0F172A',
    marginTop: 2,
  },
  consigneeCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  consigneeDetails: {
    flex: 1,
    gap: 3,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  buyerNameText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  iconLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#1E293B',
  },
  addressCityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  addressDetailText: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
    lineHeight: 14,
  },
  qrBox: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 4,
  },
  qrImage: {
    width: 84,
    height: 84,
  },
  qrPlaceholder: {
    width: 84,
    height: 84,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLoadingText: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'center',
  },
  qrHint: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
    textAlign: 'center',
  },
  qrCoords: {
    fontSize: 7,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  mapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mapLinkText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  codBox: {
    borderWidth: 2.5,
    borderColor: '#0F172A',
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codBoxLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#78350F',
  },
  codAmountText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#0F172A',
    marginTop: 2,
  },
  codCurrency: {
    fontSize: 12,
    fontWeight: '700',
  },
  cashOnlyBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cashOnlyText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  itemSenderRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    gap: 10,
  },
  itemCol: {
    flex: 1,
    gap: 2,
  },
  itemTitleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemConditionText: {
    fontSize: 9,
    color: '#64748B',
  },
  senderCol: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 10,
    gap: 2,
  },
  senderNameText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  senderPhoneText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#475569',
  },
  senderCityText: {
    fontSize: 9,
    color: '#64748B',
  },
  inspectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  inspectionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
    lineHeight: 13,
  },
  slipFooterBarcode: {
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  footerActions: {
    backgroundColor: '#0F172A',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  printBtn: {
    flex: 1,
    backgroundColor: '#B4F105',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  printBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
});
