import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length >= 10) ? match[2] : null;
};

const VideoModal = ({ isOpen, onClose, videoUrl, title }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const ytId = getYouTubeId(videoUrl);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl z-10">
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 rounded-full"
                    onClick={onClose}
                    aria-label="Close Video"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Button>

                {/* Video Player */}
                <div className="w-full h-full flex items-center justify-center">
                    {ytId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                            title={title || "YouTube video player"}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : videoUrl ? (
                        <video
                            src={videoUrl}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="text-white text-center">
                            <p className="text-xl mb-2">Video not available</p>
                            <p className="text-gray-400 text-sm">{title}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

VideoModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    videoUrl: PropTypes.string,
    title: PropTypes.string,
};

export default VideoModal;
