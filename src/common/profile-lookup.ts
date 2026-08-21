import { NotFoundException } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import type { PrismaService } from "../prisma.service";

type ProfileClient = PrismaService | Prisma.TransactionClient;

export async function getOwnedProfile(client: ProfileClient, userId: string) {
    const profile = await client.profile.findUnique({ where: { userId } });

    if (!profile) {
        throw new NotFoundException("No profile found for this user");
    }

    return profile;
}

export async function getOwnedProfileId(client: ProfileClient, userId: string) {
    const profile = await getOwnedProfile(client, userId);
    return profile.id;
}

export async function getOwnedProfileIdSafe(client: ProfileClient, userId?: string) {
    if (!userId) {
        return undefined;
    }

    const profile = await client.profile.findUnique({ where: { userId } });
    return profile?.id;
}