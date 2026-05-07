import { Schema, model } from "mongoose";

const taxValuesSchema = new Schema({
  masValue: { type: String },
  maamValue: { type: String },
}, { timestamps: true });

export const TaxValues = model("TaxValues", taxValuesSchema);
