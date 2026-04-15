import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, GraduationCap, BookOpen, Lightbulb, CheckCircle2, RefreshCw } from 'lucide-react';
import { getStepByStepSolution } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StudentScreenProps {
  onBack: () => void;
  expression: string;
}

export function StudentScreen({ onBack, expression }: StudentScreenProps) {
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<any>(null);

  const handleSolve = async () => {
    if (!expression) return;
    setLoading(true);
    const res = await getStepByStepSolution(expression);
    setSolution(res);
    setLoading(false);
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
        <h2 className="text-xl font-black tracking-tight">Student Mode</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <GraduationCap className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">Current Expression</span>
          </div>
          <div className="text-2xl font-black tracking-tight text-foreground break-all">
            {expression || 'No expression entered'}
          </div>
          <button 
            onClick={handleSolve}
            disabled={loading || !expression}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
            {loading ? 'Analyzing...' : 'Solve Step-by-Step'}
          </button>
        </div>

        {solution && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Step-by-Step Solution
              </h3>
              <div className="space-y-3">
                {solution.steps.map((step: string, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-card border border-border rounded-2xl flex gap-4"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground text-[10px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="text-sm font-medium text-foreground leading-relaxed">
                      {step}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Final Result
              </h3>
              <div className="text-3xl font-black text-emerald-600">
                {solution.final_answer}
              </div>
            </div>

            {solution.formula_used && (
              <div className="p-6 bg-card border border-border rounded-3xl space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Formula Used</h3>
                <div className="font-mono text-sm p-3 bg-secondary rounded-xl text-foreground">
                  {solution.formula_used}
                </div>
              </div>
            )}

            {solution.explanation && (
              <div className="p-6 bg-card border border-border rounded-3xl space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Conceptual Explanation</h3>
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{solution.explanation}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
