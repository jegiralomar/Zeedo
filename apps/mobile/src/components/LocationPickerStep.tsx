import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { MapPin, Navigation, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { AppTheme } from '../theme/colors';
import { DeliveryLocation } from '../types';

// ─── Conditional imports for native vs web ───────────────────────────────────
let MapView: any = null;
let Marker: any = null;
let ExpoLocation: any = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    ExpoLocation = require('expo-location');
  } catch (_) {}
}

// ─── Iraq bounds (Baghdad center as default) ─────────────────────────────────
const BAGHDAD = { latitude: 33.3152, longitude: 44.3661 };
const INITIAL_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };

interface LocationPickerStepProps {
  isRtl: boolean;
  onConfirm: (loc: DeliveryLocation) => void;
  isSaving: boolean;
  initialLocation?: DeliveryLocation;
}

// ─── Reverse Geocoding via Nominatim (free, no API key) ──────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
      { headers: { 'User-Agent': 'ZeedoApp/1.0' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const city =
      addr.city || addr.town || addr.county || addr.state || 'العراق';
    const neighbourhood = addr.suburb || addr.neighbourhood || addr.road || '';
    const address = neighbourhood ? `${neighbourhood}، ${city}` : city;
    return { address, city };
  } catch (_) {
    return { address: 'العراق', city: 'العراق' };
  }
}

// ─── Web Fallback Map (using Leaflet via WebView-like iframe) ─────────────────
function WebMapFallback({
  pin,
  onTap,
}: {
  pin: { lat: number; lng: number } | null;
  onTap: (lat: number, lng: number) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pinLat = pin?.lat ?? BAGHDAD.latitude;
  const pinLng = pin?.lng ?? BAGHDAD.longitude;

  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>
</head><body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${pinLat},${pinLng}], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);

  var pinIcon = L.divIcon({
    className: '',
    html: '<div style="width:32px;height:32px;background:#7C3AED;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
    iconSize:[32,32],
    iconAnchor:[16,32]
  });

  var marker = L.marker([${pinLat},${pinLng}], {icon: pinIcon, draggable: false}).addTo(map);

  map.on('click', function(e){
    marker.setLatLng(e.latlng);
    window.parent.postMessage({type:'TAP',lat:e.latlng.lat,lng:e.latlng.lng},'*');
  });
