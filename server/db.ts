import {
  InsertEvent,
  InsertExpense,
  InsertGuest,
  InsertTask,
  InsertUser,
  InsertWedding,
  User,
} from "../drizzle/schema";
import type {
  QueryDocumentSnapshot,
  Transaction,
} from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import { getFirebaseAdminApp } from "./_core/firebaseAdmin";

type UserDoc = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastSignedIn: Date | Timestamp;
};

type WeddingDoc = {
  id: number;
  userId: number;
  inviteCode: string;
  brideName: string;
  groomName: string;
  weddingDate: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

type WeddingMemberDoc = {
  userId: number;
  weddingId: number;
  role: "owner" | "member";
  createdAt: Date | Timestamp;
};

type EventDoc = {
  id: number;
  weddingId: number;
  title: string;
  date: string;
  time: string;
  description: string | null;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

type TaskDoc = {
  id: number;
  weddingId: number;
  text: string;
  completed: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

type GuestDoc = {
  id: number;
  weddingId: number;
  name: string;
  side: "noiva" | "noivo";
  role: string;
  confirmed: boolean;
  present: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

type ExpenseDoc = {
  id: number;
  weddingId: number;
  item: string;
  totalValue: string;
  paymentMethod: string;
  entryValue: string;
  entryInstallments: number;
  entryStartDate: string;
  installments: number;
  paymentStartDate: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

const db = getFirestore(getFirebaseAdminApp());

function toDate(value: Date | Timestamp | string | null | undefined) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return new Date(value);
}

function sortByNumericId<T extends { id: number }>(items: T[]) {
  return items.sort((a, b) => a.id - b.id);
}

async function nextId(collectionName: string): Promise<number> {
  const counterRef = db.collection("counters").doc(collectionName);

  return db.runTransaction(async (tx: Transaction) => {
    const snapshot = await tx.get(counterRef);
    const current = (snapshot.data()?.value as number | undefined) ?? 0;
    const next = current + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return next;
  });
}

function mapUser(row: UserDoc): User {
  return {
    id: row.id,
    openId: row.openId,
    name: row.name,
    email: row.email,
    loginMethod: row.loginMethod,
    role: row.role,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
    lastSignedIn: toDate(row.lastSignedIn),
  };
}

function mapWedding(row: WeddingDoc) {
  return {
    id: row.id,
    userId: row.userId,
    inviteCode: row.inviteCode,
    brideName: row.brideName,
    groomName: row.groomName,
    weddingDate: toDate(row.weddingDate),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

function mapEvent(row: EventDoc) {
  return {
    id: row.id,
    weddingId: row.weddingId,
    title: row.title,
    date: row.date,
    time: row.time,
    description: row.description,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

function mapTask(row: TaskDoc) {
  return {
    id: row.id,
    weddingId: row.weddingId,
    text: row.text,
    completed: row.completed,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

function mapGuest(row: GuestDoc) {
  return {
    id: row.id,
    weddingId: row.weddingId,
    name: row.name,
    side: row.side,
    role: row.role,
    confirmed: row.confirmed,
    present: row.present,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

function mapExpense(row: ExpenseDoc) {
  return {
    id: row.id,
    weddingId: row.weddingId,
    item: row.item,
    totalValue: row.totalValue,
    paymentMethod: row.paymentMethod,
    entryValue: row.entryValue,
    entryInstallments: row.entryInstallments,
    entryStartDate: row.entryStartDate,
    installments: row.installments,
    paymentStartDate: row.paymentStartDate,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const existingSnapshot = await db
    .collection("users")
    .where("openId", "==", user.openId)
    .limit(1)
    .get();

  const now = new Date();

  if (existingSnapshot.empty) {
    const id = await nextId("users");
    const payload: UserDoc = {
      id,
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn ? new Date(user.lastSignedIn) : now,
    };

    await db.collection("users").doc(String(id)).set(payload);
    return;
  }

  const doc = existingSnapshot.docs[0]!;
  const payload: Partial<UserDoc> = { updatedAt: now };

  if (user.name !== undefined) payload.name = user.name;
  if (user.email !== undefined) payload.email = user.email;
  if (user.loginMethod !== undefined) payload.loginMethod = user.loginMethod;
  if (user.lastSignedIn !== undefined) payload.lastSignedIn = new Date(user.lastSignedIn);
  if (user.role !== undefined) {
    payload.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    payload.role = "admin";
  }

  await doc.ref.set(payload, { merge: true });
}

export async function getUserByOpenId(openId: string) {
  const snapshot = await db
    .collection("users")
    .where("openId", "==", openId)
    .limit(1)
    .get();

  if (snapshot.empty) return undefined;
  return mapUser(snapshot.docs[0]!.data() as UserDoc);
}

export async function createWedding(data: InsertWedding) {
  const now = new Date();
  const inviteCode = nanoid(10).toUpperCase();
  const id = await nextId("weddings");

  const weddingPayload: WeddingDoc = {
    id,
    userId: data.userId,
    inviteCode,
    brideName: data.brideName,
    groomName: data.groomName,
    weddingDate: new Date(data.weddingDate),
    createdAt: now,
    updatedAt: now,
  };

  const memberPayload: WeddingMemberDoc = {
    userId: data.userId,
    weddingId: id,
    role: "owner",
    createdAt: now,
  };

  const batch = db.batch();
  batch.set(db.collection("weddings").doc(String(id)), weddingPayload);
  batch.set(db.collection("wedding_members").doc(String(data.userId)), memberPayload);
  await batch.commit();

  return { success: true, inviteCode };
}

export async function getWeddingByUserId(userId: number) {
  const memberSnapshot = await db
    .collection("wedding_members")
    .doc(String(userId))
    .get();

  if (!memberSnapshot.exists) return null;

  const member = memberSnapshot.data() as WeddingMemberDoc;
  const weddingSnapshot = await db
    .collection("weddings")
    .doc(String(member.weddingId))
    .get();

  if (!weddingSnapshot.exists) return null;
  return mapWedding(weddingSnapshot.data() as WeddingDoc);
}

export async function getWeddingInviteCodeByUserId(
  userId: number
): Promise<string | null> {
  const wedding = await getWeddingByUserId(userId);
  if (!wedding) return null;
  return (wedding as { inviteCode?: string }).inviteCode ?? null;
}

export async function joinWeddingByInviteCode(
  userId: number,
  inviteCode: string
): Promise<void> {
  const normalizedCode = inviteCode.trim().toUpperCase();
  const weddingSnapshot = await db
    .collection("weddings")
    .where("inviteCode", "==", normalizedCode)
    .limit(1)
    .get();

  if (weddingSnapshot.empty) {
    throw new Error("Invite code invalid");
  }

  const wedding = weddingSnapshot.docs[0]!.data() as WeddingDoc;

  await db.collection("wedding_members").doc(String(userId)).set({
    userId,
    weddingId: wedding.id,
    role: "member",
    createdAt: new Date(),
  } as WeddingMemberDoc);
}

export async function updateWedding(id: number, data: Partial<InsertWedding>) {
  const payload: Partial<WeddingDoc> = {
    updatedAt: new Date(),
  };

  if (data.brideName !== undefined) payload.brideName = data.brideName;
  if (data.groomName !== undefined) payload.groomName = data.groomName;
  if (data.weddingDate !== undefined) payload.weddingDate = new Date(data.weddingDate);

  await db.collection("weddings").doc(String(id)).set(payload, { merge: true });
  return { success: true };
}

export async function createEvent(data: InsertEvent) {
  const now = new Date();
  const id = await nextId("events");

  const payload: EventDoc = {
    id,
    weddingId: data.weddingId,
    title: data.title,
    date: data.date,
    time: data.time,
    description: data.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("events").doc(String(id)).set(payload);
  return { success: true };
}

export async function getEventsByWeddingId(weddingId: number) {
  const snapshot = await db
    .collection("events")
    .where("weddingId", "==", weddingId)
    .get();

  const items = snapshot.docs.map((doc: QueryDocumentSnapshot) =>
    mapEvent(doc.data() as EventDoc)
  );
  return items.sort((a: { date: string; time: string }, b: { date: string; time: string }) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const payload: Partial<EventDoc> = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) payload.title = data.title;
  if (data.date !== undefined) payload.date = data.date;
  if (data.time !== undefined) payload.time = data.time;
  if (data.description !== undefined) payload.description = data.description;

  await db.collection("events").doc(String(id)).set(payload, { merge: true });
  return { success: true };
}

export async function deleteEvent(id: number) {
  await db.collection("events").doc(String(id)).delete();
  return { success: true };
}

export async function createTask(data: InsertTask) {
  const now = new Date();
  const id = await nextId("tasks");

  const payload: TaskDoc = {
    id,
    weddingId: data.weddingId,
    text: data.text,
    completed: Boolean(data.completed),
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("tasks").doc(String(id)).set(payload);
  return { success: true };
}

export async function getTasksByWeddingId(weddingId: number) {
  const snapshot = await db
    .collection("tasks")
    .where("weddingId", "==", weddingId)
    .get();

  return sortByNumericId(
    snapshot.docs.map((doc: QueryDocumentSnapshot) => mapTask(doc.data() as TaskDoc))
  );
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const payload: Partial<TaskDoc> = {
    updatedAt: new Date(),
  };

  if (data.text !== undefined) payload.text = data.text;
  if (data.completed !== undefined) payload.completed = data.completed;

  await db.collection("tasks").doc(String(id)).set(payload, { merge: true });
  return { success: true };
}

export async function deleteTask(id: number) {
  await db.collection("tasks").doc(String(id)).delete();
  return { success: true };
}

export async function createGuest(data: InsertGuest) {
  const now = new Date();
  const id = await nextId("guests");

  const payload: GuestDoc = {
    id,
    weddingId: data.weddingId,
    name: data.name,
    side: data.side,
    role: data.role,
    confirmed: Boolean(data.confirmed),
    present: Boolean(data.present),
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("guests").doc(String(id)).set(payload);
  return { success: true };
}

export async function getGuestsByWeddingId(weddingId: number) {
  const snapshot = await db
    .collection("guests")
    .where("weddingId", "==", weddingId)
    .get();

  return sortByNumericId(
    snapshot.docs.map((doc: QueryDocumentSnapshot) => mapGuest(doc.data() as GuestDoc))
  );
}

export async function updateGuest(id: number, data: Partial<InsertGuest>) {
  const payload: Partial<GuestDoc> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) payload.name = data.name;
  if (data.side !== undefined) payload.side = data.side;
  if (data.role !== undefined) payload.role = data.role;
  if (data.confirmed !== undefined) payload.confirmed = data.confirmed;
  if (data.present !== undefined) payload.present = data.present;

  await db.collection("guests").doc(String(id)).set(payload, { merge: true });
  return { success: true };
}

export async function deleteGuest(id: number) {
  await db.collection("guests").doc(String(id)).delete();
  return { success: true };
}

export async function createExpense(data: InsertExpense) {
  const now = new Date();
  const id = await nextId("expenses");

  const payload: ExpenseDoc = {
    id,
    weddingId: data.weddingId,
    item: data.item,
    totalValue: String(data.totalValue),
    paymentMethod: data.paymentMethod,
    entryValue: String(data.entryValue),
    entryInstallments: data.entryInstallments,
    entryStartDate: data.entryStartDate,
    installments: data.installments,
    paymentStartDate: data.paymentStartDate,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("expenses").doc(String(id)).set(payload);
  return { success: true };
}

export async function getExpensesByWeddingId(weddingId: number) {
  const snapshot = await db
    .collection("expenses")
    .where("weddingId", "==", weddingId)
    .get();

  return snapshot.docs
    .map((doc: QueryDocumentSnapshot) => mapExpense(doc.data() as ExpenseDoc))
    .sort(
      (a: { paymentStartDate: string }, b: { paymentStartDate: string }) =>
        a.paymentStartDate.localeCompare(b.paymentStartDate)
    );
}

export async function updateExpense(id: number, data: Partial<InsertExpense>) {
  const payload: Partial<ExpenseDoc> = {
    updatedAt: new Date(),
  };

  if (data.item !== undefined) payload.item = data.item;
  if (data.totalValue !== undefined) payload.totalValue = String(data.totalValue);
  if (data.paymentMethod !== undefined) payload.paymentMethod = data.paymentMethod;
  if (data.entryValue !== undefined) payload.entryValue = String(data.entryValue);
  if (data.entryInstallments !== undefined) {
    payload.entryInstallments = data.entryInstallments;
  }
  if (data.entryStartDate !== undefined) payload.entryStartDate = data.entryStartDate;
  if (data.installments !== undefined) payload.installments = data.installments;
  if (data.paymentStartDate !== undefined) {
    payload.paymentStartDate = data.paymentStartDate;
  }

  await db.collection("expenses").doc(String(id)).set(payload, { merge: true });
  return { success: true };
}

export async function deleteExpense(id: number) {
  await db.collection("expenses").doc(String(id)).delete();
  return { success: true };
}
