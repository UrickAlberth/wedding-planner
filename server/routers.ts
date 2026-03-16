import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createWedding,
  getWeddingByUserId,
  getWeddingInviteCodeByUserId,
  joinWeddingByInviteCode,
  updateWedding,
  createEvent,
  getEventsByWeddingId,
  updateEvent,
  deleteEvent,
  createTask,
  getTasksByWeddingId,
  updateTask,
  deleteTask,
  createGuest,
  getGuestsByWeddingId,
  updateGuest,
  deleteGuest,
  createExpense,
  getExpensesByWeddingId,
  updateExpense,
  deleteExpense,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      return {
        success: true,
      } as const;
    }),
  }),

  // Wedding procedures
  wedding: router({
    getOrCreate: protectedProcedure
      .input(z.object({
        brideName: z.string(),
        groomName: z.string(),
        weddingDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getWeddingByUserId(ctx.user!.id);
        if (existing) return existing;
        
        await createWedding({
          userId: ctx.user!.id,
          brideName: input.brideName,
          groomName: input.groomName,
          weddingDate: input.weddingDate,
        });
        
        return await getWeddingByUserId(ctx.user!.id);
      }),

    getShareCode: protectedProcedure.query(async ({ ctx }) => {
      return await getWeddingInviteCodeByUserId(ctx.user!.id);
    }),

    joinByCode: protectedProcedure
      .input(
        z.object({
          inviteCode: z.string().min(4),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await joinWeddingByInviteCode(ctx.user!.id, input.inviteCode);
        return await getWeddingByUserId(ctx.user!.id);
      }),
    
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getWeddingByUserId(ctx.user!.id);
    }),
    
    update: protectedProcedure
      .input(z.object({
        brideName: z.string().optional(),
        groomName: z.string().optional(),
        weddingDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await updateWedding(wedding.id, input);
        return await getWeddingByUserId(ctx.user!.id);
      }),
  }),

  // Events procedures
  events: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const wedding = await getWeddingByUserId(ctx.user!.id);
      if (!wedding) return [];
      return await getEventsByWeddingId(wedding.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        date: z.string(), // YYYY-MM-DD
        time: z.string(), // HH:MM
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await createEvent({
          weddingId: wedding.id,
          ...input,
        });
        
        return await getEventsByWeddingId(wedding.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        const { id, ...data } = input;
        await updateEvent(id, data);
        
        return await getEventsByWeddingId(wedding.id);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await deleteEvent(input.id);
        
        return await getEventsByWeddingId(wedding.id);
      }),
  }),

  // Tasks procedures
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const wedding = await getWeddingByUserId(ctx.user!.id);
      if (!wedding) return [];
      return await getTasksByWeddingId(wedding.id);
    }),
    
    create: protectedProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await createTask({
          weddingId: wedding.id,
          text: input.text,
          completed: false,
        });
        
        return await getTasksByWeddingId(wedding.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        text: z.string().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        const { id, ...data } = input;
        await updateTask(id, data);
        
        return await getTasksByWeddingId(wedding.id);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await deleteTask(input.id);
        
        return await getTasksByWeddingId(wedding.id);
      }),
  }),

  // Guests procedures
  guests: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const wedding = await getWeddingByUserId(ctx.user!.id);
      if (!wedding) return [];
      return await getGuestsByWeddingId(wedding.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        side: z.enum(["noiva", "noivo"]),
        role: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await createGuest({
          weddingId: wedding.id,
          ...input,
          confirmed: false,
          present: false,
        });
        
        return await getGuestsByWeddingId(wedding.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        side: z.enum(["noiva", "noivo"]).optional(),
        role: z.string().optional(),
        confirmed: z.boolean().optional(),
        present: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        const { id, ...data } = input;
        await updateGuest(id, data);
        
        return await getGuestsByWeddingId(wedding.id);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await deleteGuest(input.id);
        
        return await getGuestsByWeddingId(wedding.id);
      }),
  }),

  // Expenses procedures
  expenses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const wedding = await getWeddingByUserId(ctx.user!.id);
      if (!wedding) return [];
      return await getExpensesByWeddingId(wedding.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        item: z.string(),
        totalValue: z.number(),
        paymentMethod: z.string(),
        entryValue: z.number().optional(),
        entryInstallments: z.number().optional(),
        entryStartDate: z.string(),
        installments: z.number().optional(),
        paymentStartDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await createExpense({
          weddingId: wedding.id,
          item: input.item,
          totalValue: input.totalValue.toString(),
          paymentMethod: input.paymentMethod,
          entryValue: (input.entryValue || 0).toString(),
          entryInstallments: input.entryInstallments || 1,
          entryStartDate: input.entryStartDate,
          installments: input.installments || 1,
          paymentStartDate: input.paymentStartDate,
        });
        
        return await getExpensesByWeddingId(wedding.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        item: z.string().optional(),
        totalValue: z.number().optional(),
        paymentMethod: z.string().optional(),
        entryValue: z.number().optional(),
        entryInstallments: z.number().optional(),
        entryStartDate: z.string().optional(),
        installments: z.number().optional(),
        paymentStartDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        const { id, ...data } = input;
        const convertedData: Record<string, any> = {};
        if (data.item !== undefined) convertedData.item = data.item;
        if (data.totalValue !== undefined) convertedData.totalValue = data.totalValue.toString();
        if (data.paymentMethod !== undefined) convertedData.paymentMethod = data.paymentMethod;
        if (data.entryValue !== undefined) convertedData.entryValue = data.entryValue.toString();
        if (data.entryInstallments !== undefined) convertedData.entryInstallments = data.entryInstallments;
        if (data.entryStartDate !== undefined) convertedData.entryStartDate = data.entryStartDate;
        if (data.installments !== undefined) convertedData.installments = data.installments;
        if (data.paymentStartDate !== undefined) convertedData.paymentStartDate = data.paymentStartDate;
        await updateExpense(id, convertedData);
        
        return await getExpensesByWeddingId(wedding.id);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await getWeddingByUserId(ctx.user!.id);
        if (!wedding) throw new Error("Wedding not found");
        
        await deleteExpense(input.id);
        
        return await getExpensesByWeddingId(wedding.id);
      }),
  })
});

export type AppRouter = typeof appRouter;
