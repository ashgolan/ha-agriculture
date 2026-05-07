import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const workersSchema = new Schema({
  date: { type: String, default: getToday },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  number: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

export const Workers = model("Workers", workersSchema);
