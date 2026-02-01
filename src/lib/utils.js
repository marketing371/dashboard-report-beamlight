import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value) {
    return `€${(value || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value) {
    return (value || 0).toLocaleString('it-IT');
}

export function formatPercentage(value, decimals = 2) {
    return `${(value * 100).toFixed(decimals)}%`.replace('.', ',');
}
