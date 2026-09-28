import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  X,
  Sparkles,
  Send,
} from 'lucide-react-native';

interface DisputeModalProps {
  visible: boolean;
  orderRef: string;
  itemTitle: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  isRtl?: boolean;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  visible,
  orderRef,
  itemTitle,
  onClose,
  onSubmit,
  isRtl = false,
}) => {
  const [selectedReason, setSelectedReason] = useState('Condition Mismatch Reported');
  const [details, setDetails] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reasons = [
    'Condition Mismatch Reported',
    'Courier Physical Damage',
    'Incomplete Package / Missing Accessories',
    'Suspected Authenticity Issue',
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSubmit(selectedReason, details);
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={[styles.headerRow, isRtl && styles.rtlRow]}>
            <View style={[styles.titleGroup, isRtl && styles.rtlRow]}>
              <View style={styles.iconCircle}>
                <AlertTriangle size={20} color={TOKENS.colors.tertiary} />
              </View>
              <View>
                <Text style={styles.title}>
                  {isRtl ? 'دەروازەی ناکۆکی و گەڕاندنەوە' : 'Dispute & Return Portal'}
                </Text>
                <Text style={styles.subtitle}>
                  {isRtl ? 'داواکاری پشکنینی ژیریی دەستکردی کاڵا' : 'File ticket or request AI condition audit'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={TOKENS.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Order Reference Card */}
            <View style={styles.orderCard}>
              <Text style={styles.orderLabel}>Target Order Reference</Text>
              <Text style={styles.orderRefText}>{orderRef}</Text>
              <Text numberOfLines={1} style={styles.itemTitleText}>{itemTitle}</Text>
            </View>

            {/* Reason selector */}
            <View style={styles.group}>
              <Text style={styles.groupLabel}>
                {isRtl ? 'هۆکاری سەرەکی کێشەکە' : 'Primary Dispute Category'}
              </Text>
              <View style={styles.reasonList}>
                {reasons.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.reasonItem,
                        isSelected && styles.reasonItemSelected,
                        isRtl && styles.rtlRow,
                      ]}
                      onPress={() => setSelectedReason(r)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.radioDot,
                          isSelected && styles.radioDotSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          isSelected && styles.reasonTextSelected,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Details input */}
            <View style={styles.group}>
              <Text style={styles.groupLabel}>
                {isRtl ? 'ڕوونکردنەوەی زیاتر بۆ بەڕێوەبەرایەتی' : 'Detailed Explanation for Moderator'}
              </Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="Describe discrepancies between listing photos and the physical parcel..."
                placeholderTextColor={TOKENS.colors.outline}
                value={details}
                onChangeText={setDetails}
              />
            </View>

            {/* Photo upload button */}
            <TouchableOpacity
              style={[styles.uploadBox, hasPhoto && styles.uploadBoxDone]}
              onPress={() => setHasPhoto(!hasPhoto)}
              activeOpacity={0.8}
            >
              <Camera size={22} color={hasPhoto ? TOKENS.colors.secondary : TOKENS.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>
                  {hasPhoto ? 'Photo Evidence Attached (1 image)' : 'Attach Parcel / Delivery Photos'}
                </Text>
                <Text style={styles.uploadSub}>
                  {hasPhoto ? 'Tap to change image' : 'AI vision validates item condition vs catalog specs'}
                </Text>
              </View>
              {hasPhoto && <CheckCircle size={18} color={TOKENS.colors.secondary} />}
            </TouchableOpacity>

            {/* AI Audit Notice */}
            <View style={styles.aiAuditCard}>
              <Sparkles size={18} color={TOKENS.colors.secondary} />
              <Text style={styles.aiAuditText}>
                {isRtl
                  ? 'سیستەمی ژیری دەستکرد لە ماوەی کەمتر لە ٢ کاتژمێر پشکنین دەکات و پەیوەندی بە فرۆشیارەوە دەکات.'
                  : 'ZEEDO AI condition auditor automatically cross-checks courier photos against original seller catalog specs within 2 hours.'}
              </Text>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSuccess && styles.submitBtnSuccess,
                isSubmitting && styles.submitBtnLoading,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || isSuccess}
              activeOpacity={0.88}
            >
              {isSuccess ? (
                <>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Dispute Ticket Filed Successfully!</Text>
                </>
              ) : (
                <>
                  <Send size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>
                    {isSubmitting
                      ? 'Assigning AI Auditor...'
                      : isRtl
                      ? 'ناردنی داواکاری گەڕاندنەوە'
                      : 'Submit Dispute & Assign AI Auditor'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 30, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderTopLeftRadius: TOKENS.borderRadius.xxl,
    borderTopRightRadius: TOKENS.borderRadius.xxl,
    maxHeight: '90%',
    ...TOKENS.shadows.modal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.lg,
    paddingVertical: TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.surfaceContainerHigh,
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
    backgroundColor: `${TOKENS.colors.tertiary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: TOKENS.colors.onSurface,
  },
  subtitle: {
    fontSize: 10,
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
  content: {
    padding: TOKENS.spacing.lg,
    gap: TOKENS.spacing.md,
  },
  orderCard: {
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
    gap: 2,
  },
  orderLabel: {
    fontSize: 10,
    color: TOKENS.colors.outline,
    textTransform: 'uppercase',
  },
  orderRefText: {
    fontSize: 14,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  itemTitleText: {
    fontSize: 12,
    color: TOKENS.colors.onSurface,
  },
  group: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.onSurfaceVariant,
  },
  reasonList: {
    gap: 6,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    padding: 10,
    borderRadius: TOKENS.borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonItemSelected: {
    borderColor: TOKENS.colors.tertiary,
    backgroundColor: `${TOKENS.colors.tertiary}10`,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: TOKENS.colors.outline,
  },
  radioDotSelected: {
    borderColor: TOKENS.colors.tertiary,
    backgroundColor: TOKENS.colors.tertiary,
  },
  reasonText: {
    fontSize: 12,
    color: TOKENS.colors.onSurface,
  },
  reasonTextSelected: {
    fontWeight: '700',
    color: TOKENS.colors.tertiary,
  },
  textArea: {
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    borderRadius: TOKENS.borderRadius.lg,
    borderWidth: 1,
    borderColor: TOKENS.colors.outlineVariant,
    padding: TOKENS.spacing.md,
    fontSize: 12,
    color: TOKENS.colors.onSurface,
    textAlignVertical: 'top',
    height: 70,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.md,
    backgroundColor: `${TOKENS.colors.primary}0D`,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: TOKENS.colors.primary,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
  },
  uploadBoxDone: {
    backgroundColor: `${TOKENS.colors.secondary}12`,
    borderColor: TOKENS.colors.secondary,
    borderStyle: 'solid',
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  uploadSub: {
    fontSize: 10,
    color: TOKENS.colors.outline,
    marginTop: 2,
  },
  aiAuditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${TOKENS.colors.secondary}10`,
    padding: TOKENS.spacing.sm,
    borderRadius: TOKENS.borderRadius.md,
  },
  aiAuditText: {
    fontSize: 10,
    color: TOKENS.colors.secondary,
    lineHeight: 14,
    flex: 1,
  },
  footer: {
    padding: TOKENS.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.surfaceContainerHigh,
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.tertiary,
    height: 52,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.card,
  },
  submitBtnLoading: {
    opacity: 0.8,
  },
  submitBtnSuccess: {
    backgroundColor: TOKENS.colors.secondary,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
