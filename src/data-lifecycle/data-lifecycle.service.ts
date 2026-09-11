import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma.service";

/**
 * Scheduled retention sweeps (data minimization, art. 5(1)(e) GDPR): rows that
 * carry PII and are no longer useful must not outlive their expiry.
 *
 * - `session`: expired rows keep the session token, IP and user agent forever.
 * - `verification`: better-auth only deletes expired rows lazily, when a given
 *   identifier is read; unread rows (abandoned sign-up, one-time delete links)
 *   would stay forever. Rows carry the raw email as `identifier`.
 */
@Injectable()
export class DataLifecycleService {
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

      if (sessions.count > 0 || verifications.count > 0) {
        console.log(
          `Data lifecycle sweep: purged ${sessions.count} expired session(s) and ${verifications.count} expired verification(s)`,
        );
      }
    } catch (error) {
      // Never break the process over a sweep: it will run again on schedule.
      console.error("Data lifecycle sweep failed:", error);
    }
  }
}
