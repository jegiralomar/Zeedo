'use client';

import React from 'react';
import {
  Gavel,
  ShieldCheck,
  Truck,
  MessageCircle,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LandingFeaturesProps {
  lang: 'ar' | 'ckb' | 'en';
  t: {
    featuresBadge: string;
    featuresTitle: string;
    featuresSubtitle: string;
    f1Title: string;
    f1Desc: string;
    f1Tag: string;
    f2Title: string;
    f2Desc: string;
    f2Tag: string;
    f3Title: string;
    f3Desc: string;
    f3Tag: string;
    f4Title: string;
    f4Desc: string;
    f4Tag: string;
  };
}

export function LandingFeatures({ lang, t }: LandingFeaturesProps) {
  const isRtl = lang === 'ar' || lang === 'ckb';

  const features = [
    {
      icon: Gavel,
      color: '#F83758',
      bgColor: '#FFF0F2',
      tag: t.f1Tag,
      title: t.f1Title,
      description: t.f1Desc,
      highlight: 'Anti-Sniping Engine',
    },
    {
      icon: Truck,
      color: '#4392F9',
      bgColor: '#EBF3FF',
      tag: t.f2Tag,
      title: t.f2Title,
      description: t.f2Desc,
      highlight: 'Doorstep Inspection',
    },
    {
      icon: ShieldCheck,
      color: '#F8991D',
      bgColor: '#FFF8E7',
      tag: t.f3Tag,
      title: t.f3Title,
      description: t.f3Desc,
      highlight: '100% Genuine Brands',
    },
    {
      icon: MessageCircle,
      color: '#00E599',
      bgColor: '#E6FAF3',
      tag: t.f4Tag,
      title: t.f4Title,
      description: t.f4Desc,
      highlight: 'Instant WhatsApp Alerts',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[#F9FAFB] relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#4392F9]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#F83758]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F83758]" />
            <span className="text-xs font-black uppercase tracking-wider font-['Montserrat']">
              {t.featuresBadge}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17223B] tracking-tight">
            {t.featuresTitle}
          </h2>

          <p className="text-base text-slate-600 font-medium">
            {t.featuresSubtitle}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={idx}
                className="group p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                      style={{ backgroundColor: feat.bgColor }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: feat.color }} />
                    </div>
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: feat.bgColor, color: feat.color }}
                    >
                      {feat.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-lg font-black text-[#17223B] group-hover:text-[#F83758] transition-colors leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                {/* Footer Highlight Pill */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{feat.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
