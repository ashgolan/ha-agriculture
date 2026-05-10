import { Schema, model } from "mongoose";
const getToday = () => new Date().toISOString().split("T")[0];

const personalInvestmentSchema = new Schema({
  date:        { type: String,  default: getToday },
  name:        { type: String,  required: true },
  number:      { type: Number,  default: 0 },
  other:       { type: String,  default: "-" },
  totalAmount: { type: Number,  default: 0 },
  colored:     { type: Boolean, default: false },
}, { timestamps: true });

export const PersonalInvestment = model("PersonalInvestment", personalInvestmentSchema);
