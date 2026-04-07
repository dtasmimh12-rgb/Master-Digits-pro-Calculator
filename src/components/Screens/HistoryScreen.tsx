import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, History, Download, Search, Star } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '../../lib/utils';

interface HistoryScreenProps {
  history: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  toggleStar: (id: string) => void;
  setExpression: (val: string) => void;
  setResult: (val: string) => void;
  setIsResultShown: (val: boolean) => void;
  onBack: () => void;
  exportHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  history, 
  searchQuery, 
  setSearchQuery, 
  toggleStar, 
  setExpression, 
  setResult, 
  setIsResultShown, 
  onBack, 
  exportHistory 
}) => {
  const filteredHistory = history.filter(item => 
    item.expression.includes(searchQuery) || item.result.includes(searchQuery)
  );

  const groupedHistory = filteredHistory.reduce((acc: any, item) => {
    const date = new Date(item.timestamp);
    let label = format(date, 'MMM d, yyyy');
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-background z-[70] flex flex-col"
    >
      <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="p-3 rounded-2xl bg-secondary text-secondary-foreground active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Calculation History</h2>
        </div>
        <button onClick={exportHistory} className="p-3 rounded-2xl bg-secondary text-primary active:scale-90 transition-all">
          <Download className="w-6 h-6" />
        </button>
      </div>
      
      <div className="px-6 py-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search history..."
            className="w-full pl-12 pr-4 py-4 bg-secondary rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-12">
        <div className="max-w-md mx-auto space-y-8">
          {Object.entries(groupedHistory).map(([label, items]: any) => (
            <div key={label}>
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">{label}</h3>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.id} className="group relative bg-secondary/50 p-6 rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all shadow-sm">
                    <button 
                      onClick={() => { 
                        setExpression(item.expression); 
                        setResult(item.result); 
                        setIsResultShown(true); 
                        onBack(); 
                      }}
                      className="w-full text-right"
                    >
                      <div className="text-muted-foreground text-sm mb-2 font-medium tracking-wider">{item.expression}</div>
                      <div className="text-3xl font-black text-foreground">{item.result}</div>
                    </button>
                    <button 
                      onClick={() => toggleStar(item.id)}
                      className={cn(
                        "absolute top-6 left-6 p-3 rounded-2xl transition-all", 
                        item.isStarred ? "text-yellow-500 bg-yellow-500/10" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Star className={cn("w-5 h-5", item.isStarred && "fill-current")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-bold">No calculations found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
