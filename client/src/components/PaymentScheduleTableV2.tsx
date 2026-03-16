import { useState, useMemo } from 'react';
import { Expense } from '@/contexts/WeddingContext';

interface PaymentScheduleTableV2Props {
  expenses: Expense[];
  weddingDate: string;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day || 1);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const names = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
                 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  return `${names[month - 1]} ${year}`;
}

function addMonths(date: Date, n: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + n);
  return result;
}

interface MonthItemValue {
  value: number;
  isEntry: boolean;
}

export default function PaymentScheduleTableV2({ expenses, weddingDate }: PaymentScheduleTableV2Props) {
  const [divideBy, setDivideBy] = useState<number>(2);
  const [customDivideValue, setCustomDivideValue] = useState<string>('');

  const divisor = divideBy === 0
    ? (parseFloat(customDivideValue) || 2)
    : divideBy;

  // Build schedule: { monthKey -> { itemName -> { value, isEntry } } }
  const { grid, sortedMonths, itemNames, itemTotals } = useMemo(() => {
    const grid: Record<string, Record<string, MonthItemValue>> = {};
    const allMonths = new Set<string>();
    const itemSet: string[] = [];
    const itemTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const name = expense.item;
      if (!itemSet.includes(name)) itemSet.push(name);
      itemTotals[name] = expense.totalValue;

      // 1) Entrada (sinal) — pode ser parcelada
      if (expense.entryValue > 0 && expense.entryStartDate) {
        const entryStart = parseDate(expense.entryStartDate);
        const entryParcelas = expense.entryInstallments || 1;
        const entryParcelaValue = expense.entryValue / entryParcelas;

        for (let i = 0; i < entryParcelas; i++) {
          const d = addMonths(entryStart, i);
          const mk = monthKey(d);
          allMonths.add(mk);
          if (!grid[mk]) grid[mk] = {};
          // Soma ao valor existente do mesmo item no mesmo mês
          const existing = grid[mk][name];
          grid[mk][name] = {
            value: (existing?.value || 0) + entryParcelaValue,
            isEntry: true,
          };
        }
      }

      // 2) Saldo parcelado
      const saldo = expense.totalValue - (expense.entryValue || 0);
      if (saldo > 0 && expense.installments > 0 && expense.paymentStartDate) {
        const payStart = parseDate(expense.paymentStartDate);
        const parcelaValue = saldo / expense.installments;

        for (let i = 0; i < expense.installments; i++) {
          const d = addMonths(payStart, i);
          const mk = monthKey(d);
          allMonths.add(mk);
          if (!grid[mk]) grid[mk] = {};
          const existing = grid[mk][name];
          if (existing) {
            // Se já tem entrada nesse mês, soma
            grid[mk][name] = {
              value: existing.value + parcelaValue,
              isEntry: existing.isEntry,
            };
          } else {
            grid[mk][name] = { value: parcelaValue, isEntry: false };
          }
        }
      }
    });

    const sortedMonths = Array.from(allMonths).sort();

    return { grid, sortedMonths, itemNames: itemSet, itemTotals };
  }, [expenses]);

  if (expenses.length === 0) return null;

  // Calcular totais por coluna
  const columnTotals: Record<string, number> = {};
  itemNames.forEach((name) => {
    columnTotals[name] = 0;
    sortedMonths.forEach((mk) => {
      columnTotals[name] += grid[mk]?.[name]?.value || 0;
    });
  });

  return (
    <div className="space-y-4">
      {/* Controle de divisão */}
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-sm font-medium" style={{ color: 'oklch(0.45 0.05 40)' }}>
          Dividir total por:
        </label>
        <select
          value={divideBy}
          onChange={(e) => setDivideBy(parseInt(e.target.value))}
          className="px-3 py-1.5 rounded-lg border text-sm"
          style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
        >
          <option value={1}>1 pessoa (sem divisão)</option>
          <option value={2}>2 pessoas</option>
          <option value={3}>3 pessoas</option>
          <option value={0}>Personalizado</option>
        </select>
        {divideBy === 0 && (
          <input
            type="number"
            value={customDivideValue}
            onChange={(e) => setCustomDivideValue(e.target.value)}
            placeholder="Quantas pessoas?"
            min="1"
            className="px-3 py-1.5 rounded-lg border text-sm w-36"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'oklch(0.88 0.02 60)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'oklch(0.90 0.02 75)' }}>
              <th
                className="px-4 py-3 text-left font-bold whitespace-nowrap sticky left-0 z-10"
                style={{ color: 'oklch(0.28 0.04 40)', backgroundColor: 'oklch(0.90 0.02 75)', minWidth: '140px' }}
              >
                MÊS
              </th>
              {itemNames.map((name) => (
                <th
                  key={name}
                  className="px-3 py-3 text-center font-bold whitespace-nowrap"
                  style={{ color: 'oklch(0.28 0.04 40)', minWidth: '130px' }}
                >
                  <div className="text-xs uppercase">{name}</div>
                  <div className="text-[10px] font-normal mt-0.5" style={{ color: 'oklch(0.55 0.03 40)' }}>
                    {formatCurrency(itemTotals[name])}
                  </div>
                </th>
              ))}
              <th
                className="px-4 py-3 text-right font-bold whitespace-nowrap"
                style={{ color: 'oklch(0.28 0.04 40)', minWidth: '120px' }}
              >
                PARCELAS
              </th>
              <th
                className="px-4 py-3 text-right font-bold whitespace-nowrap"
                style={{ color: 'oklch(0.40 0.12 145)', minWidth: '130px' }}
              >
                DIVIDIDO POR {divisor}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMonths.map((mk, idx) => {
              const row = grid[mk] || {};
              let monthTotal = 0;
              itemNames.forEach((name) => {
                monthTotal += row[name]?.value || 0;
              });
              const divided = monthTotal / divisor;

              return (
                <tr
                  key={mk}
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'white' : 'oklch(0.98 0.006 60)',
                    borderBottom: '1px solid oklch(0.92 0.01 60)',
                  }}
                >
                  <td
                    className="px-4 py-2.5 font-semibold whitespace-nowrap text-xs sticky left-0 z-10"
                    style={{
                      color: 'oklch(0.28 0.04 40)',
                      backgroundColor: idx % 2 === 0 ? 'white' : 'oklch(0.98 0.006 60)',
                    }}
                  >
                    {monthLabel(mk)}
                  </td>
                  {itemNames.map((name) => {
                    const cell = row[name];
                    return (
                      <td key={`${mk}-${name}`} className="px-3 py-2.5 text-center">
                        {cell ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: cell.isEntry
                                ? 'oklch(0.90 0.06 145)'
                                : 'oklch(0.95 0.015 75)',
                              color: cell.isEntry
                                ? 'oklch(0.30 0.08 145)'
                                : 'oklch(0.35 0.04 40)',
                            }}
                          >
                            {formatCurrency(cell.value)}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'oklch(0.82 0.01 60)' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right font-bold text-xs whitespace-nowrap" style={{ color: 'oklch(0.28 0.04 40)' }}>
                    {formatCurrency(monthTotal)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-xs whitespace-nowrap" style={{ color: 'oklch(0.40 0.12 145)' }}>
                    {formatCurrency(divided)}
                  </td>
                </tr>
              );
            })}

            {/* Linha de TOTAL */}
            <tr style={{ backgroundColor: 'oklch(0.90 0.02 75)', borderTop: '2px solid oklch(0.80 0.03 40)' }}>
              <td
                className="px-4 py-3 font-bold text-xs whitespace-nowrap sticky left-0 z-10"
                style={{ color: 'oklch(0.28 0.04 40)', backgroundColor: 'oklch(0.90 0.02 75)' }}
              >
                TOTAL
              </td>
              {itemNames.map((name) => (
                <td key={`total-${name}`} className="px-3 py-3 text-center font-bold text-xs" style={{ color: 'oklch(0.28 0.04 40)' }}>
                  {formatCurrency(itemTotals[name])}
                </td>
              ))}
              <td className="px-4 py-3 text-right font-bold text-xs" style={{ color: 'oklch(0.28 0.04 40)' }}>
                {formatCurrency(expenses.reduce((s, e) => s + e.totalValue, 0))}
              </td>
              <td className="px-4 py-3 text-right font-bold text-xs" style={{ color: 'oklch(0.40 0.12 145)' }}>
                {formatCurrency(expenses.reduce((s, e) => s + e.totalValue, 0) / divisor)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Total planejado',
            value: expenses.reduce((sum, e) => sum + e.totalValue, 0),
            color: 'oklch(0.45 0.07 20)',
            bg: 'oklch(0.93 0.025 20)',
          },
          {
            label: 'Total pago (Entradas)',
            value: expenses.reduce((sum, e) => sum + e.entryValue, 0),
            color: 'oklch(0.40 0.12 145)',
            bg: 'oklch(0.93 0.04 145)',
          },
          {
            label: 'Falta pagar',
            value: expenses.reduce((sum, e) => sum + (e.totalValue - e.entryValue), 0),
            color: 'oklch(0.55 0.08 65)',
            bg: 'oklch(0.93 0.025 65)',
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="text-center rounded-xl py-3 px-2 transition-all"
            style={{ backgroundColor: bg, border: '1px solid oklch(0.88 0.02 60)' }}
          >
            <div className="font-display text-base font-bold leading-tight" style={{ color }}>
              {formatCurrency(value)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.03 40)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
