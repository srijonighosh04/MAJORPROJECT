if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}
console.log(process.env.SECRET);

// ================= DEPENDENCIES =================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const User = require("./models/user.js");

// Routes
const listingRouter = require("./routes/listings");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Utils & validation
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

const app = express();
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);


// ================= VIEW ENGINE =================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser("thisisasecret"));

// ----- Session Store -----
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "devsecret",
  },
  touchAfter: 24 * 3600, // time period in seconds (reduce write frequency)
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR ❌", e);
});

// ----- Session Setup -----
app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ----- Flash Messages -----
app.use(flash());

// ----- Passport Init -----
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----- Global locals (flash + currentUser) -----
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ================= CUSTOM VALIDATION =================
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ----- Demo user creation (optional) -----
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

// Mount route files
app.use("/users", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// ================= ERROR HANDLING =================
// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Generic error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  const message = err.message || "Something went wrong";
  res.status(statusCode).render("error.ejs", { statusCode, message });
});

// ================= DATABASE & SERVER START =================
const startServer = async () => {
  const connectWithRetry = async (retries = 5, delay = 3000) => {
    try {
      await mongoose.connect(dbUrl);
      console.log("Connected to MongoDB ✅");
    } catch (err) {
      if (retries <= 0) {
        console.error("Failed to connect to MongoDB after multiple attempts:", err);
        process.exit(1);
      } else {
        console.warn(`MongoDB connection failed. Retrying in ${delay / 1000}s...`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      }
    }
  };

  await connectWithRetry();

  app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
  });
};

startServer();
