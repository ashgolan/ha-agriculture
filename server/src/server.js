import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { startCronJobs } from "./utils/cron.js";

// Routes
import userRoutes              from "./routes/user.routes.js";
import saleRoutes              from "./routes/sale.routes.js";
import expenseRoutes           from "./routes/expense.routes.js";
import clientRoutes            from "./routes/client.routes.js";
import bidRoutes               from "./routes/bid.routes.js";
import tractorPriceRoutes      from "./routes/tractorPrice.routes.js";
import taxValuesRoutes         from "./routes/taxValues.routes.js";
import personalSalesRoutes     from "./routes/personal/personalSales.routes.js";
import personalWorkersRoutes   from "./routes/personal/personalWorkers.routes.js";
import personalRkrRoutes       from "./routes/personal/personalRkr.routes.js";
import personalProductExpRoutes from "./routes/personal/personalProductExpenses.routes.js";
import personalInvestmentRoutes from "./routes/personal/personalInvestment.routes.js";
import personalTractorPriceRoutes from "./routes/personal/personalTractorPrice.routes.js";
import backupRoutes            from "./routes/backup.routes.js";

connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use("/api", apiLimiter);

// Routes
app.use("/api/users",                  userRoutes);
app.use("/api/sales",                  saleRoutes);
app.use("/api/expenses",               expenseRoutes);
app.use("/api/clients",                clientRoutes);
app.use("/api/bids",                   bidRoutes);
app.use("/api/tractorPrice",           tractorPriceRoutes);
app.use("/api/taxValues",              taxValuesRoutes);
app.use("/api/personalSales",          personalSalesRoutes);
app.use("/api/personalWorkers",        personalWorkersRoutes);
app.use("/api/personalRkrExpenses",    personalRkrRoutes);
app.use("/api/personalProductExpenses", personalProductExpRoutes);
app.use("/api/personalInvestments",    personalInvestmentRoutes);
app.use("/api/personalTractorPrice",   personalTractorPriceRoutes);
app.use("/api/backup",                 backupRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "שגיאת שרת" : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  startCronJobs();
});
