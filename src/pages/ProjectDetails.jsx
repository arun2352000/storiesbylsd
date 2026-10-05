import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import logoMark from '../assets/image/logo/LogoMark.png';
import ImageWithLoader from '../components/common/ImageWithLoader';
import Masonry from 'react-masonry-css';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProject = async () => {
            try {
                const data = await api.getProjectById(id);
                setProject(data);
            } catch (err) {
                console.error("Failed to load project", err);
                setError("Project not found");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="h-screen w-full flex items-center justify-center bg-brand-dark text-white">
                    <p className="text-xl tracking-widest uppercase">Loading...</p>
                </div>
            </MainLayout>
        );
    }

    if (error || !project) {
        return (
            <MainLayout>
                <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-dark text-white gap-4">
                    <p className="text-xl tracking-widest uppercase">Project not found</p>
                    <Button onClick={() => navigate('/')}>Back to Home</Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0">
                    <ImageWithLoader
                        src={project.heroImage?.url || project.heroImage}
                        lowResSrc={project.heroImageLowRes?.url || project.heroImageLowRes}
                        alt={project.title}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 p-4">
                    {/* Logo Section */}
                    <div className="mb-6 opacity-90">
                        <img src={logoMark} alt="Logo" className="w-16 md:w-20" />
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-6 tracking-wide leading-tight">
                        {project.title}
                    </h1>
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-light">
                        {project.date}
                    </p>
                </div>

                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10">
                    <button
                        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                        className="text-white text-[10px] md:text-xs uppercase tracking-[0.2em] border-b border-white/40 pb-1 cursor-pointer hover:border-white transition-all hover:tracking-[0.25em]"
                    >
                        View Gallery
                    </button>
                </div>
            </section>

            {/* Masonry Gallery Section */}
            <section className="w-full bg-[#f5f5f5]">
                {/* 
                  Using a grid that adapts to screen size.
                  For a true masonry layout (staggered), CSS columns are often easiest.
                 */}
                <Masonry
                    breakpointCols={{ default: 3, 1024: 3, 768: 2, 640: 1 }}
                    className="flex w-auto p-2"
                    columnClassName="px-1 flex flex-col gap-2"
                >
                    {project.images && project.images.map((img, index) => {
                        const lowResImg = project.imagesLowRes && project.imagesLowRes[index] 
                            ? (project.imagesLowRes[index]?.url || project.imagesLowRes[index]) 
                            : null;
                        
                        return (
                            <div key={index} className="break-inside-avoid">
                                <ImageWithLoader
                                    src={img?.url || img}
                                    lowResSrc={lowResImg}
                                    alt={`Gallery image ${index + 1}`}
                                    imgClassName="hover:opacity-95 transition-opacity duration-300"
                                    loading="lazy"
                                />
                            </div>
                        );
                    })}
                </Masonry>

                {/* Navigation Links at bottom */}
                <div className="flex justify-between items-center p-8 md:p-16 bg-white">
                    <button className="uppercase tracking-widest text-xs md:text-sm text-gray-500 hover:text-black transition-colors">
                        Prev
                    </button>
                    <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="border-black text-black hover:bg-black hover:text-white uppercase tracking-widest text-xs px-8 py-3"
                    >
                        View All
                    </Button>
                    <button className="uppercase tracking-widest text-xs md:text-sm text-gray-500 hover:text-black transition-colors">
                        Next
                    </button>
                </div>
            </section>
        </MainLayout>
    );
};

export default ProjectDetails;
