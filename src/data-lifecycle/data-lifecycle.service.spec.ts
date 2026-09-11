import { describe, expect, it } from "bun:test";
import { PrismaService } from "../prisma.service";
import { DataLifecycleService } from "./data-lifecycle.service";

describe("DataLifecycleService", () => {
  it("purges expired sessions and verifications only", async () => {
    const calls: { model: string; where: unknown }[] = [];
    const prisma = {
      session: {
        deleteMany: async ({ where }: { where: unknown }) => {
          calls.push({ model: "session", where });
          return { count: 3 };
        },
      },
      verification: {
        deleteMany: async ({ where }: { where: unknown }) => {
          calls.push({ model: "verification", where });
          return { count: 2 };
        },
      },
    } as unknown as PrismaService;

    const service = new DataLifecycleService(prisma);
    await service.purgeExpired();

    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({ model: "session" });
    expect(calls[1]).toMatchObject({ model: "verification" });

    const where = (calls[0].where ?? {}) as Record<string, unknown>;
    const expiresAt = (where.expiresAt ?? {}) as Record<string, unknown>;
    expect(expiresAt.lt).toBeInstanceOf(Date);
    expect((expiresAt.lt as Date).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("never throws when the sweep fails", async () => {
    const prisma = {
      session: {
        deleteMany: async () => {
          throw new Error("boom");
        },
      },
      verification: {
        deleteMany: async () => ({ count: 0 }),
      },
    } as unknown as PrismaService;

    const service = new DataLifecycleService(prisma);
    await expect(service.purgeExpired()).resolves.toBeUndefined();
  });
});
