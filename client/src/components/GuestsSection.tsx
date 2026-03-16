import { useState, useMemo } from 'react';
import { Users, Plus, Pencil, Trash2, Check, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useWedding, Guest, GuestRole, GuestSide } from '@/contexts/WeddingContext';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES: GuestRole[] = ['Convidado', 'Padrinho', 'Madrinha', 'Daminha', 'Pajem', 'Família', 'Amigo(a)', 'Outro'];

const roleColors: Record<GuestRole, { bg: string; text: string }> = {
  'Convidado': { bg: 'oklch(0.93 0.015 75)', text: 'oklch(0.45 0.05 40)' },
  'Padrinho': { bg: 'oklch(0.88 0.04 240)', text: 'oklch(0.35 0.10 240)' },
  'Madrinha': { bg: 'oklch(0.90 0.04 20)', text: 'oklch(0.45 0.08 20)' },
  'Daminha': { bg: 'oklch(0.90 0.04 300)', text: 'oklch(0.45 0.08 300)' },
  'Pajem': { bg: 'oklch(0.90 0.04 200)', text: 'oklch(0.40 0.08 200)' },
  'Família': { bg: 'oklch(0.88 0.05 65)', text: 'oklch(0.45 0.07 65)' },
  'Amigo(a)': { bg: 'oklch(0.90 0.04 145)', text: 'oklch(0.40 0.08 145)' },
  'Outro': { bg: 'oklch(0.93 0.01 40)', text: 'oklch(0.50 0.03 40)' },
};

interface GuestCardProps {
  guest: Guest;
  onEdit: (g: Guest) => void;
  onRemove: (id: number) => void;
  onToggleConfirmed: (id: number) => void;
  onTogglePresent: (id: number) => void;
}

