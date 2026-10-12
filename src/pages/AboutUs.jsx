// About Us Page
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import heroBackground from '../assets/image/Backgrou image/AND03973 1.png';
import howWeWorkBg from '../assets/image/Backgrou image/Layer 1 1.png';

const DEFAULT_TEAM_MEMBERS = [
    { id: 'tm_1', name: 'ISHVAR', role: 'Photographer', image: null },
    { id: 'tm_2', name: 'RAJESH', role: 'Photographer', image: null },
    { id: 'tm_3', name: 'SAI', role: 'Photographer', image: null },
    { id: 'tm_4', name: 'GOWRI', role: 'Photographer', image: null },
    { id: 'tm_5', name: 'ANDREW', role: 'Photographer', image: null },
    { id: 'tm_6', name: 'DHANUSH', role: 'Photographer', image: null },
    { id: 'tm_7', name: 'HARI', role: 'Photographer', image: null },
    { id: 'tm_8', name: 'SHRAVANN', role: 'Photographer', image: null },
];

const DEFAULT_STORIES = [
    {
        id: 'story_1',
        title: 'Jayanthi & Karthik',
        image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'story_2',
        title: 'Kavitha & Sathish',
        image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'story_3',
        title: 'Vijay & Rohini',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    },
];

const extractTeamMembers = (sc, defaultList = DEFAULT_TEAM_MEMBERS) => {
    if (!sc || !sc.teamMembers) return defaultList;
    if (Array.isArray(sc.teamMembers) && sc.teamMembers.length > 0) return sc.teamMembers;
    if (sc.teamMembers && Array.isArray(sc.teamMembers.list) && sc.teamMembers.list.length > 0) return sc.teamMembers.list;
    if (sc.teamMembers && Array.isArray(sc.teamMembers.members) && sc.teamMembers.members.length > 0) return sc.teamMembers.members;
    return defaultList;
};

