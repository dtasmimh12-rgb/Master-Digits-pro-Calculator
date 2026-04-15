import React, { useEffect, useRef, useState } from 'react';
import { 
  History, 
  Moon, 
  Sun, 
  Trash2, 
  Copy, 
  Delete,
  ChevronLeft,
  Star,
  LayoutGrid,
  LineChart as ChartIcon,
  BookOpen,
  ArrowRightLeft,
  X,
  Download,
  Search,
  Check,
  Palette,
  Volume2,
  VolumeX,
  Smartphone,
  RotateCcw,
  Cake,
  Calendar,
  User,
  ShieldCheck,
  Settings,
  Grid3X3,
  ArrowLeftRight,
  Sparkles,
  GraduationCap,
  FileText,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCalculator } from './hooks/useCalculator';
import { cn } from './lib/utils';
import { 
  format, 
  isToday, 
  isYesterday, 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  addYears, 
  isBefore, 
  startOfDay, 
  differenceInWeeks, 
  differenceInHours,
  addDays,
  addMonths,
  setYear,
  setMonth,
  setDate
} from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import * as math from 'mathjs';

import { VaultScreen } from './components/Screens/VaultScreen';
import { AgeScreen } from './components/Screens/AgeScreen';
import { ConverterScreen } from './components/Screens/ConverterScreen';
import { GraphScreen } from './components/Screens/GraphScreen';
import { NotebookScreen } from './components/Screens/NotebookScreen';
import { HistoryScreen } from './components/Screens/HistoryScreen';
import { FinancialScreen } from './components/Screens/FinancialScreen';
import { StudentScreen } from './components/Screens/StudentScreen';
import { ReceiptScreen } from './components/Screens/ReceiptScreen';
import { SmartInputScreen } from './components/Screens/SmartInputScreen';

