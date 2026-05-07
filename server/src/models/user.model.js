import { model, Schema } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (value.length < 10) throw Error("min length of password is 10 digits!");
    },
  },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, required: true, enum: ["Admin", "User"] },
}, { timestamps: true });

export const User = model("User", userSchema);
