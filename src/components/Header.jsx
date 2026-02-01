import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { LogOut, Settings, LayoutDashboard } from 'lucide-react';

export default function Header({ openSettings }) {
    const { isAuthenticated, logout, config } = useAuth();

    return (
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 w-full">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                        src="https://beamlight.it/wp-content/uploads/2023/11/BEAMLIGHT-sito-web-nera.png"
                        alt="Beamlight Logo"
                        className="h-10 w-auto"
                    />
                    <div className="hidden md:block w-px h-6 bg-gray-700"></div>
                    <span className="hidden md:flex items-center text-gray-400 text-sm font-medium">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Marketing Dashboard
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    {isAuthenticated ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={openSettings} className="mr-2 hidden md:inline-flex text-gray-400 hover:text-white">
                                <Settings className="w-4 h-4 mr-2" />
                                Configurazione
                            </Button>
                            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-white">
                                <LogOut className="w-4 h-4 mr-2" />
                                Esci
                            </Button>
                        </>
                    ) : (
                        <span className="text-xs text-yellow-500 font-medium">Non Connesso</span>
                    )}
                    <Button variant="secondary" size="icon" className="md:hidden" onClick={openSettings}>
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
