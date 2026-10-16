import React from 'react';

const AboutUsPreview = ({ teamImages = [], teamGrid = '2x3' }) => {
    // Determine slot count and grid layout based on teamGrid setting
    let targetCount = 6;
    let gridColsClass = 'grid-cols-2 sm:grid-cols-3';
    let containerWidthClass = 'w-full md:w-[55%] lg:w-[50%]';

    if (teamGrid === '2x2') {
        targetCount = 4;
        gridColsClass = 'grid-cols-2';
        containerWidthClass = 'w-full md:w-[45%] lg:w-[40%]';
    } else if (teamGrid === '2x4') {
        targetCount = 8;
        gridColsClass = 'grid-cols-2 sm:grid-cols-4';
        containerWidthClass = 'w-full md:w-[60%] lg:w-[55%]';
    } else { // '2x3'
        targetCount = 6;
        gridColsClass = 'grid-cols-2 sm:grid-cols-3';
        containerWidthClass = 'w-full md:w-[55%] lg:w-[50%]';
    }

    const displayImages = [...teamImages];
    while (displayImages.length < targetCount) {
        displayImages.push(null);
    }
    const finalImages = displayImages.slice(0, targetCount);

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Calculate order classes so the alternating (chessboard) pattern is preserved in 2-column mobile view
    const getOrderItemClass = (index) => {
        if (teamGrid === '2x3' || !teamGrid) {
            switch (index) {
                case 0: return 'order-1 sm:order-1';
                case 1: return 'order-2 sm:order-2';
                case 2: return 'order-4 sm:order-3'; // Swap with index 3 on mobile
                case 3: return 'order-3 sm:order-4'; // Swap with index 2 on mobile
                case 4: return 'order-5 sm:order-5';
                case 5: return 'order-6 sm:order-6';
                default: return '';
            }
        }
        if (teamGrid === '2x4') {
            switch (index) {
                case 0: return 'order-1 sm:order-1';
                case 1: return 'order-2 sm:order-2';
                case 2: return 'order-4 sm:order-3';
                case 3: return 'order-3 sm:order-4';
                case 4: return 'order-5 sm:order-5';
                case 5: return 'order-6 sm:order-6';
                case 6: return 'order-8 sm:order-7';
                case 7: return 'order-7 sm:order-8';
                default: return '';
            }
        }
        if (teamGrid === '2x2') {
            switch (index) {
                case 0: return 'order-1';
                case 1: return 'order-2';
                case 2: return 'order-4';
                case 3: return 'order-3';
                default: return '';
            }
        }
        return '';
    };

    return (
        <section className="bg-[#424530] text-white pt-20 pb-16 md:py-24 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-20">
                
                {/* Mobile Heading (Shown above team images on mobile screens) */}
                <div className="w-full text-center md:hidden mb-4">
                    <h2 className="font-serif text-3xl sm:text-4xl text-brand-cream tracking-wide">ABOUT US</h2>
                </div>

                {/* Team Grid */}
                <div className={containerWidthClass}>
                    <div className={`grid ${gridColsClass} gap-0 border-t border-l border-white/10`}>
                        {finalImages.map((img, index) => (
                            <div 
                                key={index} 
                                className={`aspect-square border-r border-b border-white/10 overflow-hidden bg-[#424530] ${getOrderItemClass(index)}`}
                            >
                                {img && (
                                    <img 
                                        src={img.url || img.downloadUrl} 
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                                        alt={`Stories by LSD Wedding Photography Team Member ${index + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Text & Button */}
                <div className="w-full md:w-[40%] lg:w-[45%] flex flex-col justify-center">
                    <h2 className="hidden md:block font-serif text-3xl md:text-5xl mb-6 text-brand-cream tracking-wide">ABOUT US</h2>
                    
                    <div className="text-gray-300 font-light text-sm md:text-base leading-relaxed space-y-5 mb-10 text-center md:text-left">
                        <p>
                            "Our Team is a bunch of storytelling enthusiasts with cameras—young, energetic, and hopelessly in love with love! We turn every wedding into a cinematic adventure, capturing all the laughter, happy tears, and those candid moments you'll cherish forever.
                        </p>
                        <p>
                            From the heartfelt vows to the epic dance floor moves, we're always in the right place at the right time, blending creativity with a dash of spontaneity. With us, your wedding day isn't just documented—it's transformed into a vibrant, visual celebration that you'll want to relive over and over."
                        </p>
                    </div>

                    <div className="text-center md:text-left">
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
