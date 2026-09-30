import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { EviraTheme, eviraWindowStyles } from '../lib/theme';
import { EviraModal } from './EviraModal';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSaved: (location: {
    city: string;
    district: string;
    landmark: string;
    coordinates: { lat: number; lng: number };
  }) => void;
}

const IRAQI_CITIES = [
  { name: 'Erbil', kurdish: 'هەولێر', arabic: 'أربيل', lat: 36.1911, lng: 44.0092 },
  { name: 'Baghdad', kurdish: 'بەغدا', arabic: 'بغداد', lat: 33.3152, lng: 44.3661 },
  { name: 'Sulaymaniyah', kurdish: 'سلێمانی', arabic: 'السليمانية', lat: 35.5669, lng: 45.4161 },
  { name: 'Duhok', kurdish: 'دهۆک', arabic: 'دهوك', lat: 36.8679, lng: 42.9885 },
  { name: 'Basra', kurdish: 'بەسرە', arabic: 'البصرة', lat: 30.5081, lng: 47.7835 },
  { name: 'Kirkuk', kurdish: 'کەرکووک', arabic: 'كركوك', lat: 35.4681, lng: 44.3922 },
  { name: 'Najaf', kurdish: 'نەجەف', arabic: 'النجف', lat: 32.0259, lng: 44.3462 },
  { name: 'Karbala', kurdish: 'کەربەلا', arabic: 'كربلاء', lat: 32.616, lng: 44.0249 },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onLocationSaved,
}) => {
  const [selectedCity, setSelectedCity] = useState(IRAQI_CITIES[0]);
  const [district, setDistrict] = useState('');
  const [landmark, setLandmark] = useState('');

  const handleSave = () => {
    if (!district.trim()) {
      Alert.alert('Required', 'Please enter your neighborhood or district name.');
      return;
    }

    onLocationSaved({
      city: selectedCity.name,
      district: district.trim(),
      landmark: landmark.trim(),
      coordinates: { lat: selectedCity.lat, lng: selectedCity.lng },
    });
    onClose();
  };

  return (
    <EviraModal
      visible={visible}
      onClose={onClose}
      title="Delivery Doorstep Location"
      subtitle="Pinpoint 100% Cash-on-Delivery Dispatch"
      contentStyle={styles.modalContent}
    >
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* City Selector Chips */}
        <Text style={eviraWindowStyles.inputLabel}>Select City / Governorate</Text>
        <View style={styles.chipGrid}>
          {IRAQI_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name;
            return (
              <TouchableOpacity
                key={city.name}
                onPress={() => setSelectedCity(city)}
                style={[styles.cityChip, isSelected && styles.cityChipActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                  📍 {city.name} ({city.kurdish})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Neighborhood / District Input */}
        <Text style={[eviraWindowStyles.inputLabel, { marginTop: 16 }]}>
          Neighborhood / District
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dream City, Bakhtiyari, Mansour..."
          placeholderTextColor={EviraTheme.colors.textTertiary}
          value={district}
          onChangeText={setDistrict}
        />

        {/* Nearest Landmark */}
        <Text style={[eviraWindowStyles.inputLabel, { marginTop: 16 }]}>
          Nearest Landmark (Optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Near Royal Mall, opposite Grand Mosque..."
          placeholderTextColor={EviraTheme.colors.textTertiary}
          value={landmark}
          onChangeText={setLandmark}
        />

        {/* Inspection & Courier Guarantee */}
        <View style={styles.guaranteeBanner}>
          <Text style={styles.guaranteeIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.guaranteeTitle}>Doorstep Cash Inspection</Text>
            <Text style={styles.guaranteeText}>
              Couriers call you directly upon arrival. You can open and inspect the auction lot before handing over payment.
            </Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={[eviraWindowStyles.primaryButton, styles.confirmButton]}
          activeOpacity={0.85}
        >
          <Text style={eviraWindowStyles.primaryButtonText}>Confirm Doorstep Location</Text>
        </TouchableOpacity>
      </ScrollView>
    </EviraModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: '88%',
  },
  scroll: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: EviraTheme.radii.full,
    backgroundColor: EviraTheme.colors.surface,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
  },
  cityChipActive: {
    backgroundColor: EviraTheme.colors.primary,
    borderColor: EviraTheme.colors.primary,
  },
  cityChipText: {
    color: EviraTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: EviraTheme.colors.textWhite,
    fontWeight: '700',
  },
  input: {
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.lg,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
    color: EviraTheme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: '500',
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: EviraTheme.colors.surface,
    borderRadius: EviraTheme.radii.lg,
    borderWidth: 1,
    borderColor: EviraTheme.colors.border,
    padding: 14,
    marginTop: 18,
    gap: 12,
  },
  guaranteeIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: EviraTheme.colors.textPrimary,
    marginBottom: 2,
  },
  guaranteeText: {
    fontSize: 11,
    lineHeight: 16,
    color: EviraTheme.colors.textSecondary,
  },
  confirmButton: {
    marginTop: 20,
  },
});
