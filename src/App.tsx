import { useEffect, useRef, useState } from 'react';
import { 
  History, 
  Settings, 
  Moon, 
  Sun, 
  Trash2, 
  Copy, 
  Mic, 
  MicOff,
  Delete,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCalculator } from './hooks/useCalculator';
import { cn } from './lib/utils';

export default function App() {
  const {
    expression,
    setExpression,
    result,
    isResultShown,
    history,
    memory,
    theme,
    isScientific,
    handleInput,
    clearHistory,
    toggleTheme,
    toggleScientific,
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (['+', '-', '*', '/'].includes(e.key)) handleInput(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      if (e.key === 'Enter' || e.key === '=') handleInput('=');
      if (e.key === 'Backspace') handleInput('C');
      if (e.key === 'Escape') handleInput('AC');
      if (e.key === '.') handleInput('.');
      if (e.key === '(' || e.key === ')') handleInput(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  // Auto-scroll display
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [expression]);

  const copyToClipboard = () => {
    const textToCopy = result || expression;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Simple mapping for voice commands
      const mapped = transcript.toLowerCase()
        .replace(/plus/g, '+')
        .replace(/minus/g, '-')
        .replace(/times/g, '×')
        .replace(/divided by/g, '÷')
        .replace(/point/g, '.')
        .replace(/equals/g, '=')
        .replace(/clear/g, 'AC');
      
      // Process characters one by one or as a whole
      if (mapped === 'AC' || mapped === '=') {
        handleInput(mapped);
      } else {
        // Try to append valid characters
        const validChars = mapped.match(/[0-9+\-×÷.()]/g);
        if (validChars) {
          validChars.forEach(char => handleInput(char));
        }
      }
    };

    recognition.start();
  };

  const buttons = [
    { label: 'AC', type: 'function', scientific: false },
    { label: 'C', type: 'function', scientific: false, icon: <Delete className="w-5 h-5" /> },
    { label: '%', type: 'operator', scientific: false },
    { label: '÷', type: 'operator', scientific: false },
    
    { label: '7', type: 'number', scientific: false },
    { label: '8', type: 'number', scientific: false },
    { label: '9', type: 'number', scientific: false },
    { label: '×', type: 'operator', scientific: false },
    
    { label: '4', type: 'number', scientific: false },
    { label: '5', type: 'number', scientific: false },
    { label: '6', type: 'number', scientific: false },
    { label: '-', type: 'operator', scientific: false },
    
    { label: '1', type: 'number', scientific: false },
    { label: '2', type: 'number', scientific: false },
    { label: '3', type: 'number', scientific: false },
    { label: '+', type: 'operator', scientific: false },
    
    { label: '0', type: 'number', scientific: false, span: 2 },
    { label: '.', type: 'number', scientific: false },
    { label: '=', type: 'equals', scientific: false },
  ];

  const scientificButtons = [
    { label: 'sin(', type: 'sci' },
    { label: 'cos(', type: 'sci' },
    { label: 'tan(', type: 'sci' },
    { label: 'log(', type: 'sci' },
    { label: 'ln(', type: 'sci' },
    { label: 'sqrt(', type: 'sci' },
    { label: '^', type: 'sci' },
    { label: '!', type: 'sci' },
    { label: 'π', type: 'sci' },
    { label: 'e', type: 'sci' },
    { label: '(', type: 'sci' },
    { label: ')', type: 'sci' },
    { label: 'M+', type: 'mem' },
    { label: 'M-', type: 'mem' },
    { label: 'MR', type: 'mem' },
    { label: 'MC', type: 'mem' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          >
            <History className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleScientific}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                isScientific 
                  ? "bg-primary text-white" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              SCI
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="px-8 py-6 flex flex-col items-end justify-end min-h-[180px]">
          <div 
            ref={scrollRef}
            className="w-full overflow-x-auto whitespace-nowrap text-right mb-2 scrollbar-hide min-h-[1.75rem]"
          >
            <span className="text-slate-400 dark:text-slate-500 text-xl font-medium tracking-wider">
              {isResultShown ? expression : ''}
            </span>
          </div>
          <div className="w-full text-right overflow-x-auto scrollbar-hide">
            <motion.span 
              key={isResultShown ? (result || 'empty') : (expression || '0')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "font-bold tracking-tighter block whitespace-nowrap",
                result === 'Error' ? "text-destructive text-5xl" : "text-slate-900 dark:text-white",
                // Dynamic font size based on length
                ((isResultShown ? result : expression)?.length || 0) > 15 ? "text-3xl" : ((isResultShown ? result : expression)?.length || 0) > 10 ? "text-4xl" : "text-5xl"
              )}
            >
              {isResultShown ? result : (expression || '0')}
            </motion.span>
          </div>
          
          <div className="flex gap-4 mt-4 w-full justify-end">
            <button 
              onClick={startVoiceInput}
              className={cn(
                "p-2 rounded-full transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "text-slate-400 hover:text-primary"
              )}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={copyToClipboard}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-3">
            {isScientific && (
              <div className="col-span-4 grid grid-cols-4 gap-3 mb-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                {scientificButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => handleInput(btn.label)}
                    className="h-12 rounded-2xl text-sm font-bold transition-all active:scale-95 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
            
            {buttons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleInput(btn.label)}
                className={cn(
                  "h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center",
                  btn.span === 2 ? "col-span-2" : "col-span-1",
                  btn.type === 'number' && "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700",
                  btn.type === 'operator' && "bg-slate-100 dark:bg-slate-800 text-primary hover:bg-slate-200 dark:hover:bg-slate-700",
                  btn.type === 'function' && "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700",
                  btn.type === 'equals' && "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                )}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold">History</h2>
                </div>
                <button 
                  onClick={clearHistory}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                    <RotateCcw className="w-12 h-12 opacity-20" />
                    <p>No calculations yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setExpression(item.result);
                        setShowHistory(false);
                      }}
                      className="w-full text-right group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-4 rounded-3xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    >
                      <div className="text-slate-400 dark:text-slate-500 text-sm mb-1 group-hover:text-primary transition-colors">
                        {item.expression}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {item.result}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory Indicator */}
        {memory !== 0 && (
          <div className="absolute top-24 left-8 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md border border-primary/20">
            M: {memory}
          </div>
        )}
      </div>
    </div>
  );
}
