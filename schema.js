const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title is required."
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description is required."
    }),
    price: Joi.number().required().min(0).messages({
      "number.base": "Price must be a number.",
      "number.min": "Price cannot be negative."
    }),
    country: Joi.string().required().messages({
      "string.empty": "Country is required."
    }),
    location: Joi.string().required().messages({
      "string.empty": "Location is required."
    }),
  }).required(),
  image: Joi.any().optional() // still accepts the uploaded file
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(5).max(500).required()
  }).required()
});
