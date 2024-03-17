import mongoose from "mongoose";
const { Schema, model } = mongoose;

const courseSchema = new Schema(
  {
    subject: { type: String },
    class_id: { type: Number, unique: true },
    lessons: { type: Array },
    course_id: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Course", courseSchema);
