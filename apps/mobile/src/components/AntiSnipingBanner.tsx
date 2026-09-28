import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { Timer, Zap, TrendingUp } from 'lucide-react-native';

interface AntiSnipingBannerProps {
  endTime: string;
  incrementStepIqd: number;
  isRtl?: boolean;
}

export const AntiSnipingBanner: React.FC<AntiSnipingBannerProps> = ({
  endTime,
  incrementStepIqd,
  isRtl = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsRemaining(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isSoftCloseActive = secondsRemaining <= 60 && secondsRemaining > 0;

  return (
    <View
      style={[
        styles.bannerCard,
        isSoftCloseActive ? styles.alertBackground : styles.normalBackground,
        isRtl && styles.rtlRow,
      ]}
    >
      {/* Timer & Pulsing Icon */}
      <View style={[styles.timerGroup, isRtl && styles.rtlRow]}>
        <View
          style={[
            styles.iconBox,
            isSoftCloseActive ? styles.alertIconBox : styles.normalIconBox,
          ]}
        >
          <Timer
            size={20}
            color={isSoftCloseActive ? '#FFFFFF' : TOKENS.colors.primary}
          />
        </View>

        <View>
          <View style={[styles.statusTagRow, isRtl && styles.rtlRow]}>
            <Zap
              size={11}
              color={isSoftCloseActive ? TOKENS.colors.accent : TOKENS.colors.primary}
            />
            <Text
              style={[
                styles.statusTagText,
                isSoftCloseActive ? styles.alertText : styles.normalText,
              ]}
            >
              {isSoftCloseActive ? 'SOFT-CLOSE ANTI-SNIPING' : 'TIME REMAINING'}
            </Text>
            {isSoftCloseActive && <View style={styles.pulseDot} />}
          </View>

          <Text
            style={[
              styles.timerDigits,
              isSoftCloseActive ? styles.alertDigits : styles.normalDigits,
            ]}
          >
            {timeFormatted}
            <Text style={styles.secSuffix}> {isRtl ? 'چرکە' : 'sec'}</Text>
          </Text>
        </View>
      </View>

      {/* Next Min Step Pill with soft shadow */}
      <View style={[styles.stepBox, isRtl ? styles.alignLeft : styles.alignRight]}>
        <Text style={styles.stepLabel}>{isRtl ? 'هەنگاوی زیادکردن' : 'Min Increment'}</Text>
        <View style={styles.stepValueRow}>
          <TrendingUp size={11} color={TOKENS.colors.primary} />
          <Text style={styles.stepAmount}>+{incrementStepIqd.toLocaleString()} IQD</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: TOKENS.borderRadius.xl,
    marginVertical: 8,
    ...TOKENS.shadows.card,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  alertBackground: {
    backgroundColor: TOKENS.colors.accentLight,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  normalBackground: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
  },
  timerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconBox: {
    backgroundColor: TOKENS.colors.accent,
    ...TOKENS.shadows.card,
  },
  normalIconBox: {
    backgroundColor: TOKENS.colors.primaryLight,
  },
  statusTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 1,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  alertText: {
    color: TOKENS.colors.accent,
  },
  normalText: {
    color: TOKENS.colors.primary,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: TOKENS.colors.accent,
  },
  timerDigits: {
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  alertDigits: {
    color: '#9F1239',
  },
  normalDigits: {
    color: TOKENS.colors.textPrimary,
  },
  secSuffix: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  stepBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: TOKENS.colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  stepValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stepAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
});