const AboutUs = () => {
    const navigate = useNavigate();
    const [teamMembers, setTeamMembers] = useState(() => {
        try {
            const cached = localStorage.getItem('lsd_site_config');
            if (cached) {
                const parsed = JSON.parse(cached);
                return extractTeamMembers(parsed);
            }
        } catch {}
        return DEFAULT_TEAM_MEMBERS;
    });

    const [stories, setStories] = useState(DEFAULT_STORIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, siteConfigData] = await Promise.all([
                    api.getAllProjects(),
                    api.getSiteConfig()
                ]);

                if (siteConfigData) {
                    try {
                        localStorage.setItem('lsd_site_config', JSON.stringify(siteConfigData));
                    } catch {}
                    const extracted = extractTeamMembers(siteConfigData);
                    if (extracted && extracted.length > 0) {
                        setTeamMembers(extracted);
                    }
                }

                if (Array.isArray(projectsData) && projectsData.length > 0) {
                    // Filter portfolio items toggled for About Us page
                    const aboutStories = projectsData.filter(p => p.aboutPage === true);
                    if (aboutStories.length > 0) {
                        setStories(aboutStories);
                    } else {
                        // Fallback to homePage items or first 3 projects
                        const fallback = projectsData.filter(p => p.homePage === true).slice(0, 3);
                        setStories(fallback.length > 0 ? fallback : projectsData.slice(0, 3));
                    }
                }
            } catch (err) {
                console.error("Failed to load About Us dynamic data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const workPillars = [
        {
            title: 'DOCUMENTARY-STYLE STORYTELLING:',
            description: 'Candid, unposed, authentic moments are what we live for.',
        },
        {
            title: 'ARTISTIC FLAIR:',
            description: 'We blend cinematic visuals with heartfelt emotion.',
        },
        {
            title: 'COLLABORATIVE PARTNERSHIP:',
            description: 'From pre-wedding consultations to on-the-day coordination, we work hand-in-hand with you.',
        },
        {
            title: 'DETAIL-ORIENTED:',
            description: "Whether it's the shimmer of an accessory or a tear-filled glance, nothing escapes our lens.",
        },
    ];

    const renderTeamMemberCard = (member, index) => {
        const photoUrl = member.image?.url || member.image?.downloadUrl || (typeof member.image === 'string' ? member.image : null);

        return (
            <div key={member.id || index} className="text-center group">
                <div className="bg-gray-800 rounded-lg aspect-[3/4] mb-4 overflow-hidden relative shadow-md">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                            <svg className="w-16 h-16 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}
                </div>
                <h3 className="text-sm md:text-base font-light tracking-wide uppercase text-[#FFEFCD]">{member.name}</h3>
                <p className="text-xs md:text-sm text-gray-400 mt-0.5">{member.role}</p>
            </div>
        );
    };

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="relative h-screen w-full bg-[#424530] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroBackground}
                        alt="About Us Background"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase text-brand-cream">
                        YOUR LOVE. OUR LENS.
                    </h1>
                </div>
            </div>

            {/* Who Are We Section */}
            <section className="bg-brand-dark text-white py-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-light mb-6 tracking-wide text-[#FFEFCD]">WHO ARE WE?</h2>
                        <div className="space-y-4 text-gray-300 font-light text-sm md:text-base leading-relaxed">
                            <p>
                                We're a group of passionate storytellers armed with cameras and fueled by love. Based in Chennai, LSD
                                Production believes that every wedding is a cinematic narrative worth cherishing.
                            </p>
                            <p>
                                With youthful energy, creative vision, and a keen eye for emotion, we capture your most authentic,
                                heartfelt moments, delivering not just photos and videos but heartfelt memories to cherish forever.
                            </p>
                            <p>
                                Over the past 7+ years, we've had the privilege of serving over 350 happy clients and capturing 600+
                                memorable events, earning 11 industry awards along the way.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg overflow-hidden">
                        <img
                            src={howWeWorkBg}
                            alt="Our Work"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* How We Work Section */}
            <section className="bg-brand-black text-white py-12 sm:py-16 md:py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xs sm:text-sm md:text-base font-light mb-12 sm:mb-16 md:mb-20 tracking-[0.3em] sm:tracking-[0.4em] text-center text-brand-cream uppercase">HOW WE WORK</h2>
                    <div className="space-y-10 sm:space-y-12 md:space-y-16">
                        {workPillars.map((pillar, index) => (
                            <div key={index} className="text-center">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-light mb-3 sm:mb-4 tracking-wide text-white uppercase">{pillar.title}</h3>
                                <p className="text-gray-400 font-light text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet The Team Section */}
            <section className="bg-brand-dark text-white py-12 sm:py-16 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-light mb-8 sm:mb-12 tracking-wide text-center text-[#FFEFCD]">MEET THE TEAM</h2>
                    
                    {/* First 6 members (2 rows of 3 on desktop, 3 rows of 2 on mobile) */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12 max-w-4xl mx-auto mb-6 sm:mb-8">
                        {teamMembers.slice(0, 3).map((member, index) => renderTeamMemberCard(member, index))}
                    </div>
                    
                    {teamMembers.length > 3 && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12 max-w-4xl mx-auto mb-6 sm:mb-8">
                            {teamMembers.slice(3, 6).map((member, index) => renderTeamMemberCard(member, index + 3))}
                        </div>
                    )}

                    {/* Centered remaining members (e.g. 7 & 8) */}
                    {teamMembers.length > 6 && (
                        <div className={`grid gap-4 sm:gap-8 md:gap-12 mx-auto ${
                            teamMembers.length - 6 === 1 
                                ? 'max-w-xs grid-cols-1' 
                                : teamMembers.length - 6 === 2 
                                ? 'max-w-md grid-cols-2' 
                                : 'max-w-4xl grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                        }`}>
                            {teamMembers.slice(6).map((member, index) => renderTeamMemberCard(member, index + 6))}
                        </div>
                    )}
                </div>
            </section>

            {/* Stories We've Crafted Section */}
            <section className="bg-brand-black text-white py-12 sm:py-16 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-light mb-8 sm:mb-12 tracking-wide text-center italic text-[#FFEFCD]">
                        Stories We've Crafted
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {stories.map((story, index) => {
                            const storyImage = story.heroImage?.url || story.heroImage?.downloadUrl || (typeof story.heroImage === 'string' ? story.heroImage : null) || story.image;
                            const storyTitle = story.title || story.couple;
                            const storyId = story.id || story._id;

                            return (
                                <div 
                                    key={storyId || index} 
                                    onClick={() => {
                                        if (storyId && !storyId.startsWith('story_')) {
                                            navigate(`/project/${storyId}`);
                                        }
                                    }}
                                    className={`group ${storyId && !storyId.startsWith('story_') ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="rounded-lg overflow-hidden mb-4 aspect-[4/5] bg-gray-900 shadow-md">
                                        <img
                                            src={storyImage}
                                            alt={storyTitle}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <p className="text-center text-sm font-light text-[#FFEFCD] group-hover:text-white transition-colors">{storyTitle}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center">
                        <Link
                            to="/photography"
                            className="inline-block bg-brand-cream text-brand-buttonText px-8 py-3 text-sm font-light tracking-widest hover:bg-brand-cream/90 transition-colors"
                        >
                            VIEW PORTFOLIO
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-brand-dark text-white py-12 sm:py-16 md:py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-light mb-4 sm:mb-6 tracking-wide text-[#FFEFCD]">
                        READY TO CAPTURE YOUR STORY?
                    </h2>
                    <p className="text-gray-300 font-light text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">
                        Whether you're planning an intimate ceremony or a grand celebration, we're here to make your wedding
                        unforgettable. Let's bring your vision to life, together.
                    </p>
                    <Link
                        to="/contact-us"
                        className="inline-block bg-brand-cream text-brand-buttonText px-8 py-3 text-sm font-light tracking-widest hover:bg-brand-cream/90 transition-colors"
                    >
                        GET IN TOUCH
                    </Link>
                </div>
            </section>
        </MainLayout>
    );
};

export default AboutUs;
