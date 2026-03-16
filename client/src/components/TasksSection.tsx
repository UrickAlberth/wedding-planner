import { useState } from 'react';
import { CheckSquare, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useWedding } from '@/contexts/WeddingContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TasksSection() {
  const { tasks, addTask, editTask, toggleTask, removeTask } = useWedding();
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTask(newText.trim());
    setNewText('');
  };

  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const confirmEdit = () => {
    if (!editingId || !editText.trim()) return;
    editTask(editingId, editText.trim());
    setEditingId(null);
  };

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="wedding-card p-5 h-full">
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare className="w-5 h-5" style={{ color: 'oklch(0.55 0.08 20)' }} />
        <h2 className="font-display text-xl font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
          Tarefas
        </h2>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'oklch(0.55 0.03 40)' }}>
          <span>{completed} de {total} concluídas</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'oklch(0.88 0.02 60)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'oklch(0.55 0.08 20)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Add form */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Ex: Fechar buffet"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95 whitespace-nowrap"
          style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'oklch(0.98 0.005 75)' }}
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="rounded-lg p-3 border transition-all"
              style={{
                borderColor: task.completed ? 'oklch(0.80 0.06 145)' : 'oklch(0.88 0.02 60)',
                backgroundColor: task.completed ? 'oklch(0.96 0.03 145)' : 'white',
              }}
            >
              {editingId === task.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                    className="flex-1 px-2 py-1 rounded border text-sm focus:outline-none"
                    style={{ borderColor: 'oklch(0.88 0.02 60)' }}
                    autoFocus
                  />
                  <button
                    onClick={confirmEdit}
                    className="p-1.5 rounded transition-all"
                    style={{ color: 'oklch(0.45 0.10 145)' }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded transition-all"
                    style={{ color: 'oklch(0.55 0.03 40)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id as number)}
                    className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: task.completed ? 'oklch(0.45 0.10 145)' : 'oklch(0.72 0.065 20)',
                      backgroundColor: task.completed ? 'oklch(0.45 0.10 145)' : 'transparent',
                    }}
                  >
                    {task.completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span
                    className="flex-1 text-sm transition-all"
                    style={{
                      color: task.completed ? 'oklch(0.55 0.03 40)' : 'oklch(0.28 0.04 40)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.text}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(task.id as number, task.text)}
                      className="p-1.5 rounded-md transition-all hover:scale-110"
                      style={{ color: 'oklch(0.55 0.08 20)' }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeTask(task.id as number)}
                      className="p-1.5 rounded-md transition-all hover:scale-110"
                      style={{ color: 'oklch(0.577 0.245 27.325)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="text-center py-6 text-sm" style={{ color: 'oklch(0.65 0.02 40)' }}>
            Nenhuma tarefa cadastrada
          </p>
        )}
      </div>
    </div>
  );
}
