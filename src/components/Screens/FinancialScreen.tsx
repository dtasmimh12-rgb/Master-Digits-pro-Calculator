import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Calculator, Percent, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HistoryItem } from '../../types';

interface FinancialScreenProps {
  onBack: () => void;
  onSaveHistory: (item: HistoryItem) => void;
}

type FinancialSubMode = 'emi' | 'interest' | 'discount' | 'profit-loss';

export function FinancialScreen({ onBack, onSaveHistory }: FinancialScreenProps) {
  const [subMode, setSubMode] = useState<FinancialSubMode>('emi');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  const calculateEMI = () => {
    const p = parseFloat(inputs.principal || '0');
    const r = parseFloat(inputs.rate || '0') / 12 / 100;
    const n = parseFloat(inputs.tenure || '0');
    if (p && r && n) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setResult({
        emi: emi.toFixed(2),
        totalInterest: (emi * n - p).toFixed(2),
        totalPayment: (emi * n).toFixed(2)
      });
    }
  };

  const calculateInterest = () => {
    const p = parseFloat(inputs.principal || '0');
    const r = parseFloat(inputs.rate || '0');
    const t = parseFloat(inputs.time || '0');
    if (p && r && t) {
      const si = (p * r * t) / 100;
      const ci = p * (Math.pow(1 + r / 100, t)) - p;
      setResult({
        simpleInterest: si.toFixed(2),
        compoundInterest: ci.toFixed(2),
        totalAmount: (p + ci).toFixed(2)
      });
    }
  };

  const calculateDiscount = () => {
    const price = parseFloat(inputs.originalPrice || '0');
    const discount = parseFloat(inputs.discountPercent || '0');
    if (price && discount) {
      const saved = (price * discount) / 100;
      setResult({
        finalPrice: (price - saved).toFixed(2),
        savedAmount: saved.toFixed(2)
      });
    }
  };

  const calculateProfitLoss = () => {
    const cp = parseFloat(inputs.costPrice || '0');
    const sp = parseFloat(inputs.sellingPrice || '0');
    if (cp && sp) {
      const diff = sp - cp;
      const percent = (Math.abs(diff) / cp) * 100;
      setResult({
        type: diff >= 0 ? 'Profit' : 'Loss',
        amount: Math.abs(diff).toFixed(2),
        percentage: percent.toFixed(2)
      });
    }
  };

  const handleCalculate = () => {
    let res: any = null;
    let expr = '';
    
    if (subMode === 'emi') {
      const p = parseFloat(inputs.principal || '0');
      const r = parseFloat(inputs.rate || '0') / 12 / 100;
      const n = parseFloat(inputs.tenure || '0');
      if (p && r && n) {
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        res = {
          emi: emi.toFixed(2),
          totalInterest: (emi * n - p).toFixed(2),
          totalPayment: (emi * n).toFixed(2)
        };
        expr = `EMI: P=${p}, R=${inputs.rate}%, N=${n}`;
      }
    }
    
    if (subMode === 'interest') {
      const p = parseFloat(inputs.principal || '0');
      const r = parseFloat(inputs.rate || '0');
      const t = parseFloat(inputs.time || '0');
      if (p && r && t) {
        const si = (p * r * t) / 100;
        const ci = p * (Math.pow(1 + r / 100, t)) - p;
        res = {
          simpleInterest: si.toFixed(2),
          compoundInterest: ci.toFixed(2),
          totalAmount: (p + ci).toFixed(2)
        };
        expr = `Interest: P=${p}, R=${r}%, T=${t}`;
      }
    }

    if (subMode === 'discount') {
      const price = parseFloat(inputs.originalPrice || '0');
      const discount = parseFloat(inputs.discountPercent || '0');
      if (price && discount) {
        const saved = (price * discount) / 100;
        res = {
          finalPrice: (price - saved).toFixed(2),
          savedAmount: saved.toFixed(2)
        };
        expr = `Discount: ${price} - ${discount}%`;
      }
    }

    if (subMode === 'profit-loss') {
      const cp = parseFloat(inputs.costPrice || '0');
      const sp = parseFloat(inputs.sellingPrice || '0');
      if (cp && sp) {
        const diff = sp - cp;
        const percent = (Math.abs(diff) / cp) * 100;
        res = {
          type: diff >= 0 ? 'Profit' : 'Loss',
          amount: Math.abs(diff).toFixed(2),
          percentage: percent.toFixed(2)
        };
        expr = `P/L: CP=${cp}, SP=${sp}`;
      }
    }

    if (res) {
      setResult(res);
      onSaveHistory({
        id: Math.random().toString(36).substr(2, 9),
        expression: expr,
        result: res.emi || res.totalAmount || res.finalPrice || `${res.type} ${res.amount}`,
        timestamp: Date.now(),
        category: 'financial',
        note: JSON.stringify(res)
      });
    }
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
        <h2 className="text-xl font-black tracking-tight">Financial Hub</h2>
        <div className="w-10" />
      </div>

      <div className="flex p-4 gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'emi', label: 'EMI', icon: <Calculator className="w-4 h-4" /> },
          { id: 'interest', label: 'Interest', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'discount', label: 'Discount', icon: <Percent className="w-4 h-4" /> },
          { id: 'profit-loss', label: 'P/L', icon: <TrendingUp className="w-4 h-4" /> },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => { setSubMode(m.id as any); setResult(null); setInputs({}); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              subMode === m.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {subMode === 'emi' && (
          <div className="space-y-4">
            <InputGroup label="Principal Amount" value={inputs.principal} onChange={(v) => setInputs(p => ({ ...p, principal: v }))} icon={<DollarSign className="w-4 h-4" />} />
            <InputGroup label="Annual Interest Rate (%)" value={inputs.rate} onChange={(v) => setInputs(p => ({ ...p, rate: v }))} icon={<TrendingUp className="w-4 h-4" />} />
            <InputGroup label="Tenure (Months)" value={inputs.tenure} onChange={(v) => setInputs(p => ({ ...p, tenure: v }))} icon={<TrendingUp className="w-4 h-4" />} />
          </div>
        )}

        {subMode === 'interest' && (
          <div className="space-y-4">
            <InputGroup label="Principal Amount" value={inputs.principal} onChange={(v) => setInputs(p => ({ ...p, principal: v }))} icon={<DollarSign className="w-4 h-4" />} />
            <InputGroup label="Annual Interest Rate (%)" value={inputs.rate} onChange={(v) => setInputs(p => ({ ...p, rate: v }))} icon={<TrendingUp className="w-4 h-4" />} />
            <InputGroup label="Time (Years)" value={inputs.time} onChange={(v) => setInputs(p => ({ ...p, time: v }))} icon={<TrendingUp className="w-4 h-4" />} />
          </div>
        )}

        {subMode === 'discount' && (
          <div className="space-y-4">
            <InputGroup label="Original Price" value={inputs.originalPrice} onChange={(v) => setInputs(p => ({ ...p, originalPrice: v }))} icon={<DollarSign className="w-4 h-4" />} />
            <InputGroup label="Discount Percent (%)" value={inputs.discountPercent} onChange={(v) => setInputs(p => ({ ...p, discountPercent: v }))} icon={<Percent className="w-4 h-4" />} />
          </div>
        )}

        {subMode === 'profit-loss' && (
          <div className="space-y-4">
            <InputGroup label="Cost Price" value={inputs.costPrice} onChange={(v) => setInputs(p => ({ ...p, costPrice: v }))} icon={<DollarSign className="w-4 h-4" />} />
            <InputGroup label="Selling Price" value={inputs.sellingPrice} onChange={(v) => setInputs(p => ({ ...p, sellingPrice: v }))} icon={<DollarSign className="w-4 h-4" />} />
          </div>
        )}

        <button 
          onClick={handleCalculate}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Calculate
        </button>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Results</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(result).map(([key, val]: [string, any]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={cn(
                    "text-lg font-black",
                    val === 'Profit' ? "text-emerald-500" : val === 'Loss' ? "text-destructive" : "text-foreground"
                  )}>
                    {key === 'percentage' ? `${val}%` : val}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, icon }: { label: string, value?: string, onChange: (v: string) => void, icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <input 
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all font-bold text-foreground"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
