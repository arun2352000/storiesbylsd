import React, { useState, useEffect, useRef } from 'react';

// Pre-measured natural aspect ratios for the 18 portfolio moments to ensure zero layout shift
const KNOWN_ASPECT_RATIOS = {
    FIL2913: 1.5,   // Feet (Landscape)
    FIL2914: 0.67,  // Lamp (Portrait)
    FIL2915: 0.67,  // Bride in bathtub (Portrait)
    FIL2916: 1.5,   // Couple on beach (Landscape)
    FIL2917: 0.67,  // Couple in pink field (Portrait)
    FIL2918: 1.5,   // Bride in mirror (Landscape)
    FIL2919: 1.5,   // Bride & groom throwing rice (Landscape)
    FIL2920: 1.78,  // Hands with rings (Landscape)
    FIL2921: 0.67,  // Couple on beach with sun rays (Portrait)
    FIL2922: 1.33,  // Dad lifting baby (Landscape)
    FIL2923: 1.5,   // Baby in white dress (Landscape)
    FIL2924: 1.5,   // Drone shot on roof (Landscape)
    FIL2925: 1.5,   // Yellow garland couple (Landscape)
    FIL2926: 1.5,   // Night couple under light (Landscape)
    FIL2927: 0.67,  // Bride in pink dress (Portrait)
    FIL2928: 1.5,   // Couple in white flowers (Landscape)
    FIL2929: 0.8,   // Groomsmen laughing (Portrait)
    FIL2930: 1.5    // Window blur shot (Landscape)
};

const ImageFolio = ({ images }) => {
    if (!images || images.length === 0) return null;

    const displayImages = images.slice(0, 18);
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [aspectRatios, setAspectRatios] = useState(KNOWN_ASPECT_RATIOS);

    // Measure actual rendered container width
    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };
        updateWidth();
        const ro = new ResizeObserver(updateWidth);
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Lightbox keyboard navigation
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

    const handleImageLoad = (imgId, e) => {
        const { naturalWidth, naturalHeight } = e.target;
        if (naturalWidth && naturalHeight) {
            const ratio = naturalWidth / naturalHeight;
            setAspectRatios((prev) => {
                if (prev[imgId] && Math.abs(prev[imgId] - ratio) < 0.05) return prev;
                return { ...prev, [imgId]: ratio };
            });
        }
    };

    // Calculate gap based on screen size
    const gap = containerWidth >= 1024 ? 12 : containerWidth >= 640 ? 10 : 8;

    // Define harmonious rows based on screen width
    let rowPartitions = [];
    if (containerWidth >= 992) {
        // Desktop: 5 balanced rows (4, 4, 4, 3, 3) - perfect flush base!
        rowPartitions = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [8, 9, 10, 11],
            [12, 13, 14],
            [15, 16, 17]
        ];
    } else if (containerWidth >= 640) {
        // Tablet: 7 balanced rows
        rowPartitions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7],
            [8, 9, 10],
            [11, 12],
            [13, 14],
            [15, 16, 17]
        ];
    } else {
        // Mobile: 9 clean pairs
        rowPartitions = [
            [0, 1], [2, 3], [4, 5],
            [6, 7], [8, 9], [10, 11],
            [12, 13], [14, 15], [16, 17]
        ];
    }

    // Filter to valid partitions within displayImages length
    const validRows = rowPartitions
        .map((row) => row.filter((idx) => idx < displayImages.length))
        .filter((row) => row.length > 0);

    return (
        <section 
            ref={containerRef}
            className="w-full bg-[#424530] p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden select-none"
        >
            <div className="flex flex-col w-full" style={{ gap: `${gap}px` }}>
                {validRows.map((rowIndices, rowIndex) => {
                    // Compute exact row height for 100% uncropped fit
                    const arSum = rowIndices.reduce((sum, idx) => {
                        const img = displayImages[idx];
                        const r = aspectRatios[img?.id] || 1.33;
                        return sum + r;
                    }, 0);

                    const totalGaps = (rowIndices.length - 1) * gap;
                    const availableWidth = Math.max(containerWidth - totalGaps, 100);
                    const rowHeight = Math.round(availableWidth / arSum);

                    return (
                        <div 
                            key={`row-${rowIndex}`}
                            className="flex flex-row w-full items-center justify-between"
                            style={{ height: `${rowHeight}px`, gap: `${gap}px` }}
                        >
                            {rowIndices.map((imgIndex) => {
                                const img = displayImages[imgIndex];
                                const imgUrl = img?.url || img?.downloadUrl || (typeof img === 'string' ? img : '');
                                const ar = aspectRatios[img?.id] || 1.33;

                                return (
                                    <div
                                        key={img?.id || imgIndex}
                                        onClick={() => setLightboxIndex(imgIndex)}
                                        style={{ flexGrow: ar * 100, flexBasis: 0 }}
                                        className="h-full relative overflow-hidden rounded-md group cursor-pointer bg-[#383a29] transition-all duration-300 shadow-sm hover:shadow-xl"
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`Stories by LSD Wedding Moment ${imgIndex + 1}`}
                                            onLoad={(e) => handleImageLoad(img?.id, e)}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {/* Hover Overlay */}
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
                        </div>
                    );
                })}
            </div>

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
