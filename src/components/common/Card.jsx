import React from 'react';
import PropTypes from 'prop-types';
import ImageWithLoader from './ImageWithLoader';

const Card = ({
    image,
    lowResImage,
    title,
    date,
    className = '',
    onClick
}) => {
    return (
        <div
            className={`group relative overflow-hidden cursor-pointer rounded-lg ${className}`}
            onClick={onClick}
        >
            <div className="w-full h-full">
                <ImageWithLoader
                    src={image}
                    lowResSrc={lowResImage}
                    alt={title}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-300 pointer-events-none" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 z-30 p-4 sm:p-6 text-white transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-wide mb-1">{title}</h3>
                {date && (
                    <p className="text-[10px] sm:text-xs text-gray-200 uppercase tracking-wider">{date}</p>
                )}
            </div>
        </div>
    );
};

Card.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Card;
