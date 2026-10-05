import React from 'react';

const ImageFolio = ({ images }) => {
    if (!images || images.length === 0) return null;

    // Limit to 18 images (between 15 and 20 as requested)
    const displayImages = images.slice(0, 18);

    // Single photo tile for Desktop fixed-height collage blocks
    const renderDesktopTile = (img, index, className = '', heightStyle = {}) => {
        if (!img) return null;
        return (
            <div 
                key={img.id || index} 
                className={`relative overflow-hidden group bg-[#424530] ${className}`}
                style={heightStyle}
            >
                <img 
                    src={img.url || img.downloadUrl} 
                    alt={`Folio ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
            </div>
        );
    };

    // Single photo tile for Mobile/Tablet natural vertical flow (zero gaps)
    const renderFlowTile = (img, index) => {
        if (!img) return null;
        return (
            <div key={img.id || index} className="relative overflow-hidden group bg-[#424530] w-full">
                <img 
                    src={img.url || img.downloadUrl} 
                    alt={`Folio ${index + 1}`} 
                    className="w-full h-auto object-cover block transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
            </div>
        );
    };

    // 1. Desktop Block A (10 images - exact Wix layout matching lsdproductions.in)
    const renderBlockA = (chunk, startIndex) => {
        return (
            <div key={`block-a-${startIndex}`} className="flex flex-row w-full h-[540px] lg:h-[650px] overflow-hidden gap-0">
                {/* Column 1 (18%): 2 vertical stacked photos */}
                <div className="flex flex-col w-[18%] h-full">
                    {renderDesktopTile(chunk[0], startIndex + 0, "w-full h-[60%]")}
                    {renderDesktopTile(chunk[1], startIndex + 1, "w-full h-[40%]")}
                </div>

                {/* Column 2 (32%): 1 top landscape + 2 bottom side-by-side */}
                <div className="flex flex-col w-[32%] h-full">
                    {renderDesktopTile(chunk[2], startIndex + 2, "w-full h-[60%]")}
                    <div className="flex flex-row w-full h-[40%]">
                        {renderDesktopTile(chunk[3], startIndex + 3, "w-1/2 h-full")}
                        {renderDesktopTile(chunk[4], startIndex + 4, "w-1/2 h-full")}
                    </div>
                </div>

                {/* Column 3 (20%): 1 full-height tall hero portrait */}
                <div className="w-[20%] h-full">
                    {renderDesktopTile(chunk[5], startIndex + 5, "w-full h-full")}
                </div>

                {/* Column 4 (15%): 2 vertical stacked photos */}
                <div className="flex flex-col w-[15%] h-full">
                    {renderDesktopTile(chunk[6], startIndex + 6, "w-full h-[52%]")}
                    {renderDesktopTile(chunk[7], startIndex + 7, "w-full h-[48%]")}
                </div>

                {/* Column 5 (15%): 2 vertical stacked photos */}
                <div className="flex flex-col w-[15%] h-full">
                    {renderDesktopTile(chunk[8], startIndex + 8, "w-full h-[52%]")}
                    {renderDesktopTile(chunk[9], startIndex + 9, "w-full h-[48%]")}
                </div>
            </div>
        );
    };

    // 2. Desktop Block B (Remaining images - 4-column balanced collage)
    const renderBlockB = (chunk, startIndex) => {
        if (!chunk || chunk.length === 0) return null;
        return (
            <div key={`block-b-${startIndex}`} className="flex flex-row w-full h-[500px] lg:h-[600px] overflow-hidden gap-0">
                {/* Column 1 (22%): 2 vertical stacked photos */}
                <div className="flex flex-col w-[22%] h-full">
                    {renderDesktopTile(chunk[0], startIndex + 0, "w-full h-[50%]")}
                    {renderDesktopTile(chunk[1], startIndex + 1, "w-full h-[50%]")}
                </div>

                {/* Column 2 (28%): 1 top landscape + 2 bottom side-by-side */}
                <div className="flex flex-col w-[28%] h-full">
                    {renderDesktopTile(chunk[2], startIndex + 2, "w-full h-[55%]")}
                    <div className="flex flex-row w-full h-[45%]">
                        {renderDesktopTile(chunk[3], startIndex + 3, chunk[4] ? "w-1/2 h-full" : "w-full h-full")}
                        {chunk[4] && renderDesktopTile(chunk[4], startIndex + 4, "w-1/2 h-full")}
                    </div>
                </div>

                {/* Column 3 (22%): 1 tall hero portrait */}
                <div className="w-[22%] h-full">
                    {renderDesktopTile(chunk[5], startIndex + 5, "w-full h-full")}
                </div>

                {/* Column 4 (28%): 2 vertical stacked photos */}
                <div className="flex flex-col w-[28%] h-full">
                    {renderDesktopTile(chunk[6], startIndex + 6, chunk[7] ? "w-full h-[50%]" : "w-full h-full")}
                    {chunk[7] && renderDesktopTile(chunk[7], startIndex + 7, "w-full h-[50%]")}
                </div>
            </div>
        );
    };

    // Distribute images for Mobile (2 columns)
    const mobileCol1 = [];
    const mobileCol2 = [];
    displayImages.forEach((img, idx) => {
        if (idx % 2 === 0) mobileCol1.push({ img, idx });
        else mobileCol2.push({ img, idx });
    });

    // Distribute images for Tablet (3 columns)
    const tabletCol1 = [];
    const tabletCol2 = [];
    const tabletCol3 = [];
    displayImages.forEach((img, idx) => {
        if (idx % 3 === 0) tabletCol1.push({ img, idx });
        else if (idx % 3 === 1) tabletCol2.push({ img, idx });
        else tabletCol3.push({ img, idx });
    });

    return (
        <section className="w-full bg-[#424530] overflow-hidden select-none">
            {/* 1. DESKTOP VIEW (>= 1024px): 5-column varied Wix collage */}
            <div className="hidden lg:flex flex-col w-full gap-0 p-0 m-0">
                {displayImages.length >= 10 && renderBlockA(displayImages.slice(0, 10), 0)}
                {displayImages.length > 10 && renderBlockB(displayImages.slice(10), 10)}
                {displayImages.length < 10 && (
                    <div className="flex flex-row w-full h-[450px] overflow-hidden gap-0">
                        {displayImages.map((img, idx) => (
                            <div key={img.id || idx} className="flex-1 h-full">
                                {renderDesktopTile(img, idx, "w-full h-full")}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. TABLET VIEW (640px to 1023px): 3 flex-columns with natural flow and ZERO black gaps */}
            <div className="hidden sm:flex lg:hidden flex-row w-full gap-0 p-0 m-0">
                <div className="w-1/3 flex flex-col gap-0 p-0 m-0">
                    {tabletCol1.map(({ img, idx }) => renderFlowTile(img, idx))}
                </div>
                <div className="w-1/3 flex flex-col gap-0 p-0 m-0">
                    {tabletCol2.map(({ img, idx }) => renderFlowTile(img, idx))}
                </div>
                <div className="w-1/3 flex flex-col gap-0 p-0 m-0">
                    {tabletCol3.map(({ img, idx }) => renderFlowTile(img, idx))}
                </div>
            </div>

            {/* 3. MOBILE VIEW (< 640px): 2 flex-columns with natural flow and ZERO black gaps */}
            <div className="flex sm:hidden flex-row w-full gap-0 p-0 m-0">
                <div className="w-1/2 flex flex-col gap-0 p-0 m-0">
                    {mobileCol1.map(({ img, idx }) => renderFlowTile(img, idx))}
                </div>
                <div className="w-1/2 flex flex-col gap-0 p-0 m-0">
                    {mobileCol2.map(({ img, idx }) => renderFlowTile(img, idx))}
                </div>
            </div>
        </section>
    );
};

export default ImageFolio;
