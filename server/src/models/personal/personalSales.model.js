import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const personalSaleSchema = new Schema({
  date: { type: String, default: getToday },
  clientName: { type: String, default: "" },
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  number: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
}, { timestamps: true });

export const PersonalSale = model("PersonalSale", personalSaleSchema);
