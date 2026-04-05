import { useState, useEffect, useCallback } from 'react';
import { create, all } from 'mathjs';
import { HistoryItem } from '../types';

const math = create(all);
math.config({
  number: 'BigNumber',
  precision: 64
});

/**
 * Formats a mathjs result to a string, avoiding scientific notation
 * and handling large numbers with high precision.
 */
function formatResult(res: any): string {
  if (res === null || res === undefined) return '';
  
  // If it's a BigNumber, use its formatting methods
  if (math.isBigNumber(res)) {
    // toFixed() avoids scientific notation but might have trailing zeros
    // We use a large enough number for decimals if needed, then trim
    let str = res.toFixed(40); 
    
    // Remove trailing zeros after decimal point
    if (str.includes('.')) {
      str = str.replace(/\.?0+$/, '');
    }
    return str;
  }

  // Fallback for other types
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
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('calc-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [memory, setMemory] = useState<string>(() => {
    const saved = localStorage.getItem('calc-memory');
    return saved || '0';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('calc-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [isScientific, setIsScientific] = useState(false);

  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calc-memory', memory);
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('calc-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const calculate = useCallback((expr: string) => {
    try {
      if (!expr) return null;
      
      // Better trig replacement for mathjs BigNumber + Degrees
      let finalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/e/g, 'e');
      
      // mathjs functions like sin(45 deg) work well
      finalExpr = finalExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, '$1($2 deg)');

      const res = math.evaluate(finalExpr);
      return formatResult(res);
    } catch (error) {
      console.error('Calc Error:', error);
      return 'Error';
    }
  }, []);

  const handleInput = useCallback((val: string) => {
    if (val === '=') {
      const res = calculate(expression);
      if (res && res !== 'Error') {
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          expression,
          result: res,
          timestamp: Date.now(),
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
        } catch (e) {
          console.error('Memory Error:', e);
        }
      }
    } else if (val === 'M-') {
      const target = isResultShown && result ? result : expression;
      const res = calculate(target);
      if (res && res !== 'Error') {
        try {
          const currentMem = math.bignumber(memory);
          const toSub = math.bignumber(res);
          setMemory(formatResult(math.subtract(currentMem, toSub)));
        } catch (e) {
          console.error('Memory Error:', e);
        }
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
      // Operators
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

  const clearHistory = () => setHistory([]);
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const toggleScientific = () => setIsScientific(prev => !prev);

  return {
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
  };
}
