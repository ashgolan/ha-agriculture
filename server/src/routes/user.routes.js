import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { protect } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = Router();

const signToken = (id) =>
  jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });

// POST /api/users/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, "נא להזין אימייל וסיסמא", 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendError(res, "אימייל או סיסמא שגויים", 401);
    if (user.isBlocked) return sendError(res, "החשבון חסום, צור קשר עם המנהל", 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, "אימייל או סיסמא שגויים", 401);

    const accessToken = signToken(user._id);
    sendSuccess(res, {
      accessToken,
      user: { _id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    sendError(res, e.message, 500);
  }
});

// POST /api/users/register — requires login + Admin role
router.post("/register", protect, async (req, res) => {
  try {
    // Only Admin can add users
    if (req.user.role !== "Admin")
      return sendError(res, "אין הרשאה — מנהלים בלבד", 403);

    const { email, password, role } = req.body;
    if (!email || !password) return sendError(res, "נא למלא את כל השדות", 400);

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return sendError(res, "אימייל כבר קיים במערכת", 400);

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ email: email.toLowerCase(), password: hash, role: role || "User" });
    sendSuccess(res, { _id: user._id, email: user.email, role: user.role }, 201);
  } catch (e) {
    sendError(res, e.message, 400);
  }
});

// GET /api/users — requires login
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return sendError(res, "אין הרשאה", 403);
    const users = await User.find().select("-password").lean();
    sendSuccess(res, users);
  } catch (e) {
    sendError(res, e.message, 500);
  }
});

// DELETE /api/users/:id — Admin only
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return sendError(res, "אין הרשאה — מנהלים בלבד", 403);

    // Prevent deleting yourself
    if (req.params.id === req.user._id.toString())
      return sendError(res, "לא ניתן למחוק את עצמך", 400);

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, "משתמש לא נמצא", 404);
    sendSuccess(res, { message: "משתמש נמחק" });
  } catch (e) {
    sendError(res, e.message, 500);
  }
});

export default router;
