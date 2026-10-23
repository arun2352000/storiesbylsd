import React from 'react';
import PropTypes from 'prop-types';
import ImageWithLoader from './ImageWithLoader';

const Card = ({
    image,
    lowResImage,
    title,
    date,
    alt,
    className = '',
    onClick
}) => {
    const computedAlt = alt || (title ? `${title} - Candid Wedding Photography India | Stories by LSD` : 'Stories by LSD Wedding Photography India');

    return (
        <div
            className={`group relative overflow-hidden cursor-pointer rounded-lg ${className}`}
            onClick={onClick}
        >
            <div className="w-full h-full">
                <ImageWithLoader
                    src={image}
                    lowResSrc={lowResImage}
                    alt={computedAlt}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-5 sm:p-6 md:p-8 text-white pointer-events-none flex items-end justify-between">
                <div>
                    <h3 className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl font-normal tracking-wide text-white drop-shadow-sm mb-1 group-hover:text-brand-cream transition-colors duration-300">
                        {title}
                    </h3>
                    {date && (
                        <p className="text-[10px] sm:text-xs text-brand-cream/80 uppercase tracking-[0.25em] font-light">
                            {date}
                        </p>
                    )}
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-cream opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 font-light">
                    <span>View Story</span>
                    <span className="text-sm">→</span>
                </div>
            </div>
        </div>
    );
};

Card.propTypes = {
    image: PropTypes.string.isRequired,
    lowResImage: PropTypes.string,
    title: PropTypes.string.isRequired,
    date: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Card;
