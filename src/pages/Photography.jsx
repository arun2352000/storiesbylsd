// Photography Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/common/Card';
import { api } from '../services/api';
import backgroundImage from '../assets/image/Backgrou image/image 2.png';

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

    return (
        <MainLayout>
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
            <section className="bg-brand-dark p-2">
                {loading ? (
                    <div className="flex justify-center items-center h-[50vh] text-white">
                        Loading...
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Left Column */}
                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                            {projects.filter((_, i) => i % 2 === 0).map((item, index) => (
                                <Card
                                    key={item.id || item._id || index}
                                    title={item.title}
                                    date={item.date}
                                    image={item.heroImage?.url || item.heroImage}
                                    lowResImage={item.heroImageLowRes?.url || item.heroImageLowRes}
                                    className={index % 2 === 0 ? "h-[40vh] sm:h-[50vh] md:h-[60vh]" : "h-[60vh] sm:h-[75vh] md:h-[90vh]"}
                                    onClick={() => navigate(`/project/${item.id || item._id}`)}
                                />
                            ))}
                        </div>
                        {/* Right Column */}
                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                            {projects.filter((_, i) => i % 2 !== 0).map((item, index) => (
                                <Card
                                    key={item.id || item._id || index}
                                    title={item.title}
                                    date={item.date}
                                    image={item.heroImage?.url || item.heroImage}
                                    lowResImage={item.heroImageLowRes?.url || item.heroImageLowRes}
                                    className={index % 2 === 0 ? "h-[60vh] sm:h-[75vh] md:h-[90vh]" : "h-[40vh] sm:h-[50vh] md:h-[60vh]"}
                                    onClick={() => navigate(`/project/${item.id || item._id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </MainLayout>
    );
};

export default Photography;
