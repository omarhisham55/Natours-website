const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (e) => `Error at ${e.path} field: ${e.message}`
  );
  const message = errors.join(". ");
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg
    .match(/(["'])(\\?.)*?\1/)[0]
    .replaceAll('"', "")
    .replaceAll("\\", "");
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleExpiredJWTError = () =>
  new AppError("Your token has expired! Please log in again!", 401);

const sendErrorDev = (err, req, res) => {
  const isApiRequest = req.originalUrl.startsWith("/api");
  //? API
  if (isApiRequest) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //? Rendered website
  console.error(`💥ERROR:`, err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};
const sendErrorForApi = (statusCode, status, msg, res) => {
  return res.status(statusCode).json({
    status: status,
    message: msg,
  });
};

const sendErrorForWeb = (statusCode, msg, res) => {
  return res.status(statusCode).render("error", {
    title: "Something went wrong!",
    msg: msg,
  });
};
const sendErrorProd = (err, req, res) => {
  const isApiRequest = req.originalUrl.startsWith("/api");
  //? API
  if (isApiRequest) {
    //: Operational, trusted error: send message to client
    if (err.isOperational) {
      return sendErrorForApi(err.statusCode, err.status, err.message, res);
    } else {
      //? Programming or other unknown error: don't leak error details
      //: 1.Log error
      console.error(`💥ERROR:`, err);
      return sendErrorForApi(500, "error", "Something went wrong!", res);
    }
  }

  //? Rendered website
  //: Operational, trusted error: send message to client
  if (err.isOperational) {
    return sendErrorForWeb(err.statusCode, err.message, res);
  } else {
    //? Programming or other unknown error: don't leak error details
    //: 1.Log error
    console.error(`💥ERROR:`, err);
    return sendErrorForWeb(500, "Please try again later!", res);
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    //? let error = { ...err };
    console.log(err.constructor.name);
    if (err instanceof mongoose.Error.CastError) err = handleCastErrorDB(err);
    if (err instanceof mongoose.Error.ValidationError)
      err = handleValidationErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleExpiredJWTError();
    sendErrorProd(err, req, res);
  }
};
