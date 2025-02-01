const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((e) => {
    if (allowedFields.includes(e)) newObj[e] = obj[e];
  });
  return newObj;
};

const sendSuccessResponse = (user, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    data: { user },
  });
};

//* ////////////////////User Control////////////////////////
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //: 1. Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword",
        400
      )
    );
  }
  //: 2. Filtered out unwanted fields names that are not allowed to be updated
  // const filterBody = ["role", "_id"];
  // filterBody.forEach((e) => delete req.body[e]);
  const filterBody = filterObj(req.body, "name", "email");
  //: 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  sendSuccessResponse(updatedUser, 200, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  sendSuccessResponse(null, 204, res);
});

//* //////////////////////////////////////////////////////

//* ////////////////////Admin Control////////////////////////

exports.getUsersStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        numUsers: { $sum: 1 },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

//! DO NOT update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

//* //////////////////////////////////////////////////////

exports.getAllUsers = factory.getAll(User);

exports.getUserById = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};
