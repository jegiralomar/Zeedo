import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { ArrowRight, ArrowLeft, Check, Gavel } from 'lucide-react-native';
import { TOKENS } from '../theme/tokens';

interface SlideToBidSliderProps {
  currentBidIqd: number;
  incrementStepIqd: number;
  isRTL: boolean;
  onBidConfirmed: () => void;
  disabled?: boolean;
}

const SLIDER_WIDTH = Dimensions.get('window').width - 32;
const THUMB_SIZE = 50;
const MAX_DRAG = SLIDER_WIDTH - THUMB_SIZE - 8;
const CONFIRM_THRESHOLD = 0.86;

export const SlideToBidSlider: React.FC<SlideToBidSliderProps> = ({
  currentBidIqd,
  incrementStepIqd,
  isRTL,
  onBidConfirmed,
  disabled = false,
}) => {
  const nextBidAmount = currentBidIqd + incrementStepIqd;
  const [confirmed, setConfirmed] = useState(false);
  const dragAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !confirmed,
      onPanResponderMove: (_, gestureState) => {
        if (disabled || confirmed) return;

        let delta = isRTL ? -gestureState.dx : gestureState.dx;
        if (delta < 0) delta = 0;
        if (delta > MAX_DRAG) delta = MAX_DRAG;
        dragAnim.setValue(delta);

        if (delta / MAX_DRAG >= CONFIRM_THRESHOLD) {
          triggerConfirm();
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled || confirmed) return;

        const delta = isRTL ? -gestureState.dx : gestureState.dx;
        if (delta / MAX_DRAG < CONFIRM_THRESHOLD) {
          Animated.spring(dragAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 12,
          }).start();
        }
      },
    })
  ).current;

  const triggerConfirm = () => {
    setConfirmed(true);
    Animated.timing(dragAnim, {
      toValue: MAX_DRAG,
      duration: 160,
      useNativeDriver: false,
    }).start(() => {
      onBidConfirmed();
      setTimeout(() => {
        setConfirmed(false);
        dragAnim.setValue(0);
      }, 1600);
    });
  };

  const fillWidth = dragAnim.interpolate({
    inputRange: [0, MAX_DRAG],
    outputRange: [THUMB_SIZE, SLIDER_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          isRTL ? styles.trackRTL : styles.trackLTR,
          disabled && styles.trackDisabled,
          confirmed && styles.trackConfirmed,
        ]}
      >
        {/* Dynamic Electric Blue / Mint Fill Track */}
        <Animated.View
          style={[
            styles.fillTrack,
            isRTL ? { right: 0 } : { left: 0 },
            { width: fillWidth },
            confirmed && styles.fillTrackConfirmed,
          ]}
        />

        {/* Center Track Label */}
        <View style={styles.labelContainer} pointerEvents="none">
          <Text style={[styles.labelText, confirmed && styles.labelTextConfirmed]}>
            {confirmed
              ? `✓ Bid Confirmed (${nextBidAmount.toLocaleString()} IQD)`
              : isRTL
              ? `ڕابکێشە بۆ زیادکردن  +${incrementStepIqd.toLocaleString()} IQD`
              : `Slide to Bid  +${incrementStepIqd.toLocaleString()} IQD`}
          </Text>
        </View>

        {/* Draggable Slider Thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            isRTL
              ? {
                  right: 4,
                  transform: [{ translateX: Animated.multiply(dragAnim, -1) }],
                }
              : {
                  left: 4,
                  transform: [{ translateX: dragAnim }],
                },
            confirmed && styles.thumbConfirmed,
          ]}
        >
          {confirmed ? (
            <Check size={22} color={TOKENS.colors.secondary} strokeWidth={3} />
          ) : isRTL ? (
            <ArrowLeft size={20} color={TOKENS.colors.primary} strokeWidth={2.5} />
          ) : (
            <ArrowRight size={20} color={TOKENS.colors.primary} strokeWidth={2.5} />
          )}
        </Animated.View>
      </View>

      {/* Target Bid Subtext */}
      <View style={[styles.subtextRow, isRTL && styles.rowReverse]}>
        <Text style={styles.subtext}>
          {isRTL ? 'نرخی داهاتوو:' : 'Target Next Bid:'}{' '}
          <Text style={styles.subtextBold}>
            {nextBidAmount.toLocaleString()} IQD
          </Text>
        </Text>
        <Text style={styles.subtextTier}>
          +{incrementStepIqd.toLocaleString()} IQD step
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  track: {
    height: 56,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: TOKENS.colors.primary,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...TOKENS.shadows.glowPrimary,
  },
  trackLTR: {
    flexDirection: 'row',
  },
  trackRTL: {
    flexDirection: 'row-reverse',
  },
  trackDisabled: {
    opacity: 0.5,
  },
  trackConfirmed: {
    backgroundColor: TOKENS.colors.secondary,
  },
  fillTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: TOKENS.colors.primaryHover,
    borderRadius: TOKENS.borderRadius.full,
  },
  fillTrackConfirmed: {
    backgroundColor: TOKENS.colors.secondary,
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  labelTextConfirmed: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  thumb: {
    position: 'absolute',
    top: 3,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...TOKENS.shadows.card,
  },
  thumbConfirmed: {
    backgroundColor: '#FFFFFF',
  },
  subtextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  subtext: {
    fontSize: 11,
    color: TOKENS.colors.textMuted,
  },
  subtextBold: {
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  subtextTier: {
    fontSize: 10,
    color: TOKENS.colors.primary,
    fontWeight: '800',
  },
});
