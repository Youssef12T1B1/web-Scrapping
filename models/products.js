const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    Delivery: String,
    price: Number,
    shipping: String,
    specs: [],
  },
  { timestamps: true }
);
const Product = mongoose.model("product", productSchema);
module.exports = Product;
