import {
  InsertEvent,
  InsertExpense,
  InsertGuest,
  InsertTask,
  InsertUser,
  InsertWedding,
  User,
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import { supabase } from "./_core/supabase";

type DbUser = {
  id: number;
  open_id: string;
  name: string | null;
  email: string | null;
  login_method: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
  last_signed_in: string;
};

type DbWedding = {
  id: number;
  user_id: number;
  invite_code: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  created_at: string;
  updated_at: string;
};

type DbWeddingMember = {
  wedding_id: number;
  user_id: number;
  role: "owner" | "member";
  created_at: string;
};

type DbEvent = {
  id: number;
  wedding_id: number;
  title: string;
  date: string;
  time: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type DbTask = {
  id: number;
  wedding_id: number;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

type DbGuest = {
  id: number;
  wedding_id: number;
  name: string;
  side: "noiva" | "noivo";
  role: string;
  confirmed: boolean;
  present: boolean;
  created_at: string;
  updated_at: string;
};

type DbExpense = {
  id: number;
  wedding_id: number;
  item: string;
  total_value: string;
  payment_method: string;
  entry_value: string;
  entry_installments: number;
  entry_start_date: string;
  installments: number;
  payment_start_date: string;
  created_at: string;
  updated_at: string;
};

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : new Date();
}

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function assertNoError(error: unknown, operation: string) {
  if (!error) return;
  console.error(`[Database] ${operation} failed`, error);
  throw new Error(`[Database] ${operation} failed`);
}

function mapUser(row: DbUser): User {
  return {
    id: toNumber(row.id),
    openId: row.open_id,
    name: row.name,
    email: row.email,
    loginMethod: row.login_method,
    role: row.role,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
    lastSignedIn: toDate(row.last_signed_in),
  };
}

function mapWedding(row: DbWedding) {
  return {
    id: toNumber(row.id),
    userId: toNumber(row.user_id),
    inviteCode: row.invite_code,
    brideName: row.bride_name,
    groomName: row.groom_name,
    weddingDate: toDate(row.wedding_date),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function mapEvent(row: DbEvent) {
  return {
    id: toNumber(row.id),
    weddingId: toNumber(row.wedding_id),
    title: row.title,
    date: row.date,
    time: row.time,
    description: row.description,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function mapTask(row: DbTask) {
  return {
    id: toNumber(row.id),
    weddingId: toNumber(row.wedding_id),
    text: row.text,
    completed: row.completed,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function mapGuest(row: DbGuest) {
  return {
    id: toNumber(row.id),
    weddingId: toNumber(row.wedding_id),
    name: row.name,
    side: row.side,
    role: row.role,
    confirmed: row.confirmed,
    present: row.present,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function mapExpense(row: DbExpense) {
  return {
    id: toNumber(row.id),
    weddingId: toNumber(row.wedding_id),
    item: row.item,
    totalValue: row.total_value,
    paymentMethod: row.payment_method,
    entryValue: row.entry_value,
    entryInstallments: row.entry_installments,
    entryStartDate: row.entry_start_date,
    installments: row.installments,
    paymentStartDate: row.payment_start_date,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const payload: Record<string, unknown> = {
    open_id: user.openId,
    updated_at: new Date().toISOString(),
  };

  if (user.name !== undefined) payload.name = user.name;
  if (user.email !== undefined) payload.email = user.email;
  if (user.loginMethod !== undefined) payload.login_method = user.loginMethod;
  if (user.lastSignedIn !== undefined) {
    payload.last_signed_in = new Date(user.lastSignedIn).toISOString();
  }

  if (user.role !== undefined) {
    payload.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    payload.role = "admin";
  }

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "open_id" });

  assertNoError(error, "upsertUser");
}

export async function getUserByOpenId(openId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("open_id", openId)
    .maybeSingle<DbUser>();

  assertNoError(error, "getUserByOpenId");

  return data ? mapUser(data) : undefined;
}

export async function createWedding(data: InsertWedding) {
  const inviteCode = nanoid(10).toUpperCase();

  const { data: weddingRow, error: weddingError } = await supabase
    .from("weddings")
    .insert({
      user_id: data.userId,
      invite_code: inviteCode,
      bride_name: data.brideName,
      groom_name: data.groomName,
      wedding_date: new Date(data.weddingDate).toISOString(),
    })
    .select("*")
    .single<DbWedding>();

  assertNoError(weddingError, "createWedding");

  const weddingId = toNumber(weddingRow.id);

  const { error: memberError } = await supabase.from("wedding_members").upsert(
    {
      wedding_id: weddingId,
      user_id: data.userId,
      role: "owner",
    },
    { onConflict: "wedding_id,user_id" }
  );

  assertNoError(memberError, "createWedding.memberLink");
  return { success: true, inviteCode };
}

export async function getWeddingByUserId(userId: number) {
  const { data: membership, error: membershipError } = await supabase
    .from("wedding_members")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<DbWeddingMember>();

  assertNoError(membershipError, "getWeddingByUserId.membership");

  if (!membership) {
    return null;
  }

  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", membership.wedding_id)
    .maybeSingle<DbWedding>();

  assertNoError(error, "getWeddingByUserId");

  return data ? mapWedding(data) : null;
}

export async function getWeddingInviteCodeByUserId(userId: number): Promise<string | null> {
  const wedding = await getWeddingByUserId(userId);
  if (!wedding) return null;

  return (wedding as { inviteCode?: string }).inviteCode ?? null;
}

export async function joinWeddingByInviteCode(userId: number, inviteCode: string): Promise<void> {
  const normalizedCode = inviteCode.trim().toUpperCase();

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id")
    .eq("invite_code", normalizedCode)
    .maybeSingle<{ id: number }>();

  assertNoError(weddingError, "joinWeddingByInviteCode.findWedding");

  if (!wedding) {
    throw new Error("Invite code invalid");
  }

  const { error: cleanupError } = await supabase
    .from("wedding_members")
    .delete()
    .eq("user_id", userId);

  assertNoError(cleanupError, "joinWeddingByInviteCode.cleanupMembership");

  const { error: joinError } = await supabase.from("wedding_members").insert({
    wedding_id: wedding.id,
    user_id: userId,
    role: "member",
  });

  assertNoError(joinError, "joinWeddingByInviteCode.joinMembership");
}

export async function updateWedding(id: number, data: Partial<InsertWedding>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.brideName !== undefined) payload.bride_name = data.brideName;
  if (data.groomName !== undefined) payload.groom_name = data.groomName;
  if (data.weddingDate !== undefined) {
    payload.wedding_date = new Date(data.weddingDate).toISOString();
  }

  const { error } = await supabase.from("weddings").update(payload).eq("id", id);

  assertNoError(error, "updateWedding");
  return { success: true };
}

export async function createEvent(data: InsertEvent) {
  const { error } = await supabase.from("events").insert({
    wedding_id: data.weddingId,
    title: data.title,
    date: data.date,
    time: data.time,
    description: data.description ?? null,
  });

  assertNoError(error, "createEvent");
  return { success: true };
}

export async function getEventsByWeddingId(weddingId: number) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .returns<DbEvent[]>();

  assertNoError(error, "getEventsByWeddingId");

  return (data ?? []).map(mapEvent);
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) payload.title = data.title;
  if (data.date !== undefined) payload.date = data.date;
  if (data.time !== undefined) payload.time = data.time;
  if (data.description !== undefined) payload.description = data.description;

  const { error } = await supabase.from("events").update(payload).eq("id", id);

  assertNoError(error, "updateEvent");
  return { success: true };
}

export async function deleteEvent(id: number) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  assertNoError(error, "deleteEvent");
  return { success: true };
}

export async function createTask(data: InsertTask) {
  const { error } = await supabase.from("tasks").insert({
    wedding_id: data.weddingId,
    text: data.text,
    completed: Boolean(data.completed),
  });

  assertNoError(error, "createTask");
  return { success: true };
}

export async function getTasksByWeddingId(weddingId: number) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("id", { ascending: true })
    .returns<DbTask[]>();

  assertNoError(error, "getTasksByWeddingId");

  return (data ?? []).map(mapTask);
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.text !== undefined) payload.text = data.text;
  if (data.completed !== undefined) payload.completed = data.completed;

  const { error } = await supabase.from("tasks").update(payload).eq("id", id);

  assertNoError(error, "updateTask");
  return { success: true };
}

export async function deleteTask(id: number) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  assertNoError(error, "deleteTask");
  return { success: true };
}

export async function createGuest(data: InsertGuest) {
  const { error } = await supabase.from("guests").insert({
    wedding_id: data.weddingId,
    name: data.name,
    side: data.side,
    role: data.role,
    confirmed: Boolean(data.confirmed),
    present: Boolean(data.present),
  });

  assertNoError(error, "createGuest");
  return { success: true };
}

export async function getGuestsByWeddingId(weddingId: number) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("id", { ascending: true })
    .returns<DbGuest[]>();

  assertNoError(error, "getGuestsByWeddingId");

  return (data ?? []).map(mapGuest);
}

export async function updateGuest(id: number, data: Partial<InsertGuest>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) payload.name = data.name;
  if (data.side !== undefined) payload.side = data.side;
  if (data.role !== undefined) payload.role = data.role;
  if (data.confirmed !== undefined) payload.confirmed = data.confirmed;
  if (data.present !== undefined) payload.present = data.present;

  const { error } = await supabase.from("guests").update(payload).eq("id", id);

  assertNoError(error, "updateGuest");
  return { success: true };
}

