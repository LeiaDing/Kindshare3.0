import mongoose from "mongoose";
import products from "./data.js";
import Product from "../models/product.js";
import dotenv from "dotenv";

dotenv.config({ path: "backend/config/config.env" });
console.log("正在连接数据库：", process.env.DB_LOCAL_URI);

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.DB_LOCAL_URI, {   // 🟥 改这一行：使用 .env 中的 DB_LOCAL_URI
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 🟥 加这个
    });

    await Product.deleteMany();
    console.log("Products are deleted");

    await Product.insertMany(products);
    console.log("Products are added");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
