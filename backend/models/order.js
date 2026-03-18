const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true },
  deliveryLocation: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "in-transit", "delivered", "cancelled"],
    default: "pending"
  },
  transporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickupLocation: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);