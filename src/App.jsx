import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { fetchClientData } from './services/api';
import Layout from './components/Layout';
import MetricCard from './components/MetricCard';
import ChartSection from './components/ChartSection';
import DataTable from './components/DataTable';
import SettingsModal from './components/SettingsModal';
import { Select } from './components/ui/Select';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { dayjs } from './lib/transformers';
import { Loader2, AlertCircle } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { formatCurrency, formatNumber, formatPercentage } from './lib/utils';

export default function App() {
    const { config, authToken, isLoading: authLoading, isAuthenticated, login } = useAuth();
    const [selectedClientId, setSelectedClientId] = useState('');
    const [dateRange, setDateRange] = useState({
        start: dayjs().subtract(7, 'day'),
        end: dayjs()
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Initial Client Selection
    useEffect(() => {
        if (config.clients && Object.keys(config.clients).length > 0 && !selectedClientId) {
            setSelectedClientId(Object.keys(config.clients)[0]);
        }
    }, [config.clients]);

    // Data Fetching
    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated || !selectedClientId || !config.workerUrl) return;

            setLoading(true);
            setError(null);
            try {
                const client = config.clients[selectedClientId];
                const result = await fetchClientData(config.workerUrl, authToken, client, dateRange);
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, selectedClientId, dateRange.start, dateRange.end, authToken, config.workerUrl]);

    // Column Definitions for Tables
    const campaignColumns = useMemo(() => [
        { header: 'Campagna', accessorKey: 'name' },
        { header: 'Costo', accessorKey: 'cost', cell: info => formatCurrency(info.getValue()) },
        { header: 'Click', accessorKey: 'clicks', cell: info => formatNumber(info.getValue()) },
        { header: 'Impressioni', accessorKey: 'impressions', cell: info => formatNumber(info.getValue()) },
        { header: 'Conversioni', accessorKey: 'conversions', cell: info => formatNumber(info.getValue()) },
        { header: 'CPA', accessorKey: 'cpa', cell: info => formatCurrency(info.getValue()) },
        { header: 'Quota Imp.', accessorKey: 'searchImpressionShare', cell: info => formatPercentage(info.getValue()) },
    ], []);

    const metaColumns = useMemo(() => [
        { header: 'Campagna', accessorKey: 'name' },
        { header: 'Spesa', accessorKey: 'spend', cell: info => formatCurrency(info.getValue()) },
        { header: 'Impressioni', accessorKey: 'impressions', cell: info => formatNumber(info.getValue()) },
        { header: 'Click', accessorKey: 'clicks', cell: info => formatNumber(info.getValue()) },
        { header: 'Conversioni', accessorKey: 'conversions', cell: info => formatNumber(info.getValue()) },
        { header: 'CPA', accessorKey: 'cpa', cell: info => formatCurrency(info.getValue()) },
    ], []);

    const trafficColumns = useMemo(() => [
        { header: 'Fonte / Mezzo', accessorKey: 'source' },
        { header: 'Sessioni', accessorKey: 'sessions', cell: info => formatNumber(info.getValue()) },
        { header: 'Utenti', accessorKey: 'users', cell: info => formatNumber(info.getValue()) },
        { header: 'Conversioni', accessorKey: 'conversions', cell: info => formatNumber(info.getValue()) },
    ], []);

    if (authLoading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin mr-2" /> Caricamento...</div>;

    if (!isAuthenticated) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-4">
                <img src="https://beamlight.it/wp-content/uploads/2023/11/BEAMLIGHT-sito-web-nera.png" alt="Beamlight" className="h-12 mb-4" />
                <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
                <p className="text-gray-400">Accedi per visualizzare i report</p>
                <Button onClick={login}>Accedi con Google</Button>
            </div>
        );
    }

    // KPI Calculation
    const kpis = data ? {
        cost: (data.gads?.totals?.cost || 0) + (data.meta?.totals?.spend || 0),
        clicks: (data.gads?.totals?.clicks || 0) + (data.meta?.totals?.clicks || 0),
        conversions: (data.ga4?.totals?.conversions || 0) + (data.gads?.totals?.conversions || 0) + (data.meta?.totals?.conversions || 0),
        cpa: 0,
    } : { cost: 0, clicks: 0, conversions: 0, cpa: 0 };

    if (kpis.conversions > 0) kpis.cpa = kpis.cost / kpis.conversions;

    return (
        <Layout openSettings={() => setIsSettingsOpen(true)}>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="w-full md:w-64">
                    <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                    <Select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                        {Object.entries(config.clients || {}).map(([id, client]) => (
                            <option key={id} value={id}>{client.name}</option>
                        ))}
                    </Select>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Dal</label>
                        <Input
                            type="date"
                            value={dateRange.start.format('YYYY-MM-DD')}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: dayjs(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Al</label>
                        <Input
                            type="date"
                            value={dateRange.end.format('YYYY-MM-DD')}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: dayjs(e.target.value) }))}
                        />
                    </div>
                </div>
            </div>

            {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-cyan-500" /></div>}

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    error: {error}
                </div>
            )}

            {!loading && data && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Spesa Totale" value={formatCurrency(kpis.cost)} />
                        <MetricCard title="Conversioni Totali" value={formatNumber(kpis.conversions)} />
                        <MetricCard title="CPA Medio" value={formatCurrency(kpis.cpa)} />
                        <MetricCard title="Click Totali" value={formatNumber(kpis.clicks)} />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartSection
                            title="Traffico GA4: Sessioni vs Nuovi Utenti"
                            data={{
                                labels: data.ga4?.timeseries?.labels || [],
                                datasets: [
                                    {
                                        label: 'Sessioni',
                                        data: data.ga4?.timeseries?.sessions || [],
                                        borderColor: 'rgb(34, 211, 238)',
                                        backgroundColor: 'rgba(34, 211, 238, 0.2)',
                                        fill: true,
                                    },
                                    {
                                        label: 'Nuovi Utenti',
                                        data: data.ga4?.timeseries?.newUsers || [],
                                        borderColor: 'rgb(16, 185, 129)',
                                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                        fill: true,
                                    }
                                ]
                            }}
                        />
                        <div className="space-y-6">
                            {/* Traffic Table */}
                            <div className="bg-gray-800 border-gray-700 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-700">
                                    <h3 className="text-lg font-semibold text-white">Sorgenti di Traffico</h3>
                                </div>
                                <div className="p-4">
                                    <DataTable data={data.ga4?.traffic || []} columns={trafficColumns} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Tables */}
                    <div className="grid grid-cols-1 gap-6">
                        {data.gads?.campaigns?.length > 0 && (
                            <div className="bg-gray-800 border-gray-700 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-white">Google Ads</h3>
                                    {data.gadsSandbox && <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">Sandbox</span>}
                                </div>
                                <div className="p-4">
                                    <DataTable data={data.gads.campaigns} columns={campaignColumns} />
                                </div>
                            </div>
                        )}

                        {data.meta?.campaigns?.length > 0 && (
                            <div className="bg-gray-800 border-gray-700 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-white">Meta Ads</h3>
                                    {data.metaSandbox && <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">Sandbox</span>}
                                </div>
                                <div className="p-4">
                                    <DataTable data={data.meta.campaigns} columns={metaColumns} />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Layout>
    );
}
