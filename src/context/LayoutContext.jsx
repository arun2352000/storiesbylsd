import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <LayoutContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
            {children}
        </LayoutContext.Provider>
    );
};

LayoutProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
