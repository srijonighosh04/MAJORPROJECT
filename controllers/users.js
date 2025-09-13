const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");

// ===== RENDER PAGES =====
module.exports.showRegister = (req, res) => {
  res.render("users/register");
};

module.exports.showLogin = (req, res) => {
  res.render("users/login");
};

module.exports.getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.render("users/index", { users });
};

module.exports.getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("reviews");
  if (!user) throw new ExpressError(404, "User not found");
  res.render("users/show", { user });
};

// ===== AUTH ACTIONS =====
module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash("success", "Welcome! You are signed up!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register"); // ✅ fixed path
  }
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  req.flash("success", "User deleted!");
  res.redirect("/"); // ✅ better redirect after deleting a user
};
