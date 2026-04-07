import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, FileText, Trash2, Edit2, ChevronRight, LogOut, ShieldCheck, Clock, Calendar } from 'lucide-react';
import { Note } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface VaultNotesListProps {
  notes: Note[];
  onAdd: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
}

export function VaultNotesList({ notes, onAdd, onEdit, onDelete, onLogout }: VaultNotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Vault Notes</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{notes.length} Secure Notes</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-3 rounded-2xl bg-secondary text-muted-foreground hover:text-destructive transition-all active:scale-90"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="px-8 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search secure notes..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none transition-all text-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <motion.div 
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-card p-6 rounded-3xl border-2 border-border hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => onEdit(note)}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors text-foreground">{note.title || 'Untitled Note'}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {note.content || 'No content...'}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                      className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-primary-foreground transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {format(note.createdAt, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {format(note.createdAt, 'h:mm a')}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-muted-foreground">No notes found</h3>
                <p className="text-sm text-muted-foreground/60">Create your first secure note.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8">
        <button 
          onClick={onAdd}
          className="w-full py-5 bg-primary text-primary-foreground rounded-3xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
          New Secure Note
        </button>
      </div>
    </div>
  );
}
