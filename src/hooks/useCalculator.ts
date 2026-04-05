import { useState, useEffect, useCallback } from 'react';
import { create, all } from 'mathjs';
import { HistoryItem, CalculatorMode } from '../types';
import { GoogleGenAI } from '@google/genai';

const math = create(all);
math.config({
  number: 'BigNumber',
  precision: 64
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

  const calculate = useCallback((expr: string) => {
    try {
      if (!expr) return null;
      let finalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/e/g, 'e');
      
      finalExpr = finalExpr.replace(/(sin|cos|tan)\(([^)]+)\)/g, '$1($2 deg)');
      const res = math.evaluate(finalExpr);
      return formatResult(res);
    } catch (error) {
      return 'Error';
    }
  }, []);

  const solveAI = async (imageData: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Solve this math problem. Return ONLY the expression and the result in JSON format: { \"expression\": \"...\", \"result\": \"...\" }. If it's complex, simplify it." },
              { inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } }
            ]
          }
        ]
      });
      const text = response.text || '';
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());
      return json;
    } catch (error) {
      console.error('AI Error:', error);
      return null;
    }
  };

  const parseVoice = async (transcript: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Convert this spoken math expression into a standard mathematical expression: "${transcript}". Return ONLY the expression string, e.g. "100 + 50".`
      });
      return response.text?.trim() || '';
    } catch (error) {
      return '';
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
    clearHistory: () => setHistory([]),
    toggleStar,
    solveAI,
    parseVoice,
  };
}
