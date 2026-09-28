import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { LanguageCode } from '../types';
import { DIALECT_LABELS, isRTL } from '../i18n/translations';
import { useAuthStore } from '../store/useAuthStore';
import { Check, X, Languages } from 'lucide-react-native';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { language, setLanguage } = useAuthStore();
  const currentRtl = isRTL(language);

  const dialects: { code: LanguageCode; nativeName: string; region: string }[] = [
    { code: 'ckb', nativeName: 'کوردی سۆرانی', region: 'هەولێر، سلێمانی، کەرکووک (Erbil & Suly Hub)' },
    { code: 'badini', nativeName: 'کوردی بادینی', region: 'دهۆک، زاخۆ، ئامێدی (Duhok & Zakho Hub)' },
    { code: 'ar', nativeName: 'العربية (عراقي)', region: 'بغداد، البصرة، الموصل والوسط والجنوب' },
    { code: 'en', nativeName: 'English', region: 'Standard International / Global Interface' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={[styles.headerRow, currentRtl && styles.rtlRow]}>
            <View style={[styles.titleGroup, currentRtl && styles.rtlRow]}>
              <View style={styles.iconCircle}>
                <Languages size={18} color={TOKENS.colors.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Select Regional Dialect</Text>
                <Text style={styles.modalSubtitle}>هەڵبژاردنی زمان • اختيار اللهجة</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={TOKENS.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Dialect List */}
          <View style={styles.dialectList}>
            {dialects.map((item) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.dialectItem,
                    isSelected && styles.selectedDialectItem,
                    currentRtl && styles.rtlRow,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dialectName,
                        isSelected && styles.selectedDialectText,
                      ]}
                    >
                      {item.nativeName}
                    </Text>
                    <Text style={styles.dialectRegion}>{item.region}</Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RTL / LTR Notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              💡 Instant layout mirroring: Selecting Arabic, Sorani, or Badini switches the entire app to native RTL (Right-to-Left).
            </Text>
          </View>
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
  modalCard: {
    width: '100%',
    maxWidth: 440,
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
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.surfaceContainerHigh,
    paddingBottom: TOKENS.spacing.sm,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TOKENS.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  modalSubtitle: {
    fontSize: 12,
    color: TOKENS.colors.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialectList: {
    gap: TOKENS.spacing.sm,
  },
  dialectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: TOKENS.spacing.md,
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    borderRadius: TOKENS.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedDialectItem: {
    backgroundColor: `${TOKENS.colors.primary}0D`,
    borderColor: TOKENS.colors.primary,
  },
  dialectName: {
    fontSize: 16,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  selectedDialectText: {
    color: TOKENS.colors.primary,
  },
  dialectRegion: {
    fontSize: 12,
    color: TOKENS.colors.onSurfaceVariant,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TOKENS.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    marginTop: TOKENS.spacing.md,
    padding: TOKENS.spacing.sm,
    backgroundColor: TOKENS.colors.surfaceContainerHigh,
    borderRadius: TOKENS.borderRadius.md,
  },
  noticeText: {
    fontSize: 11,
    color: TOKENS.colors.onSurfaceVariant,
    lineHeight: 16,
    textAlign: 'center',
  },
});
