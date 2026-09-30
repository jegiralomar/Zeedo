import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Delivery Doorstep Location</Text>
              <Text style={styles.headerSub}>Pinpoint 100% Cash-on-Delivery Dispatch</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* City Selector Chips */}
            <Text style={styles.sectionLabel}>Select City / Governorate</Text>
            <View style={styles.chipGrid}>
              {IRAQI_CITIES.map((city) => {
                const isSelected = selectedCity.name === city.name;
                return (
                  <TouchableOpacity
                    key={city.name}
                    onPress={() => setSelectedCity(city)}
                    style={[styles.cityChip, isSelected && styles.cityChipActive]}
                  >
                    <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                      📍 {city.name} ({city.kurdish})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Neighborhood / District Input */}
            <Text style={styles.sectionLabel}>Neighborhood / District</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dream City, Bakhtiyari, Mansour..."
              placeholderTextColor="#94A3B8"
              value={district}
              onChangeText={setDistrict}
            />

            {/* Nearest Landmark */}
            <Text style={styles.sectionLabel}>Nearest Landmark (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Royal Mall, opposite Grand Mosque..."
              placeholderTextColor="#94A3B8"
              value={landmark}
              onChangeText={setLandmark}
            />

            {/* Map Pin Guarantee Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                ✓ Couriers call you directly upon arrival. You can open and inspect the item before handing over cash.
              </Text>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Confirm Doorstep Location</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#072F1F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: 'rgba(180, 241, 5, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#A7C1B5',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scroll: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#E5E7EB',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cityChipActive: {
    backgroundColor: '#B4F105',
    borderColor: '#B4F105',
  },
  cityChipText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  cityChipTextActive: {
    color: '#072F1F',
    fontWeight: '900',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  infoBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },
  infoText: {
    color: '#6EE7B7',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#B4F105',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#072F1F',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
