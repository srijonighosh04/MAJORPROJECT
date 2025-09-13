const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: [true, "Review comment cannot be empty."],
    minlength: [5, "Review must be at least 5 characters long."],
    maxlength: [500, "Review cannot exceed 500 characters."]
  },
  rating: {
    type: Number,
    required: [true, "Rating is required."],
    min: [1, "Rating must be at least 1."],
    max: [5, "Rating cannot be more than 5."]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"   // 🔑 Link review to the user who wrote it
  }
});

module.exports = mongoose.model("Review", reviewSchema);
