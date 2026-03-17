import { ForbiddenError } from "../../shared/_core/errors";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { getFirebaseAdminAuth } from "./firebaseAdmin";
class SDKServer {
  private getBearerToken(req: Request): string | null {
    const header = req.get("authorization");
    if (!header) return null;
    if (!header.startsWith("Bearer ")) return null;

    const token = header.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
  }

  private async ensurePrivateSharedUser(openId: string): Promise<User> {
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(openId);

    if (!user) {
      await db.upsertUser({
        openId,
        name: "Nosso Casamento",
        email: null,
        loginMethod: "private-shared",
        role: openId === ENV.ownerOpenId ? "admin" : "user",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(openId);
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

  async authenticateRequest(req: Request): Promise<User> {
    const token = this.getBearerToken(req);
    if (!token) {
      return this.ensurePrivateSharedUser(ENV.ownerOpenId || "private-shared-owner");
    }

    const decodedToken = await getFirebaseAdminAuth()
      .verifyIdToken(token)
      .catch(() => null);
    if (!decodedToken) {
      return this.ensurePrivateSharedUser(ENV.ownerOpenId || "private-shared-owner");
    }

    const sessionUserId = decodedToken.uid;
    const displayName =
      (decodedToken.name as string | undefined) ??
      (decodedToken.email as string | undefined) ??
      "User";
    const email = (decodedToken.email as string | undefined) ?? null;
    const signedInAt = new Date();

    let user = await db.getUserByOpenId(sessionUserId);

    if (!user) {
      await db.upsertUser({
        openId: sessionUserId,
        name: displayName,
        email,
        loginMethod: "firebase",
        role: sessionUserId === ENV.ownerOpenId ? "admin" : "user",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(sessionUserId);
    }

    if (!user) {
      return this.ensurePrivateSharedUser(ENV.ownerOpenId || sessionUserId);
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
