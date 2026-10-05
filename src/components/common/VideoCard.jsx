import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import ImageWithLoader from './ImageWithLoader';

const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length >= 10) ? match[2] : null;
};

const VideoCard = ({
    image,
    lowResImage,
    title,
    date,
    videoUrl,
    className = '',
    onClick
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimeout = useRef(null);
    const ytId = getYouTubeId(videoUrl);

    const handleMouseEnter = () => {
        if (ytId) {
            hoverTimeout.current = setTimeout(() => {
                setIsHovered(true);
            }, 300); // Small delay to avoid flashing when just moving mouse across
        }
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setIsHovered(false);
    };

    return (
        <div
            className={`group relative overflow-hidden cursor-pointer rounded-lg bg-[#424530] ${className}`}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="w-full h-full relative">
                {isHovered && ytId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${ytId}&playsinline=1`}
                        title={title}
                        className="absolute inset-0 w-full h-full object-cover scale-150 pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                ) : (
                    <ImageWithLoader
                        src={image}
                        lowResSrc={lowResImage}
                        alt={title}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 text-white transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-wide mb-1">{title}</h3>
                {date && (
                    <p className="text-[10px] sm:text-xs text-gray-200 uppercase tracking-wider">{date}</p>
                )}
            </div>

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

VideoCard.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string,
    videoUrl: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default VideoCard;
