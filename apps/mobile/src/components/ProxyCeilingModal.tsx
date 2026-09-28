import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { Sliders, AlertTriangle, Check, X, Shield } from 'lucide-react-native';

interface ProxyCeilingModalProps {
  visible: boolean;
  currentBidIqd: number;
  estimatedRetailIqd: number;
  initialCeiling?: number;
  onSave: (ceilingIqd: number) => void;
  onClose: () => void;
  isRtl?: boolean;
}

export const ProxyCeilingModal: React.FC<ProxyCeilingModalProps> = ({
  visible,
  currentBidIqd,
  estimatedRetailIqd,
  initialCeiling,
  onSave,
  onClose,
  isRtl = false,
}) => {
  const [ceilingText, setCeilingText] = useState(
    initialCeiling ? String(initialCeiling) : String(currentBidIqd + 20000)
  );

  const numericCeiling = parseInt(ceilingText.replace(/[^0-9]/g, ''), 10) || 0;
  const isSafetyBrakeTriggered = numericCeiling > estimatedRetailIqd * 1.5;

  const handleConfirm = () => {
    if (numericCeiling > currentBidIqd) {
      onSave(numericCeiling);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={[styles.headerRow, isRtl && styles.rtlRow]}>
            <View style={[styles.titleGroup, isRtl && styles.rtlRow]}>
              <View style={styles.iconCircle}>
                <Sliders size={18} color={TOKENS.colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>
                  {isRtl ? 'ڕێکخستنی بەرزترین سنوری خۆکار' : 'Proxy Auto-Bid Ceiling'}
                </Text>
                <Text style={styles.subtitle}>
                  {isRtl ? 'سیستەم خۆی بە پلە زیاد دەکات' : 'System auto-increments bids on your behalf'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={TOKENS.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Current Bid & Retail Baseline Stats */}
          <View style={[styles.statsGrid, isRtl && styles.rtlRow]}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{isRtl ? 'بەرزترین نرخی ئێستا' : 'Current Winning Bid'}</Text>
              <Text style={styles.statValue}>{currentBidIqd.toLocaleString()} IQD</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{isRtl ? 'نرخی خەمڵێنراوی بازاڕ' : 'Retail Market Baseline'}</Text>
              <Text style={styles.statValue}>{estimatedRetailIqd.toLocaleString()} IQD</Text>
            </View>
          </View>

          {/* Input field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isRtl ? 'بەرزترین سنووری دڵخوازی تۆ (IQD)' : 'Your Maximum Proxy Ceiling (IQD)'}
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={ceilingText}
                onChangeText={setCeilingText}
                placeholder="e.g. 350,000"
                placeholderTextColor={TOKENS.colors.outline}
              />
              <Text style={styles.currencyTag}>IQD</Text>
            </View>
          </View>

          {/* Quick preset buttons */}
          <View style={styles.presetRow}>
            {[10000, 25000, 50000].map((delta) => (
              <TouchableOpacity
                key={delta}
                style={styles.presetBtn}
                onPress={() => setCeilingText(String(currentBidIqd + delta))}
              >
                <Text style={styles.presetText}>+{delta.toLocaleString()} IQD</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Safety Brake Warning Banner */}
          {isSafetyBrakeTriggered && (
            <View style={styles.safetyBrakeCard}>
              <AlertTriangle size={18} color={TOKENS.colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.safetyBrakeTitle}>
                  {isRtl ? 'ئاگاداری فڕێنی سەلامەتی بازاڕ' : 'Retail Safety Brake Warning'}
                </Text>
                <Text style={styles.safetyBrakeDesc}>
                  {isRtl
                    ? 'ئەم نرخە لە ١٥٠٪ی نرخی ڕاستەقینەی بازاڕ زیاترە. تکایە دڵنیابەرەوە پێش تەواوکردن.'
                    : 'Ceiling exceeds 150% of verified retail market baseline. Review carefully to prevent overbidding.'}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              numericCeiling <= currentBidIqd && styles.disabledBtn,
            ]}
            onPress={handleConfirm}
            disabled={numericCeiling <= currentBidIqd}
            activeOpacity={0.85}
          >
            <Shield size={18} color="#ffffff" />
            <Text style={styles.confirmText}>
              {isRtl ? 'پەسەندکردنی سنوری خۆکار' : 'Confirm Proxy Ceiling'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 30, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TOKENS.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.lg,
    ...TOKENS.shadows.modal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TOKENS.spacing.md,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TOKENS.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  subtitle: {
    fontSize: 11,
    color: TOKENS.colors.onSurfaceVariant,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: TOKENS.spacing.sm,
    marginBottom: TOKENS.spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    padding: TOKENS.spacing.sm,
    borderRadius: TOKENS.borderRadius.md,
  },
  statLabel: {
    fontSize: 10,
    color: TOKENS.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  inputGroup: {
    marginBottom: TOKENS.spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TOKENS.colors.onSurfaceVariant,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    borderRadius: TOKENS.borderRadius.lg,
    borderWidth: 1,
    borderColor: TOKENS.colors.outlineVariant,
    paddingHorizontal: TOKENS.spacing.md,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
  currencyTag: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.outline,
  },
  presetRow: {
    flexDirection: 'row',
    gap: TOKENS.spacing.xs,
    marginBottom: TOKENS.spacing.md,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: TOKENS.colors.surfaceContainer,
    borderRadius: TOKENS.borderRadius.full,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: TOKENS.colors.onSurfaceVariant,
  },
  safetyBrakeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: TOKENS.spacing.sm,
    backgroundColor: TOKENS.colors.errorContainer,
    padding: TOKENS.spacing.sm,
    borderRadius: TOKENS.borderRadius.md,
    marginBottom: TOKENS.spacing.md,
  },
  safetyBrakeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: TOKENS.colors.error,
  },
  safetyBrakeDesc: {
    fontSize: 10,
    color: TOKENS.colors.onErrorContainer,
    marginTop: 2,
    lineHeight: 14,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: TOKENS.spacing.sm,
    backgroundColor: TOKENS.colors.primary,
    height: 50,
    borderRadius: TOKENS.borderRadius.full,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
