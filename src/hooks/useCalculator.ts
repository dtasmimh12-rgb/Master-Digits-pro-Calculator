import { useState, useEffect, useCallback } from 'react';
import { create, all } from 'mathjs';
import { HistoryItem, CalculatorMode } from '../types';

const math = create(all);
math.config({
  number: 'BigNumber',
  precision: 64
});

function formatResult(res: any): string {
  if (res === null || res === undefined) return '';
  if (math.isBigNumber(res)) {
    let str = res.toFixed(40); 
    if (str.includes('.')) {
      str = str.replace(/\.?0+$/, '');
    }
    return str;
  }
  return math.format(res, { 
    notation: 'fixed', 
    lowerExp: -100, 
    upperExp: 100 
  });
}

export function useCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isResultShown, setIsResultShown] = useState(false);
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [dob, setDob] = useState<string | null>(() => {
    return localStorage.getItem('calc-dob');
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('calc-onboarded') === 'true';
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('calc-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [memory, setMemory] = useState<string>(() => {
    const saved = localStorage.getItem('calc-memory');
    return saved || '0';
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'midnight' | 'emerald'>(() => {
    const saved = localStorage.getItem('calc-theme');
    return (saved as any) || 'dark';
  });
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('calc-exchange-rates');
    return saved ? JSON.parse(saved) : {};
  });
  const [lastRatesUpdate, setLastRatesUpdate] = useState<number>(() => {
    const saved = localStorage.getItem('calc-rates-update');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calc-memory', memory);
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('calc-theme', theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight', 'emerald');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('calc-exchange-rates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem('calc-rates-update', lastRatesUpdate.toString());
  }, [lastRatesUpdate]);

  useEffect(() => {
    if (dob) {
      localStorage.setItem('calc-dob', dob);
    } else {
      localStorage.removeItem('calc-dob');
    }
  }, [dob]);

  useEffect(() => {
    localStorage.setItem('calc-onboarded', isOnboarded.toString());
  }, [isOnboarded]);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      if (data.result === 'success') {
        setExchangeRates(data.rates);
        setLastRatesUpdate(Date.now());
        return data.rates;
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return exchangeRates; // Return cached rates on failure
    }
  };

  useEffect(() => {
    // Fetch rates if they are older than 1 hour or don't exist
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - lastRatesUpdate > oneHour || Object.keys(exchangeRates).length === 0) {
      fetchExchangeRates();
    }
  }, []);

  const calculate = useCallback((expr: string) => {
    try {
      if (!expr) return null;
      let finalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/e/g, 'e')
        .replace(/ln\(/g, 'log(')
        .replace(/log\(/g, 'log10(');
      
      // Handle trig functions with degrees by default
      finalExpr = finalExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, func, arg) => {
        if (arg.includes('deg') || arg.includes('rad')) return match;
        return `${func}(${arg} deg)`;
      });

      const res = math.evaluate(finalExpr);
      return formatResult(res);
    } catch (error) {
      return 'Error';
    }
  }, []);

  const handleSmartInput = async (input: string) => {
    const { processSmartInput } = await import('../services/geminiService');
    const result = await processSmartInput(input);
    if (result) {
      setExpression(result.expression);
      const res = calculate(result.expression);
      if (res && res !== 'Error') {
        setResult(res);
        setIsResultShown(true);
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          expression: result.expression,
          result: res,
          timestamp: Date.now(),
          category: 'smart',
          note: result.explanation
        };
        setHistory(prev => [newItem, ...prev].slice(0, 50));
      }
    }
  };

  const handleInput = useCallback((val: string) => {
    if (val === '=') {
      const res = calculate(expression);
      if (res && res !== 'Error') {
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          expression,
          result: res,
          timestamp: Date.now(),
          category: 'standard'
        };
        setHistory(prev => [newItem, ...prev].slice(0, 50));
        setResult(res);
        setIsResultShown(true);
      } else if (res === 'Error') {
        setResult('Error');
        setIsResultShown(true);
      }
    } else if (val === 'AC') {
      setExpression('');
      setResult(null);
      setIsResultShown(false);
    } else if (val === 'C') {
      if (isResultShown) {
        setExpression('');
        setResult(null);
        setIsResultShown(false);
      } else {
        setExpression(prev => prev.slice(0, -1));
      }
    } else if (val === 'M+') {
      const target = isResultShown && result ? result : expression;
      const res = calculate(target);
      if (res && res !== 'Error') {
        try {
          const currentMem = math.bignumber(memory);
          const toAdd = math.bignumber(res);
          setMemory(formatResult(math.add(currentMem, toAdd)));
        } catch (e) { console.error(e); }
      }
    } else if (val === 'M-') {
      const target = isResultShown && result ? result : expression;
      const res = calculate(target);
      if (res && res !== 'Error') {
        try {
          const currentMem = math.bignumber(memory);
          const toSub = math.bignumber(res);
          setMemory(formatResult(math.subtract(currentMem, toSub)));
        } catch (e) { console.error(e); }
      }
    } else if (val === 'MR') {
      if (isResultShown) {
        setExpression(memory);
        setResult(null);
        setIsResultShown(false);
      } else {
        setExpression(prev => prev + memory);
      }
    } else if (val === 'MC') {
      setMemory('0');
    } else {
      const isOperator = ['+', '-', '×', '÷', '%', '^', '!'].includes(val);
      if (isResultShown) {
        if (isOperator && result && result !== 'Error') {
          setExpression(result + val);
        } else {
          setExpression(val);
        }
        setResult(null);
        setIsResultShown(false);
      } else {
        setExpression(prev => prev + val);
      }
    }
  }, [expression, calculate, memory, result, isResultShown]);

  const toggleStar = (id: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, isStarred: !item.isStarred } : item));
  };

  return {
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
    clearHistory: () => setHistory([]),
    toggleStar,
    exchangeRates,
    lastRatesUpdate,
    fetchExchangeRates,
    dob,
    setDob,
    isOnboarded,
    setIsOnboarded,
  };
}
