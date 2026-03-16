import { ForbiddenError } from "@shared/_core/errors";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { supabase } from "./supabase";
class SDKServer {
  private getBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    if (!header.startsWith("Bearer ")) return null;

    const token = header.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
  }

  async authenticateRequest(req: Request): Promise<User> {
    const token = this.getBearerToken(req);
    if (!token) {
      throw ForbiddenError("Missing bearer token");
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      throw ForbiddenError("Invalid Supabase token");
    }

    const supabaseUser = authData.user;
    const sessionUserId = supabaseUser.id;
    const displayName =
      (supabaseUser.user_metadata?.name as string | undefined) ??
      (supabaseUser.user_metadata?.full_name as string | undefined) ??
      supabaseUser.email ??
      "User";
    const signedInAt = new Date();

    let user = await db.getUserByOpenId(sessionUserId);

    if (!user) {
      await db.upsertUser({
        openId: sessionUserId,
        name: displayName,
        email: supabaseUser.email ?? null,
        loginMethod: "supabase",
        role: sessionUserId === ENV.ownerOpenId ? "admin" : "user",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(sessionUserId);
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
