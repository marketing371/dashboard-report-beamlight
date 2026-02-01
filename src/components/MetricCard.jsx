import React from 'react';
import { Card, CardContent } from './ui/Card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, comparison, type = 'neutral' }) {
    // comparison: { value: number, percentage: number }
    // type: 'positive' | 'negative' | 'neutral' (determines color logic)

    let trendColor = 'text-gray-400';
    let TrendIcon = Minus;

    if (comparison) {
        if (comparison.percentage > 0) {
            TrendIcon = ArrowUpRight;
            if (type === 'positive') trendColor = 'text-green-400';
            else if (type === 'negative') trendColor = 'text-red-400';
            else trendColor = 'text-gray-300';
        } else if (comparison.percentage < 0) {
            TrendIcon = ArrowDownRight;
            if (type === 'positive') trendColor = 'text-red-400';
            else if (type === 'negative') trendColor = 'text-green-400';
            else trendColor = 'text-gray-300';
        }
    }

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    {comparison && (
                        <div className={cn("flex items-center text-sm font-medium", trendColor)}>
                            <TrendIcon className="w-4 h-4 mr-1" />
                            {Math.abs(comparison.percentage * 100).toFixed(1)}%
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
