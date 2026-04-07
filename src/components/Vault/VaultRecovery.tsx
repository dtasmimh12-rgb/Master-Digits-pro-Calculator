import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ChevronLeft, ChevronRight, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { SecurityQuestion } from '../../types';
import { cn } from '../../lib/utils';

interface VaultRecoveryProps {
  questions: SecurityQuestion[];
  onRecover: (answers: string[]) => Promise<boolean>;
  onCancel: () => void;
}

export function VaultRecovery({ questions, onRecover, onCancel }: VaultRecoveryProps) {
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ''));
  const [error, setError] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some(a => !a)) return setError('Please answer all questions');
    
    setIsRecovering(true);
    setError('');
    
    const success = await onRecover(answers);
    if (!success) {
      setError('One or more answers are incorrect');
      setIsRecovering(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-8 overflow-y-auto">
      <div className="max-w-md mx-auto w-full flex flex-col gap-8 py-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Vault Recovery</h1>
          <p className="text-muted-foreground">Answer your security questions to regain access to your vault.</p>
        </div>

        <form onSubmit={handleRecover} className="space-y-8">
          {questions.map((q, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-bold text-foreground">{q.question}</h3>
              </div>
              <input 
                type="text"
                value={answers[i]}
                onChange={(e) => {
                  const newA = [...answers];
                  newA[i] = e.target.value;
                  setAnswers(newA);
                }}
                placeholder="Your answer"
                className="w-full p-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all text-foreground"
              />
            </div>
          ))}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isRecovering}
              className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isRecovering ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Answers
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
