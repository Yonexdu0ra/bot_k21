import mongoose from "mongoose";
const { Schema, model } = mongoose;

const courseSchema = new Schema(
  {
    subject: { type: String, unique: true },
    class_id: { type: Number },
    type: { type: String },
    lesson: { type: S },
  },
  {
    timestamps: true,
  }
);

export default model("Course", courseSchema);
