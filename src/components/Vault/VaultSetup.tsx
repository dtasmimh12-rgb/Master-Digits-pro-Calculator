import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Key, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VaultSetupProps {
  onComplete: (authType: 'password' | 'pin', password: string, questions: { question: string; answer: string }[]) => void;
}

const QUESTIONS = [
  [
    "What is your favorite color?",
    "What is your childhood nickname?",
    "What is your first school name?"
  ],
  [
    "What is your mother's name?",
    "What city were you born in?",
    "What is your favorite food?"
  ],
  [
    "What is your best friend's name?",
    "What is your dream job?",
    "What is your favorite movie?"
  ]
];

export function VaultSetup({ onComplete }: VaultSetupProps) {
  const [step, setStep] = useState(1);
  const [authType, setAuthType] = useState<'password' | 'pin'>('pin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(['', '', '']);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!password) return setError('Please enter a ' + authType);
      if (authType === 'pin' && (password.length < 4 || password.length > 6)) return setError('PIN must be 4-6 digits');
      if (password !== confirmPassword) return setError('Passwords do not match');
      setStep(3);
    } else if (step === 3) {
      if (selectedQuestions.some(q => !q) || answers.some(a => !a)) return setError('Please answer all questions');
      
      const finalQuestions = selectedQuestions.map((q, i) => ({
        question: q,
        answer: answers[i]
      }));
      
      onComplete(authType, password, finalQuestions);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-8 overflow-y-auto">
      <div className="max-w-md mx-auto w-full flex flex-col gap-8 py-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Secure Vault</h1>
          <p className="text-muted-foreground">Protect your private notes with military-grade encryption.</p>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                step === s ? "w-8 bg-primary" : "w-2 bg-secondary"
              )} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Choose Security Type</h2>
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setAuthType('pin')}
                    className={cn(
                      "p-6 rounded-3xl border-2 text-left transition-all flex items-center gap-4",
                      authType === 'pin' ? "border-primary bg-primary/10" : "border-border bg-card"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", authType === 'pin' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Passcode (PIN)</div>
                      <div className="text-sm text-muted-foreground">4-6 digit numeric code</div>
                    </div>
                    {authType === 'pin' && <Check className="w-6 h-6 ml-auto text-primary" />}
                  </button>

                  <button 
                    onClick={() => setAuthType('password')}
                    className={cn(
                      "p-6 rounded-3xl border-2 text-left transition-all flex items-center gap-4",
                      authType === 'password' ? "border-primary bg-primary/10" : "border-border bg-card"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", authType === 'password' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Password</div>
                      <div className="text-sm text-muted-foreground">Complex alphanumeric text</div>
                    </div>
                    {authType === 'password' && <Check className="w-6 h-6 ml-auto text-primary" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Set {authType === 'pin' ? 'PIN' : 'Password'}</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground px-1">Enter {authType === 'pin' ? 'PIN' : 'Password'}</label>
                    <input 
                      type={authType === 'pin' ? 'number' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authType === 'pin' ? '••••' : 'Enter password'}
                      className="w-full p-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground px-1">Confirm {authType === 'pin' ? 'PIN' : 'Password'}</label>
                    <input 
                      type={authType === 'pin' ? 'number' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={authType === 'pin' ? '••••' : 'Confirm password'}
                      className="w-full p-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all text-foreground"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Security Questions</h2>
                <p className="text-sm text-muted-foreground">Select one question from each category to help recover your vault if you forget your password.</p>
                
                <div className="space-y-8">
                  {QUESTIONS.map((category, catIdx) => (
                    <div key={catIdx} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {catIdx + 1}
                        </div>
                        <h3 className="font-bold text-foreground">Category {catIdx + 1}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <select 
                          value={selectedQuestions[catIdx]}
                          onChange={(e) => {
                            const newQ = [...selectedQuestions];
                            newQ[catIdx] = e.target.value;
                            setSelectedQuestions(newQ);
                          }}
                          className="w-full p-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all appearance-none text-foreground"
                        >
                          <option value="">Select a question...</option>
                          {category.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        
                        {selectedQuestions[catIdx] && (
                          <input 
                            type="text"
                            value={answers[catIdx]}
                            onChange={(e) => {
                              const newA = [...answers];
                              newA[catIdx] = e.target.value;
                              setAnswers(newA);
                            }}
                            placeholder="Your answer"
                            className="w-full p-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all text-foreground"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="flex gap-4 mt-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(prev => prev - 1)}
              className="flex-1 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button 
            onClick={handleNext}
            className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {step === 3 ? 'Complete Setup' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
