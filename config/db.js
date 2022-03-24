const mongoose = require("mongoose");
const URI = require("./.env").MONGO_URI;

const connectDB = async () => {
  try {
    const con = await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
