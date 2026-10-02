import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Compass,
  Building2,
  Sparkles,
} from 'lucide-react-native';
import { AppTheme } from '../theme/colors';
import { DeliveryLocation } from '../types';

export const IRAQI_GOVERNORATES = [
  { id: 'baghdad', nameAr: 'بغداد', nameEn: 'Baghdad', lat: 33.3152, lng: 44.3661 },
  { id: 'erbil', nameAr: 'أربيل', nameEn: 'Erbil', lat: 36.1901, lng: 44.0091 },
  { id: 'basra', nameAr: 'البصرة', nameEn: 'Basra', lat: 30.5085, lng: 47.7804 },
  { id: 'sulaymaniyah', nameAr: 'السليمانية', nameEn: 'Sulaymaniyah', lat: 35.5612, lng: 45.4373 },
  { id: 'najaf', nameAr: 'النجف الأشرف', nameEn: 'Najaf', lat: 31.9961, lng: 44.3317 },
  { id: 'karbala', nameAr: 'كربلاء المقدسة', nameEn: 'Karbala', lat: 32.6160, lng: 44.0249 },
  { id: 'duhok', nameAr: 'دهوك', nameEn: 'Duhok', lat: 36.8679, lng: 42.9885 },
  { id: 'kirkuk', nameAr: 'كركوك', nameEn: 'Kirkuk', lat: 35.4681, lng: 44.3922 },
  { id: 'nineveh', nameAr: 'نينوى (الموصل)', nameEn: 'Nineveh (Mosul)', lat: 36.3489, lng: 43.1577 },
  { id: 'babil', nameAr: 'بابل (الحلة)', nameEn: 'Babil (Hillah)', lat: 32.4637, lng: 44.4305 },
  { id: 'dhi_qar', nameAr: 'ذي قار (الناصرية)', nameEn: 'Dhi Qar (Nasiriyah)', lat: 31.0579, lng: 46.2573 },
  { id: 'maysan', nameAr: 'ميسان (العمارة)', nameEn: 'Maysan (Amarah)', lat: 31.8414, lng: 47.1444 },
  { id: 'anbar', nameAr: 'الأنبار (الرمادي)', nameEn: 'Anbar (Ramadi)', lat: 33.4234, lng: 43.2982 },
  { id: 'diyala', nameAr: 'ديالى (بعقوبة)', nameEn: 'Diyala (Baqubah)', lat: 33.7463, lng: 44.6433 },
  { id: 'wasit', nameAr: 'واسط (الكوت)', nameEn: 'Wasit (Kut)', lat: 32.5129, lng: 45.8183 },
  { id: 'diwaniyah', nameAr: 'الديوانية (القادسية)', nameEn: 'Diwaniyah', lat: 31.9929, lng: 44.9248 },
  { id: 'muthanna', nameAr: 'المثنى (السماوة)', nameEn: 'Muthanna (Samawah)', lat: 31.3120, lng: 45.2818 },
  { id: 'salah_al_din', nameAr: 'صلاح الدين (تكريت)', nameEn: 'Salah al-Din (Tikrit)', lat: 34.6062, lng: 43.6783 },
];

const DEFAULT_CITY = IRAQI_GOVERNORATES[0]; // Baghdad

interface LocationPickerStepProps {
  isRtl: boolean;
  onConfirm: (loc: DeliveryLocation) => void;
  isSaving: boolean;
  initialLocation?: DeliveryLocation;
  onSkip?: () => void;
}

// ─── Reverse Geocoding via Nominatim (Free, no API key required) ──────────────
async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
      { headers: { 'User-Agent': 'ZeedoBidApp/1.0 (support@zeedo.auction)' } }
    );
    if (!res.ok) throw new Error('Reverse geocode error');
    const data = await res.json();
    const addr = data.address || {};
    const city =
      addr.city || addr.town || addr.county || addr.state || 'العراق';
    const neighbourhood = addr.suburb || addr.neighbourhood || addr.road || '';
    const address = neighbourhood ? `${neighbourhood}، ${city}` : city;
    return { address, city };
  } catch (_) {
    return { address: '', city: 'العراق' };
  }
}

