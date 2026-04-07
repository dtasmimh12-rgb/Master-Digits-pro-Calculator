import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, LineChart as ChartIcon } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface GraphScreenProps {
  data: any[];
  onBack: () => void;
}

export const GraphScreen: React.FC<GraphScreenProps> = ({ data, onBack }) => {
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
          <ChartIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Function Graph</h2>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6">
        <div className="w-full h-full bg-secondary/50 rounded-[3rem] p-6 overflow-hidden border border-border shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#8884d822" />
              <XAxis dataKey="x" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
