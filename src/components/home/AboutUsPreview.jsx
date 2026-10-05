import React from 'react';

const AboutUsPreview = ({ teamImages = [] }) => {
    // We expect up to 8 images for a 4x2 grid (4 columns, 2 rows)
    const displayImages = [...teamImages];
    while(displayImages.length < 8) {
        displayImages.push(null);
    }
    // Ensure we only show exactly 8 boxes to maintain the 2-row layout
    const finalImages = displayImages.slice(0, 8);

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-[#424530] text-white py-16 md:py-24 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-20">
                
                {/* Left Side: Team Grid (4 columns x 2 rows = 8 boxes) */}
                <div className="w-full md:w-[60%] lg:w-[55%]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-t border-l border-white/10">
                        {finalImages.map((img, index) => (
                            <div key={index} className="aspect-square border-r border-b border-white/10 overflow-hidden bg-[#424530]">
                                {img && (
                                    <img 
                                        src={img.url || img.downloadUrl} 
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                                        alt={`Team ${index + 1}`}
                                        loading="lazy"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Text & Button */}
                <div className="w-full md:w-[40%] lg:w-[45%] flex flex-col justify-center">
                    <h2 className="font-serif text-3xl md:text-5xl mb-6 text-brand-cream tracking-wide">ABOUT US</h2>
                    
                    <div className="text-gray-300 font-light text-sm md:text-base leading-relaxed space-y-5 mb-10">
                        <p>
                            "Our Team is a bunch of storytelling enthusiasts with cameras—young, energetic, and hopelessly in love with love! We turn every wedding into a cinematic adventure, capturing all the laughter, happy tears, and those candid moments you'll cherish forever.
                        </p>
                        <p>
                            From the heartfelt vows to the epic dance floor moves, we're always in the right place at the right time, blending creativity with a dash of spontaneity. With us, your wedding day isn't just documented—it's transformed into a vibrant, visual celebration that you'll want to relive over and over."
                        </p>
                    </div>

                    <div>
                        <button 
                            onClick={scrollToContact}
                            className="border border-brand-cream text-brand-cream px-8 py-3 text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-brand-cream hover:text-black transition-colors duration-300"
                        >
                            CONTACT US
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutUsPreview;
