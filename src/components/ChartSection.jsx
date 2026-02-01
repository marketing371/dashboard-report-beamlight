import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ChartSection({ data, title }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#9CA3AF' }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#9CA3AF' }
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9CA3AF' }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    // Fallback data if null
    const chartData = data || { labels: [], datasets: [] };

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <Line options={options} data={chartData} />
                </div>
            </CardContent>
        </Card>
    );
}
