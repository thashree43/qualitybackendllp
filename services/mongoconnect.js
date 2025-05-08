import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 
console.log("here iit may have been reaced ");

const mongoUrl = process.env.MONGOURL;
console.log("MongoDB URL:", process.env.MONGOURL); 

if (!mongoUrl) {
  console.error("MONGOURL is not defined in environment variables.");
  process.exit(1);
}

export async function connectdb() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
