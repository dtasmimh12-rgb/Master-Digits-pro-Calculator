import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ArrowLeftRight, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface ConverterScreenProps {
  exchangeRates: Record<string, number>;
  lastRatesUpdate: string | null;
  fetchExchangeRates: () => void;
  onBack: () => void;
}

export const ConverterScreen: React.FC<ConverterScreenProps> = ({ 
  exchangeRates, 
  lastRatesUpdate, 
  fetchExchangeRates, 
  onBack 
}) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');

  const currencies = Object.keys(exchangeRates).length > 0 
    ? Object.keys(exchangeRates).sort() 
    : ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

  const result = exchangeRates[fromCurrency] && exchangeRates[toCurrency] 
    ? ((parseFloat(amount) || 0) * (exchangeRates[toCurrency] / exchangeRates[fromCurrency])).toFixed(2)
    : '0.00';

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-background z-[60] flex flex-col"
    >
      <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="p-3 rounded-2xl bg-secondary text-secondary-foreground active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Currency Converter</h2>
        </div>
        <button 
          onClick={fetchExchangeRates}
          className="p-3 rounded-2xl bg-secondary text-secondary-foreground active:scale-90 transition-all"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-secondary/50 p-8 rounded-[3rem] border border-border space-y-6">
            <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">From</div>
                <select 
                  className="bg-transparent outline-none text-sm font-black text-primary p-2 rounded-xl border border-border"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              <input 
                type="number"
                className="bg-transparent outline-none text-4xl font-black w-full text-foreground"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <button 
                onClick={() => {
                  const temp = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(temp);
                }}
                className="p-5 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/20 active:scale-90 transition-all"
              >
                <ArrowLeftRight className="w-6 h-6 rotate-90" />
              </button>
            </div>

            <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">To</div>
                <select 
                  className="bg-transparent outline-none text-sm font-black text-primary p-2 rounded-xl border border-border"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              <div className="text-4xl font-black text-primary">
                {result}
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground italic">
              Rates updated: {lastRatesUpdate ? format(new Date(lastRatesUpdate), 'MMM d, HH:mm') : 'Never'}
            </p>
            {Object.keys(exchangeRates).length === 0 && (
              <p className="text-xs text-destructive font-bold">Offline: Using default rates</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
