const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const imageController = require("./imageController");

exports.uploadTourImages = imageController.upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) next();

  //: 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  const imageCoverOptions = {
    file: req.files.imageCover[0].buffer,
    filename: req.body.imageCover,
    dir: "public/img/tours",
    format: "jpeg",
    quality: 90,
    resize: {
      width: 2000,
      height: 1333,
      fit: "cover",
    },
  };
  await imageController.imageOptions(imageCoverOptions);

  //: 2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour=${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      const imagesOptions = {
        file: file.buffer,
        filename: filename,
        dir: "public/img/tours",
        format: "jpeg",
        quality: 90,
        resize: {
          width: 2000,
          height: 1333,
          fit: "cover",
        },
      };
      await imageController.imageOptions(imagesOptions);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyStats = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const stats = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        toursCount: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $sort: { toursCount: -1 } },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    { $limit: 12 },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTourById = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createNew(Tour);
exports.patchTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: { data: distances },
  });
});
