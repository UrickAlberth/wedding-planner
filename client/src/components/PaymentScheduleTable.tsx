import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Expense } from '@/contexts/WeddingContext';

interface PaymentScheduleTableProps {
  expenses: Expense[];
  weddingDate: string;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getMonthKey(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${month}/${year}`;
}

function addMonths(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split('-');
  let y = parseInt(year);
  let m = parseInt(month) + months;
  
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  
  return `${y}-${String(m).padStart(2, '0')}-${String(day || '01').padStart(2, '0')}`;
}

export default function PaymentScheduleTable({ expenses, weddingDate }: PaymentScheduleTableProps) {
  const [divideBy, setDivideBy] = useState<number>(2);
  const [customDivideValue, setCustomDivideValue] = useState<string>('');

  // Calcular cronograma de pagamentos
  const paymentSchedule = useMemo(() => {
    const schedule: Record<string, Record<string, number>> = {};
    const months = new Set<string>();

    expenses.forEach((expense) => {
      if (!expense.paymentStartDate) return;

      // Entrada (sinal)
      const entryMonthKey = getMonthKey(expense.paymentStartDate);
      if (!schedule[entryMonthKey]) schedule[entryMonthKey] = {};
      schedule[entryMonthKey][`${expense.item} (Entrada)`] = expense.entryValue;
      months.add(entryMonthKey);

      // Parcelamento do saldo
      const remainingBalance = expense.totalValue - expense.entryValue;
      if (remainingBalance > 0 && expense.installments > 0) {
        const installmentValue = remainingBalance / expense.installments;
        
        for (let i = 0; i < expense.installments; i++) {
          const installmentDate = addMonths(expense.paymentStartDate, i);
          const monthKey = getMonthKey(installmentDate);
          
          if (!schedule[monthKey]) schedule[monthKey] = {};
          schedule[monthKey][expense.item] = installmentValue;
          months.add(monthKey);
        }
      }
    });

    return { schedule, months: Array.from(months).sort() };
  }, [expenses]);

  const divisor = customDivideValue ? parseFloat(customDivideValue) || divideBy : divideBy;

  // Obter todos os serviços únicos
  const allServices = useMemo(() => {
    const services = new Set<string>();
    Object.values(paymentSchedule.schedule).forEach((monthData) => {
      Object.keys(monthData).forEach((service) => services.add(service));
    });
    return Array.from(services).sort();
  }, [paymentSchedule]);

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
          <option value={2}>2 pessoas</option>
          <option value={3}>3 pessoas</option>
          <option value={0}>Personalizado</option>
        </select>
        {divideBy === 0 && (
          <input
            type="number"
            value={customDivideValue}
            onChange={(e) => setCustomDivideValue(e.target.value)}
            placeholder="Digite o valor"
            min="1"
            step="0.01"
            className="px-3 py-1.5 rounded-lg border text-sm w-32"
            style={{ borderColor: 'oklch(0.88 0.02 60)', backgroundColor: 'white', color: 'oklch(0.28 0.04 40)' }}
          />
        )}
      </div>

      {/* Tabela de cronograma */}
      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'oklch(0.88 0.02 60)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'oklch(0.93 0.018 75)' }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                MÊS
              </th>
              {allServices.map((service) => (
                <th
                  key={service}
                  className="px-3 py-3 text-center font-semibold whitespace-nowrap"
                  style={{ color: 'oklch(0.45 0.07 20)' }}
                >
                  <div className="text-xs">{service}</div>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                TOTAL
              </th>
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'oklch(0.45 0.10 145)' }}>
                DIVIDIDO POR {divisor}
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentSchedule.months.map((monthKey, idx) => {
              const monthData = paymentSchedule.schedule[monthKey];
              const monthTotal = Object.values(monthData).reduce((sum, val) => sum + val, 0);
              const dividedValue = monthTotal / divisor;

              return (
                <tr
                  key={monthKey}
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'white' : 'oklch(0.98 0.008 60)',
                    borderBottom: '1px solid oklch(0.88 0.02 60)',
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'oklch(0.28 0.04 40)' }}>
                    {monthKey}
                  </td>
                  {allServices.map((service) => {
                    const value = monthData[service];
                    return (
                      <td key={`${monthKey}-${service}`} className="px-3 py-3 text-center">
                        {value ? (
                          <div
                            className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: service.includes('Entrada')
                                ? 'oklch(0.93 0.04 145)'
                                : 'oklch(0.93 0.025 20)',
                              color: service.includes('Entrada')
                                ? 'oklch(0.35 0.08 145)'
                                : 'oklch(0.45 0.07 20)',
                            }}
                          >
                            {formatCurrency(value)}
                          </div>
                        ) : (
                          <span style={{ color: 'oklch(0.75 0.01 60)' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-bold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                    {formatCurrency(monthTotal)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: 'oklch(0.45 0.10 145)' }}>
                    {formatCurrency(dividedValue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Total dos serviços',
            value: expenses.reduce((sum, e) => sum + e.totalValue, 0),
            color: 'oklch(0.45 0.07 20)',
            bg: 'oklch(0.93 0.025 20)',
          },
          {
            label: 'Total pago',
            value: expenses.reduce((sum, e) => sum + e.entryValue, 0),
            color: 'oklch(0.45 0.10 145)',
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
