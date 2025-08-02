// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

router.get("/user", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("JWT verify error:", err);
        return res.status(403).json({ error: "Invalid token" });
      }

      try {
        // Fetch actual user data from database using userId from JWT
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        console.log("Returning user data:", user);
        res.json(user); // Returns actual user object with username, email, etc.
      } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).json({ error: "Database error" });
      }
    });
  } catch (error) {
    console.error("Error in /user route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
  httpOnly: true,
  secure: false, // change to true in production with HTTPS
  sameSite: "Lax",
}).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
  httpOnly: true,
  secure: false, // change to true in production with HTTPS
  sameSite: "Lax",
}).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user._id, username: req.user.username }, process.env.JWT_SECRET);
  res.redirect(`http://localhost:5173/oauth?token=${token}`);
});

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", passport.authenticate("github", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user._id, username: req.user.username }, process.env.JWT_SECRET);
  res.redirect(`http://localhost:5173/oauth?token=${token}`);
});

module.exports = router;
