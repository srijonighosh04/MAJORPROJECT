const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
const User = require('../models/user.js');  // 👈 make sure you have a User model

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await User.deleteMany({}); // optional: clear users too for a clean slate

    // 👇 create a dummy user to be owner of seeded listings
    const dummyUser = new User({
      username: "seedUser",
      email: "seed@example.com"
    });
    await dummyUser.save();

    // 👇 attach this user's _id as owner to each seeded listing
    const dataWithOwner = initData.data.map(obj => ({
      ...obj,
      owner: dummyUser._id,
    }));

    await Listing.insertMany(dataWithOwner);
    console.log("✅ Database seeded with listings & dummy owner!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
