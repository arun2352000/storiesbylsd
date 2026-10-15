import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Card from '../components/common/Card';
import { useLayout } from '../context/LayoutContext';
import { api } from '../services/api';

import ScrollReveal from '../components/common/ScrollReveal';
import ImageFolio from '../components/home/ImageFolio';
import AboutUsPreview from '../components/home/AboutUsPreview';
import ContactForm from '../components/common/ContactForm';
import SEO from '../components/common/SEO';
import contactBg from '../assets/image/Backgrou image/image 2.png';


const Home = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const { isMenuOpen } = useLayout();
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [siteConfig, setSiteConfig] = useState(() => {
        try {
            const cached = localStorage.getItem('lsd_site_config');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [heroThumbUrl, setHeroThumbUrl] = useState(() => {
        try {
            const cachedThumb = localStorage.getItem('lsd_hero_thumb');
            if (cachedThumb) return cachedThumb;
            const cached = localStorage.getItem('lsd_site_config');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.heroVideoThumb) {
                    return parsed.heroVideoThumb.url || parsed.heroVideoThumb.downloadUrl || parsed.heroVideoThumb;
                }
            }
        } catch {}
        return null;
    });
    const [heroVideoSrc, setHeroVideoSrc] = useState(() => {
        try {
            const cached = localStorage.getItem('lsd_site_config');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.heroVideo && (parsed.heroVideo.url || typeof parsed.heroVideo === 'string')) {
                    return parsed.heroVideo.url || parsed.heroVideo;
                }
            }
        } catch {}
        return null;
    });
    const [loading, setLoading] = useState(true);

    // Fast independent fetch for Hero Poster so it renders before the video or heavy payloads
    useEffect(() => {
        let isMounted = true;
        api.getHeroPoster().then(posterUrl => {
            if (isMounted && posterUrl) {
                setHeroThumbUrl(posterUrl);
                try {
                    localStorage.setItem('lsd_hero_thumb', posterUrl);
                } catch {}
            }
        });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const [data, fetchedSiteConfig] = await Promise.all([
                    api.getAllProjects(),
                    api.getSiteConfig()
                ]);
                const featuredData = data.filter(item => item.homePage === true);
                setPortfolioItems(featuredData);
                if (fetchedSiteConfig) {
                    setSiteConfig(fetchedSiteConfig);
                    try {
                        localStorage.setItem('lsd_site_config', JSON.stringify(fetchedSiteConfig));
                    } catch {}

                    if (fetchedSiteConfig.heroVideo && (fetchedSiteConfig.heroVideo.url || typeof fetchedSiteConfig.heroVideo === 'string')) {
                        setHeroVideoSrc(fetchedSiteConfig.heroVideo.url || fetchedSiteConfig.heroVideo);
                    }
                    if (fetchedSiteConfig.heroVideoThumb) {
                        const thumb = fetchedSiteConfig.heroVideoThumb.url || fetchedSiteConfig.heroVideoThumb.downloadUrl || fetchedSiteConfig.heroVideoThumb;
                        if (thumb) {
                            setHeroThumbUrl(thumb);
                            try {
                                localStorage.setItem('lsd_hero_thumb', thumb);
                            } catch {}
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const attemptPlay = async () => {
        if (videoRef.current) {
            try {
                await videoRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.log("Autoplay blocked:", error);
                // Fallback: Mute and play if autoplay was blocked (likely due to unmuted audio)
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                    try {
                        await videoRef.current.play();
                        setIsPlaying(true);
                    } catch (e) {
                        console.error("Muted autoplay also failed", e);
                        setIsPlaying(false);
                    }
                }
            }
        }
    };

    // Handle immediate play when hero video source is hydrated from API
    useEffect(() => {
        if (heroVideoSrc && videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch((err) => {
                console.log("Initial autoplay deferred:", err);
            });
        }
    }, [heroVideoSrc]);

    // Handle video pause when menu is open
    useEffect(() => {
        if (videoRef.current) {
            if (isMenuOpen) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else if (!isMenuOpen && !isPlaying) {
                attemptPlay();
            }
        }
    }, [isMenuOpen]);

    // Handle video pause/play based on visibility in viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        // Video is in view, play it
                        if (!isMenuOpen) {
                            attemptPlay();
                        }
                    } else {
                        // Video is out of view, pause it
                        videoRef.current.pause();
                        setIsPlaying(false);
                    }
                }
            },
            {
                threshold: 0.5, // Trigger when 50% of video is visible
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, [isMenuOpen]);

    // Unmute on first user interaction
    useEffect(() => {
        const handleInteraction = () => {
            if (videoRef.current && videoRef.current.muted) {
                videoRef.current.muted = false;
                setIsMuted(false);
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                attemptPlay();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <MainLayout>
            <SEO 
                title="Stories by LSD | Luxury Candid Wedding Photography & Films | India"
                description="Stories by LSD is a premier candid wedding photography and cinematic films team capturing authentic emotions, timeless wedding stories, and luxury celebrations across India and worldwide."
                canonical="https://www.storiesbylsd.com/"
            />
            {/* Hero Section - Loads instantly on mount with High-Priority Thumbnail/Poster */}
            <section className="relative h-screen w-full bg-[#424530] overflow-hidden group">
                {/* Hero Title Poster: Rendered with high priority to show immediately before video plays */}
                {heroThumbUrl && (
                    <div 
                        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 z-0 ${
                            isVideoActive ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                        <img
                            src={heroThumbUrl}
                            alt="Stories by LSD Luxury Candid Wedding Photography & Films India"
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Hero Video - Present in DOM immediately, streams and fades in when playing */}
                <video
                    ref={videoRef}
                    src={heroVideoSrc || undefined}
                    className={`absolute inset-0 w-full h-full object-cover md:inset-auto md:top-1/2 md:left-1/2 md:w-[100vh] md:h-[100vw] md:min-w-full md:min-h-full md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:-rotate-90 transition-opacity duration-700 z-0 ${isVideoActive ? 'opacity-100' : 'opacity-0'}`}
                    loop
                    autoPlay
                    muted
                    preload="metadata"
                    playsInline
                    onPlaying={() => setIsVideoActive(true)}
                >
                    Your browser does not support the video tag.
                </video>

                <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />
            </section>

            {/* 2. Image Folio Section */}
            {siteConfig?.folioImages && siteConfig.folioImages.length > 0 && (
                <ScrollReveal>
                    <ImageFolio images={siteConfig.folioImages} />
                </ScrollReveal>
            )}

            {/* 3. About Us Section */}
            <ScrollReveal>
                <AboutUsPreview teamImages={siteConfig?.teamImages || []} teamGrid={siteConfig?.teamGrid || '2x3'} />
            </ScrollReveal>

            {/* 4. Gallery Section */}
            <ScrollReveal>
                <section className="bg-brand-dark p-2">
                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Left Column */}
                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                            {portfolioItems.filter((_, i) => i % 2 === 0).map((item, index) => (
                                <ScrollReveal key={item.id || index} delay={index * 100}>
                                    <Card
                                        title={item.title}
                                        date={item.date}
                                        image={item.heroImage?.url || item.heroImage}
                                        lowResImage={item.heroImageLowRes?.url || item.heroImageLowRes}
                                        className={index % 2 === 0 ? "h-[40vh] sm:h-[50vh] md:h-[60vh]" : "h-[60vh] sm:h-[75vh] md:h-[90vh]"}
                                        onClick={() => navigate(`/project/${item.id || item._id}`)}
                                    />
                                </ScrollReveal>
                            ))}
                        </div>
                        {/* Right Column */}
                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                            {portfolioItems.filter((_, i) => i % 2 !== 0).map((item, index) => (
                                <ScrollReveal key={item.id || index} delay={index * 100}>
                                    <Card
                                        title={item.title}
                                        date={item.date}
                                        image={item.heroImage?.url || item.heroImage}
                                        lowResImage={item.heroImageLowRes?.url || item.heroImageLowRes}
                                        className={index % 2 === 0 ? "h-[60vh] sm:h-[75vh] md:h-[90vh]" : "h-[40vh] sm:h-[50vh] md:h-[60vh]"}
                                        onClick={() => navigate(`/project/${item.id || item._id}`)}
                                    />
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* 5. Embedded Contact Section */}
            <ScrollReveal>
                <section id="contact-section" className="relative w-full bg-[#424530] flex items-center justify-center overflow-hidden py-24 sm:py-32">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={contactBg}
                            alt="Contact Background"
                            className="w-full h-full object-cover opacity-50 grayscale"
                            loading="lazy"
                        />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 w-full max-w-2xl px-4 text-center">
                        <div className="mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-cream tracking-wider mb-2">
                                BEGIN YOUR STORY
                            </h2>
                            <p className="text-sm text-gray-300 font-light">Get in touch with us today.</p>
                        </div>
                        <ContactForm />
                    </div>
                </section>
            </ScrollReveal>
        </MainLayout>
    );
};

export default Home;
