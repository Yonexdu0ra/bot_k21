import mongoose from "mongoose";
const { Schema, model } = mongoose;

const studentSchema = new Schema(
  {
    user_id: { type: Number, required: true },
    student_id: { type: Number, required: true },
    name: { type: String },
    full_name: { type: String },
    student_code: { type: String },
    birthday: { type: String },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model("Student", studentSchema);
