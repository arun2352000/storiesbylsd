import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';

const ImageFolio = ({ images }) => {
    if (!images || images.length === 0) return null;

    // Show all configured folio images (or up to 24)
    const displayImages = images.slice(0, 24);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, displayImages.length]);

    const masonryBreakpointCols = {
        default: 4,
        1440: 4,
        1024: 3,
        640: 2
    };

    return (
        <section className="w-full bg-[#424530] p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden select-none">
            <Masonry
                breakpointCols={masonryBreakpointCols}
                className="flex w-auto gap-2 sm:gap-3 lg:gap-4"
                columnClassName="flex flex-col gap-2 sm:gap-3 lg:gap-4 bg-clip-padding"
            >
                {displayImages.map((img, index) => {
                    const imgUrl = img?.url || img?.downloadUrl || (typeof img === 'string' ? img : '');
                    if (!imgUrl) return null;

                    return (
                        <div 
                            key={img.id || index}
                            onClick={() => setLightboxIndex(index)}
                            className="group relative overflow-hidden rounded-lg bg-[#383a29] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <img 
                                src={imgUrl} 
                                alt={`Stories by LSD Candid Wedding Photography India - Portfolio Moment ${index + 1}`} 
                                className="w-full h-auto block object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                loading="lazy"
                                decoding="async"
                            />
                            {/* Hover overlay with subtle zoom indicator */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm text-white p-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Masonry>

            {/* Interactive Full-Screen Lightbox Modal */}
            {lightboxIndex !== null && displayImages[lightboxIndex] && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2.5 rounded-full transition-all border border-white/20"
                        title="Close (Esc)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
                        }}
                        className="absolute left-3 sm:left-6 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all border border-white/20 hover:scale-110"
                        title="Previous (Left arrow)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 sm:right-6 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all border border-white/20 hover:scale-110"
                        title="Next (Right arrow)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Image Container */}
                    <div 
                        className="max-w-[92vw] max-h-[88vh] flex flex-col items-center justify-center relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={displayImages[lightboxIndex].url || displayImages[lightboxIndex].downloadUrl || (typeof displayImages[lightboxIndex] === 'string' ? displayImages[lightboxIndex] : '')} 
                            alt={`Stories by LSD Wedding Moment ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="mt-3 text-white/70 text-xs tracking-widest font-light">
                            {lightboxIndex + 1} / {displayImages.length}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ImageFolio;