</script>
</body></html>`;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'TAP') {
        onTap(e.data.lat, e.data.lng);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onTap]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const LocationPickerStep: React.FC<LocationPickerStepProps> = ({
  isRtl,
  onConfirm,
  isSaving,
  initialLocation,
}) => {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
  );
  const [region, setRegion] = useState({
    latitude: initialLocation?.lat ?? BAGHDAD.latitude,
    longitude: initialLocation?.lng ?? BAGHDAD.longitude,
    ...INITIAL_DELTA,
  });
  const [geocodedAddress, setGeocodedAddress] = useState<{ address: string; city: string } | null>(
    initialLocation
      ? { address: initialLocation.address, city: initialLocation.city }
      : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-detect GPS on mount only if no initial location
  useEffect(() => {
    if (!initialLocation) {
      autoDetectLocation();
    }
  }, []);

  const autoDetectLocation = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) return;
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: lat, longitude: lng } = pos.coords;
              setRegion({ latitude: lat, longitude: lng, ...INITIAL_DELTA });
              placePinAt(lat, lng);
              resolve();
            },
            () => resolve(),
            { timeout: 8000 }
          );
        });
      } else if (ExpoLocation) {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
          const { latitude: lat, longitude: lng } = pos.coords;
          setRegion({ latitude: lat, longitude: lng, ...INITIAL_DELTA });
          placePinAt(lat, lng);
        }
      }
    } catch (_) {
      // Fallback to Baghdad
    } finally {
      setIsLocating(false);
    }
  };

  const placePinAt = (lat: number, lng: number) => {
    setPin({ lat, lng });
    setGeocodedAddress(null);

    // Debounce reverse geocoding
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      setIsGeocoding(true);
      const result = await reverseGeocode(lat, lng);
      setGeocodedAddress(result);
      setIsGeocoding(false);
    }, 600);
  };

  const handleMapPress = (e: any) => {
    const coord = e?.nativeEvent?.coordinate;
    if (coord) {
      placePinAt(coord.latitude, coord.longitude);
      setRegion({ latitude: coord.latitude, longitude: coord.longitude, ...INITIAL_DELTA });
    }
  };

  const handleWebTap = (lat: number, lng: number) => {
    placePinAt(lat, lng);
  };

  const handleConfirm = () => {
    if (!pin || !geocodedAddress) return;
    onConfirm({
      lat: pin.lat,
      lng: pin.lng,
      address: geocodedAddress.address,
      city: geocodedAddress.city,
    });
  };

  const canConfirm = pin && geocodedAddress && !isGeocoding && !isSaving;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <MapPin size={20} color="#FFFFFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, isRtl && styles.rtl]}>
            {isRtl ? 'حدد عنوان التوصيل' : 'Set Delivery Address'}
          </Text>
          <Text style={[styles.subtitle, isRtl && styles.rtl]}>
            {isRtl
              ? 'اضغط على الخريطة لتحديد موقعك بدقة'
              : 'Tap the map to pin your exact location'}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapWrapper}>
        {isLocating && (
          <View style={styles.locatingOverlay}>
            <ActivityIndicator color={AppTheme.colors.primary} size="small" />
            <Text style={styles.locatingText}>
              {isRtl ? 'جاري تحديد موقعك...' : 'Detecting your location...'}
            </Text>
          </View>
        )}

        {Platform.OS === 'web' ? (
          <WebMapFallback pin={pin} onTap={handleWebTap} />
        ) : MapView ? (
          <MapView
            style={styles.map}
            region={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {pin && (
              <Marker
                coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                pinColor={AppTheme.colors.primary}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapUnavailable}>
            <MapPin size={32} color="#94A3B8" />
            <Text style={styles.mapUnavailableText}>Map unavailable</Text>
          </View>
        )}

        {/* GPS Button */}
        <TouchableOpacity style={styles.gpsBtn} onPress={autoDetectLocation} disabled={isLocating}>
          <Navigation size={18} color={AppTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Address Label */}
      <View style={styles.addressBox}>
        {!pin ? (
          <Text style={[styles.addressPlaceholder, isRtl && styles.rtl]}>
            {isRtl ? '👆 اضغط على الخريطة لتحديد موقعك' : '👆 Tap on the map to place your pin'}
          </Text>
        ) : isGeocoding ? (
          <View style={styles.geocodingRow}>
            <ActivityIndicator size="small" color={AppTheme.colors.primary} />
            <Text style={styles.geocodingText}>
              {isRtl ? 'جاري تحديد العنوان...' : 'Looking up address...'}
            </Text>
          </View>
        ) : geocodedAddress ? (
          <View style={[styles.geocodedRow, isRtl && styles.geocodedRowRtl]}>
            <CheckCircle2 size={16} color="#059669" />
            <View style={styles.geocodedTexts}>
              <Text style={[styles.geocodedAddress, isRtl && styles.rtl]}>
                {geocodedAddress.address}
              </Text>
              <Text style={[styles.geocodedCity, isRtl && styles.rtl]}>
                {geocodedAddress.city}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
        onPress={handleConfirm}
        disabled={!canConfirm}
        activeOpacity={0.88}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.confirmBtnInner}>
            <Text style={styles.confirmBtnText}>
              {isRtl ? 'تأكيد الموقع والدخول' : 'Confirm Location & Enter'}
            </Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  rtl: {
    textAlign: 'right',
  },
  mapWrapper: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  locatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  gpsBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 5,
  },
  mapUnavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapUnavailableText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  addressBox: {
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addressPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  geocodingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  geocodingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  geocodedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  geocodedRowRtl: {
    flexDirection: 'row-reverse',
  },
  geocodedTexts: {
    flex: 1,
  },
  geocodedAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  geocodedCity: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: AppTheme.colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  confirmBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
