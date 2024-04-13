import mongoose from "mongoose";
const { Schema, model } = mongoose;

const noteSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Account", noteSchema);
