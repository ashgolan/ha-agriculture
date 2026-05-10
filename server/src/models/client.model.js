import { Schema, model } from "mongoose";

const clientSchema = new Schema({
  clientName: { type: String, required: true },
  name:       { type: String, default: "-" },
  quantity:   { type: Number, default: 0 },
});

export const Client = model("Client", clientSchema);

