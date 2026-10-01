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
      id: 'LED-01',
      date: 'اليوم، 14:10',
      description: 'Zeedo Platform Fee (10%) - Sony PS5 Pro',
      type: 'debit',
      amountIqd: -45000,
    },
    {
      id: 'LED-02',
      date: 'اليوم، 13:55',
      description: 'COD Doorstep Clearance - iPhone 16 Pro Max',
      type: 'credit',
      amountIqd: 820000,
    },
    {
      id: 'LED-03',
      date: 'أمس، 18:20',
      description: 'ZainCash Direct Advance Payout',
      type: 'settled',
      amountIqd: -500000,
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
        {/* Payout Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>READY FOR WITHDRAWAL</Text>
          <Text style={styles.balanceAmount}>275,000 د.ع</Text>
          <Text style={styles.balanceSub}>Disbursed via ZainCash, FIB or QiCard within 24 hours</Text>
        </View>

        {/* Ledger Entries */}
        <Text style={styles.sectionTitle}>Transaction & Commission Ledger</Text>
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
                  item.amountIqd > 0 ? styles.creditText : styles.debitText,
                ]}
              >
                {item.amountIqd > 0 ? `+${item.amountIqd.toLocaleString()}` : item.amountIqd.toLocaleString()} د.ع
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
