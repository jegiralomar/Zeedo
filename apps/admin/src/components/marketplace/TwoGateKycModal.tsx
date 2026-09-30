'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  MapPin,
  Navigation,
  FileCheck2,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useBuyerAuthStore } from '@/store/useBuyerAuthStore';
import { TRANSLATIONS, isRTL } from '@/i18n/translations';
import { LocationPickerModal } from './LocationPickerModal';

interface TwoGateKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TwoGateKycModal: React.FC<TwoGateKycModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language, buyer, completeGate2 } = useBuyerAuthStore();
  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  // Delivery Location state
  const [city, setCity] = useState(buyer?.rooftopPin?.city || buyer?.city || 'Erbil');
  const [district, setDistrict] = useState(buyer?.rooftopPin?.district || '');
  const [landmark, setLandmark] = useState(buyer?.rooftopPin?.landmark || '');
  const [latitude, setLatitude] = useState(buyer?.rooftopPin?.latitude || 36.1911);
  const [longitude, setLongitude] = useState(buyer?.rooftopPin?.longitude || 44.0092);
  const [isLocationPinned, setIsLocationPinned] = useState(
    Boolean(buyer?.rooftopPin && buyer.rooftopPin.isVerified)
  );
  const [showLocationModal, setShowLocationModal] = useState(false);

  if (!isOpen) return null;

  const handleConfirmAll = () => {
    if (!isLocationPinned) {
      setShowLocationModal(true);
      return;
    }

    const formattedAddress = [landmark, district, city, 'Iraq']
      .filter(Boolean)
      .join(', ');

    completeGate2({
      latitude,
      longitude,
      city,
      district,
      landmark,
      addressText: formattedAddress,
      isVerified: true,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  const isPhoneVerified = Boolean(buyer?.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.gateModalTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.gateModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* STEP 1: Phone Verification (WhatsApp OTP) */}
          <div className="border border-emerald-300 bg-emerald-50/50 rounded-2xl p-4.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center text-white bg-emerald-600 shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.gate1Title}</h4>
                  <p className="text-xs text-slate-500">{t.gate1Desc}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {buyer?.phone || '+964 750 000 0000'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-200/80 text-emerald-900">
                WhatsApp Verified ✓
              </span>
            </div>
          </div>

          {/* STEP 2: Delivery Location (Interactive Map) */}
          <div
            className={`border rounded-2xl p-4.5 transition-all ${
              isLocationPinned
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center text-white shrink-0 ${
                    isLocationPinned ? 'bg-emerald-600' : 'bg-emerald-600'
                  }`}
                >
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.gate2Title}</h4>
                  <p className="text-xs text-slate-500">{t.gate2Desc}</p>
                </div>
              </div>
              {isLocationPinned && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            </div>

            <div className="mt-4 space-y-3">
              {/* Interactive Map Launch Banner */}
              <div
                onClick={() => setShowLocationModal(true)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/60 p-3.5 transition-all hover:border-emerald-300 hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">
                          {isLocationPinned
                            ? (t.editLocationOnMap || 'Edit Location on Map')
                            : (t.openInteractiveMap || 'Open Interactive Map')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                          Live Leaflet Map
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isLocationPinned
                          ? `${city}${district ? ' • ' + district : ''} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                          : 'Tap to drop and adjust your delivery pin on OpenStreetMap'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLocationModal(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>
                      {isLocationPinned
                        ? (t.changeLocation || 'Change Pin')
                        : (t.setDeliveryLocation || 'Set Location')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Form Fields for Governorate, District & Landmark */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.governorate}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.district}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nearest Landmark / نقطة دالة
                </label>
                <input
                  type="text"
                  value={landmark}
                  placeholder={t.landmarkPlaceholder}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.locateMe}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {isLocationPinned
                ? 'WhatsApp & Location Confirmed ✓'
                : 'Choose your location on map to start bidding'}
            </span>
          </div>
          <button
            onClick={handleConfirmAll}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{isLocationPinned ? t.confirmGates : (t.setDeliveryLocation || 'Set Location on Map')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Modal */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSaved={(pin) => {
          setCity(pin.city);
          setDistrict(pin.district || '');
          setLandmark(pin.landmark || '');
          setLatitude(pin.latitude);
          setLongitude(pin.longitude);
          setIsLocationPinned(true);
        }}
        initialCity={city}
        initialDistrict={district}
        initialLandmark={landmark}
        initialLatitude={latitude}
        initialLongitude={longitude}
      />
    </div>
  );
};

export default TwoGateKycModal;
