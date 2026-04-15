import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SmartInputScreenProps {
  onBack: () => void;
  onProcess: (input: string) => Promise<void>;
}

export function SmartInputScreen({ onBack, onProcess }: SmartInputScreenProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    await onProcess(input);
    setLoading(false);
    onBack();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8"
    >
      <div className="w-full max-w-md bg-card rounded-[3rem] shadow-2xl border border-border p-8 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black mb-2">Smart Input</h2>
          <p className="text-muted-foreground text-sm">
            Describe your calculation in plain English.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Calculate 15% tip on $85.50"
              className="w-full h-32 p-6 rounded-3xl bg-secondary/50 border-2 border-border focus:border-primary outline-none transition-all font-medium text-foreground resize-none"
              autoFocus
            />
            <div className="absolute bottom-4 right-4 text-muted-foreground/30">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onBack}
              className="flex-1 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !input}
              className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'Processing...' : 'Calculate'}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Try these</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "15% of 500",
              "Square root of 144",
              "250 plus 10 percent",
              "Area of circle with radius 5"
            ].map((hint) => (
              <button 
                key={hint}
                onClick={() => setInput(hint)}
                className="px-3 py-1.5 bg-secondary rounded-full text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
