const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js"); 
const upload = multer({ storage });

// Middlewares
const { isLoggedIn, isOwner } = require("../middleware.js");

// Validation
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

// ================= ROUTES =================

// Index
router.get("/", wrapAsync(listingController.index));

// New
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Create
router.post(
  "/",
  isLoggedIn,
  upload.single("image"), // 👈 for image upload
  validateListing,
  wrapAsync(listingController.createListing)
);

// Show
router.get("/:id", wrapAsync(listingController.showListing));

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"), // 👈 add this so file uploads are processed
  validateListing,
  wrapAsync(listingController.updateListing)
);

// Delete
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
