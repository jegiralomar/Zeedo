import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { AppTheme } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { LocationPickerStep } from './LocationPickerStep';
import { DeliveryLocation } from '../types';

export const LocationModal: React.FC = () => {
  const {
    isLocationSetupOpen,
    closeLocationSetup,
    currentUser,
    sessionToken,
    saveDeliveryLocation,
    language,
  } = useAppStore();

  const isRtl = language !== 'en';
  const [isSaving, setIsSaving] = useState(false);

  if (!isLocationSetupOpen) return null;

  const handleConfirm = async (loc: DeliveryLocation) => {
    setIsSaving(true);
    try {
      await saveDeliveryLocation(loc, sessionToken || '');
    } finally {
      setIsSaving(false);
      closeLocationSetup();
    }
  };

  return (
    <Modal
      visible={isLocationSetupOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeLocationSetup}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <MapPin size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>
                {isRtl ? 'تحديث عنوان التوصيل' : 'Update Delivery Address'}
              </Text>
            </View>
            <TouchableOpacity onPress={closeLocationSetup} style={styles.closeBtn}>
              <X size={20} color={AppTheme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Location Picker */}
          <LocationPickerStep
            isRtl={isRtl}
            onConfirm={handleConfirm}
            onSkip={closeLocationSetup}
            isSaving={isSaving}
            initialLocation={currentUser?.deliveryLocation}
          />
        </View>
      </View>
    </Modal>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    minHeight: '75%',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
