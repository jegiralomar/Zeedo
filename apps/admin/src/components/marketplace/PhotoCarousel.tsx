'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

interface PhotoCarouselProps {
  images: string[];
  title: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  images = [],
  title,
  className = '',
  aspectRatio = 'square',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[4/3]',
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Main Image Stage */}
      <div className={`relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs group ${aspectClasses[aspectRatio]}`}>
        <img
          src={displayImages[currentIndex]}
          alt={`${title} - image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Zoom Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(true);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/60 text-slate-700 flex items-center justify-center shadow-xs transition-transform active:scale-95"
          title="Fullscreen High-Res Zoom"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Carousel Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/60 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/60 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Bottom Indicator Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
            {displayImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-5 bg-white shadow-xs'
                    : 'w-1.5 bg-white/50 backdrop-blur-xs'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Row if more than 1 image */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex
                  ? 'border-blue-600 scale-95 shadow-xs'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-4xl max-h-[85vh] relative">
            <img
              src={displayImages[currentIndex]}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
