const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// Define user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true  // prevents duplicate emails
  }
});

// Attach passport-local-mongoose plugin to the schema
// This automatically adds username, hash, salt, and helper methods (register, authenticate, etc.)
userSchema.plugin(passportLocalMongoose);

// Compile model from schema
module.exports = mongoose.model("User", userSchema);
