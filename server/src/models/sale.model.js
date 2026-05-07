import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const saleSchema = new Schema({
  date: { type: String, default: getToday },
  clientName: { type: String, required: true },
  purpose: { type: String, required: true },
  name: { type: String, required: true },
  strains: { type: String, default: "-" },
  product: { type: Array, default: [] },
  pricesOfProducts: { type: Object },
  quantitiesOfProduct: { type: Object },
  quantity: { type: Number, default: 0 },
  number: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
}, { timestamps: true });

export const Sale = model("Sale", saleSchema);
