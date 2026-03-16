import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Wedding table — stores wedding information
 */
export const weddings = mysqlTable("weddings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  brideName: varchar("brideName", { length: 255 }).notNull(),
  groomName: varchar("groomName", { length: 255 }).notNull(),
  weddingDate: timestamp("weddingDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wedding = typeof weddings.$inferSelect;
export type InsertWedding = typeof weddings.$inferInsert;

/**
 * Events table — stores agenda events
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  time: varchar("time", { length: 5 }).notNull(), // HH:MM
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Tasks table — stores wedding tasks
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Guests table — stores wedding guests
 */
export const guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  side: mysqlEnum("side", ["noiva", "noivo"]).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // Convidado, Padrinho, Madrinha, etc
  confirmed: boolean("confirmed").default(false).notNull(),
  present: boolean("present").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

/**
 * Expenses table — stores wedding expenses
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  entryValue: decimal("entryValue", { precision: 10, scale: 2 }).notNull().default("0"),
  installments: int("installments").default(1).notNull(),
  paymentStartDate: varchar("paymentStartDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;