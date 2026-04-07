import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Trash2, Calendar, Clock, Shield } from 'lucide-react';
import { Note } from '../../types';
import { format } from 'date-fns';

interface VaultNoteEditorProps {
  note?: Note;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function VaultNoteEditor({ note, onSave, onCancel, onDelete }: VaultNoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-8 pb-4 flex items-center justify-between gap-4">
        <button 
          onClick={onCancel}
          className="p-3 rounded-2xl bg-secondary text-muted-foreground hover:text-primary transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
          <Shield className="w-3 h-3" />
          Encrypted Session
        </div>

        <div className="flex gap-2">
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-primary-foreground transition-all active:scale-90"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => onSave(title, content)}
            className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-90"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 py-4 overflow-hidden">
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {format(note?.createdAt || Date.now(), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {format(note?.createdAt || Date.now(), 'h:mm a')}
          </div>
        </div>

        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-3xl font-black tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/20 text-foreground mb-6"
        />
        
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your secure note..."
          className="flex-1 bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:text-muted-foreground/20 text-foreground"
        />
      </div>
    </div>
  );
}
