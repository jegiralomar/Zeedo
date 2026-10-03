import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  ArrowLeft,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  CreditCard,
  Clock,
} from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';

export const MerchantCommissionsScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();

  const ledger = [
    {
      id: 'FEE-01',
      date: 'اليوم، 14:10',
      description: 'عمولة بيع مزاد (5%) - Sony PS5 Slim',
      type: 'debit',
      amountIqd: 22500,
    },
    {
      id: 'POST-02',
      date: 'اليوم، 12:00',
      description: 'رسم نشر سلعة جديدة (1,000 د.ع) - iPhone 16 Pro',
      type: 'debit',
      amountIqd: 1000,
    },
    {
      id: 'POST-03',
      date: 'أمس، 18:30',
      description: 'رسم نشر سلعة جديدة (1,000 د.ع) - AirPods Pro 2',
      type: 'debit',
      amountIqd: 1000,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setActiveScreen('merchant_home')}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={AppTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Merchant Settlement Ledger</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Platform Fees Payable Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>FEES OWED TO ZEEDO (عمولات ورسوم النشر المستحقة)</Text>
          <Text style={styles.balanceAmount}>14,500 د.ع</Text>
          <Text style={styles.balanceSub}>تشمل رسوم نشر السلع (1,000 د.ع لكل سلعة) + نسبة العمولة على السلع المباعة. تدفع عبر زين كاش أو FIB</Text>
        </View>

        {/* Ledger Entries */}
        <Text style={styles.sectionTitle}>سجل العمولات ورسوم النشر</Text>
        <View style={styles.ledgerList}>
          {ledger.map((item) => (
            <View key={item.id} style={styles.ledgerItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <Text style={styles.itemDate}>{item.date} • {item.id}</Text>
              </View>
              <Text
                style={[
                  styles.itemAmount,
                  styles.debitText,
                ]}
              >
                {item.amountIqd.toLocaleString()} د.ع
              </Text>
            </View>
          ))}
        </View>

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
  balanceCard: {
    backgroundColor: AppTheme.colors.textPrimary,
    borderRadius: AppTheme.radius.md,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#B4F105',
    marginVertical: 4,
  },
  balanceSub: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 10,
  },
  ledgerList: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 12,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 8,
  },
  itemDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  itemDate: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '900',
  },
  creditText: {
    color: AppTheme.colors.green,
  },
  debitText: {
    color: AppTheme.colors.primary,
  },
});
