import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { createBackupZip, restoreFromZip, sendBackupEmail } from "../utils/backup.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("יש להעלות קובץ ZIP בלבד"));
    }
  },
});

// GET /api/backup/export — download backup ZIP
router.get("/export", protect, async (req, res) => {
  try {
    const zipBuffer = await createBackupZip();
    const date = new Date().toLocaleDateString("he-IL").replace(/\//g, "-");
    const filename = `גיבוי_חקלאות_${date}.zip`;
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": zipBuffer.length,
    });
    res.send(zipBuffer);
  } catch (e) {
    sendError(res, `שגיאה ביצירת הגיבוי: ${e.message}`, 500);
  }
});

// POST /api/backup/import — restore from ZIP (requires login)
router.post("/import", protect, upload.single("backup"), async (req, res) => {
  try {
    if (!req.file) return sendError(res, "לא הועלה קובץ", 400);
    const results = await restoreFromZip(req.file.buffer);
    sendSuccess(res, { message: "הנתונים שוחזרו בהצלחה", restored: results });
  } catch (e) {
    sendError(res, `שגיאה בשחזור: ${e.message}`, 500);
  }
});

// POST /api/backup/send-email — manual trigger
router.post("/send-email", protect, async (req, res) => {
  try {
    const zipBuffer = await createBackupZip();
    await sendBackupEmail(zipBuffer);
    sendSuccess(res, { message: "הגיבוי נשלח בהצלחה לאימייל" });
  } catch (e) {
    sendError(res, `שגיאה בשליחת הגיבוי: ${e.message}`, 500);
  }
});

// ══════════════════════════════════════════════════════════════
// 🚨 EMERGENCY RESTORE — ללא צורך בהתחברות
// POST /api/backup/emergency-restore
// Body: { secretKey, (multipart: backup file) }
// ══════════════════════════════════════════════════════════════
router.post("/emergency-restore", upload.single("backup"), async (req, res) => {
  try {
    // Validate secret key
    const secretKey = req.body?.secretKey || req.headers["x-restore-key"];
    if (!secretKey || secretKey !== process.env.RESTORE_SECRET_KEY) {
      return sendError(res, "מפתח שחזור שגוי", 403);
    }
    if (!req.file) return sendError(res, "לא הועלה קובץ", 400);

    const results = await restoreFromZip(req.file.buffer);
    sendSuccess(res, { message: "הנתונים שוחזרו בהצלחה (חירום)", restored: results });
  } catch (e) {
    sendError(res, `שגיאה בשחזור: ${e.message}`, 500);
  }
});

export default router;
