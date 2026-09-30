import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';

interface SlideToBidSliderProps {
  onBidConfirmed: () => void;
  disabled?: boolean;
  bidAmount?: number;
  currency?: string;
  label?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const THUMB_SIZE = 56;
const MAX_SLIDE = SLIDER_WIDTH - THUMB_SIZE - 8;

export const SlideToBidSlider: React.FC<SlideToBidSliderProps> = ({
  onBidConfirmed,
  disabled = false,
  bidAmount = 1000,
  currency = 'IQD',
  label = 'Slide to Bid +1,000 IQD',
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
        if (gestureState.dx >= MAX_SLIDE * 0.85) {
          // Slide completed!
          Animated.timing(pan, {
            toValue: MAX_SLIDE,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            setCompleted(true);
            onBidConfirmed();
            // Reset after 1.5 seconds
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
          // Reset slider back to start
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
          {completed ? '✓ BID PLACED!' : label}
        </Text>
      </View>

      {/* Draggable Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: pan }],
            backgroundColor: completed ? '#10B981' : '#B4F105',
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.thumbArrow}>{completed ? '✓' : '➔'}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: 64,
    backgroundColor: '#0F3826',
    borderRadius: 32,
    padding: 4,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(180, 241, 5, 0.25)',
    overflow: 'hidden',
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
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingLeft: 40,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: '#072F1F',
  },
});
