import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const personalRkrExpensesSchema = new Schema({
  date: { type: String, default: getToday },
  workKind: { type: String, required: true },
  name: { type: String, required: true },
  clientName: { type: String, default: "" },
  quantity: { type: Number, default: 0 },
  product: { type: Array, default: [] },
  pricesOfProducts: { type: Object },
  quantitiesOfProduct: { type: Object },
  other: { type: String, default: "-" },
  number: { type: Number, default: 0 },
  workPrice: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
}, { timestamps: true });

export const PersonalRkrExpenses = model("PersonalRkrExpenses", personalRkrExpensesSchema);
