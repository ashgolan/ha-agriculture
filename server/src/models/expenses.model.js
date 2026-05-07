import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const expenseSchema = new Schema({
  date: { type: String, default: getToday },
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  number: { type: Number, default: 0 },
  tax: { type: Boolean, default: true },
  colored: { type: Boolean, default: false },
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

export const Expense = model("Expense", expenseSchema);
