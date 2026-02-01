import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [config, setConfig] = useState({
        googleClientId: '',
        workerUrl: '',
        clients: {}
    });
    const [authToken, setAuthToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial config from local storage
    useEffect(() => {
        try {
            const localConfig = localStorage.getItem('beamlightDashboardBootstrap');
            if (localConfig) {
                const parsed = JSON.parse(localConfig);
                setConfig(prev => ({ ...prev, ...parsed }));
            }

            const token = sessionStorage.getItem('googleAuthToken');
            if (token) {
                setAuthToken(token);
            } else {
                // Check URL for token
                const urlParams = new URLSearchParams(window.location.search);
                const tokenFromUrl = urlParams.get('token');
                if (tokenFromUrl) {
                    setAuthToken(tokenFromUrl);
                    sessionStorage.setItem('googleAuthToken', tokenFromUrl);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        } catch (e) {
            console.error("Error loading initial config", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch remote config when token and workerUrl are available
    useEffect(() => {
        const fetchRemoteConfig = async () => {
            if (!authToken || !config.workerUrl) return;
            try {
                const response = await fetch(`${config.workerUrl}/config`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    const remoteConfig = await response.json();
                    setConfig(prev => ({ ...prev, ...remoteConfig }));
                }
            } catch (e) {
                console.error("Failed to fetch remote config", e);
            }
        };

        if (authToken && config.workerUrl) {
            fetchRemoteConfig();
        }
    }, [authToken, config.workerUrl]);

    const login = () => {
        if (!config.googleClientId || !config.workerUrl) {
            alert('Configurazione mancante. Inserisci Client ID e Worker URL.');
            return;
        }
        const scopes = 'openid https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/adwords';
        const redirectUri = `${config.workerUrl}/google-auth-callback`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
        window.location.href = authUrl;
    };

    const logout = () => {
        setAuthToken(null);
        sessionStorage.removeItem('googleAuthToken');
    };

    const updateConfig = (newConfig) => {
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };
            localStorage.setItem('beamlightDashboardBootstrap', JSON.stringify({
                googleClientId: updated.googleClientId,
                workerUrl: updated.workerUrl
            }));
            return updated;
        });
    };

    const saveRemoteConfig = async (configToSave) => {
        if (!authToken || !config.workerUrl) return;
        try {
            const response = await fetch(`${config.workerUrl}/config`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configToSave)
            });
            if (!response.ok) throw new Error('Salvataggio remoto fallito');
            // Update local state as well
            updateConfig(configToSave);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{
            config,
            authToken,
            isLoading,
            login,
            logout,
            updateConfig,
            saveRemoteConfig,
            isAuthenticated: !!authToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
