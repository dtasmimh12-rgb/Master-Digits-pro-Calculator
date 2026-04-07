import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { VaultManager } from '../Vault/VaultManager';

interface VaultScreenProps {
  onBack: () => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({ onBack }) => {
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
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Secure Vault</h2>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-hidden">
        <VaultManager />
      </div>
    </motion.div>
  );
};
