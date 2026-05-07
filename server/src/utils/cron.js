import cron from "node-cron";
import { createBackupZip, sendBackupEmail } from "./backup.js";

export function startCronJobs() {
  // ─── Daily backup at 01:00 AM ─────────────────────────────
  // "0 1 * * *" = every day at 01:00
  cron.schedule("0 1 * * *", async () => {
    console.log("⏰ [CRON] Starting daily backup...");
    try {
      const zipBuffer = await createBackupZip();
      await sendBackupEmail(zipBuffer);
      console.log("✅ [CRON] Daily backup sent successfully");
    } catch (err) {
      console.error("❌ [CRON] Backup failed:", err.message);
    }
  }, {
    timezone: "Asia/Jerusalem",
  });

  console.log("✅ Cron jobs started — daily backup at 01:00 AM (Jerusalem time)");
}
