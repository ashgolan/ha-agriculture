import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";

export const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return sendError(res, "אין הרשאה - נדרשת כניסה לחשבון", 401);

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded._id;
    next();
  } catch (e) {
    return sendError(res, "טוקן לא תקין או שפג תוקפו", 401);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "Admin")
    return sendError(res, "אין הרשאת מנהל", 403);
  next();
};
