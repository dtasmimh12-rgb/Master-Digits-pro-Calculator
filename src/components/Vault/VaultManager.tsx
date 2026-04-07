import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVault } from '../../hooks/useVault';
import { VaultSetup } from './VaultSetup';
import { VaultLock } from './VaultLock';
import { VaultNotesList } from './VaultNotesList';
import { VaultNoteEditor } from './VaultNoteEditor';
import { VaultRecovery } from './VaultRecovery';
import { Note } from '../../types';

export function VaultManager() {
  const {
    config,
    notes,
    isAuthenticated,
    setupVault,
    login,
    recover,
    logout,
    addNote,
    updateNote,
    deleteNote
  } = useVault();

  const [view, setView] = useState<'list' | 'editor' | 'recovery'>('list');
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  if (!config?.isSetup) {
    return <VaultSetup onComplete={setupVault} />;
  }

  if (!isAuthenticated) {
    if (view === 'recovery') {
      return (
        <VaultRecovery 
          questions={config.securityQuestions}
          onRecover={recover}
          onCancel={() => setView('list')}
        />
      );
    }
    return (
      <VaultLock 
        authType={config.authType}
        onUnlock={login}
        onForgot={() => setView('recovery')}
      />
    );
  }

  const handleAdd = () => {
    setEditingNote(undefined);
    setView('editor');
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setView('editor');
  };

  const handleSave = (title: string, content: string) => {
    if (editingNote) {
      updateNote(editingNote.id, title, content);
    } else {
      addNote(title, content);
    }
    setView('list');
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setView('list');
  };

  return (
    <div className="h-full w-full bg-background">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <VaultNotesList 
              notes={notes}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={deleteNote}
              onLogout={logout}
            />
          </motion.div>
        )}

        {view === 'editor' && (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <VaultNoteEditor 
              note={editingNote}
              onSave={handleSave}
              onCancel={() => setView('list')}
              onDelete={editingNote ? () => handleDelete(editingNote.id) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
