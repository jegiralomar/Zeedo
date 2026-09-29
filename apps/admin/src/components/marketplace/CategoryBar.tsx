'use client';

import React from 'react';
import {
  Layers,
  Smartphone,
  Watch,
  Gamepad2,
  Laptop,
  Wrench,
  Car,
  Headphones,
} from 'lucide-react';
import { MobileAuctionItem } from '@/types/marketplace';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  auctions: MobileAuctionItem[];
  isRtl?: boolean;
}

export const CATEGORIES = [
  { id: 'All', labelEn: 'All Items', labelKu: 'هەموو کاڵاکان', labelAr: 'جميع المعروضات', icon: Layers },
  { id: 'Smartphones', labelEn: 'Smartphones', labelKu: 'مۆبایل و تابلێت', labelAr: 'هواتف وأجهزة', icon: Smartphone },
  { id: 'Watches', labelEn: 'Luxury Watches', labelKu: 'کاتژمێری لوکس', labelAr: 'ساعات فاخرة', icon: Watch },
  { id: 'Gaming', labelEn: 'Gaming & PS5', labelKu: 'گیمینگ و کۆنسۆڵ', labelAr: 'ألعاب وبلايستيشن', icon: Gamepad2 },
  { id: 'Computers', labelEn: 'Laptops', labelKu: 'لاپتۆپ و کۆمپیوتەر', labelAr: 'حواسيب ولابتوب', icon: Laptop },
  { id: 'Heavy Tools & Machinery', labelEn: 'Heavy Tools', labelKu: 'ئامێری پیشەسازی', labelAr: 'معدات صناعية', icon: Wrench },
  { id: 'Vehicles & Parts', labelEn: 'Vehicles', labelKu: 'ئۆتۆمبێل و پارچە', labelAr: 'سيارات وقطع', icon: Car },
  { id: 'Consumer Electronics', labelEn: 'Audio & Tech', labelKu: 'دەنگ و ئەلکترۆنیات', labelAr: 'صوتيات وتقنيات', icon: Headphones },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  auctions,
  isRtl = false,
}) => {
  const getCategoryCount = (catId: string) => {
    if (catId === 'All') return auctions.length;
    return auctions.filter((a) => a.category === catId || (catId === 'Watches' && a.category?.includes('Watch'))).length;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 scale-102'
                  : 'bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{isRtl ? cat.labelKu : cat.labelEn}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
