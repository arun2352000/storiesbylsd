// About Us Page
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Link } from 'react-router-dom';
import heroBackground from '../assets/image/Backgrou image/AND03973 1.png';
import howWeWorkBg from '../assets/image/Backgrou image/Layer 1 1.png';

const AboutUs = () => {
    const teamMembers = [
        { name: 'ISHVAR', role: 'Photographer' },
        { name: 'RAJESH', role: 'Photographer' },
        { name: 'SAI', role: 'Photographer' },
        { name: 'GOWRI', role: 'Photographer' },
        { name: 'ANDREW', role: 'Photographer' },
        { name: 'DHANUSH', role: 'Photographer' },
        { name: 'HARI', role: 'Photographer' },
        { name: 'SHRAVANN', role: 'Photographer' },
    ];

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

    const stories = [
        {
            couple: 'Jayanthi & Karthik',
            image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=800&auto=format&fit=crop',
        },
        {
            couple: 'Kavitha & Sathish',
            image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=800&auto=format&fit=crop',
        },
        {
            couple: 'Vijay & Rohini',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
        },
    ];

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
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12 max-w-4xl mx-auto mb-6 sm:mb-8">
                        {teamMembers.slice(0, 3).map((member, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-gray-800 rounded-lg aspect-[3/4] mb-4 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-sm md:text-base font-light tracking-wide uppercase text-[#FFEFCD]">{member.name}</h3>
                                <p className="text-xs md:text-sm text-gray-400">{member.role}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12 max-w-4xl mx-auto mb-6 sm:mb-8">
                        {teamMembers.slice(3, 6).map((member, index) => (
                            <div key={index + 3} className="text-center">
                                <div className="bg-gray-800 rounded-lg aspect-[3/4] mb-4 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-sm md:text-base font-light tracking-wide uppercase text-[#FFEFCD]">{member.name}</h3>
                                <p className="text-xs md:text-sm text-gray-400">{member.role}</p>
                            </div>
                        ))}
                    </div>
                    {teamMembers.length > 6 && (
                        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-12 max-w-md mx-auto">
                            {teamMembers.slice(6, 8).map((member, index) => (
                                <div key={index + 6} className="text-center">
                                    <div className="bg-gray-800 rounded-lg aspect-[3/4] mb-4 overflow-hidden">
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-sm md:text-base font-light tracking-wide uppercase text-[#FFEFCD]">{member.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-400">{member.role}</p>
                                </div>
                            ))}
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
                        {stories.map((story, index) => (
                            <div key={index} className="group cursor-pointer">
                                <div className="rounded-lg overflow-hidden mb-4 aspect-[4/5]">
                                    <img
                                        src={story.image}
                                        alt={story.couple}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <p className="text-center text-sm font-light">{story.couple}</p>
                            </div>
                        ))}
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
