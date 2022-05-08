const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: String,
    username: String,
    rating: Number,
    avatar: String,
    vouches: Array
});
module.exports = mongoose.model("mm", schema);