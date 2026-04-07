import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, BookOpen } from 'lucide-react';

interface NotebookScreenProps {
  expression: string;
  setExpression: (val: string) => void;
  onBack: () => void;
}

export const NotebookScreen: React.FC<NotebookScreenProps> = ({ 
  expression, 
  setExpression, 
  onBack 
}) => {
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
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Notebook</h2>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6">
        <div className="w-full h-full bg-secondary/50 rounded-[3rem] p-8 overflow-hidden border border-border shadow-sm">
          <textarea 
            className="w-full h-full bg-transparent outline-none resize-none font-mono text-xl leading-relaxed text-foreground"
            placeholder="Start typing your calculations...&#10;&#10;Example:&#10;10 + 20&#10;50 * 2"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            autoFocus
          />
        </div>
      </div>
    </motion.div>
  );
};
