import { Schema, model } from "mongoose";

const personalTractorprice = new Schema({
  price: { type: Number, required: true },
}, { timestamps: true });

export const PersonalTractorPrice = model("personalTractorPrice", personalTractorprice);
