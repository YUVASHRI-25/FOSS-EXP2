const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
    .connect("mongodb://127.0.0.1:27017/blogDB")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// User Model
const User = mongoose.model("User", {
    username: String,
    password: String,
});

// ==================== REGISTER ====================

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ username });

    if (exists) {
        return res.json({
            message: "User already exists",
        });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
        username,
        password: passwordHash,
    });

    res.json({
        message: "Registration successful",
    });
});

// ==================== LOGIN ====================

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            username: user.username,
        },
        "secretkey",
        {
            expiresIn: "1h",
        }
    );

    res.json({
        message: "Login successful",
        token: token,
    });
});

// ==================== START SERVER ====================

app.listen(5000, () => {
    console.log("Server running on port 5000");
});