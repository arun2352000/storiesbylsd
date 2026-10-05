import React, { useState } from 'react';

const ImageWithLoader = ({ src, lowResSrc, alt, className = "", imgClassName = "", ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative w-full min-h-[150px] sm:min-h-[200px] bg-gray-200 flex items-center justify-center overflow-hidden ${className}`}>
            {hasError ? (
                <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-xs">Image not available</span>
                </div>
            ) : (
                <>
                    {/* Low Res Placeholder */}
                    {!isLoaded && lowResSrc && (
                        <img 
                            src={lowResSrc} 
                            alt="" 
                            className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70`}
                        />
                    )}
                    {/* High Res Image */}
                    <img
                        src={src}
                        alt={alt}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => { setIsLoaded(true); setHasError(true); }}
                        className={`w-full h-auto block transition-all duration-700 ease-in-out relative z-10 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0'} ${imgClassName}`}
                        {...props}
                    />
                </>
            )}
        </div>
    );
};

export default ImageWithLoader;