// ─── Web Leaflet Map (Browser Only) ──────────────────────────────────────────
function WebMapFallback({
  pin,
  onTap,
}: {
  pin: { lat: number; lng: number } | null;
  onTap: (lat: number, lng: number) => void;
}) {
  const iframeRef = useRef<any>(null);
  const pinLat = pin?.lat ?? DEFAULT_CITY.lat;
  const pinLng = pin?.lng ?? DEFAULT_CITY.lng;

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
  var map = L.map('map').setView([${pinLat},${pinLng}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);

  var pinIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;background:#F83758;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
    iconSize:[28,28],
    iconAnchor:[14,28]
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
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
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
  onSkip,
}) => {
  const [selectedCity, setSelectedCity] = useState(
    initialLocation?.city || DEFAULT_CITY.nameAr
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat ?? DEFAULT_CITY.lat,
    lng: initialLocation?.lng ?? DEFAULT_CITY.lng,
  });
  const [detailedAddress, setDetailedAddress] = useState(
    initialLocation?.address || ''
  );
  const [isLocating, setIsLocating] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(Boolean(initialLocation?.lat));
  const [gpsStatusText, setGpsStatusText] = useState('');

  // Auto-detect GPS coordinates safely on mobile/web
  const handleAutoDetectGps = async () => {
    setIsLocating(true);
    setGpsStatusText(isRtl ? 'جاري الاتصال بالقمر الصناعي...' : 'Connecting to GPS...');

    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setGpsStatusText(isRtl ? 'GPS غير مدعوم في هذا المتصفح' : 'Geolocation not supported');
          setIsLocating(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setCoords({ lat, lng });
            setGpsSuccess(true);
            const res = await reverseGeocode(lat, lng);
            if (res.city && res.city !== 'العراق') setSelectedCity(res.city);
            if (res.address) setDetailedAddress(res.address);
            setGpsStatusText(isRtl ? 'تم تحديد موقعك بدقة عالية' : 'GPS location pinned');
            setIsLocating(false);
          },
          (err) => {
            setGpsStatusText(isRtl ? 'تعذر جلب إحداثيات GPS' : 'GPS signal unavailable');
            setIsLocating(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        // Native Expo Location
        let expoLoc: any = null;
        try {
          expoLoc = require('expo-location');
        } catch (_) {}

        if (expoLoc && expoLoc.requestForegroundPermissionsAsync) {
          const { status } = await expoLoc.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await expoLoc.getCurrentPositionAsync({
              accuracy: expoLoc.Accuracy?.Balanced ?? 3,
            });
            const { latitude: lat, longitude: lng } = pos.coords;
            setCoords({ lat, lng });
            setGpsSuccess(true);
            const res = await reverseGeocode(lat, lng);
            if (res.city && res.city !== 'العراق') setSelectedCity(res.city);
            if (res.address) setDetailedAddress(res.address);
            setGpsStatusText(isRtl ? 'تم تحديد موقعك بدقة عالية' : 'GPS location pinned');
          } else {
            setGpsStatusText(
              isRtl
                ? 'يرجى تفعيل صلاحية الموقع من الإعدادات'
                : 'Location permission not granted'
            );
          }
        }
        setIsLocating(false);
      }
    } catch (e: any) {
      setGpsStatusText(isRtl ? 'تعذر جلب إحداثيات GPS' : 'GPS signal unavailable');
      setIsLocating(false);
    }
  };

  const handleSelectGovernorate = (gov: typeof IRAQI_GOVERNORATES[0]) => {
    setSelectedCity(isRtl ? gov.nameAr : gov.nameEn);
    setCoords({ lat: gov.lat, lng: gov.lng });
  };

  const handleConfirm = () => {
    const finalCity = selectedCity.trim() || 'بغداد';
    const finalAddress = detailedAddress.trim() || (isRtl ? `توصيل مباشر - ${finalCity}` : `Direct Delivery - ${finalCity}`);
    onConfirm({
      lat: coords.lat,
      lng: coords.lng,
      city: finalCity,
      address: finalAddress,
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Header Banner */}
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <MapPin size={22} color="#FFFFFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, isRtl && styles.rtl]}>
            {isRtl ? 'حدد عنوان استلام المزايدة' : 'Set Doorstep Delivery Address'}
          </Text>
          <Text style={[styles.subtitle, isRtl && styles.rtl]}>
            {isRtl
              ? 'تصلك السلع إلى باب منزلك مع ميزة الفحص والمعاينة قبل الدفع'
              : 'Direct doorstep delivery with inspection before payment'}
          </Text>
        </View>
      </View>

      {/* 2. GPS Auto-Pin Card */}
      <View style={styles.gpsCard}>
        <View style={styles.gpsCardTop}>
          <View style={styles.gpsBeaconRow}>
            <View style={[styles.beaconDot, gpsSuccess && styles.beaconDotActive]} />
            <Text style={styles.beaconText}>
              {gpsSuccess
                ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`
                : (isRtl ? 'نظام تحديد المواقع GPS' : 'GPS Satellite Navigation')}
            </Text>
          </View>
          <View style={styles.badgeCity}>
            <Building2 size={12} color="#059669" />
            <Text style={styles.badgeCityText}>{selectedCity}</Text>
          </View>
        </View>

        {gpsStatusText ? (
          <Text style={[styles.gpsStatusNotice, isRtl && styles.rtl]}>
            {gpsStatusText}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.gpsAutoBtn, isLocating && styles.gpsAutoBtnDisabled]}
          onPress={handleAutoDetectGps}
          disabled={isLocating}
          activeOpacity={0.85}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.gpsAutoBtnContent}>
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.gpsAutoBtnText}>
                {isRtl
                  ? '📍 تحديد موقعي الحالي تلقائياً عبر GPS'
                  : '📍 Auto-Pin Current Location via GPS'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Web Interactive Leaflet Map (Browser Only) */}
      {Platform.OS === 'web' && (
        <View style={styles.webMapWrapper}>
          <WebMapFallback
            pin={coords}
            onTap={(lat, lng) => {
              setCoords({ lat, lng });
              setGpsSuccess(true);
              reverseGeocode(lat, lng).then((r) => {
                if (r.city && r.city !== 'العراق') setSelectedCity(r.city);
                if (r.address) setDetailedAddress(r.address);
              });
            }}
          />
        </View>
      )}

      {/* 4. Governorate / City Quick Chips */}
      <View style={styles.sectionBlock}>
        <View style={[styles.sectionHeaderRow, isRtl && styles.sectionHeaderRowRtl]}>
          <Compass size={16} color={AppTheme.colors.primary} />
          <Text style={styles.sectionLabel}>
            {isRtl ? 'اختر المحافظة / المدينة' : 'Select Governorate'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsScroll, isRtl && styles.chipsScrollRtl]}
        >
          {IRAQI_GOVERNORATES.map((gov) => {
            const isSelected = selectedCity.includes(gov.nameAr) || selectedCity.includes(gov.nameEn);
            return (
              <TouchableOpacity
                key={gov.id}
                onPress={() => handleSelectGovernorate(gov)}
                style={[styles.cityChip, isSelected && styles.cityChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                  {isRtl ? gov.nameAr : gov.nameEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Detailed Street / Landmark Address Input */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>
          {isRtl ? 'المنطقة، الشارع وأقرب نقطة دالة' : 'District, Street & Landmark'}
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            value={detailedAddress}
            onChangeText={setDetailedAddress}
            placeholder={
              isRtl
                ? 'مثال: المنصور، شارع 14 رمضان، قرب صيدلية...'
                : 'e.g. Mansour, 14th Ramadan St, near...'
            }
            placeholderTextColor="#94A3B8"
            style={[styles.textInput, isRtl && styles.rtl]}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* 6. Guarantee Assurance Notice */}
      <View style={styles.assuranceBox}>
        <CheckCircle2 size={16} color="#059669" />
        <Text style={styles.assuranceText}>
          {isRtl
            ? 'مندوب زيدو يقوم بتسليم الشحنة لعنوانك مباشرة مع إتاحة الفحص عند الباب'
            : 'Courier delivers straight to your doorstep with full inspection rights'}
        </Text>
      </View>

      {/* 7. Action Buttons: Confirm & Skip */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.confirmBtn, isSaving && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={isSaving}
          activeOpacity={0.88}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.confirmBtnInner}>
              <Text style={styles.confirmBtnText}>
                {isRtl ? 'تأكيد العنوان والدخول' : 'Confirm Address & Enter'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {onSkip && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onSkip}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.skipBtnText}>
              {isRtl ? 'تخطي الآن والمتابعة لاحقاً' : 'Skip for now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 24,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
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
  gpsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  gpsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpsBeaconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beaconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  beaconDotActive: {
    backgroundColor: '#10B981',
  },
  beaconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  badgeCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCityText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  gpsStatusNotice: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  gpsAutoBtn: {
    backgroundColor: AppTheme.colors.primary,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsAutoBtnDisabled: {
    opacity: 0.65,
  },
  gpsAutoBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsAutoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  webMapWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderRowRtl: {
    flexDirection: 'row-reverse',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chipsScrollRtl: {
    flexDirection: 'row-reverse',
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cityChipActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  cityChipTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    minHeight: 46,
  },
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  assuranceText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 8,
    marginTop: 4,
  },
  confirmBtn: {
    backgroundColor: AppTheme.colors.primary,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
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
  skipBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