export default function App() {
  const {
    expression,
    setExpression,
    result,
    setResult,
    isResultShown,
    setIsResultShown,
    history,
    memory,
    theme,
    setTheme,
    mode,
    setMode,
    handleInput,
    handleSmartInput,
    setHistory,
    clearHistory,
    toggleStar,
    exchangeRates,
    lastRatesUpdate,
    fetchExchangeRates,
    dob,
    setDob,
    isOnboarded,
    setIsOnboarded,
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);
  const [showSmartInput, setShowSmartInput] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');
  
  const [onboardingDob, setOnboardingDob] = useState({ day: '1', month: '1', year: '2000' });
  const [showEditDob, setShowEditDob] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const birthdayCheckedRef = useRef(false);

  // Birthday Notification Check
  useEffect(() => {
    if (dob && isOnboarded && !birthdayCheckedRef.current) {
      const today = new Date();
      const birthDate = new Date(dob);
      
      if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
        // It's birthday!
        // Check if it's after 9 AM
        if (today.getHours() >= 9) {
          birthdayCheckedRef.current = true;
          // In a real app we'd use a notification API, here we show a special UI or alert
          setTimeout(() => {
            alert("🎉 Happy Birthday! Wishing you a wonderful day!");
          }, 1000);
        }
      }
    }
  }, [dob, isOnboarded]);

  // Sound effects
  const playClick = () => {
    if (!soundEnabled) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const triggerHaptic = () => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const onKeyPress = (val: string) => {
    playClick();
    triggerHaptic();
    handleInput(val);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') onKeyPress(e.key);
      if (['+', '-', '*', '/'].includes(e.key)) onKeyPress(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      if (e.key === 'Enter' || e.key === '=') onKeyPress('=');
      if (e.key === 'Backspace') onKeyPress('C');
      if (e.key === 'Escape') onKeyPress('AC');
      if (e.key === '.') onKeyPress('.');
      if (e.key === '(' || e.key === ')') onKeyPress(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

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

  const exportHistory = () => {
    const text = history.map(h => `${h.expression} = ${h.result}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calc-history.txt';
    a.click();
  };

  // Graph Data
  const generateGraphData = () => {
    try {
      const data = [];
      for (let x = -10; x <= 10; x += 0.5) {
        const y = math.evaluate(expression.replace(/x/g, `(${x})`));
        data.push({ x, y: typeof y === 'number' ? y : 0 });
      }
      return data;
    } catch {
      return [];
    }
  };

  const modes = [
    { id: 'standard', icon: <LayoutGrid className="w-5 h-5" />, label: 'Standard' },
    { id: 'scientific', icon: <Smartphone className="w-5 h-5" />, label: 'Scientific' },
    { id: 'converter', icon: <ArrowRightLeft className="w-5 h-5" />, label: 'Converter' },
    { id: 'graph', icon: <ChartIcon className="w-5 h-5" />, label: 'Graph' },
    { id: 'notebook', icon: <BookOpen className="w-5 h-5" />, label: 'Notebook' },
    { id: 'age', icon: <Cake className="w-5 h-5" />, label: 'Age' },
    { id: 'vault', icon: <ShieldCheck className="w-5 h-5" />, label: 'Vault' },
  ];

  const themes = [
    { id: 'light', color: 'bg-white', label: 'Light' },
    { id: 'dark', color: 'bg-slate-900', label: 'Dark' },
    { id: 'midnight', color: 'bg-indigo-950', label: 'Midnight' },
    { id: 'emerald', color: 'bg-emerald-950', label: 'Emerald' },
  ];

  const FeatureItem = ({ id, icon, label, onClick }: { id: string, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-90",
        mode === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
        mode === id ? "bg-primary text-primary-foreground" : "bg-card border border-border"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen bg-background transition-colors duration-500 font-sans overflow-hidden flex flex-col safe-top safe-bottom">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-card shadow-2xl relative overflow-hidden">
        
        {/* Section 1: Top Section (Display Area) */}
        <div className="px-6 pt-8 pb-4 flex flex-col flex-shrink-0 justify-between min-h-[25%] max-h-[40%]">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-3 rounded-2xl bg-secondary text-secondary-foreground active:scale-90 transition-all"
            >
              <History className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSmartInput(true)}
                className="p-3 rounded-2xl bg-primary/10 text-primary active:scale-90 transition-all border border-primary/20"
              >
                <Sparkles className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setShowFeatures(!showFeatures)}
                className={cn(
                  "p-3 rounded-2xl active:scale-90 transition-all",
                  showFeatures ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {showFeatures ? <X className="w-6 h-6" /> : <Grid3X3 className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="p-3 rounded-2xl bg-secondary text-secondary-foreground active:scale-90 transition-all"
              >
                <Palette className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end justify-end flex-1">
            <AnimatePresence mode="wait">
              {mode === 'standard' || mode === 'scientific' ? (
                <div className="w-full flex flex-col items-end">
                  <div 
                    ref={scrollRef}
                    className="w-full overflow-x-auto whitespace-nowrap text-right mb-2 scrollbar-hide min-h-[2rem]"
                  >
                    <span className="text-muted-foreground text-xl font-medium tracking-wider">
                      {isResultShown ? expression : ''}
                    </span>
                  </div>
                  <div className="w-full text-right overflow-x-auto scrollbar-hide">
                    <motion.span 
                      key={isResultShown ? (result || 'empty') : (expression || '0')}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "font-bold tracking-tighter block whitespace-nowrap transition-all",
                        result === 'Error' ? "text-destructive text-5xl" : "text-foreground",
                        ((isResultShown ? result : expression)?.length || 0) > 15 ? "text-3xl" : ((isResultShown ? result : expression)?.length || 0) > 10 ? "text-4xl" : "text-6xl"
                      )}
                    >
                      {isResultShown ? result : (expression || '0')}
                    </motion.span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-primary font-black text-xl uppercase tracking-[0.2em] opacity-20">
                    {mode} Mode
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Section 2: Middle Section (Content / Feature Grid) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            {showFeatures ? (
              <motion.div 
                key="features"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 p-6 overflow-y-auto"
              >
                <div className="grid grid-cols-4 gap-4">
                  <FeatureItem id="age" icon={<Cake className="w-5 h-5" />} label="Age" onClick={() => { setMode('age'); setShowFeatures(false); }} />
                  <FeatureItem id="converter" icon={<ArrowLeftRight className="w-5 h-5" />} label="Convert" onClick={() => { setMode('converter'); setShowFeatures(false); }} />
                  <FeatureItem id="financial" icon={<DollarSign className="w-5 h-5" />} label="Finance" onClick={() => { setMode('financial'); setShowFeatures(false); }} />
                  <FeatureItem id="student" icon={<GraduationCap className="w-5 h-5" />} label="Student" onClick={() => { setMode('student'); setShowFeatures(false); }} />
                  <FeatureItem id="receipt" icon={<FileText className="w-5 h-5" />} label="Receipt" onClick={() => { setMode('receipt'); setShowFeatures(false); }} />
                  <FeatureItem id="vault" icon={<ShieldCheck className="w-5 h-5" />} label="Private Vault" onClick={() => { setMode('vault'); setShowFeatures(false); }} />
                  <FeatureItem id="notebook" icon={<BookOpen className="w-5 h-5" />} label="Quick Notes" onClick={() => { setMode('notebook'); setShowFeatures(false); }} />
                  <FeatureItem id="graph" icon={<ChartIcon className="w-5 h-5" />} label="Graph" onClick={() => { setMode('graph'); setShowFeatures(false); }} />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="calculator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Calculator Buttons Section */}
                <div className="mt-auto p-6 bg-secondary/30 backdrop-blur-xl rounded-t-[3rem] border-t border-border">
                  <div className="grid grid-cols-4 gap-3">
                    {mode === 'scientific' && (
                      <div className="col-span-4 grid grid-cols-4 gap-2 mb-3 border-b border-border pb-3">
                        {[
                          { l: 'sin', v: 'sin(' }, { l: 'cos', v: 'cos(' }, { l: 'tan', v: 'tan(' }, { l: '√', v: 'sqrt(' },
                          { l: 'log', v: 'log(' }, { l: 'ln', v: 'ln(' }, { l: '(', v: '(' }, { l: ')', v: ')' },
                          { l: 'x²', v: '^2' }, { l: 'xʸ', v: '^' }, { l: 'π', v: 'π' }, { l: 'e', v: 'e' },
                          { l: '!', v: '!' }, { l: 'deg', v: ' deg' }, { l: 'rad', v: ' rad' }, { l: 'exp', v: 'exp(' }
                        ].map((btn) => (
                          <button
                            key={btn.l}
                            onClick={() => onKeyPress(btn.v)}
                            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 bg-card text-foreground hover:bg-accent shadow-sm border border-border"
                          >
                            {btn.l}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Standard Buttons */}
                    {[
                      { l: 'AC', t: 'fn' }, { l: 'C', t: 'fn', i: <Delete className="w-5 h-5" /> }, { l: '%', t: 'op' }, { l: '÷', t: 'op' },
                      { l: '7', t: 'num' }, { l: '8', t: 'num' }, { l: '9', t: 'num' }, { l: '×', t: 'op' },
                      { l: '4', t: 'num' }, { l: '5', t: 'num' }, { l: '6', t: 'num' }, { l: '-', t: 'op' },
                      { l: '1', t: 'num' }, { l: '2', t: 'num' }, { l: '3', t: 'num' }, { l: '+', t: 'op' },
                      { l: '0', t: 'num', s: 2 }, { l: '.', t: 'num' }, { l: '=', t: 'eq' }
                    ].map((btn) => (
                      <button
                        key={btn.l}
                        onClick={() => onKeyPress(btn.l)}
                        className={cn(
                          "h-16 rounded-2xl text-2xl font-bold transition-all active:scale-90 shadow-sm flex items-center justify-center",
                          btn.s === 2 ? "col-span-2" : "col-span-1",
                          btn.t === 'num' && "bg-card text-foreground hover:bg-accent",
                          btn.t === 'op' && "bg-secondary text-primary hover:bg-accent",
                          btn.t === 'fn' && "bg-secondary text-muted-foreground hover:bg-accent",
                          btn.t === 'eq' && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                        )}
                      >
                        {btn.i || btn.l}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Overlays / Screens */}
        <AnimatePresence>
          {showHistory && (
            <HistoryScreen 
              history={history}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              toggleStar={toggleStar}
              setExpression={setExpression}
              setResult={setResult}
              setIsResultShown={setIsResultShown}
              onBack={() => setShowHistory(false)}
              exportHistory={exportHistory}
            />
          )}

          {mode === 'age' && (
            <AgeScreen 
              dob={dob}
              onBack={() => setMode('standard')}
              onEditDob={() => setShowEditDob(true)}
            />
          )}

          {mode === 'converter' && (
            <ConverterScreen 
              exchangeRates={exchangeRates}
              lastRatesUpdate={lastRatesUpdate}
              fetchExchangeRates={fetchExchangeRates}
              onBack={() => setMode('standard')}
            />
          )}

          {mode === 'graph' && (
            <GraphScreen 
              data={generateGraphData()}
              onBack={() => setMode('standard')}
            />
          )}

          {mode === 'notebook' && (
            <NotebookScreen 
              expression={expression}
              setExpression={setExpression}
              onBack={() => setMode('standard')}
            />
          )}

          {mode === 'vault' && (
            <VaultScreen 
              onBack={() => setMode('standard')}
            />
          )}

          {mode === 'financial' && (
            <FinancialScreen 
              onBack={() => setMode('standard')}
              onSaveHistory={(item) => setHistory(prev => [item, ...prev].slice(0, 50))}
            />
          )}

          {mode === 'student' && (
            <StudentScreen 
              onBack={() => setMode('standard')}
              expression={expression}
            />
          )}

          {mode === 'receipt' && (
            <ReceiptScreen 
              onBack={() => setMode('standard')}
              expression={expression}
              result={result || '0'}
            />
          )}

          {showSmartInput && (
            <SmartInputScreen 
              onBack={() => setShowSmartInput(false)}
              onProcess={handleSmartInput}
            />
          )}

          {(!isOnboarded || showEditDob) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Cake className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">
                    {isOnboarded ? 'Edit Birthday' : 'Welcome!'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {isOnboarded ? 'Update your date of birth below.' : 'Please enter your date of birth to personalize your experience.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 px-2">Day</label>
                    <select 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-bold"
                      value={onboardingDob.day}
                      onChange={(e) => setOnboardingDob(prev => ({ ...prev, day: e.target.value }))}
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 px-2">Month</label>
                    <select 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-bold"
                      value={onboardingDob.month}
                      onChange={(e) => setOnboardingDob(prev => ({ ...prev, month: e.target.value }))}
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                        <option key={m} value={i+1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 px-2">Year</label>
                    <select 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-bold"
                      value={onboardingDob.year}
                      onChange={(e) => setOnboardingDob(prev => ({ ...prev, year: e.target.value }))}
                    >
                      {Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {showEditDob && (
                    <button 
                      onClick={() => setShowEditDob(false)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const date = new Date(parseInt(onboardingDob.year), parseInt(onboardingDob.month) - 1, parseInt(onboardingDob.day));
                      if (isBefore(date, new Date())) {
                        setDob(date.toISOString());
                        setIsOnboarded(true);
                        setShowEditDob(false);
                        triggerHaptic();
                      } else {
                        alert("Please select a valid date in the past.");
                      }
                    }}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showThemePicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-8 right-8 bg-card p-6 rounded-[2.5rem] shadow-2xl z-40 border border-border"
            >
              <h3 className="text-lg font-bold mb-4 px-2">Choose Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id as any); setShowThemePicker(false); }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all",
                      theme === t.id ? "border-primary bg-primary/10" : "border-transparent bg-secondary"
                    )}
                  >
                    <div className={cn("w-6 h-6 rounded-full border border-white/20", t.color)} />
                    <span className="font-semibold text-sm">{t.label}</span>
                    {theme === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory Indicator */}
        {memory !== '0' && (
          <div className="absolute top-28 left-8 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20 backdrop-blur-md">
            MEM: {memory}
          </div>
        )}
      </div>
    </div>
  );
}
