import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-gray-800 focus:ring-primary',
        secondary: 'bg-secondary text-primary border border-gray-200 hover:bg-gray-50 focus:ring-gray-200',
        outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
        ghost: 'bg-transparent text-primary hover:bg-gray-100 focus:ring-gray-200',
        icon: 'rounded-full p-0', // For circular icon buttons like the play button
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        icon: 'w-12 h-12', // Fixed size for icon buttons
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = variant === 'icon' ? sizes.icon : (sizes[size] || sizes.md);

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'icon']),
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
    className: PropTypes.string,
};

export default Button;
