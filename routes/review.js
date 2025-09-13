// routes/review.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams so we can access :id from listings
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const reviewsController = require("../controllers/reviews");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const { reviewSchema } = require("../schema");

// ===== VALIDATION MIDDLEWARE =====
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// ===== ROUTES =====

// Create a review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createReview)
);

// Delete a review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewsController.deleteReview)
);

module.exports = router;
