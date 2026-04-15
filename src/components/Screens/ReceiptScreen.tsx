import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, Download, Share2, Printer, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface ReceiptScreenProps {
  onBack: () => void;
  expression: string;
  result: string;
}

export function ReceiptScreen({ onBack, expression, result }: ReceiptScreenProps) {
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('MASTER DIGITS PRO', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Professional Calculation Receipt', 105, 28, { align: 'center' });
    
    // Info
    doc.setFontSize(12);
    doc.text(`Invoice: ${invoiceNumber}`, 20, 45);
    doc.text(`Date: ${format(new Date(), 'PPP p')}`, 20, 52);
    doc.text(`Customer: ${customerName || 'Valued Client'}`, 20, 59);
    
    // Table Header
    doc.line(20, 70, 190, 70);
    doc.text('Description', 25, 78);
    doc.text('Calculation', 100, 78);
    doc.text('Total', 170, 78);
    doc.line(20, 82, 190, 82);
    
    // Content
    doc.text('General Calculation', 25, 95);
    doc.text(expression, 100, 95);
    doc.text(result, 170, 95);
    
    // Footer
    doc.line(20, 110, 190, 110);
    doc.setFontSize(14);
    doc.text('Grand Total:', 130, 120);
    doc.text(result, 170, 120);
    
    doc.setFontSize(10);
    doc.text('Thank you for using Master Digits Pro!', 105, 150, { align: 'center' });
    
    doc.save(`${invoiceNumber}.pdf`);
    setIsGenerating(false);
    setIsDone(true);
    setTimeout(() => setIsDone(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="absolute inset-0 bg-background z-50 flex flex-col"
    >
      <div className="p-6 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="p-2 rounded-xl bg-secondary text-secondary-foreground">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black tracking-tight">Receipt Generator</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Customer Name (Optional)</label>
            <input 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-6 py-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all font-bold text-foreground"
            />
          </div>

          <div className="p-8 bg-card border-2 border-dashed border-border rounded-[2.5rem] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <FileText className="w-32 h-32" />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black tracking-tight">Master Digits Pro</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Official Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invoice #</p>
                <p className="font-black text-primary">{invoiceNumber}</p>
              </div>
            </div>

            <div className="space-y-4 py-6 border-y border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Expression:</span>
                <span className="font-bold text-foreground">{expression}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Result:</span>
                <span className="font-bold text-foreground">{result}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-black">Total Amount</span>
              <span className="text-3xl font-black text-primary">{result}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="col-span-2 py-5 bg-primary text-primary-foreground rounded-3xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isDone ? <Check className="w-6 h-6" /> : <Download className="w-6 h-6" />}
            {isGenerating ? 'Generating...' : isDone ? 'Downloaded!' : 'Download PDF Receipt'}
          </button>
          
          <button className="py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Share2 className="w-5 h-5" />
            Share
          </button>
          
          <button className="py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </div>
    </motion.div>
  );
}
