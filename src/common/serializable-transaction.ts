import { ServiceUnavailableException } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma.service";

const MAX_SERIALIZATION_RETRIES = 3;

export async function runSerializableTransaction<T>(
  prisma: PrismaService,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < MAX_SERIALIZATION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: "Serializable",
        maxWait: 5_000,
        timeout: 10_000,
      });
    } catch (error) {
      const isSerializationFailure =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (
        !isSerializationFailure ||
        attempt === MAX_SERIALIZATION_RETRIES - 1
      ) {
        if (isSerializationFailure) {
          throw new ServiceUnavailableException(
            "The request conflicted with another update. Please retry.",
          );
        }
        throw error;
      }
    }
  }

  throw new ServiceUnavailableException(
    "The request could not be completed. Please retry.",
  );
}