function GuestCard({ guest, onEdit, onRemove, onToggleConfirmed, onTogglePresent }: GuestCardProps) {
  const rc = roleColors[guest.role] || roleColors['Outro'];
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-lg p-3 border flex items-start gap-3 transition-all hover:shadow-sm"
      style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-semibold text-sm" style={{ color: 'oklch(0.28 0.04 40)' }}>{guest.name}</span>
          <span
            className="status-badge text-xs"
            style={{ backgroundColor: rc.bg, color: rc.text }}
          >
            {guest.role}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {guest.present ? (
            <span className="status-badge" style={{ backgroundColor: 'oklch(0.88 0.06 145)', color: 'oklch(0.35 0.08 145)' }}>
              ✓ Presença confirmada
            </span>
          ) : guest.confirmed ? (
            <span className="status-badge" style={{ backgroundColor: 'oklch(0.88 0.06 145)', color: 'oklch(0.35 0.08 145)' }}>
              ✓ Confirmado
            </span>
          ) : (
            <span className="status-badge" style={{ backgroundColor: 'oklch(0.93 0.025 75)', color: 'oklch(0.55 0.06 40)' }}>
              Aguardando confirmação
            </span>
          )}
          <button
            onClick={() => onToggleConfirmed(guest.id)}
            className="text-xs px-2 py-0.5 rounded-full border transition-all hover:scale-105"
            style={{
              borderColor: guest.confirmed ? 'oklch(0.55 0.10 145)' : 'oklch(0.72 0.065 20)',
              color: guest.confirmed ? 'oklch(0.45 0.10 145)' : 'oklch(0.55 0.08 20)',
              backgroundColor: guest.confirmed ? 'oklch(0.96 0.04 145)' : 'transparent',
            }}
          >
            {guest.confirmed ? '✓ Confirmado' : 'Confirmar'}
          </button>
          {guest.confirmed && (
            <button
              onClick={() => onTogglePresent(guest.id)}
              className="text-xs px-2 py-0.5 rounded-full border transition-all hover:scale-105"
              style={{
                borderColor: guest.present ? 'oklch(0.45 0.12 145)' : 'oklch(0.65 0.04 145)',
                color: guest.present ? 'oklch(0.35 0.10 145)' : 'oklch(0.50 0.06 145)',
                backgroundColor: guest.present ? 'oklch(0.88 0.06 145)' : 'transparent',
              }}
            >
              {guest.present ? '✓ Presente' : 'Marcar presença'}
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(guest)}
          className="p-1.5 rounded-md transition-all hover:scale-110"
          style={{ color: 'oklch(0.55 0.08 20)' }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove(guest.id)}
          className="p-1.5 rounded-md transition-all hover:scale-110"
          style={{ color: 'oklch(0.577 0.245 27.325)' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

interface GuestGroupProps {
  title: string;
  guests: Guest[];
  onEdit: (g: Guest) => void;
  onRemove: (id: number) => void;
  onToggleConfirmed: (id: number) => void;
  onTogglePresent: (id: number) => void;
  accentColor: string;
}

function GuestGroup({ title, guests, onEdit, onRemove, onToggleConfirmed, onTogglePresent, accentColor }: GuestGroupProps) {
  const [open, setOpen] = useState(true);
  const confirmed = guests.filter(g => g.confirmed).length;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'oklch(0.88 0.02 60)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-all hover:opacity-90"
        style={{ backgroundColor: accentColor }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: 'oklch(0.28 0.04 40)' }}>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'white', color: 'oklch(0.45 0.05 40)' }}>
            {guests.length} no total
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'oklch(0.88 0.06 145)', color: 'oklch(0.35 0.08 145)' }}>
            {confirmed} confirmados
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: 'oklch(0.45 0.05 40)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'oklch(0.45 0.05 40)' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2">
              <AnimatePresence>
                {guests.map(g => (
                  <GuestCard
                    key={g.id}
                    guest={g}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    onToggleConfirmed={onToggleConfirmed}
                    onTogglePresent={onTogglePresent}
                  />
                ))}
              </AnimatePresence>
              {guests.length === 0 && (
                <p className="text-center py-4 text-sm" style={{ color: 'oklch(0.65 0.02 40)' }}>
                  Nenhum convidado neste grupo
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GuestsSection() {
  const { guests, addGuest, editGuest, removeGuest, toggleGuestConfirmed, toggleGuestPresent } = useWedding();
  const [name, setName] = useState('');
  const [side, setSide] = useState<GuestSide>('noiva');
  const [role, setRole] = useState<GuestRole>('Convidado');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'confirmados' | 'pendentes'>('todos');
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editName, setEditName] = useState('');
  const [editSide, setEditSide] = useState<GuestSide>('noiva');
  const [editRole, setEditRole] = useState<GuestRole>('Convidado');

  const handleAdd = () => {
    if (!name.trim()) return;
    addGuest({ name: name.trim(), side, role, confirmed: false });
    setName('');
  };

  const startEdit = (g: Guest) => {
    setEditingGuest(g);
    setEditName(g.name);
    setEditSide(g.side);
    setEditRole(g.role);
  };

  const confirmEdit = () => {
    if (!editingGuest) return;
    editGuest(editingGuest.id, { name: editName.trim(), side: editSide, role: editRole, confirmed: editingGuest.confirmed, present: editingGuest.present });
    setEditingGuest(null);
  };

  const filtered = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.role.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'todos' || (statusFilter === 'confirmados' && g.confirmed) || (statusFilter === 'pendentes' && !g.confirmed);
      return matchSearch && matchStatus;
    });
  }, [guests, search, statusFilter]);

  const noiva = filtered.filter(g => g.side === 'noiva');
  const noivo = filtered.filter(g => g.side === 'noivo');
  const confirmed = guests.filter(g => g.confirmed).length;
  const pending = guests.filter(g => !g.confirmed).length;

  return (
    <div className="wedding-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" style={{ color: 'oklch(0.55 0.08 20)' }} />
        <h2 className="font-display text-xl font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
          Convidados
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total', value: guests.length, color: 'oklch(0.45 0.07 20)', bg: 'oklch(0.93 0.025 20)' },
          { label: 'Confirmados', value: confirmed, color: 'oklch(0.45 0.10 145)', bg: 'oklch(0.93 0.04 145)' },
          { label: 'Pendentes', value: pending, color: 'oklch(0.55 0.08 40)', bg: 'oklch(0.96 0.012 75)' },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="text-center rounded-xl py-3 px-2 transition-all hover:shadow-sm"
            style={{ backgroundColor: bg, border: '1px solid oklch(0.88 0.02 60)' }}
          >
            <div className="font-display text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.03 40)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="p-4 rounded-xl mb-5 space-y-3" style={{ backgroundColor: 'oklch(0.96 0.012 75)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Nome do convidado</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: João da Silva"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Lado</label>
            <select
              value={side}
              onChange={e => setSide(e.target.value as GuestSide)}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            >
              <option value="noiva">Noiva</option>
              <option value="noivo">Noivo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Função</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as GuestRole)}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'oklch(0.98 0.005 75)' }}
        >
          <Plus className="w-4 h-4" />
          Adicionar convidado
        </button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[180px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'oklch(0.65 0.02 40)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou função..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
          style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
        >
          <option value="todos">Todos</option>
          <option value="confirmados">Confirmados</option>
          <option value="pendentes">Pendentes</option>
        </select>
      </div>

      <p className="text-xs mb-4" style={{ color: 'oklch(0.55 0.03 40)' }}>
        Exibindo {filtered.length} de {guests.length} · Confirmados: {confirmed} · Pendentes: {pending}
      </p>

      {/* Guest groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GuestGroup
          title="Convidados da Noiva"
          guests={noiva}
          onEdit={startEdit}
          onRemove={removeGuest}
          onToggleConfirmed={toggleGuestConfirmed}
          onTogglePresent={toggleGuestPresent}
          accentColor="oklch(0.93 0.025 20)"
        />
        <GuestGroup
          title="Convidados do Noivo"
          guests={noivo}
          onEdit={startEdit}
          onRemove={removeGuest}
          onToggleConfirmed={toggleGuestConfirmed}
          onTogglePresent={toggleGuestPresent}
          accentColor="oklch(0.93 0.025 240)"
        />
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'oklch(0 0 0 / 0.4)' }}
            onClick={() => setEditingGuest(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="wedding-card p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'oklch(0.28 0.04 40)' }}>
                Editar Convidado
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Nome</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                    style={{ borderColor: 'oklch(0.88 0.02 60)' }}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Lado</label>
                    <select
                      value={editSide}
                      onChange={e => setEditSide(e.target.value as GuestSide)}
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                      style={{ borderColor: 'oklch(0.88 0.02 60)' }}
                    >
                      <option value="noiva">Noiva</option>
                      <option value="noivo">Noivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Função</label>
                    <select
                      value={editRole}
                      onChange={e => setEditRole(e.target.value as GuestRole)}
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                      style={{ borderColor: 'oklch(0.88 0.02 60)' }}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={confirmEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'white' }}
                >
                  <Check className="w-4 h-4" /> Salvar
                </button>
                <button
                  onClick={() => setEditingGuest(null)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: 'oklch(0.93 0.015 75)', color: 'oklch(0.45 0.05 40)' }}
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
