'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  X,
  Compass,
  Building2,
  Home,
  Loader2,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { RooftopPin } from '@/types/marketplace';

// Dynamic import with ssr: false to prevent Next.js SSR window access
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[320px] sm:min-h-[380px] bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-500 rounded-2xl">
      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
      <span className="text-xs font-semibold">Loading interactive map...</span>
    </div>
  ),
});

export const IRAQ_MAJOR_CITIES = [
  { name: 'Erbil', nameAr: 'أربيل', nameKu: 'هەولێر', lat: 36.1911, lng: 44.0092 },
  { name: 'Baghdad', nameAr: 'بغداد', nameKu: 'بەغدا', lat: 33.3152, lng: 44.3661 },
  { name: 'Sulaymaniyah', nameAr: 'السليمانية', nameKu: 'سلێمانی', lat: 35.5668, lng: 45.4161 },
  { name: 'Basra', nameAr: 'البصرة', nameKu: 'بەسرە', lat: 30.5085, lng: 47.8105 },
  { name: 'Duhok', nameAr: 'دهوك', nameKu: 'دهۆك', lat: 36.8679, lng: 42.9885 },
  { name: 'Kirkuk', nameAr: 'كركوك', nameKu: 'كەركووك', lat: 35.4681, lng: 44.3922 },
  { name: 'Najaf', nameAr: 'النجف', nameKu: 'نەجەف', lat: 31.9961, lng: 44.3308 },
  { name: 'Karbala', nameAr: 'كربلاء', nameKu: 'كەربەلا', lat: 32.6160, lng: 44.0249 },
];

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSaved?: (pin: RooftopPin) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialCity?: string;
  initialDistrict?: string;
  initialLandmark?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSaved,
  initialLatitude,
  initialLongitude,
  initialCity,
  initialDistrict,
  initialLandmark,
}) => {
  const { language, buyer, completeGate2 } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  // Initial values from buyer store or props or fallback to Erbil
  const existingPin = buyer?.rooftopPin;
  const [lat, setLat] = useState<number>(
    initialLatitude || existingPin?.latitude || 36.1911
  );
  const [lng, setLng] = useState<number>(
    initialLongitude || existingPin?.longitude || 44.0092
  );
  const [city, setCity] = useState<string>(
    initialCity || existingPin?.city || buyer?.city || 'Erbil'
  );
  const [district, setDistrict] = useState<string>(
    initialDistrict || existingPin?.district || ''
  );
  const [landmark, setLandmark] = useState<string>(
    initialLandmark || existingPin?.landmark || ''
  );

  const [jumpTarget, setJumpTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Refresh state from latest store if reopened
      const pin = buyer?.rooftopPin;
      if (pin) {
        setLat(pin.latitude);
        setLng(pin.longitude);
        setCity(pin.city);
        setDistrict(pin.district || '');
        setLandmark(pin.landmark || '');
      }
    }
  }, [isOpen, buyer?.rooftopPin]);

  if (!isOpen) return null;

  // Handle marker drag / map click
  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setGpsStatus(null);

    // Optional reverse geocoding via OpenStreetMap Nominatim with debouncing
    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(async () => {
      try {
        setIsReverseGeocoding(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': language === 'ar' ? 'ar' : language === 'ckb' || language === 'badini' ? 'ku' : 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const detectedCity =
              data.address.city ||
              data.address.town ||
              data.address.state ||
              data.address.county;
            const detectedDistrict =
              data.address.suburb ||
              data.address.neighbourhood ||
              data.address.road ||
              data.address.quarter;

            if (detectedCity && !city) setCity(detectedCity);
            if (detectedDistrict && !district) setDistrict(detectedDistrict);
          }
        }
      } catch {
        // Silently ignore reverse geocode failures
      } finally {
        setIsReverseGeocoding(false);
      }
    }, 600);
  };

  // Jump to specific city
  const handleSelectCity = (c: (typeof IRAQ_MAJOR_CITIES)[0]) => {
    setCity(c.name);
    setLat(c.lat);
    setLng(c.lng);
    setJumpTarget({ lat: c.lat, lng: c.lng });
  };

  // Detect current GPS position via browser Geolocation API
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by your browser.');
      return;
    }

    setLocatingGps(true);
    setGpsStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 15);

        setLat(userLat);
        setLng(userLng);
        setJumpTarget({ lat: userLat, lng: userLng });
        setLocatingGps(false);
        setGpsStatus(`GPS detected (Accuracy ±${accuracy}m)`);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setLocatingGps(false);
        setGpsStatus('Could not access GPS. Please pick a city or click on the map.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Save location and finalize Gate 2
  const handleConfirmLocation = () => {
    const formattedAddress = [landmark, district, city, 'Iraq']
      .filter(Boolean)
      .join(', ');

    const newPin: RooftopPin = {
      latitude: lat,
      longitude: lng,
      city: city.trim() || 'Erbil',
      district: district.trim(),
      landmark: landmark.trim(),
      addressText: formattedAddress,
      isVerified: true,
    };

    // Store in Zustand buyer store
    completeGate2(newPin);

    // Call optional callback
    if (onLocationSaved) {
      onLocationSaved(newPin);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {language === 'ar'
                    ? 'تحديد موقع التوصيل'
                    : language === 'ckb'
                    ? 'دیاریکردنی شوێنی گەیاندن'
                    : language === 'badini'
                    ? 'دەستنیشانکرنا جهێ گەهاندنێ'
                    : 'Select Delivery Location'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Interactive Map
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'اسحب الدبوس أو انقر على الخريطة لتثبيت موقع استلام الطرد بدقة'
                  : language === 'ckb'
                  ? 'پینەکە ڕابکێشە یان پەنجە بنێ بە نەخشەکە بۆ دیاریکردنی شوێنی ماڵ'
                  : language === 'badini'
                  ? 'پینێ ڕابکێشە یان پەنجێ ل نەخشەی بدە دا جهێ گەهاندنێ ب دروستی دیاربیت'
                  : 'Drag pin or tap anywhere on the map to pin your exact doorstep.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick City Jump Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المدن:' : language === 'ckb' ? 'شارەکان:' : 'Cities:'}</span>
          </span>
          {IRAQ_MAJOR_CITIES.map((c) => {
            const isSelected = city.toLowerCase() === c.name.toLowerCase();
            const label =
              language === 'ar'
                ? c.nameAr
                : language === 'ckb' || language === 'badini'
                ? c.nameKu
                : c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCity(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Interactive Map Area */}
        <div className="relative w-full h-[280px] sm:h-[340px] bg-slate-100 border-b border-slate-200">
          <LeafletMapInner
            latitude={lat}
            longitude={lng}
            onLocationChange={handleLocationChange}
            jumpTarget={jumpTarget}
            className="w-full h-full"
          />

          {/* Floating GPS Button & Live Coordinates Overlay */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={locatingGps}
              className="px-3.5 py-2 bg-white/95 hover:bg-white text-emerald-800 hover:text-emerald-900 rounded-xl text-xs font-extrabold shadow-md border border-emerald-200 flex items-center gap-2 backdrop-blur-md transition-all active:scale-95"
              title="Detect device GPS coordinates"
            >
              {locatingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>
                {locatingGps
                  ? (language === 'ar' ? 'جارٍ تحديد GPS...' : 'Locating GPS...')
                  : (language === 'ar' ? 'موقعي الحالي (GPS)' : language === 'ckb' ? 'شوێنی ئێستام (GPS)' : 'Locate Me (GPS)')}
              </span>
            </button>
          </div>

          {/* Bottom Map Info Strip */}
          <div className="absolute bottom-2 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
              {isReverseGeocoding && (
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
              )}
            </div>
            {gpsStatus && (
              <div className="bg-emerald-700/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg font-medium shadow-md">
                {gpsStatus}
              </div>
            )}
          </div>
        </div>

        {/* Address Confirmation Inputs Form */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'ar'
                  ? 'المحافظة / المدينة'
                  : language === 'ckb'
                  ? 'پارێزگا / شار'
                  : language === 'badini'
                  ? 'پارێزگەهـ / باژێر'
                  : 'Governorate / City'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Erbil, Baghdad, Sulaymaniyah"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'ar'
                  ? 'القضاء / الحي / المنطقة'
                  : language === 'ckb'
                  ? 'قەزا / گەڕەک'
                  : language === 'badini'
                  ? 'قەزا / تاخ'
                  : 'District / Neighborhood'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Gulan, Empire World, Bakhtiyari"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Home className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {language === 'ar'
                ? 'أقرب نقطة دالة (معلم مميز)'
                : language === 'ckb'
                ? 'نزیکترین شوێنی ناسراو'
                : language === 'badini'
                ? 'نێزیکترین جهێ بەرنیاس'
                : 'Nearest Landmark'}
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder={t.landmarkPlaceholder}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleConfirmLocation}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {language === 'ar'
                ? 'تأكيد وحفظ موقع التوصيل'
                : language === 'ckb'
                ? 'تەئکیدکردن و پاشەکەوتی شوێن'
                : language === 'badini'
                ? 'تەئکیدکرن و پاراستنا جهی'
                : 'Confirm & Pin Location'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
