/**
 * OverviewSection — Visão geral do casamento
 * Design: Elegância Clássica Atemporal
 * Mostra estatísticas, gráficos e próximos eventos
 */

import { CalendarDays, CheckSquare, Users, DollarSign, TrendingUp, Clock, Heart, ArrowRight } from 'lucide-react';
import { useWedding } from '@/contexts/WeddingContext';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function OverviewSection() {
  const { weddingDate, agendaItems, tasks, guests, expenses } = useWedding();

  const daysLeft = getDaysUntil(weddingDate);
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const confirmedGuests = guests.filter(g => g.confirmed).length;
  const guestProgress = guests.length > 0 ? (confirmedGuests / guests.length) * 100 : 0;
  const totalPlanned = expenses.reduce((s, e) => s + e.totalValue, 0);
  const totalPaid = expenses.reduce((s, e) => s + e.entryValue, 0);
  const budgetProgress = totalPlanned > 0 ? (totalPaid / totalPlanned) * 100 : 0;

  const upcomingEvents = [...agendaItems]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter(e => e.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 4);

  const guestPieData = [
    { name: 'Confirmados', value: confirmedGuests, color: '#6aab7e' },
    { name: 'Pendentes', value: Math.max(guests.length - confirmedGuests, 0), color: '#e8ddd1' },
  ];

  const budgetPieData = [
    { name: 'Pago', value: totalPaid, color: '#9b6b5a' },
    { name: 'Restante', value: Math.max(totalPlanned - totalPaid, 0), color: '#e8ddd1' },
  ];

  // Expense bar chart data
  const expenseBarData = expenses.slice(0, 5).map(e => ({
    name: e.item.length > 12 ? e.item.slice(0, 12) + '…' : e.item,
    total: e.totalValue,
    pago: e.entryValue,
  }));

  const stats = [
    {
      label: 'Dias restantes',
      value: daysLeft > 0 ? daysLeft.toLocaleString('pt-BR') : '0',
      suffix: 'dias',
      icon: Clock,
      color: 'oklch(0.45 0.07 20)',
      bg: 'oklch(0.93 0.025 20)',
      description: 'Para o grande dia',
    },
    {
      label: 'Tarefas',
      value: completedTasks.toString(),
      suffix: `/ ${tasks.length}`,
      icon: CheckSquare,
      color: 'oklch(0.45 0.10 145)',
      bg: 'oklch(0.93 0.04 145)',
      progress: taskProgress,
      description: 'Concluídas',
    },
    {
      label: 'Convidados',
      value: confirmedGuests.toString(),
      suffix: `/ ${guests.length}`,
      icon: Users,
      color: 'oklch(0.45 0.08 240)',
      bg: 'oklch(0.93 0.025 240)',
      progress: guestProgress,
      description: 'Confirmados',
    },
    {
      label: 'Orçamento pago',
      value: formatCurrency(totalPaid),
      suffix: '',
      icon: DollarSign,
      color: 'oklch(0.55 0.08 65)',
      bg: 'oklch(0.93 0.025 65)',
      progress: budgetProgress,
      description: `de ${formatCurrency(totalPlanned)}`,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, suffix, icon: Icon, color, bg, progress, description }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            className="wedding-card p-4 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div
              className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20 -translate-y-4 translate-x-4"
              style={{ backgroundColor: color }}
            />
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <div className="font-display text-2xl font-bold mb-0.5 leading-tight" style={{ color }}>
              {value}
              {suffix && <span className="text-sm font-normal ml-1" style={{ color: 'oklch(0.60 0.03 40)' }}>{suffix}</span>}
            </div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'oklch(0.38 0.04 40)' }}>{label}</div>
            <div className="text-xs" style={{ color: 'oklch(0.60 0.02 40)' }}>{description}</div>
            {progress !== undefined && (
              <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'oklch(0.88 0.02 60)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Middle row: Events + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming events */}
        <motion.div variants={itemVariants} className="wedding-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: 'oklch(0.55 0.08 20)' }} />
              <h3 className="font-display text-base font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                Próximos Eventos
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'oklch(0.93 0.025 20)', color: 'oklch(0.45 0.07 20)' }}>
              {upcomingEvents.length}
            </span>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <Heart className="w-6 h-6 mx-auto mb-2 opacity-30" style={{ color: 'oklch(0.55 0.08 20)' }} />
                <p className="text-sm" style={{ color: 'oklch(0.65 0.02 40)' }}>Nenhum evento próximo</p>
              </div>
            ) : upcomingEvents.map((ev, i) => {
              const d = new Date(ev.date + 'T00:00:00');
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex gap-3 items-start"
                >
                  <div
                    className="shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-center"
                    style={{ backgroundColor: 'oklch(0.93 0.025 20)' }}
                  >
                    <span className="text-sm font-bold leading-none" style={{ color: 'oklch(0.45 0.07 20)' }}>
                      {d.getDate()}
                    </span>
                    <span className="text-xs leading-none mt-0.5 capitalize" style={{ color: 'oklch(0.60 0.05 20)' }}>
                      {d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate" style={{ color: 'oklch(0.28 0.04 40)' }}>{ev.event}</p>
                    <p className="text-xs capitalize mt-0.5" style={{ color: 'oklch(0.60 0.03 40)' }}>
                      {d.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Guest confirmation pie */}
        <motion.div variants={itemVariants} className="wedding-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" style={{ color: 'oklch(0.55 0.08 20)' }} />
            <h3 className="font-display text-base font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
              Confirmações
            </h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={guestPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {guestPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} convidados`]}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid oklch(0.88 0.02 60)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-1">
            {guestPieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: d.color, borderColor: '#ccc' }} />
                <span className="text-xs" style={{ color: 'oklch(0.55 0.03 40)' }}>{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Budget pie */}
        <motion.div variants={itemVariants} className="wedding-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: 'oklch(0.55 0.08 20)' }} />
            <h3 className="font-display text-base font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
              Orçamento
            </h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {budgetPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v)]}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid oklch(0.88 0.02 60)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            {budgetPieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 border" style={{ backgroundColor: d.color, borderColor: '#ccc' }} />
                <span className="text-xs" style={{ color: 'oklch(0.55 0.03 40)' }}>{d.name}: <strong>{formatCurrency(d.value)}</strong></span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Expense bar chart */}
      {expenseBarData.length > 0 && (
        <motion.div variants={itemVariants} className="wedding-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4" style={{ color: 'oklch(0.55 0.08 20)' }} />
            <h3 className="font-display text-base font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
              Gastos por Item
            </h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBarData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 60)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'oklch(0.55 0.03 40)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'oklch(0.55 0.03 40)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v)]}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid oklch(0.88 0.02 60)' }}
                />
                <Bar dataKey="total" name="Total" fill="#d9b8ae" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pago" name="Pago" fill="#9b6b5a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {[
              { label: 'Total', color: '#d9b8ae' },
              { label: 'Pago', color: '#9b6b5a' },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                <span className="text-xs" style={{ color: 'oklch(0.55 0.03 40)' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={itemVariants} className="wedding-card p-5">
        <h3 className="font-display text-base font-semibold mb-3" style={{ color: 'oklch(0.28 0.04 40)' }}>
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Adicionar evento', icon: CalendarDays, color: 'oklch(0.45 0.07 20)', bg: 'oklch(0.93 0.025 20)' },
            { label: 'Nova tarefa', icon: CheckSquare, color: 'oklch(0.45 0.10 145)', bg: 'oklch(0.93 0.04 145)' },
            { label: 'Novo convidado', icon: Users, color: 'oklch(0.45 0.08 240)', bg: 'oklch(0.93 0.025 240)' },
            { label: 'Registrar gasto', icon: DollarSign, color: 'oklch(0.55 0.08 65)', bg: 'oklch(0.93 0.025 65)' },
          ].map(({ label, icon: Icon, color, bg }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 hover:shadow-sm"
              style={{ backgroundColor: bg, color }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-left leading-tight">{label}</span>
              <ArrowRight className="w-3 h-3 ml-auto shrink-0 opacity-60" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
