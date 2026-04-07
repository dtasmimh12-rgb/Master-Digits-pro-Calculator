import { useState, useEffect, useCallback } from 'react';
import { VaultConfig, Note, SecurityQuestion } from '../types';

const STORAGE_KEY_CONFIG = 'calc-vault-config';
const STORAGE_KEY_NOTES = 'calc-vault-notes';

async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function useVault() {
  const [config, setConfig] = useState<VaultConfig | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    return saved ? JSON.parse(saved) : null;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTES);
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    if (config) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  const setupVault = async (
    authType: 'password' | 'pin',
    password: string,
    questions: { question: string; answer: string }[]
  ) => {
    const passwordHash = await hashString(password);
    const securityQuestions: SecurityQuestion[] = await Promise.all(
      questions.map(async q => ({
        question: q.question,
        answerHash: await hashString(q.answer)
      }))
    );

    const newConfig: VaultConfig = {
      authType,
      passwordHash,
      securityQuestions,
      isSetup: true
    };

    setConfig(newConfig);
    setIsAuthenticated(true);
    setFailedAttempts(0);
  };

  const login = async (password: string): Promise<{ success: boolean; remainingAttempts?: number; lockoutTime?: number }> => {
    if (!config) return { success: false };
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return { success: false, lockoutTime: lockoutUntil };
    }

    const hash = await hashString(password);
    if (hash === config.passwordHash) {
      setIsAuthenticated(true);
      setFailedAttempts(0);
      setLockoutUntil(null);
      return { success: true };
    }

    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= 5) {
      const lockout = Date.now() + 30000; // 30 second lockout
      setLockoutUntil(lockout);
      return { success: false, lockoutTime: lockout };
    }

    return { success: false, remainingAttempts: 5 - newAttempts };
  };

  const recover = async (answers: string[]): Promise<boolean> => {
    if (!config) return false;
    if (answers.length !== config.securityQuestions.length) return false;

    const results = await Promise.all(
      answers.map(async (ans, i) => {
        const hash = await hashString(ans);
        return hash === config.securityQuestions[i].answerHash;
      })
    );

    if (results.every(r => r)) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const resetPassword = async (newAuthType: 'password' | 'pin', newPassword: string) => {
    if (!config || !isAuthenticated) return;
    const passwordHash = await hashString(newPassword);
    setConfig({
      ...config,
      authType: newAuthType,
      passwordHash
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, title: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return {
    config,
    notes,
    isAuthenticated,
    setupVault,
    login,
    recover,
    resetPassword,
    logout,
    addNote,
    updateNote,
    deleteNote
  };
}
