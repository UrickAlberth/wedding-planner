import { useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useWedding, AgendaItem } from '@/contexts/WeddingContext';
import { motion, AnimatePresence } from 'framer-motion';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AgendaSection() {
  const { agendaItems, addAgendaItem, editAgendaItem, removeAgendaItem } = useWedding();
  const [newDate, setNewDate] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editEvent, setEditEvent] = useState('');

  const handleAdd = () => {
    if (!newDate || !newEvent.trim()) return;
    addAgendaItem({ date: newDate, event: newEvent.trim() });
    setNewDate('');
    setNewEvent('');
  };

  const startEdit = (item: AgendaItem) => {
    setEditingId(item.id as number);
    setEditDate(item.date);
    setEditEvent(item.event);
  };

  const confirmEdit = () => {
    if (editingId === null || !editDate || !editEvent.trim()) return;
    editAgendaItem(editingId, { date: editDate, event: editEvent.trim() });
    setEditingId(null);
  };

  const sorted = [...agendaItems].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="wedding-card p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5" style={{ color: 'oklch(0.55 0.08 20)' }} />
        <h2 className="font-display text-xl font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
          Agenda
        </h2>
      </div>

      {/* Add form */}
      <div className="space-y-2.5 mb-5 p-4 rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.012 75)' }}>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Data</label>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Evento</label>
          <input
            type="text"
            value={newEvent}
            onChange={e => setNewEvent(e.target.value)}
            placeholder="Ex: Prova do vestido"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'oklch(0.98 0.005 75)' }}
        >
          <Plus className="w-4 h-4" />
          Adicionar evento
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {sorted.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="rounded-lg p-3 border transition-all hover:shadow-sm"
              style={{ borderColor: 'oklch(0.88 0.02 60)', borderLeftWidth: '3px', borderLeftColor: 'oklch(0.72 0.065 20)' }}
            >
              {editingId === item.id ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border text-sm focus:outline-none"
                    style={{ borderColor: 'oklch(0.88 0.02 60)' }}
                  />
                  <input
                    type="text"
                    value={editEvent}
                    onChange={e => setEditEvent(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border text-sm focus:outline-none"
                    style={{ borderColor: 'oklch(0.88 0.02 60)' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={confirmEdit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
                      style={{ backgroundColor: 'oklch(0.55 0.12 145)', color: 'white' }}
                    >
                      <Check className="w-3 h-3" /> Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
                      style={{ backgroundColor: 'oklch(0.93 0.015 75)', color: 'oklch(0.45 0.05 40)' }}
                    >
                      <X className="w-3 h-3" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug" style={{ color: 'oklch(0.28 0.04 40)' }}>
                      {item.event}
                    </p>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: 'oklch(0.55 0.03 40)' }}>
                      {formatDate(item.date)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-md transition-all hover:scale-110"
                      style={{ color: 'oklch(0.55 0.08 20)' }}
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeAgendaItem(item.id as number)}
                      className="p-1.5 rounded-md transition-all hover:scale-110"
                      style={{ color: 'oklch(0.577 0.245 27.325)' }}
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <p className="text-center py-6 text-sm" style={{ color: 'oklch(0.65 0.02 40)' }}>
            Nenhum evento na agenda
          </p>
        )}
      </div>
    </div>
  );
}
