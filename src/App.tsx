import { useEffect, useRef, useState } from 'react';
import { 
  History, 
  Moon, 
  Sun, 
  Trash2, 
  Copy, 
  Mic, 
  MicOff,
  Delete,
  ChevronLeft,
  Star,
  Camera,
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
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCalculator } from './hooks/useCalculator';
import { cn } from './lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
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
    clearHistory,
    toggleStar,
    solveAI,
    parseVoice,
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Camera logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const captureAndSolve = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessingAI(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    const aiResult = await solveAI(dataUrl);
    if (aiResult) {
      setExpression(aiResult.expression);
      setResult(aiResult.result);
      setIsResultShown(true);
      stopCamera();
    } else {
      alert("Could not recognize math. Try again.");
    }
    setIsProcessingAI(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsed = await parseVoice(transcript);
      if (parsed) {
        setExpression(parsed);
        onKeyPress('=');
      }
    };
    recognition.start();
  };

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
  ];

  const themes = [
    { id: 'light', color: 'bg-white', label: 'Light' },
    { id: 'dark', color: 'bg-slate-900', label: 'Dark' },
    { id: 'midnight', color: 'bg-indigo-950', label: 'Midnight' },
    { id: 'emerald', color: 'bg-emerald-950', label: 'Emerald' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans overflow-hidden">
      <div className="relative w-full max-w-md h-[850px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-8 pt-8 pb-2 z-10">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 text-slate-500"
          >
            <History className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  mode === m.id ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
                title={m.label}
              >
                {m.icon}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 text-slate-500"
          >
            <Palette className="w-6 h-6" />
          </button>
        </div>

        {/* Display Area */}
        <div className="px-8 py-4 flex flex-col items-end justify-end flex-1 min-h-[200px] relative">
          <AnimatePresence mode="wait">
            {mode === 'graph' ? (
              <motion.div 
                key="graph"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 overflow-hidden"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateGraphData()}>
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
              </motion.div>
            ) : mode === 'notebook' ? (
              <motion.div 
                key="notebook"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 overflow-y-auto"
              >
                <div className="flex items-center gap-2 mb-4 text-slate-400">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Notebook Mode</span>
                </div>
                <textarea 
                  className="w-full h-full bg-transparent outline-none resize-none font-mono text-lg leading-relaxed text-slate-700 dark:text-slate-300"
                  placeholder="Write your calculations here...&#10;10 + 20&#10;50 * 2"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                />
              </motion.div>
            ) : mode === 'converter' ? (
              <motion.div 
                key="converter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Unit Converter</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">From (Length)</div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">1</span>
                      <span className="text-slate-500 font-medium">Meters</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <ArrowRightLeft className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">To</div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">3.2808</span>
                      <span className="text-slate-500 font-medium">Feet</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-auto italic">More units coming soon...</p>
              </motion.div>
            ) : (
              <div className="w-full flex flex-col items-end">
                <div 
                  ref={scrollRef}
                  className="w-full overflow-x-auto whitespace-nowrap text-right mb-2 scrollbar-hide min-h-[2rem]"
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
                      "font-bold tracking-tighter block whitespace-nowrap transition-all",
                      result === 'Error' ? "text-destructive text-5xl" : "text-slate-900 dark:text-white",
                      ((isResultShown ? result : expression)?.length || 0) > 15 ? "text-3xl" : ((isResultShown ? result : expression)?.length || 0) > 10 ? "text-4xl" : "text-6xl"
                    )}
                  >
                    {isResultShown ? result : (expression || '0')}
                  </motion.span>
                </div>
              </div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-4 mt-6 w-full justify-between items-center">
            <div className="flex gap-2">
              <button onClick={() => setHapticEnabled(!hapticEnabled)} className={cn("p-2 rounded-lg", hapticEnabled ? "text-primary" : "text-slate-300")}>
                <Smartphone className="w-4 h-4" />
              </button>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className={cn("p-2 rounded-lg", soundEnabled ? "text-primary" : "text-slate-300")}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={startCamera}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all active:scale-90"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button 
                onClick={startVoiceInput}
                className={cn(
                  "p-3 rounded-2xl transition-all active:scale-90",
                  isListening ? "bg-destructive text-white animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary"
                )}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result || expression);
                  triggerHaptic();
                }}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all active:scale-90"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Keypad Section */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-xl rounded-t-[3rem] border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-4 gap-3">
            {mode === 'scientific' && (
              <div className="col-span-4 grid grid-cols-4 gap-3 mb-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                {['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', '^', '!', 'π', 'e', '(', ')'].map((label) => (
                  <button
                    key={label}
                    onClick={() => onKeyPress(label)}
                    className="h-12 rounded-2xl text-sm font-bold transition-all active:scale-95 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                  >
                    {label}
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
                  btn.t === 'num' && "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700",
                  btn.t === 'op' && "bg-slate-100 dark:bg-slate-800 text-primary hover:bg-slate-200 dark:hover:bg-slate-700",
                  btn.t === 'fn' && "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700",
                  btn.t === 'eq' && "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30"
                )}
              >
                {btn.i || btn.l}
              </button>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b dark:border-slate-800">
                <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold">Smart History</h2>
                <button onClick={exportHistory} className="p-2 text-primary"><Download className="w-6 h-6" /></button>
              </div>
              
              <div className="px-8 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search calculations..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-8">
                {Object.entries(groupedHistory).map(([label, items]: any) => (
                  <div key={label}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{label}</h3>
                    <div className="space-y-4">
                      {items.map((item: any) => (
                        <div key={item.id} className="group relative bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all">
                          <button 
                            onClick={() => { setExpression(item.expression); setResult(item.result); setIsResultShown(true); setShowHistory(false); }}
                            className="w-full text-right"
                          >
                            <div className="text-slate-400 text-sm mb-1">{item.expression}</div>
                            <div className="text-2xl font-bold">{item.result}</div>
                          </button>
                          <button 
                            onClick={() => toggleStar(item.id)}
                            className={cn("absolute top-4 left-4 p-2 rounded-full transition-all", item.isStarred ? "text-yellow-500 bg-yellow-500/10" : "text-slate-300 opacity-0 group-hover:opacity-100")}
                          >
                            <Star className={cn("w-4 h-4", item.isStarred && "fill-current")} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {showCamera && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-[60] flex flex-col"
            >
              <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-8 left-8 right-8 flex justify-between">
                <button onClick={stopCamera} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white"><X className="w-6 h-6" /></button>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold">AI Scanner</div>
              </div>
              <div className="p-12 flex justify-center bg-black/50 backdrop-blur-xl border-t border-white/10">
                <button 
                  onClick={captureAndSolve}
                  disabled={isProcessingAI}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
                >
                  {isProcessingAI ? <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /> : <div className="w-16 h-16 border-4 border-slate-900 rounded-full" />}
                </button>
              </div>
            </motion.div>
          )}

          {showThemePicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-8 right-8 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl z-40 border border-slate-100 dark:border-slate-700"
            >
              <h3 className="text-lg font-bold mb-4 px-2">Choose Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id as any); setShowThemePicker(false); }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all",
                      theme === t.id ? "border-primary bg-primary/5" : "border-transparent bg-slate-50 dark:bg-slate-900"
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
