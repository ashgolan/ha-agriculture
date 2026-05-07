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

// POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY)
      return sendError(res, "מפתח הרשמה שגוי", 403);

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ email, password: hash, role: role || "User" });
    sendSuccess(res, { _id: user._id, email: user.email, role: user.role }, 201);
  } catch (e) {
    sendError(res, e.message, 400);
  }
});

// GET /api/users
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    sendSuccess(res, users);
  } catch (e) {
    sendError(res, e.message, 500);
  }
});

// PATCH /api/users/:id
router.patch("/:id", protect, async (req, res) => {
  try {
    const { adminKey, password, ...rest } = req.body;
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY)
      return sendError(res, "מפתח שגוי", 403);

    const update = { ...rest };
    if (password) {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
      .select("-password");
    if (!user) return sendError(res, "משתמש לא נמצא", 404);
    sendSuccess(res, user);
  } catch (e) {
    sendError(res, e.message, 400);
  }
});

// DELETE /api/users/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const { adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY)
      return sendError(res, "מפתח שגוי", 403);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, "משתמש לא נמצא", 404);
    sendSuccess(res, { message: "משתמש נמחק" });
  } catch (e) {
    sendError(res, e.message, 500);
  }
});

export default router;
