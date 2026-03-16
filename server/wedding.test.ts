import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Wedding API", () => {
  it("should create or get a wedding", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const wedding = await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    expect(wedding).toBeDefined();
    expect(wedding?.brideName).toBe("Maria");
    expect(wedding?.groomName).toBe("João");
  });

  it("should create an event", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create wedding first
    await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    // Create event
    const events = await caller.events.create({
      title: "Experimentar vestido",
      date: "2027-03-18",
      time: "08:00",
      description: "Experimentar vestido da noiva",
    });

    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.title).toBe("Experimentar vestido");
  });

  it("should create a task", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create wedding first
    await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    // Create task
    const tasks = await caller.tasks.create({
      text: "Fechar buffet",
    });

    expect(tasks).toBeDefined();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]?.text).toBe("Fechar buffet");
    expect(tasks[0]?.completed).toBe(false);
  });

  it("should create a guest", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create wedding first
    await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    // Create guest
    const guests = await caller.guests.create({
      name: "João da Silva",
      side: "noivo",
      role: "Convidado",
    });

    expect(guests).toBeDefined();
    expect(guests.length).toBeGreaterThan(0);
    expect(guests[0]?.name).toBe("João da Silva");
    expect(guests[0]?.confirmed).toBe(false);
  });

  it("should create an expense", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create wedding first
    await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    // Create expense with unique name
    const uniqueName = `Fotógrafo-${Date.now()}`;
    const expenses = await caller.expenses.create({
      item: uniqueName,
      totalValue: 5000,
      paymentMethod: "Pix",
      entryValue: 2500,
      entryInstallments: 1,
      entryStartDate: "2027-03-09",
      installments: 2,
      paymentStartDate: "2027-03-09",
    });

    expect(expenses).toBeDefined();
    expect(expenses.length).toBeGreaterThan(0);
    // Verify the expense was created with correct structure
    const createdExpense = expenses.find(e => e.item === uniqueName);
    expect(createdExpense).toBeDefined();
    expect(createdExpense?.totalValue).toBe("5000.00");
  });

  it("should update a task", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create wedding first
    await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    // Create task
    const tasksCreated = await caller.tasks.create({
      text: "Fechar buffet",
    });

    const taskId = tasksCreated[0]?.id;
    expect(taskId).toBeDefined();

    // Update task
    const tasksUpdated = await caller.tasks.update({
      id: taskId!,
      completed: true,
    });

    expect(tasksUpdated).toBeDefined();
    const updatedTask = tasksUpdated.find(t => t.id === taskId);
    expect(updatedTask?.completed).toBe(true);
  });

  it("should delete a task", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create wedding first
    await caller.wedding.getOrCreate({
      brideName: "Maria",
      groomName: "João",
      weddingDate: new Date("2027-05-09"),
    });

    // Create task
    const tasksCreated = await caller.tasks.create({
      text: "Fechar buffet",
    });

    const taskId = tasksCreated[0]?.id;
    expect(taskId).toBeDefined();

    // Delete task
    const tasksAfterDelete = await caller.tasks.delete({
      id: taskId!,
    });

    const deletedTask = tasksAfterDelete.find(t => t.id === taskId);
    expect(deletedTask).toBeUndefined();
  });
});
