import { Expense } from '@/contexts/WeddingContext';
import { motion } from 'framer-motion';

interface InstallmentMonth {
  month: string;
  monthIndex: number;
  expenses: { item: string; amount: number; color: string }[];
  total: number;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getMonthName(monthIndex: number): string {
  const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 
                  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  return months[monthIndex] || '';
}

const expenseColors: Record<string, string> = {
  'Local casamento': 'oklch(0.88 0.04 240)',
  'Fotógrafo': 'oklch(0.90 0.04 20)',
  'Decoração': 'oklch(0.90 0.04 300)',
  'Buffet': 'oklch(0.88 0.05 65)',
  'DJ': 'oklch(0.90 0.04 200)',
  'Vestido': 'oklch(0.90 0.04 145)',
  'Convites': 'oklch(0.88 0.04 240)',
};

function getExpenseColor(item: string): string {
  return expenseColors[item] || 'oklch(0.88 0.04 240)';
}

interface ExpenseInstallmentsTableProps {
  expenses: Expense[];
  weddingDate: string;
}

export default function ExpenseInstallmentsTable({ expenses, weddingDate }: ExpenseInstallmentsTableProps) {
  // Parse wedding date
  const weddingDateObj = new Date(weddingDate);
  const weddingMonth = weddingDateObj.getMonth();
  const weddingYear = weddingDateObj.getFullYear();

  // Calculate installment schedule
  const installmentsByMonth: Map<string, InstallmentMonth> = new Map();

  expenses.forEach((expense) => {
    if (expense.installments <= 0) return;

    const monthlyAmount = (expense.totalValue - expense.entryValue) / expense.installments;
    
    // Start from the month after entry
    const startDate = new Date(weddingYear, weddingMonth, 1);
    
    for (let i = 0; i < expense.installments; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setMonth(installmentDate.getMonth() - expense.installments + i + 1);
      
      const monthKey = `${installmentDate.getFullYear()}-${String(installmentDate.getMonth()).padStart(2, '0')}`;
      const monthName = `${getMonthName(installmentDate.getMonth())} ${installmentDate.getFullYear()}`;

      if (!installmentsByMonth.has(monthKey)) {
        installmentsByMonth.set(monthKey, {
          month: monthName,
          monthIndex: installmentDate.getMonth(),
          expenses: [],
          total: 0,
        });
      }

      const monthData = installmentsByMonth.get(monthKey)!;
      monthData.expenses.push({
        item: expense.item,
        amount: monthlyAmount,
        color: getExpenseColor(expense.item),
      });
      monthData.total += monthlyAmount;
    }
  });

  // Add entry value to first month
  const firstMonthKey = Array.from(installmentsByMonth.keys()).sort()[0];
  if (firstMonthKey && expenses.some(e => e.entryValue > 0)) {
    const monthData = installmentsByMonth.get(firstMonthKey)!;
    const totalEntry = expenses.reduce((sum, e) => sum + e.entryValue, 0);
    monthData.expenses.unshift({
      item: 'Entrada (paga)',
      amount: totalEntry,
      color: 'oklch(0.45 0.10 145)',
    });
    monthData.total += totalEntry;
  }

  // Sort by date
  const sortedMonths = Array.from(installmentsByMonth.values()).sort(
    (a, b) => a.monthIndex - b.monthIndex
  );

  // Get unique items for columns
  const allItems = new Set<string>();
  sortedMonths.forEach(month => {
    month.expenses.forEach(exp => {
      allItems.add(exp.item);
    });
  });

  const itemColumns = Array.from(allItems);

  if (sortedMonths.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 overflow-x-auto"
    >
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'oklch(0.88 0.02 60)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'oklch(0.96 0.012 75)' }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                MÊS
              </th>
              {itemColumns.map((item) => (
                <th key={item} className="px-3 py-3 text-center font-semibold whitespace-nowrap" style={{ color: 'oklch(0.45 0.07 20)' }}>
                  <div className="text-xs">{item}</div>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMonths.map((monthData, idx) => (
              <tr
                key={monthData.month}
                style={{
                  backgroundColor: idx % 2 === 0 ? 'white' : 'oklch(0.98 0.008 60)',
                  borderBottom: '1px solid oklch(0.88 0.02 60)',
                }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: 'oklch(0.28 0.04 40)' }}>
                  {monthData.month}
                </td>
                {itemColumns.map((item) => {
                  const expense = monthData.expenses.find(e => e.item === item);
                  return (
                    <td key={`${monthData.month}-${item}`} className="px-3 py-3 text-center">
                      {expense ? (
                        <div
                          className="inline-block px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: expense.color,
                            color: item === 'Entrada (paga)' ? 'oklch(0.35 0.08 145)' : 'oklch(0.35 0.10 240)',
                          }}
                        >
                          {formatCurrency(expense.amount)}
                        </div>
                      ) : (
                        <span style={{ color: 'oklch(0.75 0.01 60)' }}>—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right font-bold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                  {formatCurrency(monthData.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.012 75)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: 'oklch(0.45 0.05 40)' }}>
          LEGENDA:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {itemColumns.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: item === 'Entrada (paga)' ? 'oklch(0.45 0.10 145)' : getExpenseColor(item),
                }}
              />
              <span className="text-xs" style={{ color: 'oklch(0.45 0.05 40)' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