export async function deleteGuest(id: number) {
  const { error } = await supabase.from("guests").delete().eq("id", id);

  assertNoError(error, "deleteGuest");
  return { success: true };
}

export async function createExpense(data: InsertExpense) {
  const { error } = await supabase.from("expenses").insert({
    wedding_id: data.weddingId,
    item: data.item,
    total_value: String(data.totalValue),
    payment_method: data.paymentMethod,
    entry_value: String(data.entryValue),
    entry_installments: data.entryInstallments,
    entry_start_date: data.entryStartDate,
    installments: data.installments,
    payment_start_date: data.paymentStartDate,
  });

  assertNoError(error, "createExpense");
  return { success: true };
}

export async function getExpensesByWeddingId(weddingId: number) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("payment_start_date", { ascending: true })
    .returns<DbExpense[]>();

  assertNoError(error, "getExpensesByWeddingId");

  return (data ?? []).map(mapExpense);
}

export async function updateExpense(id: number, data: Partial<InsertExpense>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.item !== undefined) payload.item = data.item;
  if (data.totalValue !== undefined) payload.total_value = String(data.totalValue);
  if (data.paymentMethod !== undefined) payload.payment_method = data.paymentMethod;
  if (data.entryValue !== undefined) payload.entry_value = String(data.entryValue);
  if (data.entryInstallments !== undefined) {
    payload.entry_installments = data.entryInstallments;
  }
  if (data.entryStartDate !== undefined) payload.entry_start_date = data.entryStartDate;
  if (data.installments !== undefined) payload.installments = data.installments;
  if (data.paymentStartDate !== undefined) {
    payload.payment_start_date = data.paymentStartDate;
  }

  const { error } = await supabase.from("expenses").update(payload).eq("id", id);

  assertNoError(error, "updateExpense");
  return { success: true };
}

export async function deleteExpense(id: number) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  assertNoError(error, "deleteExpense");
  return { success: true };
}
