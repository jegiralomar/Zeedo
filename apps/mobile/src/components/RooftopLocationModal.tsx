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
import { RooftopPin } from '../types';
import {
  MapPin,
  Crosshair,
  ShieldCheck,
  CheckCircle,
  X,
  Layers,
  LockOpen,
  Mic,
  Navigation,
} from 'lucide-react-native';

interface RooftopLocationModalProps {
  visible: boolean;
  onSavePin: (pin: RooftopPin) => void;
  onClose: () => void;
  isRtl?: boolean;
}

export const RooftopLocationModal: React.FC<RooftopLocationModalProps> = ({
  visible,
  onSavePin,
  onClose,
  isRtl = false,
}) => {
  const [city, setCity] = useState('Zakho');
  const [district, setDistrict] = useState('Bedar District');
  const [landmark, setLandmark] = useState('Near Central Market water tower, blue metal door');
  const [latitude, setLatitude] = useState(37.1438);
  const [longitude, setLongitude] = useState(42.6874);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSave = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      onSavePin({
        latitude,
        longitude,
        city,
        district,
        landmark,
        addressText: `${district}, ${city}, Iraq`,
        isVerified: true,
      });
      setIsUnlocking(false);
      onClose();
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={[styles.headerRow, isRtl && styles.rtlRow]}>
            <View style={{ flex: 1 }}>
              <View style={[styles.tagRow, isRtl && styles.rtlRow]}>
                <Text style={styles.title}>
                  {isRtl ? 'دیاریکردنی شوێنی سەربان (GPS)' : 'Set Rooftop Delivery Location'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color={TOKENS.colors.secondary} />
                  <Text style={styles.verifiedText}>Verified COD</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>
                {isRtl
                  ? 'هەنگاوی پێویست بۆ سیستەمی ١٠٠٪ پارەدانی کاش. پینی سەربانی ماڵەکەت دابنێ بۆ گەیاندنی دەستەودەست.'
                  : 'Required verification step for 100% Cash on Delivery. Pin your precise rooftop for courier handover.'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={TOKENS.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Interactive Map Viewport Simulation */}
            <View style={styles.mapViewport}>
              {/* Map grid aesthetic */}
              <View style={styles.gridOverlay}>
                <View style={styles.gridHLine1} />
                <View style={styles.gridHLine2} />
                <View style={styles.gridVLine1} />
                <View style={styles.gridVLine2} />
              </View>

              {/* Floating Map Controls */}
              <View style={styles.mapControls}>
                <TouchableOpacity style={styles.mapControlBtn} activeOpacity={0.8}>
                  <Navigation size={18} color={TOKENS.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapControlBtn} activeOpacity={0.8}>
                  <Layers size={18} color={TOKENS.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* Center Pulsing Target Pin */}
              <View style={styles.centerPinContainer}>
                <View style={styles.outerPulse} />
                <View style={styles.innerPulse} />
                <View style={styles.pinIconBox}>
                  <MapPin size={22} color="#ffffff" />
                </View>
                <View style={styles.groundShadowDot} />
              </View>

              {/* Live Calibrated GPS readout banner */}
              <View style={[styles.gpsReadoutBar, isRtl && styles.rtlRow]}>
                <View style={[styles.gpsReadoutLeft, isRtl && styles.rtlRow]}>
                  <View style={styles.gpsIconCircle}>
                    <Crosshair size={14} color={TOKENS.colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.gpsReadoutTitle}>
                      {isRtl ? 'شوێن دۆزراوەتەوە (قوفڵکراو)' : 'GPS Locked & Calibrated'}
                    </Text>
                    <Text style={styles.gpsAccuracy}>Accuracy: within 2.4 meters</Text>
                  </View>
                </View>
                <View style={styles.rooftopPill}>
                  <Text style={styles.rooftopPillText}>Rooftop Mode</Text>
                </View>
              </View>
            </View>

            {/* Location Details Card */}
            <View style={styles.detailsCard}>
              <View style={[styles.detailsHeader, isRtl && styles.rtlRow]}>
                <View style={[styles.detailsLocation, isRtl && styles.rtlRow]}>
                  <MapPin size={20} color={TOKENS.colors.primary} />
                  <View>
                    <Text style={styles.detailsCity}>{city} - {district}</Text>
                    <Text style={styles.detailsRegion}>Duhok Governorate, Kurdistan Region</Text>
                  </View>
                </View>
              </View>

              {/* Coordinate pill */}
              <View style={[styles.coordPill, isRtl && styles.rtlRow]}>
                <Text style={styles.coordText}>📍 {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</Text>
                <View style={styles.readyTag}>
                  <CheckCircle size={12} color={TOKENS.colors.secondary} />
                  <Text style={styles.readyText}>Ready</Text>
                </View>
              </View>
            </View>

            {/* Building / Landmark Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isRtl ? 'خاڵی دیاریکراوی بینا / سەربان' : 'Building / Rooftop Landmark Note'}
              </Text>
              <View style={[styles.inputWrapper, isRtl && styles.rtlRow]}>
                <TextInput
                  style={styles.textInput}
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="e.g., Near Zakho Grand Mosque, 3rd floor rooftop access"
                  placeholderTextColor={TOKENS.colors.outline}
                />
                <TouchableOpacity style={styles.micBtn}>
                  <Mic size={18} color={TOKENS.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* COD Trust & Encryption Notice */}
            <View style={styles.trustBanner}>
              <ShieldCheck size={20} color={TOKENS.colors.primary} />
              <Text style={styles.trustText}>
                {isRtl
                  ? 'شوێنەکەت بە پارێزراوی کۆد دەکرێت تەنها بۆ شۆفێری گەیاندن. پارەدان تەنها لە کاتی پشکنینی ڕاستەقینە دەبێت.'
                  : 'Your rooftop location is encrypted for verified 3PL couriers only. 100% Cash payment is collected strictly upon doorstep inspection.'}
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.88}
              disabled={isUnlocking}
            >
              <LockOpen size={20} color="#ffffff" />
              <Text style={styles.saveBtnText}>
                {isUnlocking
                  ? 'Unlocking Bidding Ecosystem...'
                  : isRtl
                  ? 'پاشەکەوتکردنی پین و کردنەوەی موزایەدە'
                  : 'Save Delivery Pin & Unlock Bidding'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.instantTag}>
              Instant Activation • 100% COD Guaranteed Ecosystem
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
    backgroundColor: 'rgba(25, 28, 30, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderTopLeftRadius: TOKENS.borderRadius.xxl,
    borderTopRightRadius: TOKENS.borderRadius.xxl,
    maxHeight: '90%',
    paddingTop: TOKENS.spacing.md,
    ...TOKENS.shadows.modal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.lg,
    paddingBottom: TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.surfaceContainerHigh,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: TOKENS.colors.onSurface,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${TOKENS.colors.secondary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: TOKENS.borderRadius.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  subtitle: {
    fontSize: 11,
    color: TOKENS.colors.onSurfaceVariant,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: TOKENS.spacing.lg,
    gap: TOKENS.spacing.md,
  },
  mapViewport: {
    height: 220,
    borderRadius: TOKENS.borderRadius.xl,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  gridHLine1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#94a3b8',
  },
  gridHLine2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#94a3b8',
  },
  gridVLine1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#94a3b8',
  },
  gridVLine2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#94a3b8',
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 8,
    zIndex: 10,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...TOKENS.shadows.card,
  },
  centerPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 40, 142, 0.2)',
  },
  innerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 40, 142, 0.35)',
  },
  pinIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TOKENS.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...TOKENS.shadows.glowPrimary,
  },
  groundShadowDot: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginTop: 4,
  },
  gpsReadoutBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: TOKENS.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpsReadoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${TOKENS.colors.secondary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsReadoutTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  gpsAccuracy: {
    fontSize: 10,
    color: TOKENS.colors.onSurfaceVariant,
  },
  rooftopPill: {
    backgroundColor: TOKENS.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: TOKENS.borderRadius.sm,
  },
  rooftopPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: TOKENS.colors.onPrimaryFixed,
  },
  detailsCard: {
    backgroundColor: TOKENS.colors.surfaceContainerLow,
    borderRadius: TOKENS.borderRadius.xl,
    padding: TOKENS.spacing.md,
    gap: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsCity: {
    fontSize: 14,
    fontWeight: '700',
    color: TOKENS.colors.onSurface,
  },
  detailsRegion: {
    fontSize: 11,
    color: TOKENS.colors.onSurfaceVariant,
  },
  coordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.md,
  },
  coordText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: TOKENS.colors.onSurfaceVariant,
  },
  readyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TOKENS.colors.onSurfaceVariant,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    borderRadius: TOKENS.borderRadius.lg,
    borderWidth: 1,
    borderColor: TOKENS.colors.outlineVariant,
    paddingHorizontal: 12,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: TOKENS.colors.onSurface,
  },
  micBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${TOKENS.colors.primary}10`,
    padding: TOKENS.spacing.md,
    borderRadius: TOKENS.borderRadius.lg,
  },
  trustText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: TOKENS.colors.primary,
  },
  footerContainer: {
    padding: TOKENS.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.surfaceContainerHigh,
    backgroundColor: TOKENS.colors.surfaceContainerLowest,
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TOKENS.colors.primary,
    height: 52,
    borderRadius: TOKENS.borderRadius.full,
    ...TOKENS.shadows.card,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  instantTag: {
    fontSize: 10,
    textAlign: 'center',
    color: TOKENS.colors.outline,
  },
});
