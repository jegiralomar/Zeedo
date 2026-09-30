import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { EviraTheme } from '../lib/theme';

interface SlideToBidSliderProps {
  onBidConfirmed: () => void;
  disabled?: boolean;
  bidAmount?: number;
  currency?: string;
  label?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const THUMB_SIZE = 52;
const MAX_SLIDE = SLIDER_WIDTH - THUMB_SIZE - 8;

export const SlideToBidSlider: React.FC<SlideToBidSliderProps> = ({
  onBidConfirmed,
  disabled = false,
  label = 'Slide to Place Bid ➔',
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [completed, setCompleted] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !completed,
      onPanResponderMove: (_, gestureState) => {
        if (disabled || completed) return;
        const newX = Math.max(0, Math.min(gestureState.dx, MAX_SLIDE));
        pan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled || completed) return;
        if (gestureState.dx >= MAX_SLIDE * 0.82) {
          Animated.timing(pan, {
            toValue: MAX_SLIDE,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            setCompleted(true);
            onBidConfirmed();
            setTimeout(() => {
              Animated.spring(pan, {
                toValue: 0,
                friction: 6,
                useNativeDriver: false,
              }).start(() => {
                setCompleted(false);
              });
            }, 1200);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, disabled && styles.disabledContainer]}>
      {/* Background Track */}
      <View style={styles.track}>
        <Text style={styles.trackLabel}>
          {completed ? '✓ BID ACCEPTED' : label}
        </Text>
      </View>

      {/* Draggable Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: pan }],
            backgroundColor: completed ? EviraTheme.colors.success : EviraTheme.colors.textWhite,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text
          style={[
            styles.thumbArrow,
            completed && { color: EviraTheme.colors.textWhite },
          ]}
        >
          {completed ? '✓' : '➔'}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: 60,
    backgroundColor: EviraTheme.colors.primary,
    borderRadius: EviraTheme.radii.full,
    padding: 4,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackLabel: {
    color: EviraTheme.colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingLeft: 36,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: EviraTheme.colors.primary,
  },
});
