import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const bidSchema = new Schema({
  clientName: { type: String, required: true },
  date: { type: String, default: getToday },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  isApproved: { type: Boolean, default: false },
  target: { type: String, default: "-" },
  totalAmount: { type: Number, default: 0 },
  freeBid: { type: Boolean, required: true },
  data: { type: Array },
}, { timestamps: true });

export const Bid = model("Bid", bidSchema);
