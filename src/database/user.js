const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: String,
    username: String,
    weight: Number
});
module.exports = mongoose.model("users", schema);