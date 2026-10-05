// Wedding Films Page
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import VideoCard from '../components/common/VideoCard';
import VideoModal from '../components/common/VideoModal';
import { api } from '../services/api';
import backgroundImage from '../assets/image/Backgrou image/image 2.png';

const WeddingFilms = () => {
    const [films, setFilms] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const data = await api.getAllFilms();
                setFilms(data);
            } catch (error) {
                console.error("Failed to load films:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilms();
    }, []);

    const handleVideoClick = (film) => {
        setSelectedVideo(film);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVideo(null);
    };

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="relative h-screen w-full bg-[#424530] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={backgroundImage}
                        alt="Wedding Films Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-white text-2xl sm:text-4xl md:text-6xl font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                        Wedding Films
                    </h1>
                </div>
            </div>

            {/* Gallery Section */}
            <section className="bg-brand-dark p-4 md:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-[30vh] text-white">
                        <p>Loading Films...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {films.map((film) => (
                            <VideoCard
                                key={film.id || film._id}
                                title={film.title}
                                date={film.date}
                                videoUrl={film.videoUrl}
                                image={film.thumbnail?.url || (typeof film.thumbnail === 'string' ? film.thumbnail : '')}
                                lowResImage={film.thumbnailLowRes?.url || film.thumbnailLowRes}
                                className="h-[35vh] sm:h-[45vh] md:h-[60vh]"
                                onClick={() => handleVideoClick(film)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Video Modal */}
            <VideoModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                videoUrl={selectedVideo?.videoUrl}
                title={selectedVideo?.title}
            />
        </MainLayout>
    );
};

export default WeddingFilms;
