const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require(".../models/User");

const router = express.Router();

// register 
router.post("/register", async (req, res) => {
    try {
        const {name, email, password, role} = req.body;

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashPassword, 
            role
        });

        await newUser.save();
        
        res.status(201).json({ message: "User registered successfully"});
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
    });

// login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email});
        if (!user) return res.status(400).json({ error: "user not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "invalid password"});

        const token = jwt.sign(
            { id: user._id, role: user.role },
            "SECRETKEY",
            { expiresIn: "1d" }
        );
        
        res.json({ 
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({error: err.message});
    }
    
});

module.exports = router;

