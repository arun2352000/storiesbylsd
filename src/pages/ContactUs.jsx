import React from 'react';
import MainLayout from '../layouts/MainLayout';
import backgroundImage from '../assets/image/Backgrou image/image 2.png';
import ContactForm from '../components/common/ContactForm';
import SEO from '../components/common/SEO';

const ContactUs = () => {
    return (
        <MainLayout>
            <SEO
                title="Book Stories by LSD | Destination Wedding Photographers India"
                description="Get in touch with Stories by LSD to check wedding photography availability, packages, and book your date for weddings across India and worldwide destinations."
                canonical="https://www.storiesbylsd.com/contact-us"
            />
            <div className="relative min-h-screen w-full bg-[#424530] flex items-center justify-center overflow-hidden py-20 pt-24 sm:pt-20">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={backgroundImage}
                        alt="Contact Background"
                        className="w-full h-full object-cover opacity-50 grayscale"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-2xl px-4 text-center">
                    <div className="mb-8 sm:mb-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-cream tracking-wider mb-2">
                            BEGIN YOUR STORY
                        </h1>
                        <p className="text-[11px] sm:text-xs text-brand-cream/80 uppercase tracking-[0.25em] font-light mt-2">
                            Available Pan-India & Worldwide for Destination Weddings
                        </p>
                    </div>
                    <ContactForm />
                </div>
            </div>
        </MainLayout>
    );
};

export default ContactUs;
