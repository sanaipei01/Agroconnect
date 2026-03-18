const express = require("express");
const Order = require("../models/order");
const Product = require("../models/product");
const auth = require("../middleware/auth");

const router = express.Router();

// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity, deliveryLocation, notes } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.availability !== "Available") {
      return res.status(400).json({ error: "Product is not available" });
    }

    // Check if quantity is available
    if (quantity > product.quantity) {
      return res.status(400).json({ error: "Requested quantity exceeds available stock" });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    const order = new Order({
      product: productId,
      buyer: req.user.id,
      quantity,
      deliveryLocation,
      pickupLocation: product.location,
      totalPrice,
      notes
    });

    await order.save();

    // Populate product and buyer info
    await order.populate("product", "name price location");
    await order.populate("buyer", "name email");

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get orders for the current user (buyer)
router.get("/buyer", auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("product", "name price location farmer")
      .populate("transporter", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders for farmer (orders for their products)
router.get("/farmer", auth, async (req, res) => {
  try {
    // First get farmer's products
    const farmerProducts = await Product.find({ farmer: req.user.id }).select("_id");

    const productIds = farmerProducts.map(p => p._id);

    const orders = await Order.find({ product: { $in: productIds } })
      .populate("product", "name price location")
      .populate("buyer", "name email")
      .populate("transporter", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available orders for transporters
router.get("/available", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["pending", "accepted"] },
      transporter: { $exists: false }
    })
      .populate("product", "name price location")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders assigned to transporter
router.get("/transporter", auth, async (req, res) => {
  try {
    const orders = await Order.find({ transporter: req.user.id })
      .populate("product", "name price location")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (for farmers and transporters)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, transporterId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check permissions
    const product = await Product.findById(order.product);
    const isFarmer = product.farmer.toString() === req.user.id;
    const isTransporter = order.transporter && order.transporter.toString() === req.user.id;

    if (!isFarmer && !isTransporter) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Update transporter if provided
    if (transporterId) {
      order.transporter = transporterId;
    }

    order.status = status;
    await order.save();

    await order.populate("product", "name price location");
    await order.populate("buyer", "name email");
    await order.populate("transporter", "name email");

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Accept order (assign to transporter)
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.transporter) {
      return res.status(400).json({ error: "Order already assigned to a transporter" });
    }

    order.transporter = req.user.id;
    order.status = "accepted";
    await order.save();

    await order.populate("product", "name price location");
    await order.populate("buyer", "name email");
    await order.populate("transporter", "name email");

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel order (buyer only)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ error: "Cannot cancel delivered order" });
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("product", "name price location farmer")
      .populate("buyer", "name email")
      .populate("transporter", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user has permission to view this order
    const product = await Product.findById(order.product);
    const isBuyer = order.buyer.toString() === req.user.id;
    const isFarmer = product.farmer.toString() === req.user.id;
    const isTransporter = order.transporter && order.transporter.toString() === req.user.id;

    if (!isBuyer && !isFarmer && !isTransporter) {
      return res.status(401).json({ error: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;