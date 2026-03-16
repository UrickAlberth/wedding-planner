import { useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2, Check, X, TrendingUp } from 'lucide-react';
import { useWedding, Expense } from '@/contexts/WeddingContext';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseInstallmentsTable from './ExpenseInstallmentsTable';
import PaymentScheduleTableV2 from './PaymentScheduleTableV2';

const PAYMENT_METHODS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Transferência', 'Boleto'];

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ExpensesSection() {
  const { expenses, addExpense, editExpense, removeExpense, weddingDate } = useWedding();
  const [item, setItem] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [entryValue, setEntryValue] = useState('');
  const [entryInstallments, setEntryInstallments] = useState('1');
  const [entryStartDate, setEntryStartDate] = useState('');
  const [installments, setInstallments] = useState('1');
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editItem, setEditItem] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [editPayment, setEditPayment] = useState('Pix');
  const [editEntry, setEditEntry] = useState('');
  const [editEntryInstallments, setEditEntryInstallments] = useState('1');
  const [editEntryStartDate, setEditEntryStartDate] = useState('');
  const [editInstallments, setEditInstallments] = useState('1');
  const [editPaymentStartDate, setEditPaymentStartDate] = useState('');

  const handleAdd = () => {
    if (!item.trim() || !totalValue || !paymentStartDate) return;
    addExpense({
      item: item.trim(),
      totalValue: parseFloat(totalValue) || 0,
      paymentMethod,
      entryValue: parseFloat(entryValue) || 0,
      entryInstallments: parseInt(entryInstallments) || 1,
      entryStartDate,
      installments: parseInt(installments) || 1,
      paymentStartDate,
    });
    setItem('');
    setTotalValue('');
    setEntryValue('');
    setEntryInstallments('1');
    setEntryStartDate('');
    setInstallments('1');
    setPaymentStartDate('');
  };

  const startEdit = (e: Expense) => {
    setEditingExpense(e);
    setEditItem(e.item);
    setEditTotal(e.totalValue.toString());
    setEditPayment(e.paymentMethod);
    setEditEntry(e.entryValue.toString());
    setEditEntryInstallments(e.entryInstallments.toString());
    setEditEntryStartDate(e.entryStartDate);
    setEditInstallments(e.installments.toString());
    setEditPaymentStartDate(e.paymentStartDate);
  };

  const confirmEdit = () => {
    if (!editingExpense) return;
    editExpense(editingExpense.id, {
      item: editItem.trim(),
      totalValue: parseFloat(editTotal) || 0,
      paymentMethod: editPayment,
      entryValue: parseFloat(editEntry) || 0,
      entryInstallments: parseInt(editEntryInstallments) || 1,
      entryStartDate: editEntryStartDate,
      installments: parseInt(editInstallments) || 1,
      paymentStartDate: editPaymentStartDate,
    });
    setEditingExpense(null);
    setPaymentStartDate('');
    setEditPaymentStartDate('');
  };

  const totalPlanned = expenses.reduce((s, e) => s + e.totalValue, 0);
  const totalEntry = expenses.reduce((s, e) => s + e.entryValue, 0);
  const totalRemaining = totalPlanned - totalEntry;

  return (
    <div className="wedding-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5" style={{ color: 'oklch(0.55 0.08 20)' }} />
        <h2 className="font-display text-xl font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
          Gastos
        </h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total planejado', value: totalPlanned, color: 'oklch(0.45 0.07 20)', bg: 'oklch(0.93 0.025 20)' },
          { label: 'Total de entrada', value: totalEntry, color: 'oklch(0.45 0.10 145)', bg: 'oklch(0.93 0.04 145)' },
          { label: 'Total restante', value: totalRemaining, color: totalRemaining > 0 ? 'oklch(0.55 0.15 25)' : 'oklch(0.45 0.10 145)', bg: totalRemaining > 0 ? 'oklch(0.93 0.03 25)' : 'oklch(0.93 0.04 145)' },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="text-center rounded-xl py-3 px-2 transition-all hover:shadow-sm"
            style={{ backgroundColor: bg, border: '1px solid oklch(0.88 0.02 60)' }}
          >
            <div className="font-display text-base md:text-lg font-bold leading-tight" style={{ color }}>
              {formatCurrency(value)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.03 40)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalPlanned > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'oklch(0.55 0.03 40)' }}>
            <span>Pago: {formatCurrency(totalEntry)}</span>
            <span>{Math.round((totalEntry / totalPlanned) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'oklch(0.88 0.02 60)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'oklch(0.55 0.08 20)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalEntry / totalPlanned) * 100, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="p-4 rounded-xl mb-5 space-y-3" style={{ backgroundColor: 'oklch(0.96 0.012 75)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Item</label>
            <input
              type="text"
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder="Ex: Fotógrafo"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Valor total</label>
            <input
              type="number"
              value={totalValue}
              onChange={e => setTotalValue(e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Método de pagamento</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            >
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Entrada (Sinal)</label>
            <input
              type="number"
              value={entryValue}
              onChange={e => setEntryValue(e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Parcelas da entrada</label>
            <input
              type="number"
              value={entryInstallments}
              onChange={e => setEntryInstallments(e.target.value)}
              min="1"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Início da entrada</label>
            <input
              type="date"
              value={entryStartDate}
              onChange={e => setEntryStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Parcelas do saldo</label>
            <input
              type="number"
              value={installments}
              onChange={e => setInstallments(e.target.value)}
              min="1"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
              style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Início do parcelamento</label>
          <input
            type="date"
            value={paymentStartDate}
            onChange={e => setPaymentStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'oklch(0.98 0.005 75)' }}
        >
          <Plus className="w-4 h-4" />
          Adicionar gasto
        </button>
      </div>

      {/* Expenses table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'oklch(0.88 0.02 60)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'oklch(0.93 0.018 75)' }}>
              {['Item', 'Pagamento', 'Resumo', 'Ação'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'oklch(0.45 0.05 40)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {expenses.map((exp, idx) => {
                const remaining = exp.totalValue - exp.entryValue;
                const installmentValue = exp.installments > 1 ? (exp.totalValue - exp.entryValue) / exp.installments : 0;
                return (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t transition-colors hover:bg-opacity-50"
                    style={{
                      borderColor: 'oklch(0.88 0.02 60)',
                      backgroundColor: idx % 2 === 0 ? 'white' : 'oklch(0.98 0.005 75)',
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'oklch(0.28 0.04 40)' }}>
                      {exp.item}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'oklch(0.45 0.05 40)' }}>
                      {exp.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 text-xs" style={{ color: 'oklch(0.45 0.05 40)' }}>
                        <div>Total: <span className="font-medium">{formatCurrency(exp.totalValue)}</span></div>
                        <div>Entrada: <span className="font-medium">{formatCurrency(exp.entryValue)}</span></div>
                        <div>Restante: <span className="font-medium" style={{ color: remaining > 0 ? 'oklch(0.55 0.15 25)' : 'oklch(0.45 0.10 145)' }}>{formatCurrency(remaining)}</span></div>
                        {exp.installments > 1 && (
                          <div>{exp.installments}x de <span className="font-medium">{formatCurrency(installmentValue)}</span></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(exp)}
                          className="p-1.5 rounded-md transition-all hover:scale-110"
                          style={{ color: 'oklch(0.55 0.08 20)' }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeExpense(exp.id)}
                          className="p-1.5 rounded-md transition-all hover:scale-110"
                          style={{ color: 'oklch(0.577 0.245 27.325)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr style={{ backgroundColor: 'oklch(0.93 0.018 75)', borderTop: '2px solid oklch(0.88 0.02 60)' }}>
                <td colSpan={2} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'oklch(0.38 0.06 40)' }}>
                  Totais
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5 text-xs font-semibold">
                    <div style={{ color: 'oklch(0.45 0.07 20)' }}>Planejado: {formatCurrency(totalPlanned)}</div>
                    <div style={{ color: 'oklch(0.45 0.10 145)' }}>Entrada: {formatCurrency(totalEntry)}</div>
                    <div style={{ color: totalRemaining > 0 ? 'oklch(0.55 0.15 25)' : 'oklch(0.45 0.10 145)' }}>Restante: {formatCurrency(totalRemaining)}</div>
                  </div>
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
        {expenses.length === 0 && (
          <div className="text-center py-8" style={{ color: 'oklch(0.65 0.02 40)' }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum gasto cadastrado</p>
          </div>
        )}
      </div>

      {/* Payment Schedule Table */}
      {expenses.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'oklch(0.28 0.04 40)' }}>
            📅 Cronograma de Pagamentos
          </h3>
          <PaymentScheduleTableV2 expenses={expenses} weddingDate={weddingDate} />
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editingExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'oklch(0 0 0 / 0.4)' }}
            onClick={() => setEditingExpense(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="wedding-card p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'oklch(0.28 0.04 40)' }}>
                Editar Gasto
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Item</label>
                  <input type="text" value={editItem} onChange={e => setEditItem(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: 'oklch(0.88 0.02 60)' }} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Valor total</label>
                    <input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: 'oklch(0.88 0.02 60)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Entrada</label>
                    <input type="number" value={editEntry} onChange={e => setEditEntry(e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: 'oklch(0.88 0.02 60)' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Pagamento</label>
                    <select value={editPayment} onChange={e => setEditPayment(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: 'oklch(0.88 0.02 60)' }}>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.05 40)' }}>Parcelas</label>
                    <input type="number" value={editInstallments} onChange={e => setEditInstallments(e.target.value)} min="1" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: 'oklch(0.88 0.02 60)' }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={confirmEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90" style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'white' }}>
                  <Check className="w-4 h-4" /> Salvar
                </button>
                <button onClick={() => setEditingExpense(null)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90" style={{ backgroundColor: 'oklch(0.93 0.015 75)', color: 'oklch(0.45 0.05 40)' }}>
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
