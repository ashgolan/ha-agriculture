import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const personalProductExpensesSchema = new Schema({
  date:        { type: String,  default: getToday },
  name:        { type: String,  required: true },
  quantity:    { type: Number,  default: 0 },
  number:      { type: Number,  default: 0 },   // ✅ تم تصحيحه: كان String والصحيح Number
  totalAmount: { type: Number,  default: 0 },
  colored:     { type: Boolean, default: false },
}, { timestamps: true });

export const PersonalProductExpenses = model("PersonalProductExpenses", personalProductExpensesSchema);