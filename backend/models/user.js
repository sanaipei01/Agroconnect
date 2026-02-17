const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: string, required: true },
    email: {type: string, required: true, unique: true},
    password: {type: string, required: true},
    role: {type: string, enum: ["farmer", "buyer", "transporter"], required:true }
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);
