import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Key, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VaultLockProps {
  authType: 'password' | 'pin';
  onUnlock: (password: string) => Promise<{ success: boolean; remainingAttempts?: number; lockoutTime?: number }>;
  onForgot: () => void;
}

export function VaultLock({ authType, onUnlock, onForgot }: VaultLockProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) return;
    
    setIsUnlocking(true);
    setError('');
    
    const result = await onUnlock(password);
    if (!result.success) {
      if (result.lockoutTime) {
        const seconds = Math.ceil((result.lockoutTime - Date.now()) / 1000);
        setError(`Too many attempts. Locked for ${seconds}s`);
      } else if (result.remainingAttempts !== undefined) {
        setError(`Incorrect ${authType === 'pin' ? 'PIN' : 'password'}. ${result.remainingAttempts} attempts left.`);
      } else {
        setError('Incorrect ' + (authType === 'pin' ? 'PIN' : 'password'));
      }
      setPassword('');
      setIsUnlocking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-8 justify-center">
      <div className="max-w-md mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Vault Locked</h1>
          <p className="text-muted-foreground">Enter your {authType === 'pin' ? 'PIN' : 'password'} to access your notes.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input 
                type={authType === 'pin' ? 'number' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authType === 'pin' ? '••••' : 'Enter password'}
                autoFocus
                className={cn(
                  "w-full p-5 rounded-3xl bg-card border-2 outline-none transition-all text-center text-2xl font-bold tracking-widest text-foreground",
                  error ? "border-destructive bg-destructive/5" : "border-border focus:border-primary"
                )}
              />
              {authType === 'password' && (
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm font-medium flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isUnlocking || !password}
            className="w-full py-5 bg-primary text-primary-foreground rounded-3xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isUnlocking ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Shield className="w-6 h-6" />
                Unlock Vault
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={onForgot}
            className="w-full py-3 text-muted-foreground text-sm font-bold hover:text-primary transition-colors"
          >
            Forgot {authType === 'pin' ? 'PIN' : 'password'}?
          </button>
        </form>
      </div>
    </div>
  );
}
