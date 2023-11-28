import mongoose from "mongoose";
const { Schema, model } = mongoose;

const accountSchema = new Schema({
  chat_id: { type: Number, required: true, unique: true },
  username: { type: String, default: "" },
  password: { type: String, default: "" },
});

export default model("Account", accountSchema);
