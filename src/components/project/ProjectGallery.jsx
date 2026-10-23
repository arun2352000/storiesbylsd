import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

function partitionImages(count, perRow) {
    if (count <= 0) return [];
    if (perRow === 1) return Array.from({ length: count }, (_, i) => [i]);
    const rows = [];
    let i = 0;
    while (i < count) {
        const remaining = count - i;
        if (perRow === 3) {
            if (remaining === 4) {
                rows.push([i, i + 1]);
                rows.push([i + 2, i + 3]);
                break;
            } else if (remaining === 2) {
                rows.push([i, i + 1]);
                break;
            } else if (remaining === 1) {
                if (rows.length > 0 && rows[rows.length - 1].length === 3) {
                    const prev = rows.pop();
                    rows.push([prev[0], prev[1]]);
                    rows.push([prev[2], i]);
                } else {
                    rows.push([i]);
                }
                break;
            } else {
                rows.push([i, i + 1, i + 2]);
                i += 3;
            }
        } else {
            // perRow === 2
            if (remaining === 1 && rows.length > 0 && rows[rows.length - 1].length === 2) {
                const prev = rows.pop();
                rows.push([prev[0], prev[1], i]);
                break;
            } else if (remaining >= 2) {
                rows.push([i, i + 1]);
                i += 2;
            } else {
                rows.push([i]);
                i++;
            }
        }
    }
    return rows;
}

const ProjectGallery = ({ images = [], imagesLowRes = [], projectTitle = 'Wedding Story' }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    const [aspectRatios, setAspectRatios] = useState({});
    const [loadedImages, setLoadedImages] = useState({});
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const getImageUrl = (item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.url || item.downloadUrl || '';
    };

    // Measure container width responsively
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

    // Handle keyboard shortcuts in lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, images.length]);

    const handleImageLoad = (index, e) => {
        const { naturalWidth, naturalHeight } = e.target;
        if (naturalWidth && naturalHeight) {
            const ratio = naturalWidth / naturalHeight;
            setAspectRatios((prev) => {
                if (prev[index] && Math.abs(prev[index] - ratio) < 0.05) return prev;
                return { ...prev, [index]: ratio };
            });
        }
        setLoadedImages((prev) => ({ ...prev, [index]: true }));
    };

    const gap = containerWidth >= 1024 ? 12 : containerWidth >= 640 ? 10 : 8;
    const perRow = containerWidth >= 992 ? 3 : containerWidth >= 640 ? 2 : 1;

    const rows = useMemo(() => {
        return partitionImages(images.length, perRow);
    }, [images.length, perRow]);

    if (!images || images.length === 0) {
        return (
            <div className="py-20 text-center text-gray-500">
                <p>No gallery images uploaded for this project yet.</p>
            </div>
        );
    }

    return (
        <section 
            ref={containerRef}
            className="w-full bg-[#f8f8f8] p-3 sm:p-5 md:p-6 lg:p-8 select-none"
        >
            <div className="flex flex-col w-full" style={{ gap: `${gap}px` }}>
                {rows.map((rowIndices, rowIndex) => {
                    const arSum = rowIndices.reduce((sum, idx) => sum + (aspectRatios[idx] || 1.33), 0);
                    const totalGaps = (rowIndices.length - 1) * gap;
                    const availableWidth = Math.max(containerWidth - totalGaps, 100);
                    // Compute row height so images fit with zero crop and flush edges
                    const calculatedHeight = Math.round(availableWidth / arSum);
                    // Bound row height sensibly (min 220px, max 620px)
                    const rowHeight = Math.min(620, Math.max(220, calculatedHeight));

                    return (
                        <div 
                            key={`row-${rowIndex}`}
                            className="flex flex-row w-full items-center justify-between"
                            style={{ height: `${rowHeight}px`, gap: `${gap}px` }}
                        >
                            {rowIndices.map((imgIndex) => {
                                const img = images[imgIndex];
                                const lowRes = imagesLowRes && imagesLowRes[imgIndex];
                                const src = getImageUrl(img);
                                const lowResSrc = getImageUrl(lowRes);
                                const ar = aspectRatios[imgIndex] || 1.33;
                                const isLoaded = loadedImages[imgIndex] || false;

                                return (
                                    <div
                                        key={img?.id || imgIndex}
                                        onClick={() => setLightboxIndex(imgIndex)}
                                        style={{ flexGrow: ar * 100, flexBasis: 0 }}
                                        className="h-full relative overflow-hidden rounded-md group cursor-pointer bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-xl"
                                    >
                                        {/* Low-res Blur Placeholder */}
                                        {!isLoaded && lowResSrc && (
                                            <img
                                                src={lowResSrc}
                                                alt=""
                                                aria-hidden="true"
                                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70"
                                            />
                                        )}

                                        {/* High-res Image */}
                                        <img
                                            src={src}
                                            alt={`${projectTitle} - Moment ${imgIndex + 1} | Stories by LSD`}
                                            loading="lazy"
                                            decoding="async"
                                            onLoad={(e) => handleImageLoad(imgIndex, e)}
                                            className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03] ${
                                                isLoaded ? 'opacity-100 blur-0' : 'opacity-0'
                                            }`}
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Full-Screen Interactive Lightbox Modal */}
            {lightboxIndex !== null && images[lightboxIndex] && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2.5 rounded-full transition-all border border-white/20"
                        aria-label="Close Lightbox"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-6 z-50 text-white/70 text-xs sm:text-sm font-light tracking-widest uppercase">
                        {lightboxIndex + 1} / {images.length}
                    </div>

                    {/* Left Navigation Arrow */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                        }}
                        className="absolute left-3 sm:left-6 z-50 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition-all border border-white/10"
                        aria-label="Previous Moment"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Current Lightbox Image */}
                    <div 
                        className="relative max-w-6xl max-h-[88vh] flex items-center justify-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={getImageUrl(images[lightboxIndex])} 
                            alt={`${projectTitle} - Moment ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[88vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Right Navigation Arrow */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 sm:right-6 z-50 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 p-3 rounded-full transition-all border border-white/10"
                        aria-label="Next Moment"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </section>
    );
};

ProjectGallery.propTypes = {
    images: PropTypes.array,
    imagesLowRes: PropTypes.array,
    projectTitle: PropTypes.string
};

export default ProjectGallery;
