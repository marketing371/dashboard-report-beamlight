import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { FileDown, Sparkles, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

export default function ReportGenerator({ data, clientName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiInsight, setAiInsight] = useState('');
    const { config, authToken } = useAuth();

    const generateAiInsight = async () => {
        if (!authToken || !config.workerUrl) return;
        setIsGenerating(true);
        try {
            const response = await fetch(`${config.workerUrl}/gemini`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data, clientName })
            });
            if (response.ok) {
                const result = await response.json();
                setAiInsight(result.insight);
            } else {
                setAiInsight("Impossibile generare insight al momento. Riprova più tardi.");
            }
        } catch (e) {
            console.error(e);
            setAiInsight("Errore durante la generazione degli insight.");
        } finally {
            setIsGenerating(false);
        }
    };

    const exportToPdf = async () => {
        const input = document.getElementById('dashboard-content');
        if (!input) return;

        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#111827'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

        pdf.addImage(imgData, 'PNG', 0, 10, imgWidth * ratio, imgHeight * ratio);

        if (aiInsight) {
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.text('Analisi AI e Raccomandazioni', 10, 20);
            pdf.setFontSize(10);
            const splitText = pdf.splitTextToSize(aiInsight, 180);
            pdf.text(splitText, 10, 30);
        }

        pdf.save(`Report_Beamlight_${clientName}_${new Date().toLocaleDateString()}.pdf`);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg">
                <FileText className="w-4 h-4 mr-2" /> Genera Report Pro
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Generatore Report Professionale" className="max-w-3xl">
                <div className="space-y-6">
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="flex items-center font-semibold text-cyan-400">
                                <Sparkles className="w-4 h-4 mr-2" /> Insight Intelligenti (Gemini AI)
                            </h4>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={generateAiInsight}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analizza Dati'}
                            </Button>
                        </div>
                        {aiInsight ? (
                            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2">
                                {aiInsight}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Clicca su "Analizza Dati" per ottenere un commento professionale da inviare al cliente.</p>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4">
                        <p className="text-sm text-gray-400">
                            Questo strumento genera un PDF completo contenente la dashboard attuale e gli insight dell'IA.
                            Ideale per invii mensili o presentazioni.
                        </p>
                        <Button
                            onClick={exportToPdf}
                            variant="default"
                            className="w-full h-12 text-lg font-bold"
                        >
                            <FileDown className="w-6 h-6 mr-2" /> Scarica Report PDF
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
