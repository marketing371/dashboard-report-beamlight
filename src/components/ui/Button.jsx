import React from 'react';
import { cn } from '@/lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
        default: 'bg-cyan-600 text-white hover:bg-cyan-700',
        outline: 'border border-gray-600 bg-transparent hover:bg-gray-700 text-gray-200',
        ghost: 'hover:bg-gray-700 hover:text-white text-gray-400',
        secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = "Button";
