import { Router } from "express";
import { protect } from "../middleware/auth.js";

export const createRoutes = (controller) => {
  const router = Router();
  router.use(protect);
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  return router;
};
