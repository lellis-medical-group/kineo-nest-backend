import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { logError, logEvent } from "../lib/log";
import { PrismaService } from "../prisma.service";

/** Default retention horizon for the account-deletion audit trail (days). */
const DELETION_REQUEST_RETENTION_DAYS = 365;

/**
 * Scheduled retention sweeps (data minimization, art. 5(1)(e) GDPR): rows that
 * carry PII and are no longer useful must not outlive their expiry.
 *
 * - `session`: expired rows keep the session token, IP and user agent forever.
 * - `verification`: better-auth only deletes expired rows lazily, when a given
 *   identifier is read; unread rows (abandoned sign-up, one-time delete links)
 *   would stay forever. Rows carry the raw email as `identifier`.
 * - `dataDeletionRequest`: the accountability trail stores the email of the
 *   deleted account — a justified retention, but not a forever one. It is
 *   dropped after a bounded legal horizon (default 1 year, override with
 *   DATA_DELETION_REQUEST_RETENTION_DAYS), regardless of status: a PENDING
 *   row means the 24h token window passed without confirmation, so it no
 *   longer holds any value either.
 */
@Injectable()
export class DataLifecycleService {
  private readonly deletionRequestRetentionDays =
    deletionRequestRetentionDaysFromEnv();

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpired() {
    try {
      const now = new Date();

      const sessions = await this.prisma.session.deleteMany({
        where: { expiresAt: { lt: now } },
      });

      const verifications = await this.prisma.verification.deleteMany({
        where: { expiresAt: { lt: now } },
      });

      const deletionCutoff = new Date(
        now.getTime() - this.deletionRequestRetentionDays * 86_400_000,
      );
      const deletionRequests = await this.prisma.dataDeletionRequest.deleteMany(
        {
          where: { createdAt: { lt: deletionCutoff } },
        },
      );

      if (
        sessions.count > 0 ||
        verifications.count > 0 ||
        deletionRequests.count > 0
      ) {
        logEvent("data_lifecycle.sweep", {
          sessionsPurged: sessions.count,
          verificationsPurged: verifications.count,
          deletionRequestsPurged: deletionRequests.count,
          retentionDays: this.deletionRequestRetentionDays,
        });
      }
    } catch (error) {
      // Never break the process over a sweep: it will run again on schedule.
      logError("data_lifecycle.sweep_failed", error);
    }
  }
}

function deletionRequestRetentionDaysFromEnv(): number {
  const raw = process.env.DATA_DELETION_REQUEST_RETENTION_DAYS;
  if (!raw) {
    return DELETION_REQUEST_RETENTION_DAYS;
  }
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(
      "DATA_DELETION_REQUEST_RETENTION_DAYS must be a positive integer",
    );
  }
  return parsed;
}
