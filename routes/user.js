const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const usersController = require("../controllers/users");
const { isLoggedIn } = require("../middleware.js");

// ================= AUTH ROUTES =================

// Show register page
router.get("/register", usersController.showRegister);

// Handle register
router.post("/register", wrapAsync(usersController.registerUser));

// Show login page
router.get("/login", usersController.showLogin);

// Handle login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  usersController.login
);

// Logout
router.get("/logout", usersController.logout);

// ================= USER ROUTES =================

// Show all users
router.get("/", wrapAsync(usersController.getAllUsers));

// ⚠️ Dynamic routes go LAST so they don’t override /register, /login, etc.
router.get("/:id", wrapAsync(usersController.getUser));
router.delete("/:id", isLoggedIn, wrapAsync(usersController.deleteUser));

module.exports = router;
