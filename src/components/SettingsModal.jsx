import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Save } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
    const { config, updateConfig, saveRemoteConfig } = useAuth();
    const [localConfig, setLocalConfig] = useState(config);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) setLocalConfig(config);
    }, [isOpen, config]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveRemoteConfig(localConfig);
            onClose();
        } catch (e) {
            alert('Errore nel salvataggio: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleClientChange = (id, field, value) => {
        setLocalConfig(prev => ({
            ...prev,
            clients: {
                ...prev.clients,
                [id]: { ...prev.clients[id], [field]: value }
            }
        }));
    };

    const addClient = () => {
        const newId = `client_${Date.now()}`;
        setLocalConfig(prev => ({
            ...prev,
            clients: {
                ...prev.clients,
                [newId]: { name: 'Nuovo Cliente', ga4PropertyId: '' }
            }
        }));
    };

    const removeClient = (id) => {
        if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
        setLocalConfig(prev => {
            const newClients = { ...prev.clients };
            delete newClients[id];
            return { ...prev, clients: newClients };
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Impostazioni Dashboard" className="max-w-4xl">
            <div className="space-y-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Configurazione Generale</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400">Google Client ID</label>
                            <Input
                                value={localConfig.googleClientId || ''}
                                onChange={e => setLocalConfig(prev => ({ ...prev, googleClientId: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Worker URL</label>
                            <Input
                                value={localConfig.workerUrl || ''}
                                onChange={e => setLocalConfig(prev => ({ ...prev, workerUrl: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Clienti</h4>
                        <Button size="sm" variant="secondary" onClick={addClient}>
                            <Plus className="w-4 h-4 mr-2" /> Aggiungi
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(localConfig.clients || {}).map(([id, client]) => (
                            <div key={id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <Input
                                        className="font-semibold bg-transparent border-none focus:ring-0 p-0 h-auto text-base w-1/2"
                                        value={client.name}
                                        onChange={e => handleClientChange(id, 'name', e.target.value)}
                                        placeholder="Nome Cliente"
                                    />
                                    <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => removeClient(id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Input
                                        placeholder="GA4 Property ID"
                                        value={client.ga4PropertyId || ''}
                                        onChange={e => handleClientChange(id, 'ga4PropertyId', e.target.value)}
                                    />
                                    <Input
                                        placeholder="GAds Customer ID"
                                        value={client.gadsCustomerId || ''}
                                        onChange={e => handleClientChange(id, 'gadsCustomerId', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Meta Ad Account ID"
                                        value={client.metaAdAccountId || ''}
                                        onChange={e => handleClientChange(id, 'metaAdAccountId', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Eventi Meta (virgola)"
                                        value={client.metaConversionEvents || ''}
                                        onChange={e => handleClientChange(id, 'metaConversionEvents', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Salvataggio...' : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Salva Configurazione
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
