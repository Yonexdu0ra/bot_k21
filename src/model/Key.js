import mongoose from "mongoose";
const { Schema, model } = mongoose;

const keySchema = new Schema(
  {
    count: { type: Number, required: true, default: 1 },
    key: { type: String, default: "" },
    type: { type: String, default: "LESSON", required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Key", keySchema);
