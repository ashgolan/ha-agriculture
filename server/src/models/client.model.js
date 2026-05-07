import { Schema, model } from "mongoose";

const clientSchema = new Schema({
  clientName: { type: String, required: true, unique: true },
  phone: { type: String, default: "-" },
  address: { type: String, default: "-" },
  totalDunam: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
}, { timestamps: true });

export const Client = model("Client", clientSchema);
