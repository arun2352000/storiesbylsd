import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import logo from '../../assets/image/logo/PRIMARY LOGO.png';
import { useLayout } from '../../context/LayoutContext';

const Navbar = () => {
    const { isMenuOpen, setIsMenuOpen } = useLayout();

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20">
                        {/* Left spacer for centering logo */}
                        <div className="w-10 sm:w-12 hidden sm:block"></div>

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center flex-1">
                            <Link to="/" className="flex items-center">
                                <img src={logo} alt="LSD Logo" className="h-10 sm:h-12 w-auto" />
                            </Link>
                        </div>

                        {/* Menu Button */}
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-black z-50 relative !hover:bg-transparent hover:!bg-transparent focus:!outline-none active:!outline-none focus:!ring-0 !focus:ring-0 focus-visible:!ring-0 focus-visible:!outline-none !shadow-none !border-0 border-0 !ring-offset-0 ring-offset-0 active:!border-0 active:!ring-0 min-w-[44px] min-h-[44px]"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                            >
                                {isMenuOpen ? (
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
                                    </svg>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Full Screen Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-xl flex items-center justify-end pr-4 sm:pr-8 lg:pr-12">
                    <div className="flex flex-col space-y-4 sm:space-y-6 text-right">
                        <Link
                            to="/wedding-films"
                            className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 hover:text-black transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Wedding Films
                        </Link>
                        <Link
                            to="/photography"
                            className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 hover:text-black transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Photography
                        </Link>
                        <Link
                            to="/about-us"
                            className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 hover:text-black transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About Us
                        </Link>
                        <Link
                            to="/contact-us"
                            className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 hover:text-black transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact us
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
