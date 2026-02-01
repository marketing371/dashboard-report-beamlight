import React from 'react';
import Header from './Header';

export default function Layout({ children, openSettings }) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Header openSettings={openSettings} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
                {children}
            </main>
        </div>
    );
}
