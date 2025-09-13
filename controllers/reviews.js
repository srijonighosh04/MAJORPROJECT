// controllers/reviews.js
const Review = require("../models/reviews"); // ✅ singular file
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// ================== CREATE REVIEW ==================
module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const review = new Review(req.body.review);
  review.author = req.user._id; // ✅ attach current user
  listing.reviews.push(review);

  await review.save();
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

// ================== DELETE REVIEW ==================
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
