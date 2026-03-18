const express = require("express");
const Product = require("../models/product");
const auth = require("../middleware/auth"); // We'll need to create this middleware

const router = express.Router();

// Get all available products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ availability: "Available" })
      .populate("farmer", "name email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products by farmer
router.get("/farmer/:farmerId", auth, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.params.farmerId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post("/", auth, async (req, res) => {
  try {
    const { name, quantity, price, location, availability } = req.body;

    const product = new Product({
      name,
      quantity,
      price,
      location,
      availability: availability || "Available",
      farmer: req.user.id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
router.put("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.farmer.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.farmer.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;