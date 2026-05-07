import archiver from "archiver";
import unzipper from "unzipper";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { PassThrough } from "stream";

// ─── All models ────────────────────────────────────────────────
import { Sale }                   from "../models/sale.model.js";
import { Expense }                from "../models/expenses.model.js";
import { Client }                 from "../models/client.model.js";
import { Bid }                    from "../models/bid.model.js";
import { User }                   from "../models/user.model.js";
import { TractorPrice }           from "../models/tractorPrice.model.js";
import { TaxValues }              from "../models/taxValues.model.js";
import { PersonalSale }           from "../models/personal/personalSales.model.js";
import { Workers }                from "../models/personal/personalWorkers.model.js";
import { PersonalRkrExpenses }    from "../models/personal/personalRkrExpenses.model.js";
import { PersonalProductExpenses} from "../models/personal/personalProductsExpenses.model.js";
import { PersonalInvestment }     from "../models/personal/personalInvestments.model.js";
import { PersonalTractorPrice }   from "../models/personal/personalTractorPrice.model.js";

const COLLECTIONS = [
  { name: "sales",                   Model: Sale },
  { name: "expenses",                Model: Expense },
  { name: "clients",                 Model: Client },
  { name: "bids",                    Model: Bid },
  { name: "users",                   Model: User },
  { name: "tractorPrices",           Model: TractorPrice },
  { name: "taxValues",               Model: TaxValues },
  { name: "personalSales",           Model: PersonalSale },
  { name: "personalWorkers",         Model: Workers },
  { name: "personalRkrExpenses",     Model: PersonalRkrExpenses },
  { name: "personalProductExpenses", Model: PersonalProductExpenses },
  { name: "personalInvestments",     Model: PersonalInvestment },
  { name: "personalTractorPrices",   Model: PersonalTractorPrice },
];

// ─── Create ZIP buffer with all data ──────────────────────────
export async function createBackupZip() {
  return new Promise(async (resolve, reject) => {
    const chunks = [];
    const passThrough = new PassThrough();
    passThrough.on("data", chunk => chunks.push(chunk));
    passThrough.on("end", () => resolve(Buffer.concat(chunks)));
    passThrough.on("error", reject);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", reject);
    archive.pipe(passThrough);

    // Add metadata file
    const meta = {
      createdAt: new Date().toISOString(),
      version: "1.0",
      app: "ח.א חקלאות",
      collections: COLLECTIONS.map(c => c.name),
    };
    archive.append(JSON.stringify(meta, null, 2), { name: "meta.json" });

    // Add each collection as JSON file
    for (const { name, Model } of COLLECTIONS) {
      const data = await Model.find().lean();
      archive.append(JSON.stringify(data, null, 2), { name: `${name}.json` });
    }

    archive.finalize();
  });
}

// ─── Restore from ZIP buffer ───────────────────────────────────
export async function restoreFromZip(zipBuffer) {
  const results = {};
  const dataMap = {};

  // Read all files from zip
  const directory = await unzipper.Open.buffer(zipBuffer);
  for (const file of directory.files) {
    if (file.path === "meta.json") continue;
    const content = await file.buffer();
    const name = file.path.replace(".json", "");
    dataMap[name] = JSON.parse(content.toString());
  }

  // Restore each collection
  for (const { name, Model } of COLLECTIONS) {
    if (!dataMap[name]) { results[name] = 0; continue; }
    const docs = dataMap[name];

    // Clear existing data (keep users if no user data in backup)
    if (name === "users" && docs.length === 0) {
      results[name] = 0;
      continue;
    }
    await Model.deleteMany({});

    if (docs.length > 0) {
      // Use insertMany with ordered:false to skip duplicate _id errors
      try {
        await Model.insertMany(docs, { ordered: false });
      } catch (e) {
        // Some docs may have inserted even if error
      }
      const count = await Model.countDocuments();
      results[name] = count;
    } else {
      results[name] = 0;
    }
  }

  return results;
}

// ─── Send backup email via Gmail ──────────────────────────────
export async function sendBackupEmail(zipBuffer) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const date = new Date().toLocaleDateString("he-IL", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  await transporter.sendMail({
    from: `"ח.א חקלאות 🌾" <${process.env.GMAIL_USER}>`,
    to: process.env.BACKUP_EMAIL,
    subject: `💾 גיבוי אוטומטי — ח.א חקלאות | ${date}`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <div style="background:#fff;border-radius:10px;padding:24px;border:1px solid #e5e7eb;">
          <h2 style="color:#16a34a;margin:0 0 16px;">🌾 ח.א חקלאות</h2>
          <h3 style="color:#1a1a1a;margin:0 0 8px;">גיבוי אוטומטי יומי</h3>
          <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">
            מצורף גיבוי מלא של כל הנתונים, נוצר אוטומטית בתאריך ${date}.
          </p>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px;margin-bottom:16px;">
            <p style="color:#15803d;font-size:13px;margin:0;font-weight:500;">
              ✅ הגיבוי מכיל את כל הנתונים: מכירות, הוצאות, לקוחות, הצעות מחיר, נתונים אישיים ועוד.
            </p>
          </div>
          <p style="color:#a3a3a3;font-size:12px;margin:0;">
            לשחזור: היכנס להגדרות ← שחזור גיבוי ← העלה את הקובץ המצורף.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename: `גיבוי_חקלאות_${new Date().toLocaleDateString("he-IL").replace(/\//g,"-")}.zip`,
      content: zipBuffer,
      contentType: "application/zip",
    }],
  });
}
