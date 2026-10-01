import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Plus,
  ShieldCheck,
  CheckCircle,
  Truck,
  Edit2,
  PackageCheck,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

export const CheckoutScreen: React.FC = () => {
  const { language, wonOrders, setActiveScreen, currentUser, openAuthModal } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  const [selectedGov, setSelectedGov] = useState('Baghdad');
  const [recipientName, setRecipientName] = useState(currentUser?.name || 'كرار حيدر');
  const [phone, setPhone] = useState(currentUser?.phone || '07701234567');
  const [landmark, setLandmark] = useState('شارع فلسطين، قرب مجسر النخلة');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const governorates = [
    { id: 'Baghdad', name: t.baghdad },
    { id: 'Basra', name: t.basra },
    { id: 'Erbil', name: t.erbil },
    { id: 'Najaf', name: t.najaf },
    { id: 'Sulaymaniyah', name: t.sulaymaniyah },
  ];

  const totalIqd = wonOrders.reduce((acc, it) => acc + it.winningBidIqd, 0);
  const totalUsd = wonOrders.reduce((acc, it) => acc + it.winningBidUsd, 0);

  const handleConfirmOrder = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    setOrderConfirmed(true);
  };

  // Order Placed Success View (Matching Sucessfully.jpg)
  if (orderConfirmed) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <CheckCircle size={48} color={AppTheme.colors.green} />
        </View>

        <Text style={styles.successTitle}>{t.orderSuccess}</Text>
        <Text style={styles.successSub}>{t.orderSuccessSub}</Text>

        <View style={styles.awbCard}>
          <Text style={styles.awbLabel}>{t.trackAwb}</Text>
          <Text style={styles.awbCode}>AWB-IQ-2026-98214</Text>
          <View style={styles.awbStatusPill}>
            <View style={styles.awbStatusDot} />
            <Text style={styles.awbStatusText}>
              {isRtl ? 'جاهز للتسليم لشركة الزاجل' : 'Ready for 3PL Dispatch'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setOrderConfirmed(false);
            setActiveScreen('home');
          }}
          style={styles.continueButton}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>
            {isRtl ? 'العودة للمزادات الحية' : 'Continue Bidding'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar (Matching Checkout.jpg) */}
      <View style={[styles.topBar, isRtl && styles.topBarRtl]}>
        <TouchableOpacity
          onPress={() => setActiveScreen('home')}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={AppTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t.checkout}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Delivery Address Card (Matching Checkout.jpg) */}
        <View style={styles.sectionHeader}>
          <MapPin size={16} color={AppTheme.colors.primary} />
          <Text style={styles.sectionTitle}>{t.deliveryAddress}</Text>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>Address :</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Edit2 size={14} color={AppTheme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Governorate Selector Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.govScroll}>
            {governorates.map((gov) => (
              <TouchableOpacity
                key={gov.id}
                onPress={() => setSelectedGov(gov.id)}
                style={[
                  styles.govPill,
                  selectedGov === gov.id && styles.govPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.govPillText,
                    selectedGov === gov.id && styles.govPillTextActive,
                  ]}
                >
                  {gov.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <TextInput
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder={t.recipientName}
              style={[styles.input, isRtl && styles.textRtl]}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder={t.phoneNumber}
              keyboardType="phone-pad"
              style={[styles.input, isRtl && styles.textRtl]}
            />
            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholder={t.landmark}
              style={[styles.input, isRtl && styles.textRtl]}
            />
          </View>
        </View>

        {/* 2. Won Lots Shopping List (Matching Checkout.jpg) */}
        <View style={styles.sectionHeader}>
          <PackageCheck size={16} color={AppTheme.colors.secondary} />
          <Text style={styles.sectionTitle}>
            {isRtl ? 'قائمة المزادات الرابحة' : 'Shopping List'} ({wonOrders.length})
          </Text>
        </View>

        {wonOrders.map((item) => (
          <View key={item.orderId} style={styles.orderCard}>
            <Image source={{ uri: item.image }} style={styles.orderImage} />
            <View style={styles.orderContent}>
              <Text style={[styles.orderTitle, isRtl && styles.textRtl]} numberOfLines={2}>
                {item.title}
              </Text>

              <View style={[styles.variationsRow, isRtl && styles.variationsRowRtl]}>
                <View style={styles.variantTag}>
                  <Text style={styles.variantTagText}>100% الأصلي</Text>
                </View>
                <View style={styles.variantTag}>
                  <Text style={styles.variantTagText}>{selectedGov}</Text>
                </View>
              </View>

              <View style={[styles.orderPriceRow, isRtl && styles.orderPriceRowRtl]}>
                <Text style={styles.orderPriceIqd}>
                  {item.winningBidIqd.toLocaleString()} د.ع
                </Text>
                <Text style={styles.orderPriceUsd}>${item.winningBidUsd}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* 3. Doorstep COD Inspection Notice */}
        <View style={styles.codGuaranteeBox}>
          <ShieldCheck size={22} color={AppTheme.colors.green} />
          <View style={styles.codGuaranteeContent}>
            <Text style={styles.codGuaranteeTitle}>{t.codBadge}</Text>
            <Text style={styles.codGuaranteeSub}>{t.deliveryWithin}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Order :</Text>
            <Text style={styles.summaryValueIqd}>{totalIqd.toLocaleString()} د.ع</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Equivalent USD :</Text>
            <Text style={styles.summaryValueUsd}>${totalUsd} USD</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee :</Text>
            <Text style={styles.summaryFree}>مجاني (Free Doorstep Delivery)</Text>
          </View>
        </View>

        {/* Confirm Order Button */}
        <TouchableOpacity
          onPress={handleConfirmOrder}
          style={styles.confirmButton}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>{t.confirmCodOrder}</Text>
        </TouchableOpacity>

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
  topBarRtl: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  scroll: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  addressCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  govScroll: {
    marginBottom: 10,
  },
  govPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginRight: 6,
    backgroundColor: AppTheme.colors.surface,
  },
  govPillActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: AppTheme.colors.primaryLight,
  },
  govPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  govPillTextActive: {
    color: AppTheme.colors.primary,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: AppTheme.colors.textPrimary,
  },
  orderCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: AppTheme.radius.sm,
    resizeMode: 'cover',
  },
  orderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  orderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    lineHeight: 16,
    marginBottom: 4,
  },
  variationsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  variationsRowRtl: {
    flexDirection: 'row-reverse',
  },
  variantTag: {
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  variantTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: AppTheme.colors.textSecondary,
  },
  orderPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  orderPriceRowRtl: {
    flexDirection: 'row-reverse',
  },
  orderPriceIqd: {
    fontSize: 13,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  orderPriceUsd: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
  },
  codGuaranteeBox: {
    backgroundColor: AppTheme.colors.greenLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: AppTheme.radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  codGuaranteeContent: {
    flex: 1,
  },
  codGuaranteeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  codGuaranteeSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.colors.textSecondary,
  },
  summaryValueIqd: {
    fontSize: 15,
    fontWeight: '900',
    color: AppTheme.colors.primary,
  },
  summaryValueUsd: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  summaryFree: {
    fontSize: 11,
    fontWeight: '800',
    color: AppTheme.colors.green,
  },
  confirmButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  successContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppTheme.colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  awbCard: {
    width: '100%',
    backgroundColor: AppTheme.colors.surface,
    padding: 16,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 24,
  },
  awbLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AppTheme.colors.textMuted,
    textTransform: 'uppercase',
  },
  awbCode: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: AppTheme.colors.textPrimary,
    marginTop: 4,
  },
  awbStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  awbStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppTheme.colors.green,
  },
  awbStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  continueButton: {
    width: '100%',
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  textRtl: {
    textAlign: 'right',
  },
});
