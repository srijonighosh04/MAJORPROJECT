const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const defaultImage =
  "https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const listingSchema = new Schema({
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      url: {
        type: String,
        default: defaultImage, // ✅ fallback Unsplash image
      },
      filename: {
        type: String,
        default: "default",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    geometry:{
      type: {
        type: String, 
        enum: ['Point'],
        required:true 
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  { timestamps: true }
);


// 🛠 Ensure price is stored as a number
listingSchema.pre("save", function (next) {
  if (typeof this.price === "string") {
    this.price = Number(this.price);
  }
  next();
});

module.exports = mongoose.model("Listing", listingSchema);
