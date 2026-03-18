// Test script to verify order system
const mongoose = require("mongoose");
const User = require("./models/user");
const Product = require("./models/product");
const Order = require("./models/order");

async function testOrderSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/agrisystem");
    console.log("Connected to MongoDB");

    // Create test users
    const farmer = new User({
      name: "Test Farmer",
      email: "farmer@test.com",
      password: "password123",
      role: "farmer"
    });

    const buyer = new User({
      name: "Test Buyer",
      email: "buyer@test.com",
      password: "password123",
      role: "buyer"
    });

    await farmer.save();
    await buyer.save();
    console.log("Test users created");

    // Create test product
    const product = new Product({
      name: "Test Maize",
      quantity: 100,
      price: 2000,
      location: "Test Farm",
      farmer: farmer._id
    });

    await product.save();
    console.log("Test product created");

    // Create test order
    const order = new Order({
      product: product._id,
      buyer: buyer._id,
      quantity: 10,
      deliveryLocation: "Test City",
      pickupLocation: product.location,
      totalPrice: product.price * 10
    });

    await order.save();
    console.log("Test order created");

    // Test population
    const populatedOrder = await Order.findById(order._id)
      .populate("product", "name price")
      .populate("buyer", "name email");

    console.log("Order with populated data:", {
      product: populatedOrder.product.name,
      buyer: populatedOrder.buyer.name,
      quantity: populatedOrder.quantity,
      totalPrice: populatedOrder.totalPrice
    });

    console.log("Order system test completed successfully!");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testOrderSystem();
}

module.exports = testOrderSystem;