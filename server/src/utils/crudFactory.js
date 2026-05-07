import { sendSuccess, sendError } from "./response.js";

export const createCRUD = (Model, modelName = "Record") => ({
  getAll: async (req, res) => {
    try {
      const data = await Model.find().lean();
      sendSuccess(res, data);
    } catch (e) {
      sendError(res, e.message, 500);
    }
  },
  getById: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id).lean();
      if (!item) return sendError(res, `${modelName} not found`, 404);
      sendSuccess(res, item);
    } catch (e) {
      sendError(res, e.message, 500);
    }
  },
  create: async (req, res) => {
    try {
      const item = await Model.create(req.body);
      sendSuccess(res, item, 201);
    } catch (e) {
      sendError(res, e.message, 400);
    }
  },
  update: async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!item) return sendError(res, `${modelName} not found`, 404);
      sendSuccess(res, item);
    } catch (e) {
      sendError(res, e.message, 400);
    }
  },
  remove: async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return sendError(res, `${modelName} not found`, 404);
      sendSuccess(res, { message: "נמחק בהצלחה" });
    } catch (e) {
      sendError(res, e.message, 500);
    }
  },
});
