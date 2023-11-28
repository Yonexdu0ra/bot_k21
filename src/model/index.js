import mongoose from "mongoose";

async function connectDB(uri, options) {
  try {
    await mongoose.connect(uri, options);
    console.log("Connect to DB");
  } catch (error) {
    console.log("error: " + error);
  }
}

export default connectDB;
