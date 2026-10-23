import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import logoMark from '../assets/image/logo/LogoMark.png';
import ImageWithLoader from '../components/common/ImageWithLoader';
import ProjectGallery from '../components/project/ProjectGallery';
import SEO from '../components/common/SEO';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allProjects, setAllProjects] = useState([]);

    useEffect(() => {
        api.getAllProjects().then(list => {
            if (Array.isArray(list)) setAllProjects(list);
        }).catch(err => console.error('Failed to load project list', err));
    }, []);

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

    const projectTitle = project.title || 'Wedding Story';
    const projectDesc = project.subtitle || project.description || `Explore the heartfelt wedding moments and candid photography of ${projectTitle} by Stories by LSD.`;
    const getImageUrl = (item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.url || item.downloadUrl || '';
    };

    const projectImg = getImageUrl(project.heroImage);
    const projectCanonical = `https://www.storiesbylsd.com/project/${id}`;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.storiesbylsd.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Photography",
                "item": "https://www.storiesbylsd.com/photography"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": projectTitle,
                "item": projectCanonical
            }
        ]
    };

    const currentIndex = allProjects.findIndex(p => (p.id || p._id) === id);
    const prevProject = currentIndex > 0 
        ? allProjects[currentIndex - 1] 
        : (allProjects.length > 1 ? allProjects[allProjects.length - 1] : null);
    const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 
        ? allProjects[currentIndex + 1] 
        : (allProjects.length > 1 ? allProjects[0] : null);

    return (
        <MainLayout>
            <SEO
                title={`${projectTitle} | Stories by LSD Wedding Photography India`}
                description={projectDesc}
                canonical={projectCanonical}
                ogImage={projectImg}
                ogType="article"
                schema={breadcrumbSchema}
            />
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0">
                    <ImageWithLoader
                        src={getImageUrl(project.heroImage)}
                        lowResSrc={getImageUrl(project.heroImageLowRes)}
                        alt={`${project.title || 'Wedding Story'} - Candid Wedding Photography India by Stories by LSD`}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 p-4">
                    {/* Logo Section */}
                    <div className="mb-6 opacity-90">
                        <img src={logoMark} alt="Stories by LSD Emblem" className="w-16 md:w-20" />
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

            {/* Album Gallery Section with Balanced Flush Base & Interactive Lightbox */}
            <ProjectGallery
                images={project.images}
                imagesLowRes={project.imagesLowRes}
                projectTitle={project.title}
            />

                {/* Navigation Links at bottom */}
                <div className="flex justify-between items-center p-8 md:p-16 bg-white border-t border-gray-200">
                    <button 
                        onClick={() => prevProject && navigate(`/project/${prevProject.id || prevProject._id}`)}
                        disabled={!prevProject}
                        className="uppercase tracking-widest text-xs md:text-sm text-gray-500 hover:text-black transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>Prev</span>
                    </button>
                    <Button
                        onClick={() => navigate('/photography')}
                        variant="outline"
                        className="border-black text-black hover:bg-black hover:text-white uppercase tracking-widest text-xs px-8 py-3"
                    >
                        View All
                    </Button>
                    <button 
                        onClick={() => nextProject && navigate(`/project/${nextProject.id || nextProject._id}`)}
                        disabled={!nextProject}
                        className="uppercase tracking-widest text-xs md:text-sm text-gray-500 hover:text-black transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-2"
                    >
                        <span>Next</span>
                        <span>→</span>
                    </button>
                </div>
        </MainLayout>
    );
};

export default ProjectDetails;
