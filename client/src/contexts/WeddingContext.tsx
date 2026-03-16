import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface AgendaItem {
  id: number;
  date: string;
  event: string;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export type GuestSide = 'noiva' | 'noivo';
export type GuestRole = 'Convidado' | 'Padrinho' | 'Madrinha' | 'Daminha' | 'Pajem' | 'Família' | 'Amigo(a)' | 'Outro';

export interface Guest {
  id: number;
  name: string;
  side: GuestSide;
  role: GuestRole;
  confirmed: boolean;
  present?: boolean;
}

export interface Expense {
  id: number;
  item: string;
  totalValue: number;
  paymentMethod: string;
  // Entrada (sinal)
  entryValue: number;
  entryInstallments: number; // 1 = à vista, >1 = parcelada
  entryStartDate: string; // YYYY-MM-DD
  // Parcelamento do saldo
  installments: number;
  paymentStartDate: string; // YYYY-MM-DD
}

interface WeddingContextType {
  weddingDate: string;
  setWeddingDate: (date: string) => void;
  shareCode: string | null;
  joinWeddingByCode: (inviteCode: string) => Promise<boolean>;
  agendaItems: AgendaItem[];
  addAgendaItem: (item: Omit<AgendaItem, 'id'>) => void;
  editAgendaItem: (id: number, item: Omit<AgendaItem, 'id'>) => void;
  removeAgendaItem: (id: number) => void;
  tasks: Task[];
  addTask: (text: string) => void;
  editTask: (id: number, text: string) => void;
  toggleTask: (id: number) => void;
  removeTask: (id: number) => void;
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  editGuest: (id: number, guest: Omit<Guest, 'id'>) => void;
  removeGuest: (id: number) => void;
  toggleGuestConfirmed: (id: number) => void;
  toggleGuestPresent: (id: number) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  editExpense: (id: number, expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: number) => void;
}

const WeddingContext = createContext<WeddingContextType | null>(null);

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [weddingDate, setWeddingDateState] = useState<string>('2027-05-09');

  // Fetch data from API
  const weddingQuery = trpc.wedding.get.useQuery();
  const eventsQuery = trpc.events.list.useQuery();
  const tasksQuery = trpc.tasks.list.useQuery();
  const guestsQuery = trpc.guests.list.useQuery();
  const expensesQuery = trpc.expenses.list.useQuery();

  // Mutations
  const weddingUpdateMutation = trpc.wedding.update.useMutation();
  const weddingGetOrCreateMutation = trpc.wedding.getOrCreate.useMutation();
  const weddingJoinByCodeMutation = trpc.wedding.joinByCode.useMutation();
  const shareCodeQuery = trpc.wedding.getShareCode.useQuery();
  const eventCreateMutation = trpc.events.create.useMutation();
  const eventUpdateMutation = trpc.events.update.useMutation();
  const eventDeleteMutation = trpc.events.delete.useMutation();
  const taskCreateMutation = trpc.tasks.create.useMutation();
  const taskUpdateMutation = trpc.tasks.update.useMutation();
  const taskDeleteMutation = trpc.tasks.delete.useMutation();
  const guestCreateMutation = trpc.guests.create.useMutation();
  const guestUpdateMutation = trpc.guests.update.useMutation();
  const guestDeleteMutation = trpc.guests.delete.useMutation();
  const expenseCreateMutation = trpc.expenses.create.useMutation();
  const expenseUpdateMutation = trpc.expenses.update.useMutation();
  const expenseDeleteMutation = trpc.expenses.delete.useMutation();

  useEffect(() => {
    if (weddingQuery.data?.weddingDate) {
      const date = new Date(weddingQuery.data.weddingDate);
      setWeddingDateState(date.toISOString().split('T')[0]);
    }
  }, [weddingQuery.data]);

  const setWeddingDate = useCallback(async (date: string) => {
    setWeddingDateState(date);
    if (!weddingQuery.data) {
      await weddingGetOrCreateMutation.mutateAsync({
        brideName: 'Noiva',
        groomName: 'Noivo',
        weddingDate: new Date(date),
      });
      await weddingQuery.refetch();
    }
    await weddingUpdateMutation.mutateAsync({
      weddingDate: new Date(date),
    });
  }, [weddingGetOrCreateMutation, weddingQuery, weddingUpdateMutation]);

  const joinWeddingByCode = useCallback(async (inviteCode: string) => {
    const code = inviteCode.trim();
    if (!code) return false;

    await weddingJoinByCodeMutation.mutateAsync({ inviteCode: code });
    await Promise.all([
      weddingQuery.refetch(),
      eventsQuery.refetch(),
      tasksQuery.refetch(),
      guestsQuery.refetch(),
      expensesQuery.refetch(),
      shareCodeQuery.refetch(),
    ]);

    return true;
  }, [
    eventsQuery,
    expensesQuery,
    guestsQuery,
    shareCodeQuery,
    tasksQuery,
    weddingJoinByCodeMutation,
    weddingQuery,
  ]);

  const addAgendaItem = useCallback(async (item: Omit<AgendaItem, 'id'>) => {
    await eventCreateMutation.mutateAsync({
      title: item.event,
      date: item.date,
      time: '00:00',
    });
    eventsQuery.refetch();
  }, [eventCreateMutation, eventsQuery]);

  const editAgendaItem = useCallback(async (id: number, item: Omit<AgendaItem, 'id'>) => {
    await eventUpdateMutation.mutateAsync({
      id,
      title: item.event,
      date: item.date,
    });
    eventsQuery.refetch();
  }, [eventUpdateMutation, eventsQuery]);

  const removeAgendaItem = useCallback(async (id: number) => {
    await eventDeleteMutation.mutateAsync({ id });
    eventsQuery.refetch();
  }, [eventDeleteMutation, eventsQuery]);

  const addTask = useCallback(async (text: string) => {
    await taskCreateMutation.mutateAsync({ text });
    tasksQuery.refetch();
  }, [taskCreateMutation, tasksQuery]);

  const editTask = useCallback(async (id: number, text: string) => {
    await taskUpdateMutation.mutateAsync({ id, text });
    tasksQuery.refetch();
  }, [taskUpdateMutation, tasksQuery]);

  const toggleTask = useCallback(async (id: number) => {
    const task = tasksQuery.data?.find(t => t.id === id);
    if (task) {
      await taskUpdateMutation.mutateAsync({
        id,
        completed: !task.completed,
      });
      tasksQuery.refetch();
    }
  }, [taskUpdateMutation, tasksQuery]);

  const removeTask = useCallback(async (id: number) => {
    await taskDeleteMutation.mutateAsync({ id });
    tasksQuery.refetch();
  }, [taskDeleteMutation, tasksQuery]);

  const addGuest = useCallback(async (guest: Omit<Guest, 'id'>) => {
    await guestCreateMutation.mutateAsync({
      name: guest.name,
      side: guest.side,
      role: guest.role,
    });
    guestsQuery.refetch();
  }, [guestCreateMutation, guestsQuery]);

  const editGuest = useCallback(async (id: number, guest: Omit<Guest, 'id'>) => {
    await guestUpdateMutation.mutateAsync({
      id,
      name: guest.name,
      side: guest.side,
      role: guest.role,
      confirmed: guest.confirmed,
      present: guest.present,
    });
    guestsQuery.refetch();
  }, [guestUpdateMutation, guestsQuery]);

  const removeGuest = useCallback(async (id: number) => {
    await guestDeleteMutation.mutateAsync({ id });
    guestsQuery.refetch();
  }, [guestDeleteMutation, guestsQuery]);

  const toggleGuestConfirmed = useCallback(async (id: number) => {
    const guest = guestsQuery.data?.find(g => g.id === id);
    if (guest) {
      await guestUpdateMutation.mutateAsync({
        id,
        confirmed: !guest.confirmed,
      });
      guestsQuery.refetch();
    }
  }, [guestUpdateMutation, guestsQuery]);

  const toggleGuestPresent = useCallback(async (id: number) => {
    const guest = guestsQuery.data?.find(g => g.id === id);
    if (guest) {
      await guestUpdateMutation.mutateAsync({
        id,
        present: !guest.present,
      });
      guestsQuery.refetch();
    }
  }, [guestUpdateMutation, guestsQuery]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    await expenseCreateMutation.mutateAsync({
      item: expense.item,
      totalValue: expense.totalValue,
      paymentMethod: expense.paymentMethod,
      entryValue: expense.entryValue,
      entryInstallments: expense.entryInstallments,
      entryStartDate: expense.entryStartDate,
      installments: expense.installments,
      paymentStartDate: expense.paymentStartDate,
    });
    expensesQuery.refetch();
  }, [expenseCreateMutation, expensesQuery]);

  const editExpense = useCallback(async (id: number, expense: Omit<Expense, 'id'>) => {
    await expenseUpdateMutation.mutateAsync({
      id,
      item: expense.item,
      totalValue: expense.totalValue,
      paymentMethod: expense.paymentMethod,
      entryValue: expense.entryValue,
      entryInstallments: expense.entryInstallments,
      entryStartDate: expense.entryStartDate,
      installments: expense.installments,
      paymentStartDate: expense.paymentStartDate,
    });
    expensesQuery.refetch();
  }, [expenseUpdateMutation, expensesQuery]);

  const removeExpense = useCallback(async (id: number) => {
    await expenseDeleteMutation.mutateAsync({ id });
    expensesQuery.refetch();
  }, [expenseDeleteMutation, expensesQuery]);

  // Transform API data to match context interface
  const agendaItems: AgendaItem[] = (eventsQuery.data || []).map((event: any) => ({
    id: event.id,
    date: event.date,
    event: `${event.title} ${event.time}`,
  }));

  const expenses: Expense[] = (expensesQuery.data || []).map((expense: any) => ({
    id: expense.id,
    item: expense.item,
    totalValue: parseFloat(expense.totalValue),
    paymentMethod: expense.paymentMethod,
    entryValue: parseFloat(expense.entryValue),
    entryInstallments: expense.entryInstallments,
    entryStartDate: expense.entryStartDate,
    installments: expense.installments,
    paymentStartDate: expense.paymentStartDate,
  }));

  return (
    <WeddingContext.Provider value={{
      weddingDate, setWeddingDate,
      shareCode: shareCodeQuery.data ?? null,
      joinWeddingByCode,
      agendaItems, addAgendaItem, editAgendaItem, removeAgendaItem,
      tasks: (tasksQuery.data || []) as Task[],
      addTask, editTask, toggleTask, removeTask,
      guests: (guestsQuery.data || []) as Guest[],
      addGuest, editGuest, removeGuest, toggleGuestConfirmed, toggleGuestPresent,
      expenses, addExpense, editExpense, removeExpense,
    }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error('useWedding must be used within WeddingProvider');
  return ctx;
}
