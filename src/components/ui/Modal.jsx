import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export function Modal({ isOpen, onClose, title, children, className }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={cn(
                    "relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg shadow-xl animate-in zoom-in-95 duration-200",
                    className
                )}
                role="dialog"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
