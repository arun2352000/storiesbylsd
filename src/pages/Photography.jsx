// Photography Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import { api } from '../services/api';
import SEO from '../components/common/SEO';
import backgroundImage from '../assets/image/Backgrou image/7R308313.webp';

const Photography = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.getAllProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const gallerySchema = projects.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Wedding Photography Portfolio | Stories by LSD India",
        "description": "Curated collection of wedding photography stories and candid moments captured across India and worldwide destinations.",
        "hasPart": projects.map(item => ({
            "@type": "CreativeWork",
            "name": item.title,
            "url": `https://www.storiesbylsd.com/project/${item.id || item._id}`,
            "image": item.heroImage?.url || item.heroImage
        }))
    } : null;

    return (
        <MainLayout>
            <SEO 
                title="Wedding Photography Portfolio | Stories by LSD India"
                description="Browse our curated wedding photography gallery capturing candid moments, sacred rituals, and joyful celebrations across India and destination weddings."
                canonical="https://www.storiesbylsd.com/photography"
                schema={gallerySchema}
            />
            {/* Hero Section */}
            <div className="relative h-screen w-full bg-[#424530] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={backgroundImage}
                        alt="Photography Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-white text-2xl sm:text-4xl md:text-6xl font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                        Photography
                    </h1>
                </div>
            </div>

            {/* Gallery Section */}
            <section className="bg-brand-dark p-3 sm:p-5 md:p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-[50vh] text-white">
                        Loading...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {projects.map((item, index) => {
                            // When odd count, premier featured card spans full width for balanced baseline
                            const isFeatured = projects.length % 2 !== 0 && index === 0;
                            const cardHeight = isFeatured
                                ? "h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[75vh]"
                                : "h-[45vh] sm:h-[55vh] md:h-[62vh] lg:h-[68vh]";

                            return (
                                <div
                                    key={item.id || item._id || index}
                                    className={isFeatured ? "col-span-1 md:col-span-2" : "col-span-1"}
                                >
                                    <Card
                                        title={item.title}
                                        date={item.date}
                                        alt={`${item.title} - Candid Wedding Photography in India by Stories by LSD`}
                                        image={item.heroImage?.url || item.heroImage}
                                        lowResImage={item.heroImageLowRes?.url || item.heroImageLowRes}
                                        className={`w-full ${cardHeight}`}
                                        onClick={() => navigate(`/project/${item.id || item._id}`)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </MainLayout>
    );
};

export default Photography;
