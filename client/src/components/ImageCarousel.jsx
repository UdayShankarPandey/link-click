import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageKit';

const ImageCarousel = ({ images = [], className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x or 2x
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const imageList = Array.isArray(images) && images.length > 0
    ? images.map(img => (typeof img === 'string' ? { url: img } : img))
    : [];

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (imageList.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
    setZoomLevel(1);
  }, [imageList.length]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (imageList.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    setZoomLevel(1);
  }, [imageList.length]);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev(e);
      } else if (e.key === 'ArrowRight') {
        handleNext(e);
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handlePrev, handleNext]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      handlePrev();
    }
  };

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 2 : 1));
  };

  if (imageList.length === 0) return null;

  const currentImage = imageList[currentIndex];

  return (
    <>
      {/* Feed / Inline Container */}
      <div
        className={`relative group overflow-hidden bg-surface rounded-2xl border border-border/80 ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden flex items-center justify-center bg-black/40">
          <img
            src={getOptimizedImageUrl(currentImage.url, 800)}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300"
          />

          {/* Top Overlay Badge for image count */}
          {imageList.length > 1 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
              {currentIndex + 1} / {imageList.length}
            </div>
          )}

          {/* Fullscreen Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            aria-label="View Fullscreen Image"
            className="absolute top-3 left-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Navigation Arrows for multi-image */}
          {imageList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Image"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber hover:text-black focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Image"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber hover:text-black focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-amber"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Indicators Dots */}
        {imageList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-2.5 bg-surface/60 border-t border-border/40">
            {imageList.map((img, i) => (
              <button
                key={`dot-slide-${i}-${img.url || i}`}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === currentIndex ? 'w-6 bg-amber' : 'w-2 bg-text-tertiary/40 hover:bg-text-tertiary'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image gallery preview"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setIsFullscreen(false);
            setZoomLevel(1);
          }}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleZoom}
                className="p-2 rounded-xl bg-surface/80 text-text-primary hover:text-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                aria-label={zoomLevel === 1 ? 'Zoom 2x' : 'Reset Zoom'}
                title={zoomLevel === 1 ? 'Zoom 2x' : 'Reset Zoom'}
              >
                {zoomLevel === 1 ? <ZoomIn className="h-5 w-5" /> : <ZoomOut className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFullscreen(false);
                  setZoomLevel(1);
                }}
                className="p-2 rounded-xl bg-surface/80 text-text-primary hover:text-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                aria-label="Close fullscreen gallery"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Container with Double Tap / Click / Keyboard Zoom */}
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center">
              <img
                src={currentImage.url}
                alt={`Zoom view ${currentIndex + 1}`}
                onClick={toggleZoom}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleZoom();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Toggle zoom view"
                className={`max-h-[85vh] object-contain transition-transform duration-200 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                  zoomLevel === 2 ? 'scale-150 cursor-zoom-out' : 'scale-100'
                }`}
              />
            </div>

            {/* Navigation for Lightbox */}
            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous fullscreen image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-surface/80 text-white hover:bg-amber hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next fullscreen image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-surface/80 text-white hover:bg-amber hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
