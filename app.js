const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const errorHandler = require("./controllers/errorController");
const tourRoute = require("./routes/tourRoutes");
const userRoute = require("./routes/userRoutes");
const reviewsRoute = require("./routes/reviewsRoutes");
const viewRoute = require("./routes/viewRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//: 1. Global Middlewares
//? Serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));

//? Set security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      imgSrc: ["'self'", "data:", "*"],
      "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
      "default-src": ["'self'"],
      "connect-src": ["'self'", '*'],
    },
  })
);

//? Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//? Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

//? Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

//? Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//? Data sanitization against XSS
app.use(xss());

//? Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingAverage",
      "maxGroupSize",
      "difficulty",
      "price",
      "startDates",
    ],
  })
);

//? Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//: Routes
app.use("/", viewRoute);
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/reviews", reviewsRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
