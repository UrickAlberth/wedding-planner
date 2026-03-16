import { CalendarDays, CheckSquare, Users, DollarSign, Heart, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWedding } from '@/contexts/WeddingContext';

export type Section = 'overview' | 'agenda' | 'tasks' | 'guests' | 'expenses';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'guests', label: 'Convidados', icon: Users },
  { id: 'expenses', label: 'Gastos', icon: DollarSign },
];

interface SideNavProps {
  active: Section;
  onChange: (s: Section) => void;
}

export default function SideNav({ active, onChange }: SideNavProps) {
  const { agendaItems, tasks, guests, expenses } = useWedding();

  const badges: Partial<Record<Section, string>> = {
    agenda: agendaItems.length.toString(),
    tasks: `${tasks.filter(t => t.completed).length}/${tasks.length}`,
    guests: guests.filter(g => g.confirmed).length.toString(),
    expenses: expenses.length.toString(),
  };

  return (
    <nav
      className="rounded-2xl p-4 sticky top-4"
      style={{
        backgroundColor: 'oklch(0.995 0.005 75)',
        border: '1px solid oklch(0.88 0.02 60)',
        boxShadow: '0 2px 12px oklch(0.28 0.04 40 / 0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-5 pb-4" style={{ borderBottom: '1px solid oklch(0.88 0.02 60)' }}>
        <Heart className="w-5 h-5 fill-current" style={{ color: 'oklch(0.55 0.08 20)' }} />
        <span className="font-display text-sm font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
          Planejador
        </span>
      </div>

      {/* Nav items */}
      <div className="space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const badge = badges[id];
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
              style={{
                color: isActive ? 'oklch(0.45 0.07 20)' : 'oklch(0.50 0.03 40)',
                backgroundColor: isActive ? 'oklch(0.93 0.025 20)' : 'transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: 'oklch(0.93 0.025 20)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10 shrink-0" />
              <span className="relative z-10 flex-1 text-left">{label}</span>
              {badge && (
                <span
                  className="relative z-10 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? 'oklch(0.45 0.07 20)' : 'oklch(0.88 0.02 60)',
                    color: isActive ? 'white' : 'oklch(0.55 0.03 40)',
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
