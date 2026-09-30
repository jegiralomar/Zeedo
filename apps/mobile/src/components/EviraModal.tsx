import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { EviraTheme, eviraWindowStyles } from '../lib/theme';

interface EviraModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  showCloseButton?: boolean;
}

/**
 * Standard Evira Window / Bottom Sheet Component
 * Guarantees identical design system compliance across all modal windows.
 */
export const EviraModal: React.FC<EviraModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  contentStyle,
  showCloseButton = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={eviraWindowStyles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={[eviraWindowStyles.sheetContainer, contentStyle]}>
                {/* Evira Top Drag Handle */}
                <View style={eviraWindowStyles.dragHandle} />

                {/* Header Row (Title & Close Button) */}
                {(title || showCloseButton) && (
                  <View style={eviraWindowStyles.headerRow}>
                    {title ? (
                      <Text style={eviraWindowStyles.headerTitle}>{title}</Text>
                    ) : (
                      <View />
                    )}
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        style={eviraWindowStyles.closeButton}
                        activeOpacity={0.7}
                      >
                        <Text style={eviraWindowStyles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {subtitle && (
                  <Text style={eviraWindowStyles.headerSubtitle}>{subtitle}</Text>
                )}

                {/* Modal Window Content */}
                {children}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
