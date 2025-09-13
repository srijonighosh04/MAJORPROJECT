const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// Show new form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// Create new listing
module.exports.createListing = async (req, res) => {
  try {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();
    console.log(response.body.features[0].geometry);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Save image if uploaded
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "Successfully created a new listing!");
    return res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error("❌ Error creating listing:", err);
    req.flash("error", "Failed to create listing.");
    return res.redirect("/listings");
  }
};

// Show single listing
module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("owner")
    .populate("reviews");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  try {
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
      new: true,
      runValidators: true,
    });

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    if (req.body.listing.location) {
      console.log("Updating location to:", req.body.listing.location);

      const response = await geocodingClient
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();

      if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
        console.log("Updated geometry:", listing.geometry);
      } else {
        console.warn("⚠️ No geometry found for updated location:", req.body.listing.location);
      }
    }

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();
    req.flash("success", "Successfully updated listing!");
    return res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("❌ Error updating listing:", err);
    req.flash("error", "Failed to update listing.");
    return res.redirect("/listings");
  }
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
